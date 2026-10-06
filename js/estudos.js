let usuarioLogado = null;
let materias = [];
let estudos = [];
let estudoEmEdicao = null;
let filtroAtual = 'lista';
let referencia = new Date();

const $ = (id) => document.getElementById(id);
const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isoLocal = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const hojeISO = () => isoLocal(new Date());
const fmt = iso => iso ? new Date(iso+'T12:00:00').toLocaleDateString('pt-BR') : '';

async function iniciar(){
  usuarioLogado = await protegerPagina();
  if(!usuarioLogado) return;
  prepararInterface();
  await carregarMaterias();
  await carregarEstudos();
}

function prepararInterface(){
  const form=$('formEstudo');
  if(!form) return;
  const horario=$('horarioEstudo');
  if(horario && !$('horarioFimEstudo')){
    const campo=horario.closest('.formulario-campo');
    const clone=document.createElement('div'); clone.className='formulario-campo';
    clone.innerHTML='<label for="horarioFimEstudo">Horário final (opcional)</label><input type="time" id="horarioFimEstudo">';
    campo.after(clone);
  }
  const painel=document.querySelector('.painel-cabecalho');
  if(painel){
    const filtros=painel.querySelector('.estudos-filtros');
    if(filtros) filtros.innerHTML=`<button type="button" class="filtro-estudo ativo" data-view="lista">Lista</button><button type="button" class="filtro-estudo" data-view="semana">Semana</button><button type="button" class="filtro-estudo" data-view="mes">Mês</button>`;
  }
  document.querySelector('.painel-etiqueta')?.replaceChildren(document.createTextNode('ESTUDOS'));
  const h2=document.querySelector('.estudos-cabecalho h2'); if(h2) h2.textContent='Planejamento de estudos';
  const nova=$('novaEstudo'); if(nova) nova.innerHTML='<span>+</span> Novo estudo';
  $('criarPrimeiraEstudo')?.addEventListener('click', abrirNovo);
  nova?.addEventListener('click', abrirNovo);
  $('fecharModalEstudo')?.addEventListener('click', fecharModal);
  $('cancelarEstudo')?.addEventListener('click', fecharModal);
  $('modalEstudo')?.addEventListener('click',e=>{if(e.target===$('modalEstudo')) fecharModal();});
  form.addEventListener('submit', salvar);
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{filtroAtual=b.dataset.view; document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('ativo',x===b)); render();}));
}

