/* =====================================================
   NEXO - PROVAS
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const novaProva =
    document.getElementById("novaProva");

const criarPrimeiraProva =
    document.getElementById("criarPrimeiraProva");

const modalProva =
    document.getElementById("modalProva");

const fecharModalProva =
    document.getElementById("fecharModalProva");

const cancelarProva =
    document.getElementById("cancelarProva");

const formProva =
    document.getElementById("formProva");

const tituloModalProva =
    document.getElementById("tituloModalProva");

const nomeProva =
    document.getElementById("nomeProva");

const materiaProva =
    document.getElementById("materiaProva");

const dataProva =
    document.getElementById("dataProva");

const horarioProva =
    document.getElementById("horarioProva");

const conteudoProva =
    document.getElementById("conteudoProva");

const provaNoCalendario =
    document.getElementById("provaNoCalendario");

const listaProvasPagina =
    document.getElementById("listaProvasPagina");

const provasPaginaVazio =
    document.getElementById("provasPaginaVazio");

const textoProvasVazio =
    document.getElementById("textoProvasVazio");

const totalProximas =
    document.getElementById("totalProximas");

const totalHoje =
    document.getElementById("totalHoje");

const totalRealizadas =
    document.getElementById("totalRealizadas");

const botoesFiltroProva =
    document.querySelectorAll(".filtro-prova");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let provas = [];

let materias = [];

let provaEmEdicao = null;

let filtroAtual = "proximas";


/* =====================================================
   DATA
===================================================== */

function hojeISO() {

    const hoje =
        new Date();

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

    if (
        partes.length !== 3
    ) {
        return dataISO;
    }

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );

}


/* =====================================================
   NORMALIZAR PROVA
===================================================== */

function normalizarProva(item) {

    return {

        id:
            item.id,

        nome:
            item.nome,

        materiaId:
            item.materia_id || "",

        data:
            item.data,

        horario:
            item.horario
                ? String(
                    item.horario
                ).slice(0, 5)
                : "",

        conteudo:
            item.conteudo || "",

        lembretes: item.lembretes || [],

        noCalendario:
            Boolean(item.no_calendario),

        criadoEm:
            item.criado_em || ""

    };

}


/* =====================================================
   CARREGAR MATÉRIAS - SUPABASE
===================================================== */

async function carregarMaterias() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await nexoSupabase
                .from("materias")
                .select(
                    "id, nome, professor, criado_em"
                )
                .eq(
                    "usuario_id",
                    usuarioLogado.id
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
   CARREGAR PROVAS - SUPABASE
===================================================== */

async function carregarProvas() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await nexoSupabase
                .from("provas")
                .select(
                    "id, nome, conteudo, data, horario, materia_id, no_calendario, lembretes, criado_em"
                )
                .eq(
                    "usuario_id",
                    usuarioLogado.id
                )
                .eq(
                    "visibilidade",
                    "privada"
                )
                .order(
                    "data",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Erro ao carregar provas:",
                error
            );

            provas = [];

            return;

        }


        provas =
            (data || []).map(
                normalizarProva
            );


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar provas:",
            erro
        );

        provas = [];

    }

}


/* =====================================================
   PREENCHER MATÉRIAS
===================================================== */

function preencherMaterias(
    materiaSelecionada = ""
) {

    materiaProva.innerHTML =
        "";


    const ordenadas =
        [...materias].sort(
            function (a, b) {

                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );

            }
        );


    const opcao =
        document.createElement(
            "option"
        );


    opcao.value =
        "";


    opcao.textContent =
        ordenadas.length > 0
            ? "Selecione uma matéria"
            : "Nenhuma matéria cadastrada";


    materiaProva.appendChild(
        opcao
    );


    ordenadas.forEach(
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


            materiaProva.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   OBTER NOME DA MATÉRIA
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
   ABRIR NOVA PROVA
===================================================== */

function abrirNovaProva() {

    provaEmEdicao =
        null;


    tituloModalProva.textContent =
        "Nova prova";


    formProva.reset();
    NexoLembretes.definir(formProva,[1440]);


    preencherMaterias();


    dataProva.value =
        hojeISO();


    modalProva.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            nomeProva.focus();

        },
        100
    );

}


/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharModal() {

    modalProva.classList.remove(
        "ativo"
    );


    formProva.reset();


    provaEmEdicao =
        null;

}


