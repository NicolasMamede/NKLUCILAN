(() => {
 'use strict';
 const fontes = [
  { tabela:'atividades', tipo:'atividade', nome:'Atividade', campo:'concluida', titulo:'titulo', pagina:'atividades.html', emoji:'📘' },
  { tabela:'trabalhos', tipo:'trabalho', nome:'Trabalho', campo:'concluido', titulo:'nome', pagina:'trabalhos.html', emoji:'📂' },
  { tabela:'estudos', tipo:'estudo', nome:'Estudo', campo:'concluido', titulo:'titulo', pagina:'estudos.html', emoji:'📚' }
 ];
 let usuario, itens=[], filtro='todos';
 const $ = id => document.getElementById(id);
 function hojeBrasil(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;}
 function fmt(data){if(!data)return '';const [a,m,d]=data.split('-');return `${d}/${m}/${a}`;}
 function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 async function carregar(){
  $('nk-atrasados-lista').innerHTML='<div class="nk-atrasados-vazio">Carregando pendências...</div>';
  const hoje=hojeBrasil();
  const resultados=await Promise.all(fontes.map(async fonte=>{
   const campos=`id, data, ${fonte.titulo}, materia_nome`;
   const {data,error}=await nexoSupabase.from(fonte.tabela).select(campos).eq('usuario_id',usuario.id).lt('data',hoje).eq(fonte.campo,false).order('data',{ascending:true});
   if(error){console.error('[NK Atrasados]',fonte.tabela,error);throw new Error('Não foi possível carregar '+fonte.nome.toLowerCase()+'s: '+error.message);}
   return (data||[]).map(item=>({...item,fonte}));
  }));
  itens=resultados.flat().sort((a,b)=>a.data.localeCompare(b.data));
  renderizar();
  if(window.NKAtrasadosAtualizar)void window.NKAtrasadosAtualizar();
 }
 function renderizar(){
  $('nk-total').textContent=itens.length;
  for(const f of fontes){$('nk-'+f.tipo).textContent=itens.filter(x=>x.fonte.tipo===f.tipo).length;}
  document.querySelectorAll('[data-nk-filtro]').forEach(b=>b.classList.toggle('ativo',b.dataset.nkFiltro===filtro));
  const lista=itens.filter(x=>filtro==='todos'||x.fonte.tipo===filtro);
  if(!lista.length){$('nk-atrasados-lista').innerHTML='<div class="nk-atrasados-vazio"><strong>🎉 Nenhuma pendência atrasada!</strong>Você está em dia nesta categoria.</div>';return;}
  $('nk-atrasados-lista').innerHTML=lista.map(item=>`<article class="nk-atrasados-item"><div><span class="nk-atrasados-tipo">${item.fonte.emoji} ${item.fonte.nome}</span><h3>${escapeHTML(item[item.fonte.titulo]||'Sem título')}</h3><p>📅 Previsto para ${fmt(item.data)}${item.materia_nome?' · '+escapeHTML(item.materia_nome):''}</p></div><div class="nk-atrasados-acoes"><a href="${item.fonte.pagina}">Abrir seção</a><button type="button" data-nk-concluir="${item.id}" data-nk-tipo="${item.fonte.tipo}">✓ Concluir</button></div></article>`).join('');
 }
 async function concluir(id,tipo,btn){
  const item=itens.find(x=>x.id===id&&x.fonte.tipo===tipo);if(!item)return;
  btn.disabled=true;btn.textContent='Salvando...';
  const {error}=await nexoSupabase.from(item.fonte.tabela).update({[item.fonte.campo]:true}).eq('id',id).eq('usuario_id',usuario.id);
  if(error){alert('Não foi possível concluir: '+error.message);btn.disabled=false;btn.textContent='✓ Concluir';return;}
  itens=itens.filter(x=>x!==item);renderizar();if(window.NKAtrasadosAtualizar)void window.NKAtrasadosAtualizar();
 }
 async function iniciar(){
  usuario=await protegerPagina();if(!usuario)return;
  document.querySelectorAll('[data-nk-filtro]').forEach(b=>b.addEventListener('click',()=>{filtro=b.dataset.nkFiltro;renderizar();}));
  $('nk-atrasados-lista').addEventListener('click',e=>{const b=e.target.closest('[data-nk-concluir]');if(b)void concluir(b.dataset.nkConcluir,b.dataset.nkTipo,b);});
  try{await carregar();}catch(e){$('nk-atrasados-lista').innerHTML='<div class="nk-atrasados-vazio">'+escapeHTML(e.message)+'</div>';}
 }
 document.addEventListener('DOMContentLoaded',iniciar);
})();