async function carregarMaterias(){
  const {data,error}=await nexoSupabase.from('materias').select('id,nome').eq('usuario_id',usuarioLogado.id).order('nome');
  if(error){console.error(error); return;}
  materias=data||[]; const sel=$('materiaEstudo'); if(!sel)return;
  sel.innerHTML='<option value="">Sem matéria</option>'+materias.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('');
}
async function carregarEstudos(){
  const {data,error}=await nexoSupabase.from('estudos').select('id,titulo,objetivo,data,horario_inicio,horario_fim,materia_id,materia_nome,concluido,criado_em').eq('usuario_id',usuarioLogado.id).order('data').order('horario_inicio');
  if(error){console.error('Erro estudos:',error); alert('Não foi possível carregar os estudos.'); return;}
  estudos=data||[]; atualizarResumo(); render();
}
function materiaNome(e){return e.materia_nome || materias.find(m=>m.id===e.materia_id)?.nome || 'Sem matéria';}
function atualizarResumo(){
  const hoje=hojeISO();
  if($('totalProximas')) $('totalProximas').textContent=estudos.filter(e=>e.data>hoje&&!e.concluido).length;
  if($('totalHoje')) $('totalHoje').textContent=estudos.filter(e=>e.data===hoje&&!e.concluido).length;
  if($('totalRealizadas')) $('totalRealizadas').textContent=estudos.filter(e=>e.concluido).length;
}
function render(){ if(filtroAtual==='semana') renderSemana(); else if(filtroAtual==='mes') renderMes(); else renderLista(); }
function card(e){
  const hora=[e.horario_inicio?.slice(0,5),e.horario_fim?.slice(0,5)].filter(Boolean).join('–');
  return `<article class="prova-card ${e.concluido?'realizada':''}" data-id="${e.id}"><div class="prova-card-conteudo"><span class="prova-materia">${esc(materiaNome(e))}</span><h3>${esc(e.titulo)}</h3><p>${fmt(e.data)}${hora?' • '+hora:''}</p>${e.objetivo?`<p>${esc(e.objetivo)}</p>`:''}</div><div class="prova-acoes"><button type="button" data-act="toggle">${e.concluido?'Reabrir':'Concluir'}</button><button type="button" data-act="edit">Editar</button><button type="button" data-act="del">Excluir</button></div></article>`;
}
function bindCards(){document.querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',async ev=>{const b=ev.target.closest('[data-act]'); if(!b)return; const id=el.dataset.id; if(b.dataset.act==='edit') editar(id); if(b.dataset.act==='del') excluir(id); if(b.dataset.act==='toggle') alternar(id);}));}
function renderLista(){
  const box=$('listaEstudosPagina'); if(!box)return;
  box.innerHTML=estudos.length?estudos.map(card).join(''):`<div class="estado-vazio"><div class="vazio-icone">✎</div><h3>Nenhum estudo</h3><p>Você ainda não programou nenhum estudo.</p><button type="button" class="botao-vazio" id="novoVazio">+ Adicionar estudo</button></div>`;
  $('novoVazio')?.addEventListener('click',abrirNovo); bindCards();
}
function inicioSemana(d){const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(12,0,0,0); return x;}
function renderSemana(){
 const box=$('listaEstudosPagina'); const ini=inicioSemana(referencia); let html='<div class="estudo-cal-nav"><button id="estAnt">‹</button><strong>Semana de estudos</strong><button id="estProx">›</button></div><div class="estudo-semana-grid">';
 for(let i=0;i<7;i++){const d=new Date(ini);d.setDate(ini.getDate()+i);const iso=isoLocal(d);const arr=estudos.filter(e=>e.data===iso);html+=`<section class="estudo-dia"><strong>${d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})}</strong>${arr.length?arr.map(card).join(''):'<p class="estudo-sem-item">Sem estudos</p>'}</section>`;} html+='</div>'; box.innerHTML=html; $('estAnt').onclick=()=>{referencia.setDate(referencia.getDate()-7);renderSemana()}; $('estProx').onclick=()=>{referencia.setDate(referencia.getDate()+7);renderSemana()}; bindCards();
}
function renderMes(){
 const box=$('listaEstudosPagina'); const y=referencia.getFullYear(),m=referencia.getMonth(); const first=new Date(y,m,1); const start=(first.getDay()+6)%7; const base=new Date(y,m,1-start); let html=`<div class="estudo-cal-nav"><button id="estAnt">‹</button><strong>${referencia.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</strong><button id="estProx">›</button></div><div class="estudo-mes-grid">`;
 for(let i=0;i<42;i++){const d=new Date(base);d.setDate(base.getDate()+i);const iso=isoLocal(d),arr=estudos.filter(e=>e.data===iso);html+=`<section class="estudo-mes-dia ${d.getMonth()!==m?'fora':''}"><strong>${d.getDate()}</strong>${arr.slice(0,3).map(e=>`<button class="estudo-mes-item" data-edit="${e.id}">${esc(e.titulo)}</button>`).join('')}${arr.length>3?`<small>+${arr.length-3}</small>`:''}</section>`;} html+='</div>'; box.innerHTML=html; $('estAnt').onclick=()=>{referencia=new Date(y,m-1,1);renderMes()}; $('estProx').onclick=()=>{referencia=new Date(y,m+1,1);renderMes()}; document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editar(b.dataset.edit));
}
function abrirNovo(){estudoEmEdicao=null;$('formEstudo').reset();$('tituloModalEstudo')&&($('tituloModalEstudo').textContent='Novo estudo');$('modalEstudo').classList.add('ativo');}
function fecharModal(){$('modalEstudo')?.classList.remove('ativo');}
function editar(id){const e=estudos.find(x=>x.id===id);if(!e)return;estudoEmEdicao=id;$('nomeEstudo').value=e.titulo||'';$('materiaEstudo').value=e.materia_id||'';$('dataEstudo').value=e.data||'';$('horarioEstudo').value=e.horario_inicio?.slice(0,5)||'';$('horarioFimEstudo').value=e.horario_fim?.slice(0,5)||'';$('conteudoEstudo').value=e.objetivo||'';$('modalEstudo').classList.add('ativo');}
async function salvar(ev){ev.preventDefault();const titulo=$('nomeEstudo').value.trim(),data=$('dataEstudo').value,materia_id=$('materiaEstudo').value||null,objetivo=$('conteudoEstudo').value.trim()||null,horario_inicio=$('horarioEstudo').value||null,horario_fim=$('horarioFimEstudo').value||null;if(!titulo||!data)return;if(horario_inicio&&horario_fim&&horario_fim<=horario_inicio){alert('O horário final precisa ser depois do inicial.');return;}const payload={titulo,objetivo,data,horario_inicio,horario_fim,materia_id,materia_nome:materias.find(m=>m.id===materia_id)?.nome||null,usuario_id:usuarioLogado.id};let q=estudoEmEdicao?nexoSupabase.from('estudos').update(payload).eq('id',estudoEmEdicao).eq('usuario_id',usuarioLogado.id):nexoSupabase.from('estudos').insert(payload);const {error}=await q;if(error){console.error(error);alert('Não foi possível salvar o estudo: '+error.message);return;}fecharModal();await carregarEstudos();}
async function excluir(id){if(!confirm('Excluir este estudo?'))return;const {error}=await nexoSupabase.from('estudos').delete().eq('id',id).eq('usuario_id',usuarioLogado.id);if(error){alert(error.message);return;}await carregarEstudos();}
async function alternar(id){const e=estudos.find(x=>x.id===id);if(!e)return;const {error}=await nexoSupabase.from('estudos').update({concluido:!e.concluido}).eq('id',id).eq('usuario_id',usuarioLogado.id);if(error){alert(error.message);return;}await carregarEstudos();}

document.addEventListener('DOMContentLoaded',iniciar);