/* =====================================================
   EVENTOS
===================================================== */

if (novaProva) {

    novaProva.addEventListener(
        "click",
        abrirNovaProva
    );

}


if (criarPrimeiraProva) {

    criarPrimeiraProva.addEventListener(
        "click",
        abrirNovaProva
    );

}


if (fecharModalProva) {

    fecharModalProva.addEventListener(
        "click",
        fecharModal
    );

}


if (cancelarProva) {

    cancelarProva.addEventListener(
        "click",
        fecharModal
    );

}


if (modalProva) {

    modalProva.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalProva
            ) {

                fecharModal();

            }

        }
    );

}


/* =====================================================
   SALVAR PROVA - SUPABASE
===================================================== */

formProva.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!usuarioLogado) {
            return;
        }


        const nome =
            nomeProva.value.trim();


        const materiaId =
            materiaProva.value;


        const data =
            dataProva.value;


        const horario =
            horarioProva.value;


        const conteudo =
            conteudoProva.value.trim();

        const noCalendario =
            Boolean(provaNoCalendario && provaNoCalendario.checked);


        if (
            !nome ||
            !data
        ) {

            return;

        }


        try {

            /* =========================
               EDITAR
            ========================== */

            if (provaEmEdicao) {

                const {
                    error
                } =
                    await nexoSupabase
                        .from("provas")
                        .update({

                            nome:
                                nome,

                            materia_id:
                                materiaId ||
                                null,

                            data:
                                data,

                            horario:
                                horario ||
                                null,

                            conteudo:
                                conteudo ||
                                null,

                            no_calendario:
                                noCalendario,
                            lembretes: NexoLembretes.valores(formProva)

                        })
                        .eq(
                            "id",
                            provaEmEdicao
                        )
                        .eq(
                            "usuario_id",
                            usuarioLogado.id
                        )
                .eq(
                    "visibilidade",
                    "privada"
                );


                if (error) {

                    console.error(
                        "Erro ao editar prova:",
                        error
                    );

                    alert(
                        "Não foi possível editar a prova."
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
                } =
                    await nexoSupabase
                        .from("provas")
                        .insert({

                            nome:
                                nome,

                            materia_id:
                                materiaId ||
                                null,

                            data:
                                data,

                            horario:
                                horario ||
                                null,

                            conteudo:
                                conteudo ||
                                null,

                            usuario_id:
                                usuarioLogado.id,

                            visibilidade:
                                "privada",

                            no_calendario:
                                noCalendario,
                            lembretes: NexoLembretes.valores(formProva)

                        });


                if (error) {

                    console.error(
                        "Erro ao criar prova:",
                        error
                    );

                    alert(
                        "Não foi possível criar a prova."
                    );

                    return;

                }

            }


            await carregarProvas();

            renderizarProvas();

            fecharModal();


        } catch (erro) {

            console.error(
                "Erro inesperado ao salvar prova:",
                erro
            );

            alert(
                "Ocorreu um erro ao salvar a prova."
            );

        }

    }
);


/* =====================================================
   EDITAR
===================================================== */

function editarProva(id) {

    const prova =
        provas.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!prova) {
        return;
    }


    provaEmEdicao =
        prova.id;


    tituloModalProva.textContent =
        "Editar prova";


    nomeProva.value =
        prova.nome;


    dataProva.value =
        prova.data;


    horarioProva.value =
        prova.horario || "";


    conteudoProva.value =
        prova.conteudo || "";
    NexoLembretes.definir(formProva,prova.lembretes);

    if (provaNoCalendario) {
        provaNoCalendario.checked =
            Boolean(prova.noCalendario);
    }


    preencherMaterias(
        prova.materiaId || ""
    );


    modalProva.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            nomeProva.focus();

        },
        100
    );

}


/* =====================================================
   EXCLUIR
===================================================== */

async function excluirProva(id) {

    const prova =
        provas.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!prova) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja realmente excluir a prova "${prova.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const {
            error
        } =
            await nexoSupabase
                .from("provas")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "usuario_id",
                    usuarioLogado.id
                )
                .eq(
                    "visibilidade",
                    "privada"
                );


        if (error) {

            console.error(
                "Erro ao excluir prova:",
                error
            );

            alert(
                "Não foi possível excluir a prova."
            );

            return;

        }


        await carregarProvas();

        renderizarProvas();


    } catch (erro) {

        console.error(
            "Erro inesperado ao excluir prova:",
            erro
        );

    }

}


