    /* =====================================================
   NEXO - ATIVIDADES
   SUPABASE
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const novaAtividade =
    document.getElementById("novaAtividade");

const criarPrimeiraAtividade =
    document.getElementById("criarPrimeiraAtividade");

const modalAtividade =
    document.getElementById("modalAtividade");

const fecharModalAtividade =
    document.getElementById("fecharModalAtividade");

const cancelarAtividade =
    document.getElementById("cancelarAtividade");

const formAtividade =
    document.getElementById("formAtividade");

const tituloModalAtividade =
    document.getElementById("tituloModalAtividade");

const tituloAtividade =
    document.getElementById("tituloAtividade");

const dataAtividade =
    document.getElementById("dataAtividade");

const materiaAtividade =
    document.getElementById("materiaAtividade");

const horarioAtividade =
    document.getElementById("horarioAtividade");

const descricaoAtividade =
    document.getElementById("descricaoAtividade");

const listaAtividades =
    document.getElementById("listaAtividades");

const atividadesVazio =
    document.getElementById("atividadesVazio");

const textoAtividadesVazio =
    document.getElementById("textoAtividadesVazio");

const totalPendentes =
    document.getElementById("totalPendentes");

const totalConcluidas =
    document.getElementById("totalConcluidas");

const totalAtividades =
    document.getElementById("totalAtividades");

const botoesFiltro =
    document.querySelectorAll(".filtro-atividade");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let atividades = [];

let materias = [];

let atividadeEmEdicao = null;

let filtroAtual = "todas";


/* =====================================================
   DATA
===================================================== */

function hojeISO() {

    const hoje = new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


function formatarData(dataISO) {

    if (!dataISO) {
        return "";
    }

    const partes =
        dataISO.split("-");

    if (partes.length !== 3) {
        return dataISO;
    }

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );

}


/* =====================================================
   CONVERTER ATIVIDADE DO SUPABASE
===================================================== */

function normalizarAtividade(item) {

    return {

        id:
            item.id,

        titulo:
            item.titulo,

        data:
            item.data,

        materiaId:
            item.materia_id || "",

        horario:
            item.horario
                ? String(item.horario).slice(0, 5)
                : "",

        descricao:
            item.descricao || "",

        concluida:
            Boolean(item.concluida),

        criadoEm:
            item.criado_em || ""

    };

}


/* =====================================================
   CARREGAR MATÉRIAS DO SUPABASE
===================================================== */

async function carregarMaterias() {

    if (!usuarioLogado) {
        materias = [];
        return;
    }

    try {

        const {
            data,
            error
        } = await nexoSupabase
            .from("materias")
            .select(
                "id, nome, professor, criado_em"
            )
            .order(
                "nome",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Erro ao carregar matérias:",
                error
            );

            materias = [];

            return;

        }


        materias =
            data || [];


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar matérias:",
            erro
        );

        materias = [];

    }

}


/* =====================================================
   CARREGAR ATIVIDADES DO SUPABASE
===================================================== */

async function carregarAtividades() {

    if (!usuarioLogado) {

        atividades = [];

        renderizarAtividades();

        return;

    }


    try {

        const {
            data,
            error
        } = await nexoSupabase
            .from("atividades")
            .select(
                "id, titulo, descricao, data, horario, materia_id, concluida, criado_em"
            )
            .eq(
                "usuario_id",
                usuarioLogado.id
            );


        if (error) {

            console.error(
                "Erro ao carregar atividades:",
                error
            );

            atividades = [];

            renderizarAtividades();

            return;

        }


        atividades =
            (data || []).map(
                normalizarAtividade
            );


        renderizarAtividades();


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar atividades:",
            erro
        );

        atividades = [];

        renderizarAtividades();

    }

}


/* =====================================================
   PREENCHER MATÉRIAS
===================================================== */

function preencherMaterias(
    materiaSelecionada = ""
) {

    materiaAtividade.innerHTML = "";


    const materiasOrdenadas =
        [...materias].sort(
            function (a, b) {

                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );

            }
        );


    const opcaoPadrao =
        document.createElement(
            "option"
        );


    opcaoPadrao.value = "";


    opcaoPadrao.textContent =
        materiasOrdenadas.length > 0
            ? "Selecione uma matéria"
            : "Nenhuma matéria cadastrada";


    materiaAtividade.appendChild(
        opcaoPadrao
    );


    materiasOrdenadas.forEach(
        function (materia) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                materia.id;


            option.textContent =
                materia.nome;


            if (
                materia.id ===
                materiaSelecionada
            ) {

                option.selected =
                    true;

            }


            materiaAtividade.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   NOME DA MATÉRIA
===================================================== */

function obterNomeMateria(id) {

    if (!id) {
        return "Sem matéria";
    }


    const materia =
        materias.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!materia) {
        return "Matéria removida";
    }


    return materia.nome;

}


