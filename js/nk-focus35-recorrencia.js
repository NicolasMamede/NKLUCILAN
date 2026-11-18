/* Recorrência limitada, segura e sincronizada: cria atividades reais no Supabase.
   Não usa dados em localStorage, novas tabelas ou alterações de schema. */
(() => {
  'use strict';
  const formularios=['formAtividade','formAtividadeSemana','formAtividadeMes'];
  function parseISO(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))throw Error('Data inicial inválida.');
    const [y,m,d]=s.split('-').map(Number);const t=new Date(y,m-1,d,12);
    if(t.getFullYear()!==y||t.getMonth()!==m-1||t.getDate()!==d)throw Error('Data inválida.');return t;}
  function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function next(initial,frequency,n){
    const date=new Date(initial);
    if(frequency==='diaria')date.setDate(initial.getDate()+n);
    if(frequency==='semanal')date.setDate(initial.getDate()+7*n);
    if(frequency==='mensal'){
      const max=new Date(initial.getFullYear(),initial.getMonth()+n+1,0).getDate();
      date.setFullYear(initial.getFullYear(),initial.getMonth()+n,Math.min(initial.getDate(),max));
    }
    return date;
  }
  function montar(form) {
    if(!form||form.querySelector('.nk35-recorrencia'))return;
    const wrap=document.createElement('fieldset');wrap.className='nk35-recorrencia';
    const legend=document.createElement('legend');legend.textContent='Repetição';
    const label=document.createElement('label');label.textContent='Repetir atividade';
    const select=document.createElement('select');select.className='nk35-recorrencia-tipo';select.setAttribute('aria-label','Frequência da atividade');
    [['','Não repetir'],['diaria','Todos os dias'],['semanal','Toda semana'],['mensal','Todo mês']].forEach(([v,t])=>{const o=new Option(t,v);select.add(o);});
    label.appendChild(select);
    const ateLabel=document.createElement('label');ateLabel.textContent='Até a data';ateLabel.className='nk35-recorrencia-ate-container';ateLabel.hidden=true;
    const ate=document.createElement('input');ate.type='date';ate.className='nk35-recorrencia-ate';ateLabel.appendChild(ate);
    const aviso=document.createElement('small');aviso.textContent='Cria ocorrências independentes (máximo 60). Para interromper, exclua as futuras.';
    wrap.append(legend,label,ateLabel,aviso);
    select.addEventListener('change',()=>{ateLabel.hidden=!select.value;ate.required=Boolean(select.value);if(select.value&&!ate.value){const dateField=form.querySelector('input[type="date"]');try{const d=parseISO(dateField?.value || iso(new Date()));d.setMonth(d.getMonth()+3);ate.value=iso(d);}catch{}}});
    const botoes=form.querySelector('.formulario-botoes,.form-botoes,[class*="form-acoes"]');
    if(botoes)form.insertBefore(wrap,botoes);else form.appendChild(wrap);
    form.addEventListener('reset',()=>{select.value='';ate.value='';ate.required=false;ateLabel.hidden=true;});
  }
  function gerarRegistros(form,registro) {
    montar(form);
    const freq=form?.querySelector('.nk35-recorrencia-tipo')?.value||'';
    if(!freq)return [registro];
    const ini=parseISO(registro.data);
    const endStr=form.querySelector('.nk35-recorrencia-ate').value;
    if(!endStr)throw Error('Defina uma data final para a repetição.');
    const ate=parseISO(endStr);
    if(ate<ini)throw Error('A data final da repetição não pode ser anterior à primeira atividade.');
    const resultado=[];
    for(let n=0;n<61;n++){
      const data=next(ini,freq,n);
      if(data>ate)break;
      if(n===60)throw Error('O período escolhido cria mais de 60 atividades. Escolha uma data final mais próxima.');
      resultado.push({...registro,data:iso(data)});
    }
    return resultado;
  }
  function edicao(form,emEdicao){const area=form?.querySelector('.nk35-recorrencia');if(area){area.hidden=Boolean(emEdicao);if(emEdicao){area.querySelector('select').value='';area.querySelector('.nk35-recorrencia-ate').required=false;}}}
  function init(){formularios.forEach(id=>montar(document.getElementById(id)));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.NKRecorrencias=Object.freeze({montar,gerarRegistros,edicao});
})();
