/* Nexo - escolhas de lembretes por compromisso. Apenas interface e persistencia. */
(function () {
  'use strict';
  const opcoes = [[10080,'1 semana antes'],[2880,'2 dias antes'],[1440,'1 dia antes'],[60,'1 hora antes'],[30,'30 minutos antes'],[15,'15 minutos antes'],[0,'Na hora']];
  const ids = ['formAtividade','formProva','formTrabalho','formAtividadeSemana','formProvaSemana','formAtividadeMes','formProvaMes','formAtividadePublica','formProvaPublica','nexoFormTrabalho'];
  function montar(form) {
    if (!form || form.querySelector('.nexo-lembretes')) return;
    const bloco = document.createElement('fieldset');
    bloco.className = 'nexo-lembretes formulario-campo';
    bloco.innerHTML = '<legend>🔔 Notificações</legend><p>Escolha um ou mais lembretes (opcional).</p><div class="nexo-lembretes-opcoes">' + opcoes.map(([n,rotulo]) => '<label><input type="checkbox" value="'+n+'" '+(n===1440?'checked':'')+'> '+rotulo+'</label>').join('') + '</div><small>Sem horário informado, os lembretes serão calculados a partir das 9h do dia marcado.</small>';
    const botoes = form.querySelector('.formulario-botoes, .form-botoes, [class*="form-acoes"]');
    if (botoes) form.insertBefore(bloco,botoes);
    else form.appendChild(bloco);
    form.addEventListener('reset',()=>setTimeout(()=>definir(form,[1440]),0));
  }
  function valores(form) { if (!form) return []; montar(form); return [...form.querySelectorAll('.nexo-lembretes input:checked')].map(el=>Number(el.value)); }
  function definir(form,lista) { if (!form) return; montar(form); const valoresAtuais=Array.isArray(lista)?lista.map(Number):[1440]; form.querySelectorAll('.nexo-lembretes input').forEach(el=>{el.checked=valoresAtuais.includes(Number(el.value));}); }
  function verificar() { ids.forEach(id=>montar(document.getElementById(id))); document.querySelectorAll('#modalFormulario form').forEach(montar); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',verificar);else verificar();
  const obs = new MutationObserver(verificar);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.NexoLembretes={valores,definir,montar};
})();
