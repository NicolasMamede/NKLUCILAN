/* NEXO - integração completa de Trabalhos na Agenda Pública */
(async function () {
    const $ = id => document.getElementById(id);
    const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const sessao = (await nexoSupabase.auth.getSession()).data.session;
    const user = sessao?.user;
    if (!user) return;

    let materias = [];
    let trabalhosPublicos = [];
    let trabalhoEditandoId = "";
    try {
        const r = await nexoSupabase.from("materias").select("id,nome").eq("usuario_id", user.id).order("nome");
        materias = r.data || [];
    } catch (_) {}

    /* ---------- opção Trabalho no modal Publicar ---------- */
    const anchor = $("publicarProva");
    if (anchor && !$("nexoCriarTrabalho")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "modal-opcao";
        btn.id = "nexoCriarTrabalho";
        btn.innerHTML = '<div class="modal-opcao-icone">▣</div><div><strong>Trabalho</strong><span>Compartilhe um trabalho com os usuários.</span></div>';
        anchor.after(btn);
    }

    /* ---------- modal criar/editar ---------- */
    const modal = document.createElement("div");
    modal.className = "modal-fundo";
    modal.id = "nexoModalTrabalho";
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-cabecalho"><div><span>TRABALHO</span><h2 id="nexoTituloModalTrabalho">Publicar trabalho</h2></div><button type="button" class="modal-fechar" id="nexoFecharTrabalho">×</button></div>
        <form class="formulario-nexo" id="nexoFormTrabalho">
          <div class="formulario-campo"><label>Nome do trabalho</label><input id="nexoTrabalhoNome" required maxlength="120" placeholder="Ex.: Trabalho de Química"></div>
          <div class="formulario-campo"><label>Matéria</label><select id="nexoTrabalhoMateria"><option value="">Sem matéria</option>${materias.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join("")}</select></div>
          <div class="formulario-campo"><label>Data de entrega</label><input type="date" id="nexoTrabalhoData" required></div>
          <div class="formulario-campo"><label>Horário (opcional)</label><input type="time" id="nexoTrabalhoHorario"></div>
          <div class="formulario-campo"><label>Descrição (opcional)</label><textarea id="nexoTrabalhoDescricao" maxlength="1000"></textarea></div>
          <div class="formulario-botoes"><button type="button" class="botao-cancelar" id="nexoCancelarTrabalho">Cancelar</button><button type="submit" class="botao-salvar" id="nexoSalvarTrabalho">Publicar trabalho</button></div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const fechar = () => modal.classList.remove("ativo");
    const abrirNovo = () => {
        trabalhoEditandoId = "";
        $("nexoFormTrabalho").reset();
        $("nexoTituloModalTrabalho").textContent = "Publicar trabalho";
        $("nexoSalvarTrabalho").textContent = "Publicar trabalho";
        document.querySelectorAll(".modal-fundo.ativo").forEach(x => x.classList.remove("ativo"));
        modal.classList.add("ativo");
    };
    $("nexoCriarTrabalho")?.addEventListener("click", abrirNovo);
    $("nexoFecharTrabalho").onclick = fechar;
    $("nexoCancelarTrabalho").onclick = fechar;
    modal.onclick = e => { if (e.target === modal) fechar(); };

    $("nexoFormTrabalho").onsubmit = async e => {
        e.preventDefault();
        const submit = $("nexoSalvarTrabalho");
        if (submit.disabled) return;
        const nome = $("nexoTrabalhoNome").value.trim();
        const data = $("nexoTrabalhoData").value;
        if (!nome || !data) return;
        const materia_id = $("nexoTrabalhoMateria").value || null;
        const dados = {
            nome,
            descricao: $("nexoTrabalhoDescricao").value.trim() || null,
            data,
            horario: $("nexoTrabalhoHorario").value || null,
            materia_id,
            materia_nome: materias.find(m => m.id === materia_id)?.nome || null
        };
        try {
            submit.disabled = true;
            submit.textContent = "Salvando...";
            let r;
            if (trabalhoEditandoId) {
                r = await nexoSupabase.from("trabalhos").update(dados).eq("id", trabalhoEditandoId).eq("usuario_id", user.id);
            } else {
                r = await nexoSupabase.from("trabalhos").insert({...dados, usuario_id:user.id, no_calendario:false, concluido:false, visibilidade:"publica"});
            }
            if (r.error) throw r.error;
            fechar();
            trabalhoEditandoId = "";
            await atualizarDadosPublicos();
        } catch (error) {
            console.error("Erro ao salvar trabalho público:", error);
            alert("Não foi possível salvar o trabalho: " + (error?.message || "erro desconhecido"));
        } finally {
            submit.disabled = false;
            submit.textContent = trabalhoEditandoId ? "Salvar alterações" : "Publicar trabalho";
        }
    };

    /* ---------- aba Trabalhos ---------- */
    const abaProvas = document.querySelector('.agenda-publica-aba[data-visao="provas"]');
    if (abaProvas && !document.querySelector('.agenda-publica-aba[data-visao="trabalhos"]')) {
        const aba = document.createElement("button");
        aba.type = "button";
        aba.className = "agenda-publica-aba";
        aba.dataset.visao = "trabalhos";
        aba.textContent = "Trabalhos";
        abaProvas.after(aba);
        aba.addEventListener("click", () => trocarVisao("trabalhos"));
    }

    const visaoProvas = $("visaoProvas");
    if (visaoProvas && !$("visaoTrabalhos")) {
        const sec = document.createElement("section");
        sec.className = "agenda-publica-visao";
        sec.id = "visaoTrabalhos";
        sec.dataset.visaoConteudo = "trabalhos";
        sec.innerHTML = `<div class="painel"><div class="painel-cabecalho"><div><span class="painel-etiqueta">COMPARTILHADO</span><h2>Trabalhos</h2></div></div><div class="agenda-publica-lista" id="listaPublicaTrabalhos"></div></div>`;
        visaoProvas.after(sec);
    }

    /* legendas Semana/Mês */
    document.querySelectorAll(".semana-legenda, .mes-legenda").forEach(leg => {
        if (!leg.querySelector(".legenda-trabalho")) {
            const span = document.createElement("span");
            span.innerHTML = '<i class="legenda-trabalho"></i> Trabalho';
            leg.appendChild(span);
        }
    });

    /* ---------- carregar junto da agenda ---------- */
    const carregarBase = carregarAgendaPublica;
    carregarAgendaPublica = async function () {
        await carregarBase();
        const {data, error} = await nexoSupabase.from("trabalhos")
            .select("id,nome,descricao,data,horario,materia_id,materia_nome,usuario_id,criado_em")
            .eq("visibilidade","publica").order("data",{ascending:true}).order("horario",{ascending:true,nullsFirst:false});
        if (error) {
            console.error("Erro ao carregar trabalhos públicos:", error);
            trabalhosPublicos = [];
            return;
        }
        trabalhosPublicos = (data || []).map(t => ({
            id:t.id, titulo:t.nome, nome:t.nome, descricao:t.descricao||"", data:t.data,
            horario:formatarHorario(t.horario), materiaId:t.materia_id||"", materiaNome:t.materia_nome||"",
            usuarioId:t.usuario_id, criadoEm:t.criado_em||"", tipo:"trabalho"
        }));
    };

    const todosBase = obterTodosItensPublicos;
    obterTodosItensPublicos = function () {
        return [...todosBase(), ...trabalhosPublicos].sort(compararItens);
    };

    /* ---------- card com visual oficial ---------- */
    const cardBase = criarCardPublico;
    criarCardPublico = function (item) {
        if (item.tipo !== "trabalho") return cardBase(item);
        const card = document.createElement("article");
        card.className = "agenda-publica-card agenda-publica-card-trabalho";
        const ehAutor = usuarioLogado && item.usuarioId === usuarioLogado.id;
        const autor = obterNomeAutor(item.usuarioId);
        const materia = item.materiaNome || "Sem matéria";
        const horario = item.horario || "Sem horário";
        card.innerHTML = `
          <div class="agenda-publica-card-icone">▣</div>
          <div class="agenda-publica-card-conteudo">
            <div class="agenda-publica-card-topo"><span class="agenda-publica-tipo agenda-publica-tipo-trabalho">TRABALHO</span><span class="agenda-publica-materia">${esc(materia)}</span></div>
            <h3>${esc(item.titulo)}</h3>
            <div class="agenda-publica-meta"><span>${esc(formatarDataCompleta(item.data))}</span><span>${esc(horario)}</span></div>
            ${item.descricao ? `<p class="agenda-publica-descricao">${esc(item.descricao)}</p>` : ""}
            <div class="agenda-publica-autor"><span class="agenda-publica-autor-avatar">${esc(autor.trim().charAt(0).toUpperCase())}</span><span>Adicionado por <strong>${esc(autor)}</strong></span></div>
          </div>
          <div class="agenda-publica-acoes">
            <button type="button" class="agenda-publica-adicionar" data-acao="adicionar" data-tipo="trabalho" data-id="${item.id}">+ Minha agenda</button>
            ${ehAutor ? `<button type="button" class="agenda-publica-editar" data-acao="editar" data-tipo="trabalho" data-id="${item.id}">Editar</button><button type="button" class="agenda-publica-excluir excluir" data-acao="excluir" data-tipo="trabalho" data-id="${item.id}">Excluir</button>` : ""}
          </div>`;
        return card;
    };

    function renderizarTrabalhos() {
        const lista = $("listaPublicaTrabalhos");
        if (!lista) return;
        lista.innerHTML = "";
        if (!trabalhosPublicos.length) {
            lista.appendChild(criarEstadoVazio("Nenhum trabalho compartilhado", "Ainda não existem trabalhos públicos no Nexo."));
            return;
        }
        [...trabalhosPublicos].sort(compararItens).forEach(t => lista.appendChild(criarCardPublico(t)));
    }

    const renderTudoBase = renderizarTudo;
    renderizarTudo = function () {
        renderTudoBase();
        renderizarTrabalhos();
        document.querySelectorAll(".semana-item-trabalho .semana-item-tipo").forEach(el => el.textContent = "TRABALHO");
    };

    /* ---------- editar ---------- */
    const editarBase = editarItem;
    editarItem = function (tipo, id) {
        if (tipo !== "trabalho") return editarBase(tipo,id);
        const t = trabalhosPublicos.find(x => x.id === id);
        if (!t || t.usuarioId !== user.id) return;
        trabalhoEditandoId = t.id;
        $("nexoTrabalhoNome").value = t.nome || t.titulo || "";
        $("nexoTrabalhoMateria").value = t.materiaId || "";
        $("nexoTrabalhoData").value = t.data || "";
        $("nexoTrabalhoHorario").value = t.horario || "";
        $("nexoTrabalhoDescricao").value = t.descricao || "";
        $("nexoTituloModalTrabalho").textContent = "Editar trabalho";
        $("nexoSalvarTrabalho").textContent = "Salvar alterações";
        modal.classList.add("ativo");
    };

    /* ---------- excluir ---------- */
    const excluirBase = excluirItem;
    excluirItem = async function (tipo,id) {
        if (tipo !== "trabalho") return excluirBase(tipo,id);
        const t = trabalhosPublicos.find(x => x.id === id);
        if (!t || t.usuarioId !== user.id) return;
        if (!confirm(`Deseja excluir "${t.titulo}" da Agenda Pública?`)) return;
        const {error} = await nexoSupabase.from("trabalhos").delete().eq("id",id).eq("usuario_id",user.id);
        if (error) { console.error(error); alert("Não foi possível excluir o trabalho."); return; }
        await atualizarDadosPublicos();
    };

    /* ---------- + Minha agenda ---------- */
    const duplicadoBase = verificarDuplicado;
    verificarDuplicado = async function (item) {
        if (item.tipo !== "trabalho") return duplicadoBase(item);
        let q = nexoSupabase.from("trabalhos").select("id").eq("usuario_id",user.id).eq("visibilidade","privada").eq("nome",item.titulo).eq("data",item.data);
        if (item.horario) q = q.eq("horario",item.horario);
        const {data,error} = await q.limit(1);
        if (error) return false;
        return !!(data && data.length);
    };

    const adicionarBase = adicionarMinhaAgenda;
    adicionarMinhaAgenda = async function (tipo,id) {
        if (tipo !== "trabalho") return adicionarBase(tipo,id);
        const t = trabalhosPublicos.find(x => x.id === id);
        if (!t) return;
        if (await verificarDuplicado(t)) {
            if (!confirm("Parece que este trabalho já está na sua agenda. Deseja adicionar outra cópia mesmo assim?")) return;
        }
        const materiaLocal = procurarMateriaLocal(t.materiaNome);
        const {error} = await nexoSupabase.from("trabalhos").insert({
            nome:t.titulo, descricao:t.descricao||null, data:t.data, horario:t.horario||null,
            materia_id:materiaLocal?materiaLocal.id:null, materia_nome:t.materiaNome||null,
            usuario_id:user.id, visibilidade:"privada", no_calendario:true, concluido:false
        });
        if (error) { console.error(error); alert("Não foi possível adicionar o trabalho."); return; }
        alert("Trabalho adicionado à sua agenda!");
    };

    /* Atualiza também ao voltar para a página */
    window.addEventListener("focus", () => { if (usuarioLogado) atualizarDadosPublicos(); });
})();
