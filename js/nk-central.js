/* NK Lucilan • Navegação compartilhada e comunicados ao entrar.
   Privilégios são verificados novamente pelas policies do Supabase. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icones = {
    novidades: '<path d="M3 11v2l9 4V7L3 11Z"/><path d="m12 7 6-3v16l-6-3M5 14l1 5h3l-1-4M20 9l2-1M20 15l2 1"/>',
    sugestoes: '<path d="M9 18h6M10 22h4M8 14c-2-1-3-3-3-5a7 7 0 0 1 14 0c0 2-1 4-3 5l-1 3H9Z"/>',
    admin: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 14h3M8 17h6M16 13l1.5 1.5L20 12"/>'
  };
  const labels = {
    atualizacao: {rotulo:'Atualização',emoji:'✨'},
    importante: {rotulo:'Aviso importante',emoji:'📣'},
    manutencao: {rotulo:'Manutenção',emoji:'🛠️'}
  };
  const data = valor => { try { return new Date(valor).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}); } catch {return '';} };
  let dados = null;
  let iniciou = false;

  function itemMenu(tipo, nome, hash) {
    const a = document.createElement('a');
    a.href = `central.html#${hash}`;
    a.className = 'menu-item nk-menu-central';
    a.dataset.nkCentral = hash;
    a.innerHTML = `<span class="menu-icone"><svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${icones[tipo]}</svg></span><span>${nome}${tipo==='admin' ? ' <span class="nk-central-badge" hidden></span>' : ''}</span>`;
    return a;
  }
  function atualizarAtivo() {
    document.querySelectorAll('.nk-menu-central').forEach(el => {
      const paginaCentral = location.pathname.split('/').pop()==='central.html';
      el.classList.toggle('ativo',paginaCentral && el.dataset.nkCentral === (location.hash.slice(1) || 'novidades'));
    });
  }
  function adicionarMenu(admin) {
    const menu = document.querySelector('.sidebar-menu');
    if (!menu || menu.querySelector('.nk-menu-central')) return;
    menu.append(itemMenu('novidades','Novidades','novidades'));
    menu.append(itemMenu('sugestoes','Sugestões','sugestoes'));
    if (admin) menu.append(itemMenu('admin','Administração','admin'));
    atualizarAtivo();
    window.addEventListener('hashchange',atualizarAtivo);
  }
  function linkNoPerfil(admin) {
    if (!admin || !location.pathname.endsWith('perfil.html')) return;
    const referencia = document.querySelector('.perfil-sessao');
    if (!referencia || document.getElementById('nk-link-perfil-admin')) return;
    const div = document.createElement('section');
    div.className = 'nk-admin-perfil-card';
    div.id = 'nk-link-perfil-admin';
    div.innerHTML = '<div><strong>🛡️ Central do desenvolvedor</strong><p>Publique comunicados e responda às sugestões recebidas dos outros usuários.</p></div><a href="central.html#admin" class="nk-c-btn nk-c-btn-primary">Gerenciar</a>';
    referencia.parentNode.insertBefore(div,referencia);
  }
  async function contarRecebidas() {
    if (!dados?.admin) return;
    const {count,error} = await nexoSupabase.from('nk_sugestoes')
      .select('id',{head:true,count:'exact'}).eq('status','recebida');
    if (error) return;
    document.querySelectorAll('.nk-central-badge').forEach(el=>{el.textContent=count;el.hidden=!count;});
  }
  async function marcarLido(id) {
    const {error} = await nexoSupabase.from('nk_comunicados_leituras').insert({
      comunicado_id:id,usuario_id:dados.user.id
    });
    if (error && error.code!=='23505') throw error;
  }
  async function abrirUltimoComunicado() {
    if (!dados || dados.admin || location.pathname.endsWith('central.html')) return;
    const {data: comunicados,error} = await nexoSupabase.from('nk_comunicados')
      .select('id,titulo,mensagem,categoria,criado_em').eq('ativo',true)
      .order('criado_em',{ascending:false}).limit(1);
    if (error || !comunicados?.length) return;
    const aviso = comunicados[0];
    const {data: leitura,error:erroLeitura} = await nexoSupabase.from('nk_comunicados_leituras')
      .select('comunicado_id').eq('usuario_id',dados.user.id).eq('comunicado_id',aviso.id).maybeSingle();
    if (erroLeitura || leitura) return;
    if (document.getElementById('nk-central-popup')) return;
    const tipo = labels[aviso.categoria] || labels.atualizacao;
    const overlay = document.createElement('div');
    overlay.className = 'nk-c-overlay';
    overlay.id = 'nk-central-popup';
    overlay.innerHTML = `<section class="nk-c-popup" role="dialog" aria-modal="true" aria-labelledby="nk-c-popup-titulo">
      <div class="nk-c-popup-top"><span class="nk-c-kicker">${tipo.emoji} ${tipo.rotulo} • NK Lucilan</span><button type="button" class="nk-c-icon" data-acao="fechar" aria-label="Fechar comunicado">×</button></div>
      <div class="nk-c-hero-icon" aria-hidden="true">📣</div>
      <h2 id="nk-c-popup-titulo">${esc(aviso.titulo)}</h2>
      <p class="nk-c-popup-text">${esc(aviso.mensagem)}</p>
      <div class="nk-c-popup-meta">Publicado em ${esc(data(aviso.criado_em))} • Equipe NK Lucilan</div>
      <div class="nk-c-popup-acoes"><button class="nk-c-btn nk-c-btn-ghost" data-acao="historico">Ver histórico</button><button class="nk-c-btn nk-c-btn-primary" data-acao="fechar">Entendi, obrigado!</button></div>
      <p class="nk-c-small">Esse aviso não reaparecerá depois de confirmado.</p>
    </section>`;
    document.body.append(overlay);
    const foco = overlay.querySelector('[data-acao="fechar"]');
    if (foco) foco.focus();
    overlay.addEventListener('click',async e=>{
      const botao=e.target.closest('[data-acao]');
      if (!botao || botao.disabled) return;
      overlay.querySelectorAll('button').forEach(b=>b.disabled=true);
      try {
        await marcarLido(aviso.id);
        overlay.remove();
        if (botao.dataset.acao==='historico') location.href='central.html#novidades';
      } catch(err) {
        console.error('[NK Central] Falha ao registrar leitura:',err);
        const avisoStatus = overlay.querySelector('.nk-c-small');
        avisoStatus.textContent='Não foi possível confirmar a leitura. Verifique sua conexão e tente novamente.';
        overlay.querySelectorAll('button').forEach(b=>b.disabled=false);
      }
    });
  }
  async function iniciar() {
    if (iniciou || typeof nexoSupabase==='undefined') return;
    iniciou=true;
    try {
      const {data:{user},error} = await nexoSupabase.auth.getUser();
      if (error || !user) return;
      const {data:perfil,error:erroPerfil} = await nexoSupabase.from('nk_administradores')
        .select('usuario_id').eq('usuario_id',user.id).maybeSingle();
      if (erroPerfil) console.warn('[NK Central] Execute o SQL da Central:',erroPerfil.message);
      dados = {user,admin:!!perfil};
      window.NKCentral={user,admin:!!perfil,esc,labels,data,atualizarAtivo,contarRecebidas};
      adicionarMenu(dados.admin);
      linkNoPerfil(dados.admin);
      await Promise.allSettled([contarRecebidas(),abrirUltimoComunicado()]);
      document.dispatchEvent(new CustomEvent('nk-central-pronto',{detail:{admin:dados.admin}}));
    } catch (err) {console.error('[NK Central]',err);}
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar);
  else void iniciar();
})();