/* =====================================================
   ABRIR NOVA ATIVIDADE
===================================================== */

function abrirNovaAtividade() {

    atividadeEmEdicao = null;

    tituloModalAtividade.textContent =
        "Nova atividade";

    formAtividade.reset();

    preencherMaterias();

    dataAtividade.value =
        hojeISO();

    modalAtividade.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            tituloAtividade.focus();

        },
        100
    );

}


/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharModal() {

    modalAtividade.classList.remove(
        "ativo"
    );

    formAtividade.reset();

    atividadeEmEdicao = null;

}


/* =====================================================
   EVENTOS DO MODAL
===================================================== */

novaAtividade.addEventListener(
    "click",
    abrirNovaAtividade
);


criarPrimeiraAtividade.addEventListener(
    "click",
    abrirNovaAtividade
);


fecharModalAtividade.addEventListener(
    "click",
    fecharModal
);


cancelarAtividade.addEventListener(
    "click",
    fecharModal
);


modalAtividade.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            modalAtividade
        ) {

            fecharModal();

        }

    }
);


/* =====================================================
   SALVAR ATIVIDADE
===================================================== */

formAtividade.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!usuarioLogado) {
            return;
        }


        const titulo =
            tituloAtividade.value.trim();

        const data =
            dataAtividade.value;

        const materiaId =
            materiaAtividade.value;

        const horario =
            horarioAtividade.value;

        const descricao =
            descricaoAtividade.value.trim();


        if (
            !titulo ||
            !data
        ) {

            return;

        }


        const botaoSalvar =
            formAtividade.querySelector(
                'button[type="submit"]'
            );


        if (botaoSalvar) {

            botaoSalvar.disabled =
                true;

        }


        try {

            /* =========================
               EDITAR
            ========================== */

            if (atividadeEmEdicao) {

                const {
                    error
                } = await nexoSupabase
                    .from("atividades")
                    .update({

                        titulo:
                            titulo,

                        descricao:
                            descricao || null,

                        data:
                            data,

                        horario:
                            horario || null,

                        materia_id:
                            materiaId || null

                    })
                    .eq(
                        "id",
                        atividadeEmEdicao
                    )
                    .eq(
                        "usuario_id",
                        usuarioLogado.id
                    );


                if (error) {

                    console.error(
                        "Erro ao editar atividade:",
                        error
                    );

                    alert(
                        "Não foi possível editar a atividade."
                    );

                    return;

                }

            }


            /* =========================
               CRIAR
            ========================== */

            else {

                const {
                    error
                } = await nexoSupabase
                    .from("atividades")
                    .insert({

                        titulo:
                            titulo,

                        descricao:
                            descricao || null,

                        data:
                            data,

                        horario:
                            horario || null,

                        materia_id:
                            materiaId || null,

                        usuario_id:
                            usuarioLogado.id,

                        visibilidade:
                            "privada",

                        concluida:
                            false

                    });


                if (error) {

                    console.error(
                        "Erro ao criar atividade:",
                        error
                    );

                    alert(
                        "Não foi possível criar a atividade."
                    );

                    return;

                }

            }


            fecharModal();

            await carregarAtividades();


        } catch (erro) {

            console.error(
                "Erro inesperado ao salvar atividade:",
                erro
            );

            alert(
                "Ocorreu um erro ao salvar a atividade."
            );


        } finally {

            if (botaoSalvar) {

                botaoSalvar.disabled =
                    false;

            }

        }

    }
);


/* =====================================================
   EDITAR ATIVIDADE
===================================================== */

function editarAtividade(id) {

    const atividade =
        atividades.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!atividade) {
        return;
    }


    atividadeEmEdicao =
        atividade.id;


    tituloModalAtividade.textContent =
        "Editar atividade";


    tituloAtividade.value =
        atividade.titulo;


    dataAtividade.value =
        atividade.data;


    horarioAtividade.value =
        atividade.horario || "";


    descricaoAtividade.value =
        atividade.descricao || "";


    preencherMaterias(
        atividade.materiaId || ""
    );


    modalAtividade.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            tituloAtividade.focus();

        },
        100
    );

}


/* =====================================================
   CONCLUIR / REABRIR
===================================================== */

