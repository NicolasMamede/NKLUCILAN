/* Diagnóstico somente leitura. O horário exibido vem do banco, não do cache. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const format = date => new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
  const startOfDay = date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };
  const criar = (tag, cls, txt) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt != null) el.textContent = txt;
    return el;
  };
  async function estadoPush() {
    if (!('Notification' in window)) return 'Este dispositivo não suporta notificações.';
    if (Notification.permission === 'denied') return 'Permissão bloqueada nas configurações do dispositivo.';
    if (Notification.permission !== 'granted') return 'Permissão ainda não concedida no dispositivo.';
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'Permissão concedida, mas o push não é suportado.';
    try {
      const sw = await navigator.serviceWorker.getRegistration('./sw.js');
      const sub = sw && await sw.pushManager.getSubscription();
      return sub ? 'Permissão concedida e assinatura push local encontrada (entrega pelo servidor não verificada).'
        : 'Permissão concedida; nenhuma assinatura push local encontrada. Abra Início > Notificações para conectar.';
    } catch {
      return 'Permissão concedida, mas não foi possível inspecionar o push local.';
    }
  }
  async function conferir() {
    const btn = $('nk36-check'), area = $('nk36-check-result');
    if (!btn || !area) return;
    btn.disabled = true;
    area.replaceChildren(criar('p', 'nk36-info', 'Conferindo seus compromissos salvos…'));
    try {
      const {data: {session}, error:authErr} = await nexoSupabase.auth.getSession();
      if (authErr || !session?.user?.id) throw new Error('Faça login para consultar seus compromissos.');
      const uid = session.user.id;
      const inicio = startOfDay(new Date());
      const limite = new Date(); limite.setDate(limite.getDate() + 31);
      const fim = startOfDay(limite);
      const config = [
        {table:'atividades',type:'Atividade',title:'titulo',col:'concluida'},
        {table:'provas',type:'Prova',title:'nome',col:null},
        {table:'trabalhos',type:'Trabalho',title:'nome',col:'concluido'}
      ];
      const resultados = await Promise.all(config.map(async conf => {
        const cols = ['id',conf.title,'data','horario','lembretes'];
        if (conf.col) cols.push(conf.col);
        const {data,error} = await nexoSupabase.from(conf.table).select(cols.join(','))
          .eq('usuario_id',uid).eq('visibilidade','privada').gte('data',inicio)
          .lte('data',fim).order('data',{ascending:true}).range(0,499);
        if (error) throw new Error(`Não consegui consultar ${conf.table}: ${error.message}`);
        return (data || []).map(row => ({...row, _conf:conf}));
      }));
      const agora = Date.now(), agenda = [];
      for (const row of resultados.flat()) {
        if (row._conf.col && row[row._conf.col]) continue;
        const hora = String(row.horario || '09:00').slice(0,5);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) continue;
        const data = new Date(`${row.data}T${hora}:00`);
        if (!Number.isFinite(data.getTime()) || !Array.isArray(row.lembretes)) continue;
        for (const minsValue of row.lembretes) {
          const mins = Number(minsValue);
          if (!Number.isFinite(mins) || mins < 0) continue;
          const alerta = new Date(data.getTime() - mins*60_000);
          if (alerta.getTime() < agora - 600_000 || alerta.getTime() > limite.getTime()) continue;
          agenda.push({
            title:String(row[row._conf.title] || 'Compromisso'),
            type:row._conf.type, at:alerta, when:data, offset:mins
          });
        }
      }
      agenda.sort((a,b) => a.at-b.at);
      area.replaceChildren();
      area.appendChild(criar('p','nk36-state',await estadoPush()));
      if (!agenda.length) {
        area.appendChild(criar('p','nk36-info','Nenhum lembrete futuro encontrado nos próximos 31 dias. Confira se marcou “Na hora” ou outro horário no formulário.'));
        return;
      }
      const list = criar('ul','nk36-list');
      for (const item of agenda.slice(0,15)) {
        const li = criar('li','nk36-row');
        li.append(criar('strong','',`${item.type} · ${item.title}`));
        li.append(criar('span','',`Compromisso: ${format(item.when)} · Aviso: ${format(item.at)}`));
        li.append(criar('small','',item.offset === 0 ? 'Lembrar na hora' : `${item.offset} minuto(s) antes`));
        list.appendChild(li);
      }
      area.appendChild(list);
      if (agenda.length > 15) area.appendChild(criar('p','nk36-info',`Exibindo 15 de ${agenda.length} lembretes próximos.`));
      area.appendChild(criar('p','nk36-note','A lista comprova os dados atuais no Supabase, mas não confirma que o agendador do servidor está ativo.'));
    } catch(error) {
      console.warn('Diagnóstico de notificações:',error);
      area.replaceChildren(criar('p','nk36-error',error.message || 'Falha ao consultar os lembretes.'));
    } finally {
      btn.disabled = false;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => $('nk36-check')?.addEventListener('click',conferir),{once:true});
  } else $('nk36-check')?.addEventListener('click',conferir);
})();