/* =====================================================
   STATUS
===================================================== */

function obterStatusProva(prova) {

    const hoje =
        hojeISO();


    if (
        prova.data <
        hoje
    ) {

        return "realizada";

    }


    if (
        prova.data ===
        hoje
    ) {

        return "hoje";

    }


    return "proxima";

}


/* =====================================================
   FILTROS
===================================================== */

function obterProvasFiltradas() {

    if (
        filtroAtual ===
        "hoje"
    ) {

        return provas.filter(
            function (prova) {

                return (
                    obterStatusProva(
                        prova
                    ) ===
                    "hoje"
                );

            }
        );

    }


    if (
        filtroAtual ===
        "realizadas"
    ) {

        return provas.filter(
            function (prova) {

                return (
                    obterStatusProva(
                        prova
                    ) ===
                    "realizada"
                );

            }
        );

    }


    /*
        PRÓXIMAS

        Inclui provas de hoje
        e provas futuras.
    */

    return provas.filter(
        function (prova) {

            const status =
                obterStatusProva(
                    prova
                );


            return (
                status === "hoje" ||
                status === "proxima"
            );

        }
    );

}


/* =====================================================
   ORDENAR
===================================================== */

function ordenarProvas(lista) {

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
                a.horario ||
                "99:99";


            const horarioB =
                b.horario ||
                "99:99";


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

    let proximas =
        0;

    let hoje =
        0;

    let realizadas =
        0;


    provas.forEach(
        function (prova) {

            const status =
                obterStatusProva(
                    prova
                );


            if (
                status ===
                "realizada"
            ) {

                realizadas++;

            }


            if (
                status ===
                "hoje"
            ) {

                hoje++;

                proximas++;

            }


            if (
                status ===
                "proxima"
            ) {

                proximas++;

            }

        }
    );


    if (totalProximas) {

        totalProximas.textContent =
            proximas;

    }


    if (totalHoje) {

        totalHoje.textContent =
            hoje;

    }


    if (totalRealizadas) {

        totalRealizadas.textContent =
            realizadas;

    }

}


/* =====================================================
   RENDERIZAR
===================================================== */

