/* NK Lucilan • Central de Novidades, Sugestões e Administração */
(() => {
  'use strict';
  let ctx, comunicados=[], sugestoes=[], caixa=[];
  const $=id=>document.getElementById(id);
  const fmt=valor=>new Date(valor).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const tipoNome={atualizacao:'Atualização',importante:'Aviso importante',manutencao:'Manutenção'};
  const tipoEmoji={atualizacao:'✨',importante:'📣',manutencao:'🛠️'};
  const statusNome={recebida:'Recebida',em_analise:'Em análise',em_desenvolvimento:'Em desenvolvimento',implementada:'Implementada',recusada:'Não implementada'};
  const escape= v => ctx.esc(v);
  const erroMsg=erro=>erro?.message || 'Não foi possível concluir. Verifique sua conexão.';
  function aviso(texto, erro=false){const el=$('nk-c-alerta');el.textContent=texto;el.className=`nk-c-alerta ${erro?'nk-c-erro':'nk-c-sucesso'}`;el.hidden=false;el.scrollIntoView({behavior:'smooth',block:'nearest'});}
  function carregarIndicadores(){
    $('nk-c-num-novidades').textContent=comunicados.filter(c=>c.ativo).length;
    $('nk-c-num-enviadas').textContent=sugestoes.length;
    $('nk-c-num-pendentes').textContent=ctx.admin?caixa.filter(s=>s.status==='recebida').length:'—';
  }
  function cardComunicado(c,administravel=false){
    const tipo=tipoNome[c.categoria] || tipoNome.atualizacao;
    return `<article class="nk-c-card nk-c-comunicado">
      <div class="nk-c-card-top"><span class="nk-c-pill nk-c-tag-${escape(c.categoria)}">${tipoEmoji[c.categoria]||'✨'} ${tipo}</span><span class="nk-c-date">${escape(fmt(c.criado_em))}</span></div>
      <h3>${escape(c.titulo)}</h3><p class="nk-c-msg">${escape(c.mensagem)}</p>
      ${administravel ? `<div class="nk-c-actions"><span class="nk-c-pill ${c.ativo?'nk-c-green':'nk-c-muted'}">${c.ativo?'Publicado':'Arquivado'}</span>
        <button type="button" class="nk-c-btn nk-c-btn-ghost" data-com-action="editar" data-id="${c.id}">Editar</button>
        <button type="button" class="nk-c-btn nk-c-btn-ghost" data-com-action="alternar" data-id="${c.id}">${c.ativo?'Arquivar':'Republicar'}</button>
        <button type="button" class="nk-c-btn nk-c-btn-danger" data-com-action="excluir" data-id="${c.id}">Excluir</button></div>` : ''}
    </article>`;
  }
  function cardSugestao(s,admin=false){
    const status=statusNome[s.status]||'Recebida';
    const tag=s.status==='implementada'?'nk-c-green':s.status==='recusada'?'nk-c-red':s.status==='recebida'?'nk-c-orange':'nk-c-blue';
    return `<article class="nk-c-card nk-c-sugestao" data-sugestao-id="${s.id}">
      <div class="nk-c-card-top"><span class="nk-c-pill ${tag}">${escape(status)}</span><span class="nk-c-date">${escape(fmt(s.criado_em))}</span></div>
      <h3>${escape(s.titulo)}</h3><div class="nk-c-by">${escape(s.categoria==='problema'?'🐞 Relato de problema':'💡 Sugestão')}${admin?' • Por '+escape(s.autor_nome||'Usuário'):''}</div>
      <p class="nk-c-msg">${escape(s.descricao)}</p>
      ${!admin && s.resposta_admin ? `<div class="nk-c-resposta"><strong>Resposta do desenvolvedor</strong><p>${escape(s.resposta_admin)}</p></div>` : ''}
      ${admin ? `<div class="nk-c-admin-reply"><label>Status <select data-field="status">
         ${Object.entries(statusNome).map(([v,label])=>`<option value="${v}" ${v===s.status?'selected':''}>${label}</option>`).join('')}
        </select></label><label>Resposta para quem enviou <textarea data-field="resposta_admin" rows="3" maxlength="5000" placeholder="Explique a decisão ou a atualização...">${escape(s.resposta_admin||'')}</textarea></label>
        <button type="button" class="nk-c-btn nk-c-btn-primary" data-sug-action="salvar" data-id="${s.id}">Salvar resposta e status</button></div>` : ''}
    </article>`;
  }
  function mostrarConteudo(){
    $('nk-c-novidades-lista').innerHTML=comunicados.filter(c=>c.ativo).map(c=>cardComunicado(c)).join('') || '<div class="nk-c-empty">📣 Ainda não há comunicados publicados.</div>';
    $('nk-c-minhas-lista').innerHTML=sugestoes.map(s=>cardSugestao(s)).join('') || '<div class="nk-c-empty">💡 Você ainda não enviou sugestões.</div>';
    if(ctx.admin){
      $('nk-c-admin-com-lista').innerHTML=comunicados.map(c=>cardComunicado(c,true)).join('') || '<div class="nk-c-empty">Nenhum comunicado criado.</div>';
      const filtrado=$('nk-c-filtro-status').value;
      const itens=caixa.filter(s=>filtrado==='todos'||s.status===filtrado);
      $('nk-c-admin-sug-lista').innerHTML=itens.map(s=>cardSugestao(s,true)).join('') || '<div class="nk-c-empty">Nenhuma sugestão nesta categoria.</div>';
    }
    carregarIndicadores();
  }
  async function buscarDados(){
    const [c,s,a]=await Promise.all([
      nexoSupabase.from('nk_comunicados').select('id,titulo,mensagem,categoria,ativo,criado_em').order('criado_em',{ascending:false}),
      nexoSupabase.from('nk_sugestoes').select('id,usuario_id,autor_nome,titulo,descricao,categoria,status,resposta_admin,criado_em').eq('usuario_id',ctx.user.id).order('criado_em',{ascending:false}),
      ctx.admin?nexoSupabase.from('nk_sugestoes').select('id,usuario_id,autor_nome,titulo,descricao,categoria,status,resposta_admin,criado_em').order('criado_em',{ascending:false}):Promise.resolve({data:[],error:null})
    ]);
    const errors=[c.error,s.error,a.error].filter(Boolean);
    if(errors.length){aviso('Não foi possível carregar a central. Confira se executou o SQL e ativou sua conta de administrador. '+erroMsg(errors[0]),true);return;}
    comunicados=c.data||[];sugestoes=s.data||[];caixa=a.data||[];
    mostrarConteudo();
    if(ctx.admin && typeof ctx.contarRecebidas==='function') await ctx.contarRecebidas();
  }
  function abaSelecionada(){return ['novidades','sugestoes','admin'].includes(location.hash.slice(1))?location.hash.slice(1):'novidades';}
  function alterarAba(){
    let aba=abaSelecionada();if(aba==='admin'&&!ctx?.admin){location.hash='#novidades';aba='novidades';}
    document.querySelectorAll('[data-nk-tab]').forEach(b=>{const ativa=b.dataset.nkTab===aba;b.classList.toggle('ativo',ativa);b.setAttribute('aria-selected',String(ativa));});
    document.querySelectorAll('[data-nk-panel]').forEach(p=>{p.hidden=p.dataset.nkPanel!==aba;});
    ctx?.atualizarAtivo();
  }
  async function enviarSugestao(event){
    event.preventDefault();const btn=$('nk-c-enviar-sug');const titulo=$('nk-c-sug-titulo').value.trim(), descricao=$('nk-c-sug-descricao').value.trim();
    if(titulo.length<3 || descricao.length<5){aviso('Preencha o título e a descrição da sugestão.',true);return;}
    btn.disabled=true;
    try{
      const {error}=await nexoSupabase.from('nk_sugestoes').insert({titulo,descricao,categoria:$('nk-c-sug-categoria').value,usuario_id:ctx.user.id});
      if(error) throw error;
      $('nk-c-form-sug').reset();aviso('Sugestão enviada! Você poderá acompanhar a resposta aqui.');await buscarDados();
    }catch(e){aviso('Erro ao enviar sugestão: '+erroMsg(e),true);}finally{btn.disabled=false;}
  }
  function limparEdicao(){ $('nk-c-form-com').reset(); $('nk-c-form-com').dataset.editarId='';$('nk-c-com-salvar').textContent='Publicar comunicado';$('nk-c-com-cancelar').hidden=true; }
  async function salvarComunicado(event){
    event.preventDefault();if(!ctx.admin) return;
    const form=$('nk-c-form-com'),btn=$('nk-c-com-salvar'),id=form.dataset.editarId;
    const payload={titulo:$('nk-c-com-titulo').value.trim(),mensagem:$('nk-c-com-mensagem').value.trim(),categoria:$('nk-c-com-categoria').value,ativo:$('nk-c-com-ativo').checked};
    if(payload.titulo.length<3 || payload.mensagem.length<5){aviso('Preencha um título e uma mensagem completos.',true);return;}
    btn.disabled=true;
    try{
      const query=id?nexoSupabase.from('nk_comunicados').update(payload).eq('id',id):nexoSupabase.from('nk_comunicados').insert({...payload,autor_id:ctx.user.id});
      const {error}=await query;if(error)throw error;
      limparEdicao();aviso(id?'Comunicado atualizado!':'Comunicado publicado! Seus amigos verão o aviso ao entrar.');await buscarDados();
    }catch(e){aviso('Erro ao salvar comunicado: '+erroMsg(e),true);}finally{btn.disabled=false;}
  }
  async function acaoComunicado(event){
    const btn=event.target.closest('[data-com-action]');if(!btn||!ctx.admin)return;
    const comunicado=comunicados.find(c=>c.id===btn.dataset.id);if(!comunicado)return;
    if(btn.dataset.comAction==='editar'){
      $('nk-c-com-titulo').value=comunicado.titulo;$('nk-c-com-mensagem').value=comunicado.mensagem;
      $('nk-c-com-categoria').value=comunicado.categoria;$('nk-c-com-ativo').checked=comunicado.ativo;
      $('nk-c-form-com').dataset.editarId=comunicado.id;
      $('nk-c-com-salvar').textContent='Salvar alterações';$('nk-c-com-cancelar').hidden=false;
      $('nk-c-form-com').scrollIntoView({behavior:'smooth',block:'center'});return;
    }
    if(btn.dataset.comAction==='excluir'&&!confirm('Excluir este comunicado definitivamente?'))return;
    btn.disabled=true;
    try{
      const query=btn.dataset.comAction==='excluir'?nexoSupabase.from('nk_comunicados').delete().eq('id',comunicado.id):nexoSupabase.from('nk_comunicados').update({ativo:!comunicado.ativo}).eq('id',comunicado.id);
      const {error}=await query;if(error)throw error;aviso('Comunicado atualizado com sucesso.');await buscarDados();
    }catch(e){aviso('Erro ao alterar comunicado: '+erroMsg(e),true);}finally{btn.disabled=false;}
  }
  async function salvarResposta(event){
    const btn=event.target.closest('[data-sug-action="salvar"]');if(!btn||!ctx.admin)return;
    const card=btn.closest('[data-sugestao-id]');if(!card)return;
    const status=card.querySelector('[data-field="status"]').value,resposta=card.querySelector('[data-field="resposta_admin"]').value.trim();
    btn.disabled=true;
    try{
      const {error}=await nexoSupabase.from('nk_sugestoes').update({status,resposta_admin:resposta||null,respondido_em:resposta?new Date().toISOString():null}).eq('id',btn.dataset.id);
      if(error)throw error;aviso('Resposta e status salvos. O autor poderá visualizar a atualização.');await buscarDados();
    }catch(e){aviso('Erro ao responder: '+erroMsg(e),true);}finally{btn.disabled=false;}
  }
  function prepararEventos(){
    window.addEventListener('hashchange',alterarAba);
    document.querySelectorAll('[data-nk-tab]').forEach(b=>b.addEventListener('click',()=>{location.hash='#'+b.dataset.nkTab;alterarAba();}));
    $('nk-c-form-sug').addEventListener('submit',enviarSugestao);
    $('nk-c-form-com').addEventListener('submit',salvarComunicado);
    $('nk-c-com-cancelar').addEventListener('click',limparEdicao);
    $('nk-c-admin-com-lista').addEventListener('click',acaoComunicado);
    $('nk-c-admin-sug-lista').addEventListener('click',salvarResposta);
    $('nk-c-filtro-status').addEventListener('change',mostrarConteudo);
  }
  async function iniciar(){
    if (!window.NKCentral) return;
    ctx=window.NKCentral;
    if(ctx.admin){$('nk-c-tab-admin').hidden=false;} else {$('nk-c-num-pendentes-box').hidden=true;}
    prepararEventos();alterarAba();await buscarDados();
  }
  if (window.NKCentral) void iniciar();
  else document.addEventListener('nk-central-pronto',()=>void iniciar(),{once:true});
})();
