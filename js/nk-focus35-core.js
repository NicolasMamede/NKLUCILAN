/* NKLUCILAN Focus 3.5 — utilidades compartilhadas, sem alterar o esquema de dados. */
(() => {
  'use strict';
  const HOJE = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const nome = tipo => ({atividade:'Atividade',prova:'Prova',trabalho:'Trabalho'})[tipo] || tipo;
  const normalize = str => String(str||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const isoBR = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso||'') ? iso.split('-').reverse().join('/') : 'Sem data';
  const tables = [
    ['atividades','id, titulo, descricao, data, horario, materia_id, concluida, no_calendario, lembretes'],
    ['provas','id, nome, conteudo, data, horario, materia_id, no_calendario, lembretes'],
    ['trabalhos','id, nome, descricao, data, horario, materia_id, concluido, no_calendario, lembretes']
  ];
  async function carregar(usuarioId) {
    if (!usuarioId) throw new Error('Faça login para acessar seus dados.');
    const erros = [];
    const fetchTable = async ([table, columns]) => {
      const itens = [];
      for(let page=0;page<10;page++) {
        const {data,error} = await nexoSupabase.from(table).select(columns)
          .eq('usuario_id',usuarioId).eq('visibilidade','privada')
          .order('data',{ascending:true}).order('id',{ascending:true})
          .range(page*500,page*500+499);
        if(error) {erros.push(`${table}: ${error.message}`);break;}
        itens.push(...(data||[]));
        if(!data || data.length<500) break;
      }
      return itens.map(row => ({...row,
        tipo: table==='atividades'?'atividade':table==='provas'?'prova':'trabalho',
        titulo: row.titulo || row.nome || 'Sem título',
        descricao: row.descricao || row.conteudo || '',
        concluido: Boolean(row.concluida || row.concluido)
      }));
    };
    const [registros,materiasRes] = await Promise.all([
      Promise.all(tables.map(fetchTable)),
      nexoSupabase.from('materias').select('id, nome, cor').eq('usuario_id',usuarioId).order('nome')
    ]);
    if(materiasRes.error) erros.push('matérias: '+materiasRes.error.message);
    return {itens:registros.flat(),materias:materiasRes.data||[],erros};
  }
  async function concluir(item, usuarioId, recarregar) {
    if(!item || item.tipo==='prova') throw new Error('A conclusão de provas não está disponível.');
    const table = item.tipo==='trabalho'?'trabalhos':'atividades';
    const coluna = item.tipo==='trabalho'?'concluido':'concluida';
    const {error} = await nexoSupabase.from(table).update({[coluna]:true})
      .eq('id',item.id).eq('usuario_id',usuarioId).eq('visibilidade','privada');
    if(error) throw error;
    if(recarregar) await recarregar();
  }
  function botaoConcluir(cartao, item, usuario, recarregar) {
    if(item.tipo==='prova') return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='nk35-concluir';btn.textContent='✓';
    btn.title='Concluir '+nome(item.tipo).toLowerCase();
    btn.setAttribute('aria-label',`Concluir ${item.titulo}`);
    btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();});
    btn.addEventListener('click',async e=>{
      e.preventDefault();e.stopPropagation();
      if(btn.disabled)return;
      btn.disabled=true;btn.textContent='…';
      try{await concluir(item,typeof usuario==='function'?usuario():usuario,recarregar);}
      catch(err){console.error('[NK Focus 3.5] Conclusão:',err);btn.disabled=false;btn.textContent='✓';alert('Não foi possível concluir. Verifique a conexão e tente novamente.');}
    });
    cartao.classList.add('nk35-card-com-conclusao');
    cartao.appendChild(btn);
  }
  function inserirMenu() {
    const menu=document.querySelector('.sidebar-menu');if(!menu || document.querySelector('.nk35-link-busca'))return;
    const ativo=location.pathname.split('/').pop();
    const itens=[['buscar.html','Buscar','⌕','nk35-link-busca'],['estatisticas.html','Estatísticas','◫','nk35-link-estatisticas']];
    const referencia=menu.querySelector('.menu-secao');
    for(const [href,label,symbol,css] of itens){
      const a=document.createElement('a');a.href=href;a.className='menu-item '+css+(ativo===href?' ativo':'');
      const icone=document.createElement('span');icone.className='menu-icone';icone.textContent=symbol;
      const texto=document.createElement('span');texto.textContent=label;
      a.append(icone,texto);referencia?menu.insertBefore(a,referencia):menu.appendChild(a);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inserirMenu,{once:true});else inserirMenu();
  window.NKFocus35=Object.freeze({hoje:HOJE,nome,normalize,isoBR,carregar,concluir,botaoConcluir});
})();