async function alternarConclusao(id) {

    if (!usuarioLogado) {
        return;
    }


    const atividade =
        atividades.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!atividade) {
        return;
    }


    const novoEstado =
        !atividade.concluida;


    try {

        const {
            error
        } = await nexoSupabase
            .from("atividades")
            .update({

                concluida:
                    novoEstado

            })
            .eq(
                "id",
                id
            )
            .eq(
                "usuario_id",
                usuarioLogado.id
            );


        if (error) {

            console.error(
                "Erro ao alterar atividade:",
                error
            );

            alert(
                "Não foi possível atualizar a atividade."
            );

            return;

        }


        atividade.concluida =
            novoEstado;


        renderizarAtividades();


    } catch (erro) {

        console.error(
            "Erro inesperado ao alterar atividade:",
            erro
        );

    }

}


/* =====================================================
   EXCLUIR
===================================================== */

async function excluirAtividade(id) {

    if (!usuarioLogado) {
        return;
    }


    const atividade =
        atividades.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!atividade) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja realmente excluir a atividade "${atividade.titulo}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const {
            error
        } = await nexoSupabase
            .from("atividades")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "usuario_id",
                usuarioLogado.id
            );


        if (error) {

            console.error(
                "Erro ao excluir atividade:",
                error
            );

            alert(
                "Não foi possível excluir a atividade."
            );

            return;

        }


        atividades =
            atividades.filter(
                function (item) {

                    return (
                        item.id !== id
                    );

                }
            );


        renderizarAtividades();


    } catch (erro) {

        console.error(
            "Erro inesperado ao excluir atividade:",
            erro
        );

    }

}


/* =====================================================
   FILTRAR
===================================================== */

function obterAtividadesFiltradas() {

    /*
        TODAS

        Mantém o comportamento atual do Nexo:
        mostra somente atividades ainda não concluídas.
    */

    if (
        filtroAtual ===
        "todas"
    ) {

        return atividades.filter(
            function (atividade) {

                return (
                    !atividade.concluida
                );

            }
        );

    }


    /* PENDENTES */

    if (
        filtroAtual ===
        "pendentes"
    ) {

        return atividades.filter(
            function (atividade) {

                return (
                    !atividade.concluida
                );

            }
        );

    }


    /* CONCLUÍDAS */

    if (
        filtroAtual ===
        "concluidas"
    ) {

        return atividades.filter(
            function (atividade) {

                return (
                    atividade.concluida
                );

            }
        );

    }


    return [];

}


/* =====================================================
   ORDENAÇÃO
===================================================== */

function ordenarAtividades(lista) {

    return [...lista].sort(
        function (a, b) {

            if (
                a.data !==
                b.data
            ) {

                return a.data.localeCompare(
                    b.data
                );

            }


            const horarioA =
                a.horario || "99:99";

            const horarioB =
                b.horario || "99:99";


            return horarioA.localeCompare(
                horarioB
            );

        }
    );

}


/* =====================================================
   CONTADORES
===================================================== */

function atualizarContadores() {

    const pendentes =
        atividades.filter(
            function (atividade) {

                return (
                    !atividade.concluida
                );

            }
        ).length;


    const concluidas =
        atividades.filter(
            function (atividade) {

                return (
                    atividade.concluida
                );

            }
        ).length;


    totalPendentes.textContent =
        pendentes;

    totalConcluidas.textContent =
        concluidas;

    totalAtividades.textContent =
        atividades.length;

}


/* =====================================================
   RENDERIZAR
===================================================== */