function renderizarProvas() {

    listaProvasPagina.innerHTML =
        "";


    atualizarContadores();


    const filtradas =
        obterProvasFiltradas();


    const ordenadas =
        ordenarProvas(
            filtradas
        );


    /* =========================
       VAZIO
    ========================== */

    if (
        ordenadas.length ===
        0
    ) {

        if (
            filtroAtual ===
            "hoje"
        ) {

            textoProvasVazio.textContent =
                "Você não possui nenhuma prova hoje.";

        }

        else if (
            filtroAtual ===
            "realizadas"
        ) {

            textoProvasVazio.textContent =
                "Nenhuma prova realizada foi encontrada.";

        }

        else {

            textoProvasVazio.textContent =
                "Você não possui nenhuma prova próxima.";

        }


        listaProvasPagina.appendChild(
            provasPaginaVazio
        );


        return;

    }


    /* =========================
       CARDS
    ========================== */

    ordenadas.forEach(
        function (prova) {

            const card =
                criarCardProva(
                    prova
                );


            listaProvasPagina.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CARD
===================================================== */

function criarCardProva(prova) {

    const status =
        obterStatusProva(
            prova
        );


    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "prova-card"
    );


    if (
        status ===
        "realizada"
    ) {

        card.classList.add(
            "prova-realizada"
        );

    }


    if (
        status ===
        "hoje"
    ) {

        card.classList.add(
            "prova-hoje"
        );

    }


    /* =========================
       DATA
    ========================== */

    const blocoData =
        document.createElement(
            "div"
        );


    blocoData.classList.add(
        "prova-data"
    );


    const partes =
        prova.data.split(
            "-"
        );


    const numeroDia =
        document.createElement(
            "strong"
        );


    numeroDia.textContent =
        partes[2];


    const dataObjeto =
        new Date(
            Number(
                partes[0]
            ),
            Number(
                partes[1]
            ) - 1,
            Number(
                partes[2]
            )
        );


    const nomeMes =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                month:
                    "short"
            }
        )
            .format(
                dataObjeto
            )
            .replace(
                ".",
                ""
            )
            .toUpperCase();


    const mes =
        document.createElement(
            "span"
        );


    mes.textContent =
        nomeMes;


    blocoData.appendChild(
        numeroDia
    );


    blocoData.appendChild(
        mes
    );


    /* =========================
       CONTEÚDO
    ========================== */

    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.classList.add(
        "prova-conteudo"
    );


    const topo =
        document.createElement(
            "div"
        );


    topo.classList.add(
        "prova-topo"
    );


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        prova.nome;


    const materia =
        document.createElement(
            "span"
        );


    materia.classList.add(
        "prova-materia"
    );


    materia.textContent =
        obterNomeMateria(
            prova.materiaId
        );


    topo.appendChild(
        titulo
    );


    topo.appendChild(
        materia
    );


    /* META */

    const meta =
        document.createElement(
            "div"
        );


    meta.classList.add(
        "prova-meta"
    );


    const dataCompleta =
        document.createElement(
            "span"
        );


    dataCompleta.textContent =
        formatarData(
            prova.data
        );


    meta.appendChild(
        dataCompleta
    );


    if (
        prova.horario
    ) {

        const horario =
            document.createElement(
                "span"
            );


        horario.textContent =
            prova.horario;


        meta.appendChild(
            horario
        );

    }


    /* STATUS */

    const statusElemento =
        document.createElement(
            "span"
        );


    statusElemento.classList.add(
        "prova-status"
    );


    if (
        status ===
        "hoje"
    ) {

        statusElemento.classList.add(
            "status-hoje"
        );


        statusElemento.textContent =
            "Hoje";

    }

    else if (
        status ===
        "realizada"
    ) {

        statusElemento.classList.add(
            "status-realizada"
        );


        statusElemento.textContent =
            "Realizada";

    }

    else {

        statusElemento.classList.add(
            "status-proxima"
        );


        statusElemento.textContent =
            "Próxima";

    }


    meta.appendChild(
        statusElemento
    );


    conteudo.appendChild(
        topo
    );


    conteudo.appendChild(
        meta
    );


    /* CONTEÚDO DA PROVA */

    if (
        prova.conteudo
    ) {

        const observacao =
            document.createElement(
                "p"
            );


        observacao.classList.add(
            "prova-observacao"
        );


        observacao.textContent =
            prova.conteudo;


        conteudo.appendChild(
            observacao
        );

    }


    /* =========================
       AÇÕES
    ========================== */

    const acoes =
        document.createElement(
            "div"
        );


    acoes.classList.add(
        "prova-acoes"
    );


    const editar =
        document.createElement(
            "button"
        );


    editar.type =
        "button";


    editar.classList.add(
        "prova-editar"
    );


    editar.textContent =
        "Editar";


    editar.addEventListener(
        "click",
        function () {

            editarProva(
                prova.id
            );

        }
    );


    const excluir =
        document.createElement(
            "button"
        );


    excluir.type =
        "button";


    excluir.classList.add(
        "prova-excluir"
    );


    excluir.textContent =
        "Excluir";


    excluir.addEventListener(
        "click",
        function () {

            excluirProva(
                prova.id
            );

        }
    );


    acoes.appendChild(
        editar
    );


    acoes.appendChild(
        excluir
    );


    /* =========================
       MONTAR
    ========================== */

    card.appendChild(
        blocoData
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

botoesFiltroProva.forEach(
    function (botao) {

        botao.addEventListener(
            "click",
            function () {

                filtroAtual =
                    botao.dataset.filtro;


                botoesFiltroProva.forEach(
                    function (item) {

                        item.classList.remove(
                            "ativo"
                        );

                    }
                );


                botao.classList.add(
                    "ativo"
                );


                renderizarProvas();

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
   ATUALIZAR AO VOLTAR PARA A PÁGINA
===================================================== */

window.addEventListener(
    "focus",
    async function () {

        if (!usuarioLogado) {
            return;
        }


        await Promise.all([
            carregarMaterias(),
            carregarProvas()
        ]);


        renderizarProvas();

    }
);


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
   INICIAR
===================================================== */

async function iniciarPaginaProvas() {

    usuarioLogado =
        await protegerPagina();


    if (!usuarioLogado) {
        return;
    }


    await Promise.all([
        carregarMaterias(),
        carregarProvas()
    ]);


    renderizarProvas();

}


iniciarPaginaProvas();