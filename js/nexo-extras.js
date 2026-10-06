/* Nexo: criação de Trabalhos nos criadores globais */
(async function(){
  const $=id=>document.getElementById(id); const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const user=(await nexoSupabase.auth.getSession()).data.session?.user; if(!user)return;
  let materias=[]; try{const r=await nexoSupabase.from('materias').select('id,nome').eq('usuario_id',user.id).order('nome');materias=r.data||[]}catch(e){}
  const contexts=[['opcaoProva','dashboard'],['criarProvaSemana','semana'],['criarProvaMes','mes'],['publicarProva','publica']];
  const found=contexts.find(([id])=>$(id)); if(!found)return; const [anchorId,ctx]=found; const anchor=$(anchorId);
  const btn=document.createElement('button');btn.type='button';btn.className='modal-opcao';btn.id='nexoCriarTrabalho';btn.innerHTML='<div class="modal-opcao-icone">▣</div><div><strong>Trabalho</strong><span>'+(ctx==='publica'?'Compartilhe um trabalho com os usuários.':'Adicione um trabalho'+(ctx==='semana'||ctx==='mes'?' para esta data.':'.'))+'</span></div>';anchor.after(btn);
  const modal=document.createElement('div');modal.className='modal-fundo';modal.id='nexoModalTrabalho';modal.innerHTML=`<div class="modal"><div class="modal-cabecalho"><div><span>TRABALHO</span><h2>${ctx==='publica'?'Publicar trabalho':'Novo trabalho'}</h2></div><button type="button" class="modal-fechar" id="nexoFecharTrabalho">×</button></div><form class="formulario-nexo" id="nexoFormTrabalho"><div class="formulario-campo"><label>Nome do trabalho</label><input id="nexoTrabalhoNome" required maxlength="120" placeholder="Ex.: Trabalho de Química"></div><div class="formulario-campo"><label>Matéria</label><select id="nexoTrabalhoMateria"><option value="">Sem matéria</option>${materias.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></div><div class="formulario-campo"><label>Data de entrega</label><input type="date" id="nexoTrabalhoData" required></div><div class="formulario-campo"><label>Horário (opcional)</label><input type="time" id="nexoTrabalhoHorario"></div><div class="formulario-campo"><label>Descrição (opcional)</label><textarea id="nexoTrabalhoDescricao" maxlength="1000"></textarea></div><div class="formulario-botoes"><button type="button" class="botao-cancelar" id="nexoCancelarTrabalho">Cancelar</button><button type="submit" class="botao-salvar">${ctx==='publica'?'Publicar trabalho':'Criar trabalho'}</button></div></form></div>`;document.body.appendChild(modal);
  const fechar=()=>modal.classList.remove('ativo'); $('nexoFecharTrabalho').onclick=fechar;$('nexoCancelarTrabalho').onclick=fechar;modal.onclick=e=>{if(e.target===modal)fechar()};
  btn.onclick=()=>{ try{ if((ctx==='semana'||ctx==='mes') && typeof dataSelecionada!=='undefined' && dataSelecionada) $('nexoTrabalhoData').value=dataSelecionada; }catch(e){}; document.querySelectorAll('.modal-fundo.ativo').forEach(x=>x.classList.remove('ativo'));modal.classList.add('ativo');};
  $('nexoFormTrabalho').onsubmit=async e=>{e.preventDefault();const submit=e.currentTarget.querySelector('[type=submit]');if(submit.disabled)return;const nome=$('nexoTrabalhoNome').value.trim(),data=$('nexoTrabalhoData').value;if(!nome||!data){alert('Preencha o nome e a data do trabalho.');return;}const materia_id=$('nexoTrabalhoMateria').value||null;const payload={nome,descricao:$('nexoTrabalhoDescricao').value.trim()||null,data,horario:$('nexoTrabalhoHorario').value||null,materia_id,materia_nome:materias.find(m=>m.id===materia_id)?.nome||null,usuario_id:user.id,no_calendario:ctx==='publica'?false:true,concluido:false,visibilidade:ctx==='publica'?'publica':'privada'};try{submit.disabled=true;submit.textContent='Salvando...';const {error}=await nexoSupabase.from('trabalhos').insert(payload);if(error)throw error;fechar();location.reload();}catch(error){console.error('Erro ao criar trabalho:',error);alert('Não foi possível salvar o trabalho: '+(error?.message||'erro desconhecido'));submit.disabled=false;submit.textContent=ctx==='publica'?'Publicar trabalho':'Criar trabalho';}};

  if(ctx==='publica'){
    try {
      const {data:pub,error:erroTrabalhos}=await nexoSupabase
        .from('trabalhos')
        .select('id,nome,descricao,data,horario,materia_id,materia_nome,usuario_id')
        .eq('visibilidade','publica')
        .order('data',{ascending:true});
      if(erroTrabalhos) throw erroTrabalhos;

      const ids=[...new Set((pub||[]).map(t=>t.usuario_id).filter(Boolean))];
      let nomes={};
      if(ids.length){
        const {data:perfis,error:erroPerfis}=await nexoSupabase.from('perfis').select('id,nome').in('id',ids);
        if(!erroPerfis) (perfis||[]).forEach(p=>nomes[p.id]=p.nome);
      }

      if(pub?.length){
        const alvo=$('visaoAtividades')||document.querySelector('main');
        const sec=document.createElement('section');
        sec.className='painel nexo-trabalhos-publicos';
        sec.style.marginBottom='24px';
        sec.innerHTML=`<div class="painel-cabecalho"><div><span class="painel-etiqueta">TRABALHOS</span><h2>Trabalhos compartilhados</h2></div></div><div class="atividades-lista">${pub.map(t=>`<article class="atividade-card" data-trabalho-publico="${t.id}"><div><span class="atividade-materia">${esc(t.materia_nome||'Sem matéria')}</span><h3>${esc(t.nome)}</h3><p>${new Date(t.data+'T12:00:00').toLocaleDateString('pt-BR')}${t.horario?' • '+t.horario.slice(0,5):''}</p>${t.descricao?`<p>${esc(t.descricao)}</p>`:''}<small>Adicionado por ${esc(nomes[t.usuario_id]||'Usuário')}</small></div><div class="atividade-acoes"><button type="button" class="botao-secundario nexo-add-trabalho" data-id="${t.id}">+ Minha agenda</button></div></article>`).join('')}</div>`;
        alvo.prepend(sec);

        sec.querySelectorAll('.nexo-add-trabalho').forEach(b=>b.addEventListener('click',async()=>{
          const t=pub.find(x=>x.id===b.dataset.id); if(!t)return;
          b.disabled=true; const antigo=b.textContent; b.textContent='Adicionando...';
          try{
            let materia_id=null;
            if(t.materia_nome){
              const m=materias.find(x=>x.nome.trim().toLowerCase()===t.materia_nome.trim().toLowerCase());
              if(m) materia_id=m.id;
            }
            const {error}=await nexoSupabase.from('trabalhos').insert({
              nome:t.nome,descricao:t.descricao||null,data:t.data,horario:t.horario||null,
              materia_id,materia_nome:t.materia_nome||null,usuario_id:user.id,
              no_calendario:true,concluido:false,visibilidade:'privada'
            });
            if(error) throw error;
            b.textContent='Adicionado ✓';
          }catch(error){
            console.error('Erro ao adicionar trabalho à agenda:',error);
            alert('Não foi possível adicionar o trabalho à sua agenda: '+(error?.message||'erro desconhecido'));
            b.disabled=false;b.textContent=antigo;
          }
        }));
      }
    } catch(error) {
      console.error('Erro ao carregar trabalhos públicos:',error);
    }
  }
})();