function renderizarAtividades() {

    listaAtividades.innerHTML =
        "";


    atualizarContadores();


    const filtradas =
        obterAtividadesFiltradas();


    const ordenadas =
        ordenarAtividades(
            filtradas
        );


    /* =========================
       ESTADO VAZIO
    ========================== */

    if (
        ordenadas.length === 0
    ) {

        if (
            filtroAtual ===
            "pendentes"
        ) {

            textoAtividadesVazio.textContent =
                "Você não possui atividades pendentes.";

        }

        else if (
            filtroAtual ===
            "concluidas"
        ) {

            textoAtividadesVazio.textContent =
                "Você ainda não concluiu nenhuma atividade.";

        }

        else {

            const possuiConcluidas =
                atividades.some(
                    function (atividade) {

                        return (
                            atividade.concluida
                        );

                    }
                );


            if (possuiConcluidas) {

                textoAtividadesVazio.textContent =
                    "Você não possui atividades ativas. As atividades finalizadas estão na aba Concluídas.";

            }

            else {

                textoAtividadesVazio.textContent =
                    "Você ainda não cadastrou nenhuma atividade.";

            }

        }


        listaAtividades.appendChild(
            atividadesVazio
        );

        return;

    }


    /* =========================
       CARDS
    ========================== */

    ordenadas.forEach(
        function (atividade) {

            const card =
                criarCardAtividade(
                    atividade
                );

            listaAtividades.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CRIAR CARD
===================================================== */

function criarCardAtividade(
    atividade
) {

    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "atividade-card"
    );


    if (
        atividade.concluida
    ) {

        card.classList.add(
            "concluida"
        );

    }


    /* CHECK */

    const check =
        document.createElement(
            "button"
        );


    check.type =
        "button";


    check.classList.add(
        "atividade-check"
    );


    check.textContent =
        atividade.concluida
            ? "✓"
            : "";


    check.setAttribute(
        "aria-label",
        atividade.concluida
            ? "Reabrir atividade"
            : "Concluir atividade"
    );


    check.addEventListener(
        "click",
        async function () {

            await alternarConclusao(
                atividade.id
            );

        }
    );


    /* CONTEÚDO */

    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.classList.add(
        "atividade-conteudo"
    );


    /* TOPO */

    const topo =
        document.createElement(
            "div"
        );


    topo.classList.add(
        "atividade-topo"
    );


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        atividade.titulo;


    const materia =
        document.createElement(
            "span"
        );


    materia.classList.add(
        "atividade-materia"
    );


    materia.textContent =
        obterNomeMateria(
            atividade.materiaId
        );


    topo.appendChild(
        titulo
    );


    topo.appendChild(
        materia
    );


    /* DATA / HORÁRIO */

    const meta =
        document.createElement(
            "div"
        );


    meta.classList.add(
        "atividade-meta"
    );


    const data =
        document.createElement(
            "span"
        );


    data.textContent =
        formatarData(
            atividade.data
        );


    meta.appendChild(
        data
    );


    if (
        atividade.horario
    ) {

        const horario =
            document.createElement(
                "span"
            );


        horario.textContent =
            atividade.horario;


        meta.appendChild(
            horario
        );

    }


    /* MONTAR CONTEÚDO */

    conteudo.appendChild(
        topo
    );


    conteudo.appendChild(
        meta
    );


    /* DESCRIÇÃO */

    if (
        atividade.descricao
    ) {

        const descricao =
            document.createElement(
                "p"
            );


        descricao.classList.add(
            "atividade-descricao"
        );


        descricao.textContent =
            atividade.descricao;


        conteudo.appendChild(
            descricao
        );

    }


    /* AÇÕES */

    const acoes =
        document.createElement(
            "div"
        );


    acoes.classList.add(
        "atividade-acoes"
    );


    /* EDITAR */

    const editar =
        document.createElement(
            "button"
        );


    editar.type =
        "button";


    editar.classList.add(
        "atividade-editar"
    );


    editar.textContent =
        "Editar";


    editar.addEventListener(
        "click",
        function () {

            editarAtividade(
                atividade.id
            );

        }
    );


    /* EXCLUIR */

    const excluir =
        document.createElement(
            "button"
        );


    excluir.type =
        "button";


    excluir.classList.add(
        "atividade-excluir"
    );


    excluir.textContent =
        "Excluir";


    excluir.addEventListener(
        "click",
        async function () {

            await excluirAtividade(
                atividade.id
            );

        }
    );


    acoes.appendChild(
        editar
    );


    acoes.appendChild(
        excluir
    );


    /* MONTAR CARD */

    card.appendChild(
        check
    );


    card.appendChild(
        conteudo
    );


    card.appendChild(
        acoes
    );


    return card;

}


/* =====================================================
   FILTROS
===================================================== */

botoesFiltro.forEach(
    function (botao) {

        botao.addEventListener(
            "click",
            function () {

                filtroAtual =
                    botao.dataset.filtro;


                botoesFiltro.forEach(
                    function (item) {

                        item.classList.remove(
                            "ativo"
                        );

                    }
                );


                botao.classList.add(
                    "ativo"
                );


                renderizarAtividades();

            }
        );

    }
);


/* =====================================================
   MENU MOBILE
===================================================== */

if (
    menuMobile &&
    sidebar
) {

    menuMobile.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "ativo"
            );

        }
    );

}


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        fecharModal();


        if (sidebar) {

            sidebar.classList.remove(
                "ativo"
            );

        }

    }
);


/* =====================================================
   ATUALIZAR AO VOLTAR PARA A PÁGINA
===================================================== */

window.addEventListener(
    "focus",
    async function () {

        if (!usuarioLogado) {
            return;
        }

        await carregarMaterias();

        await carregarAtividades();

    }
);


/* =====================================================
   INICIAR
===================================================== */

async function iniciarPaginaAtividades() {

    /*
        O usuario.js também verifica a autenticação
        para atualizar nome/avatar.

        Aqui verificamos novamente porque esta página
        precisa do ID do usuário para trabalhar com
        o banco.
    */

    usuarioLogado =
        await protegerPagina();


    if (!usuarioLogado) {
        return;
    }


    await carregarMaterias();

    await carregarAtividades();

}


iniciarPaginaAtividades();