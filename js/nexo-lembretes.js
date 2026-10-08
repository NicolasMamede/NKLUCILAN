/* Nexo - escolhas de lembretes por compromisso. Apenas interface e persistencia. */
(function () {
  'use strict';
  const opcoes = [[10080,'1 semana antes'],[2880,'2 dias antes'],[1440,'1 dia antes'],[60,'1 hora antes'],[30,'30 minutos antes'],[15,'15 minutos antes'],[0,'Na hora']];
  const ids = ['formAtividade','formProva','formTrabalho','formAtividadeSemana','formProvaSemana','formAtividadeMes','formProvaMes','formAtividadePublica','formProvaPublica','nexoFormTrabalho'];
  function montar(form) {
    if (!form || form.querySelector('.nexo-lembretes')) return;
    const bloco = document.createElement('details');
    bloco.className = 'nexo-lembretes formulario-campo';
    bloco.innerHTML = '<summary><span class="nexo-lembretes-icone" aria-hidden="true">🔔</span><span class="nexo-lembretes-cabecalho"><span class="nexo-lembretes-titulo">Configurar notificações</span><span class="nexo-lembretes-chamada">Clique aqui para adicionar ou alterar lembretes</span></span><span class="nexo-lembretes-lado"><span class="nexo-lembretes-resumo"></span><span class="nexo-lembretes-seta" aria-hidden="true"></span></span></summary><div class="nexo-lembretes-conteudo"><p>Escolha um ou mais lembretes (opcional).</p><div class="nexo-lembretes-opcoes">' + opcoes.map(([n,rotulo]) => '<label><input type="checkbox" value="'+n+'" '+(n===1440?'checked':'')+'> '+rotulo+'</label>').join('') + '</div><small>Sem horário informado, os lembretes serão calculados a partir das 9h do dia marcado.</small></div>';
    const botoes = form.querySelector('.formulario-botoes, .form-botoes, [class*="form-acoes"]');
    if (botoes) form.insertBefore(bloco,botoes);
    else form.appendChild(bloco);
    bloco.addEventListener('change', atualizarResumo);
    atualizarResumo();
    form.addEventListener('reset',()=>setTimeout(()=>{definir(form,[1440]); bloco.open=false;},0));
    function atualizarResumo(){ const qtd=bloco.querySelectorAll('input:checked').length; bloco.querySelector('.nexo-lembretes-resumo').textContent=qtd===0?'Desativadas':qtd===1?'1 lembrete':qtd+' lembretes'; }
  }
  function valores(form) { if (!form) return []; montar(form); return [...form.querySelectorAll('.nexo-lembretes input:checked')].map(el=>Number(el.value)); }
  function definir(form,lista) { if (!form) return; montar(form); const valoresAtuais=Array.isArray(lista)?lista.map(Number):[1440]; form.querySelectorAll('.nexo-lembretes input').forEach(el=>{el.checked=valoresAtuais.includes(Number(el.value));}); const bloco=form.querySelector('.nexo-lembretes'); bloco.dispatchEvent(new Event('change')); }
  function verificar() { ids.forEach(id=>montar(document.getElementById(id))); document.querySelectorAll('#modalFormulario form').forEach(montar); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',verificar);else verificar();
  const obs = new MutationObserver(verificar);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.NexoLembretes={valores,definir,montar};
})();
