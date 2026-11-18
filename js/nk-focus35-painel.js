/* NKLUCILAN Focus 3.5 — Busca, estatísticas e acesso aos lembretes. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  let dados={itens:[],materias:[],erros:[]}, usuario=null;
  const nomeMateria=id=>dados.materias.find(m=>String(m.id)===String(id))?.nome||'Sem matéria';
  const labelStatus=item=>item.concluido?'Concluído':item.tipo!=='prova'&&item.data<NKFocus35.hoje()?'Atrasado':item.data===NKFocus35.hoje()?'Hoje':item.tipo==='prova'&&item.data<NKFocus35.hoje()?'Prova passada':'Pendente';
  function el(tag,css,text){const result=document.createElement(tag);if(css)result.className=css;if(text!==undefined)result.textContent=text;return result;}
  function mostrarErro(msg){const place=$('nk35-feedback');if(!place)return;place.textContent=msg;place.hidden=!msg;}
  async function carregar(){
    usuario=await protegerPagina();if(!usuario)return;
    try{
      dados=await NKFocus35.carregar(usuario.id);
      if(dados.erros.length)mostrarErro('Alguns dados não puderam ser carregados. Confira a conexão e tente recarregar a página.');
      else mostrarErro('');
      if($('nk35-resultados'))buscar();
      if($('nk35-resumo'))estatisticas();
    }catch(error){console.error('Focus 3.5:',error);mostrarErro('Não foi possível carregar os dados. Verifique sua conexão e tente novamente.');}
  }
  function abrir(item){
    NKDetalhes.abrir({item:{...item,conteudo:item.tipo==='prova'?item.descricao:undefined},materia:nomeMateria(item.materia_id)});
  }
  function criarCartao(item){
    const card=el('article','nk35-result-card');
    const content=el('button','nk35-result-open');content.type='button';
    content.setAttribute('aria-label',`Ver detalhes de ${item.titulo}`);
    const top=el('div','nk35-result-top');
    top.append(el('span','nk35-chip',NKFocus35.nome(item.tipo)),el('span','nk35-status',labelStatus(item)));
    const titulo=el('h3','',item.titulo);
    const meta=el('p','',`${nomeMateria(item.materia_id)} · ${NKFocus35.isoBR(item.data)}${item.horario?' · '+String(item.horario).slice(0,5):''}`);
    const desc=el('p','nk35-description',item.descricao||'Sem descrição cadastrada');
    content.append(top,titulo,meta,desc);content.addEventListener('click',()=>abrir(item));card.appendChild(content);
    if(item.tipo!=='prova'&&!item.concluido){
      const done=el('button','nk35-result-done','✓ Concluir');done.type='button';done.setAttribute('aria-label',`Concluir ${item.titulo}`);
      done.addEventListener('click',async()=>{
        done.disabled=true;done.textContent='Concluindo…';
        try{await NKFocus35.concluir(item,usuario.id,carregar);}
        catch(e){console.error(e);done.disabled=false;done.textContent='✓ Concluir';mostrarErro('Não foi possível concluir essa tarefa.');}
      });card.appendChild(done);
    }
    return card;
  }
  function buscar(){
    const container=$('nk35-resultados');if(!container)return;
    const termo=NKFocus35.normalize($('nk35-busca').value.trim());
    const tipo=$('nk35-tipo').value,status=$('nk35-filtro').value;
    const hoje=NKFocus35.hoje();
    const lista=dados.itens.filter(item=>{
      const bate=!termo||NKFocus35.normalize([item.titulo,item.descricao,nomeMateria(item.materia_id)].join(' ')).includes(termo);
      if(!bate||(tipo!=='todos'&&tipo!==item.tipo))return false;
      if(status==='concluidos')return item.concluido;
      if(status==='pendentes')return item.tipo!=='prova'&&!item.concluido&&item.data>=hoje;
      if(status==='atrasados')return item.tipo!=='prova'&&!item.concluido&&item.data<hoje;
      return true;
    }).sort((a,b)=>(a.data||'').localeCompare(b.data||'')||(a.horario||'99:99').localeCompare(b.horario||'99:99'));
    $('nk35-contagem').textContent=`${lista.length} ${lista.length===1?'resultado':'resultados'}`;
    container.replaceChildren();
    if(!lista.length){container.appendChild(el('p','nk35-empty','Nenhum compromisso encontrado para esses filtros.'));return;}
    lista.slice(0,150).forEach(item=>container.appendChild(criarCartao(item)));
    if(lista.length>150)container.appendChild(el('p','nk35-limit','Exibindo os 150 primeiros resultados. Refine sua pesquisa para encontrar os demais.'));
  }
  function estatisticas(){
    const container=$('nk35-resumo');if(!container)return;
    const hoje=NKFocus35.hoje(),lim=new Date();lim.setDate(lim.getDate()+7);
    const iso=`${lim.getFullYear()}-${String(lim.getMonth()+1).padStart(2,'0')}-${String(lim.getDate()).padStart(2,'0')}`;
    const itens=dados.itens;
    const tarefas=itens.filter(x=>x.tipo!=='prova');
    const metrics=[
      ['Tarefas concluídas',tarefas.filter(x=>x.concluido).length,'Desde o cadastro'],
      ['Tarefas pendentes',tarefas.filter(x=>!x.concluido&&x.data>=hoje).length,'Hoje e próximas'],
      ['Tarefas atrasadas',tarefas.filter(x=>!x.concluido&&x.data<hoje).length,'Precisam de atenção'],
      ['Compromissos em 7 dias',itens.filter(x=>!x.concluido&&x.data>=hoje&&x.data<=iso).length,'Inclui provas']
    ];
    container.replaceChildren();
    for(const [titulo,valor,subtitle] of metrics){const card=el('div','nk35-metrica');card.append(el('span','',titulo),el('strong','',String(valor)),el('small','',subtitle));container.appendChild(card);}
    const subjects=$('nk35-materias');subjects.replaceChildren();
    const ranked=Object.entries(itens.reduce((acc,item)=>{const key=nomeMateria(item.materia_id);acc[key]=(acc[key]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const max=Math.max(1,...ranked.map(x=>x[1]));
    if(!ranked.length){subjects.appendChild(el('p','nk35-empty','Cadastre atividades para acompanhar suas matérias.'));return;}
    for(const [nome,count] of ranked){
      const wrap=el('div','nk35-bar-item');const head=el('div','nk35-bar-heading');head.append(el('span','',nome),el('strong','',String(count)));
      const track=el('div','nk35-bar-track');track.setAttribute('role','meter');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(max));track.setAttribute('aria-valuenow',String(count));track.setAttribute('aria-label',nome);
      const progress=el('div','nk35-bar-fill');progress.style.width=(100*count/max)+'%';track.appendChild(progress);wrap.append(head,track);subjects.appendChild(wrap);
    }
  }
  function iniciar(){
    if(!$('nk35-resultados')&&!$('nk35-resumo'))return;
    ['nk35-busca','nk35-tipo','nk35-filtro'].forEach(id=>$(id)?.addEventListener(id==='nk35-busca'?'input':'change',buscar));
    $('nk35-ativar-lembretes')?.addEventListener('click',async()=>{
      const btn=$('nk35-ativar-lembretes');btn.disabled=true;
      try{await NKLembretesAtivos.ativar();$('nk35-lembretes-status').textContent='Permissão confirmada. Lembretes locais ativos com o app aberto; push com app fechado é separado.';}
      catch(e){$('nk35-lembretes-status').textContent=e.message;}
      finally{btn.disabled=false;}
    });
    if($('nk35-lembretes-status')) {
      const status=$('nk35-lembretes-status'),btn=$('nk35-ativar-lembretes');
      status.textContent=!('Notification' in window)?'Notificações indisponíveis neste navegador.':
        Notification.permission==='granted'?'Permissão já concedida neste aparelho. Lembretes locais funcionam com o app aberto. O envio com o app fechado depende do push do Início.':
        Notification.permission==='denied'?'Notificações bloqueadas; altere a permissão nas configurações do aparelho.':
        'Toque em Ativar para permitir avisos enquanto o aplicativo estiver aberto.';
      if(btn && 'Notification' in window){
        if(Notification.permission==='granted')btn.textContent='↻ Verificar lembretes';
        if(Notification.permission==='denied'){btn.disabled=true;btn.textContent='Permissão bloqueada';}
      }
    }
    void carregar();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
