/* Lembretes ativos: só quando o aplicativo estiver aberto e com permissão.
   Notificações push em segundo plano dependem do sistema existente no servidor. */
(() => {
  'use strict';
  let trabalhando=false,lastCheck=0,owner=null;
  const vistos=new Set();
  function isoLocal(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  const destino=tipo=>tipo==='atividade'?'atividades.html':tipo==='trabalho'?'trabalhos.html':'provas.html';
  async function verificar() {
    if(trabalhando || document.hidden || !navigator.onLine || !('Notification' in window) || Notification.permission!=='granted')return;
    if(Date.now()-lastCheck<45000)return;
    trabalhando=true;lastCheck=Date.now();
    try {
      const {data:{session}}=await nexoSupabase.auth.getSession();if(!session?.user)return;
      const uid=session.user.id;
      if(owner && owner!==uid)vistos.clear();owner=uid;
      const hoje=new Date();const start=new Date(hoje);start.setDate(start.getDate()-1);
      const end=new Date(hoje);end.setDate(end.getDate()+8);
      const rows=await Promise.all([
        ['atividades','titulo, data, horario, id, concluida, lembretes'],
        ['provas','nome, data, horario, id, lembretes'],
        ['trabalhos','nome, data, horario, id, concluido, lembretes']
      ].map(async ([table,cols])=>{
        const {data,error}=await nexoSupabase.from(table).select(cols).eq('usuario_id',uid).eq('visibilidade','privada')
          .gte('data',isoLocal(start)).lte('data',isoLocal(end)).range(0,999);
        if(error){console.warn('Lembretes: ',table,error.message);return [];}return (data||[]).map(a=>({...a,tipo:table==='atividades'?'atividade':table==='provas'?'prova':'trabalho'}));
      }));
      for(const item of rows.flat()){
        if(item.concluida||item.concluido)continue;
        if(!Array.isArray(item.lembretes))continue;
        const time=String(item.horario||'09:00').slice(0,5);
        const vencimento=new Date(`${item.data}T${/^\d\d:\d\d$/.test(time)?time:'09:00'}:00`);
        if(!Number.isFinite(vencimento.getTime()))continue;
        for(const minutos of item.lembretes){
          if(!Number.isFinite(Number(minutos))||Number(minutos)<0)continue;
          const disparo=vencimento.getTime()-Number(minutos)*60000;
          if(Date.now()<disparo||Date.now()-disparo>10*60000)continue;
          const chave=`nk35-alerta:${uid}:${item.tipo}:${item.id}:${minutos}:${item.data}:${time}`;
          let anterior=false;try{anterior=Boolean(localStorage.getItem(chave));}catch{}
          if(anterior||vistos.has(chave))continue;
          vistos.add(chave);
          try{
            const titulo=item.titulo||item.nome||'Compromisso';
            const body=Number(minutos)===0?`Está na hora: ${titulo}`:`${titulo} · ${item.data.split('-').reverse().join('/')} às ${time}`;
            if('serviceWorker' in navigator){const registro=await navigator.serviceWorker.ready;await registro.showNotification('NKLUCILAN · Lembrete',{body,icon:'./icons/icon-192.png',tag:chave,data:{url:'./'+destino(item.tipo)}});}
            else new Notification('NKLUCILAN · Lembrete',{body});
            try{localStorage.setItem(chave,'1');}catch{}
          }catch(err){console.warn('Não foi possível exibir o lembrete:',err);vistos.delete(chave);}
        }
      }
    } catch(e){console.warn('Lembretes ativos:',e);}finally{trabalhando=false;}
  }
  async function ativar() {
    if(!('Notification' in window))throw Error('Este navegador não oferece notificações.');
    if(!window.isSecureContext)throw Error('Use o endereço HTTPS do NKLUCILAN.');
    const result=Notification.permission==='granted'?'granted':
      Notification.permission==='default'?await Notification.requestPermission():'denied';
    if(result!=='granted')throw Error('Permissão de notificações não concedida. Verifique os ajustes do navegador.');
    lastCheck=0;await verificar();return true;
  }
  // Os formulários disparam este evento APÓS uma gravação bem-sucedida.
  // A próxima verificação consulta a data e os lembretes editados, não os antigos.
  function reavaliar(){lastCheck=0;void verificar();}
  window.NKLembretesAtivos=Object.freeze({ativar,verificar,reavaliar});
  window.addEventListener('nk:compromisso-salvo',reavaliar);
  window.addEventListener('pageshow',()=>{lastCheck=0;void verificar();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastCheck=0;void verificar();}});
  window.addEventListener('online',()=>{lastCheck=0;void verificar();});
  setInterval(()=>void verificar(),60000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void verificar(),{once:true});else void verificar();
})();
