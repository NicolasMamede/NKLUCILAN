/* =====================================================
   NEXO - ESTUDOS
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const novaEstudo =
    document.getElementById("novaEstudo");

const criarPrimeiraEstudo =
    document.getElementById("criarPrimeiraEstudo");

const modalEstudo =
    document.getElementById("modalEstudo");

const fecharModalEstudo =
    document.getElementById("fecharModalEstudo");

const cancelarEstudo =
    document.getElementById("cancelarEstudo");

const formEstudo =
    document.getElementById("formEstudo");

const tituloModalEstudo =
    document.getElementById("tituloModalEstudo");

const nomeEstudo =
    document.getElementById("nomeEstudo");

const materiaEstudo =
    document.getElementById("materiaEstudo");

const dataEstudo =
    document.getElementById("dataEstudo");

const horarioEstudo =
    document.getElementById("horarioEstudo");

const objetivoEstudo =
    document.getElementById("objetivoEstudo");

const listaEstudosPagina =
    document.getElementById("listaEstudosPagina");

const estudosPaginaVazio =
    document.getElementById("estudosPaginaVazio");

const textoEstudosVazio =
    document.getElementById("textoEstudosVazio");

const totalProximas =
    document.getElementById("totalProximas");

const totalHoje =
    document.getElementById("totalHoje");

const totalAnteriores =
    document.getElementById("totalAnteriores");

const botoesFiltroEstudo =
    document.querySelectorAll(".filtro-estudo");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let estudos = [];

let materias = [];

let estudoEmEdicao = null;

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

function normalizarEstudo(item) {

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

        objetivo:
            item.objetivo || "",

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
   CARREGAR ESTUDOS - SUPABASE
===================================================== */

async function carregarEstudos() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await nexoSupabase
                .from("estudos")
                .select(
                    "id, nome, objetivo, data, horario, materia_id, criado_em"
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
                "Erro ao carregar estudos:",
                error
            );

            estudos = [];

            return;

        }


        estudos =
            (data || []).map(
                normalizarEstudo
            );


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar estudos:",
            erro
        );

        estudos = [];

    }

}


/* =====================================================
   PREENCHER MATÉRIAS
===================================================== */

function preencherMaterias(
    materiaSelecionada = ""
) {

    materiaEstudo.innerHTML =
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


    materiaEstudo.appendChild(
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


            materiaEstudo.appendChild(
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

function abrirNovaEstudo() {

    estudoEmEdicao =
        null;


    tituloModalEstudo.textContent =
        "Nova estudo";


    formEstudo.reset();


    preencherMaterias();


    dataEstudo.value =
        hojeISO();


    modalEstudo.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            nomeEstudo.focus();

        },
        100
    );

}


/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharModal() {

    modalEstudo.classList.remove(
        "ativo"
    );


    formEstudo.reset();


    estudoEmEdicao =
        null;

}


/* =====================================================
   EVENTOS
===================================================== */

if (novaEstudo) {

    novaEstudo.addEventListener(
        "click",
        abrirNovaEstudo
    );

}


if (criarPrimeiraEstudo) {

    criarPrimeiraEstudo.addEventListener(
        "click",
        abrirNovaEstudo
    );

}


if (fecharModalEstudo) {

    fecharModalEstudo.addEventListener(
        "click",
        fecharModal
    );

}


if (cancelarEstudo) {

    cancelarEstudo.addEventListener(
        "click",
        fecharModal
    );

}


if (modalEstudo) {

    modalEstudo.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalEstudo
            ) {

                fecharModal();

            }

        }
    );

}


/* =====================================================
   SALVAR PROVA - SUPABASE
===================================================== */

formEstudo.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!usuarioLogado) {
            return;
        }


        const nome =
            nomeEstudo.value.trim();


        const materiaId =
            materiaEstudo.value;


        const data =
            dataEstudo.value;


        const horario =
            horarioEstudo.value;


        const objetivo =
            objetivoEstudo.value.trim();


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

            if (estudoEmEdicao) {

                const {
                    error
                } =
                    await nexoSupabase
                        .from("estudos")
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

                            objetivo:
                                objetivo ||
                                null,

                        })
                        .eq(
                            "id",
                            estudoEmEdicao
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
                        "Erro ao editar estudo:",
                        error
                    );

                    alert(
                        "Não foi possível editar a estudo."
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
                        .from("estudos")
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

                            objetivo:
                                objetivo ||
                                null,

                            usuario_id:
                                usuarioLogado.id,

                            visibilidade:
                                "privada",

                        });


                if (error) {

                    console.error(
                        "Erro ao criar estudo:",
                        error
                    );

                    alert(
                        "Não foi possível criar a estudo."
                    );

                    return;

                }

            }


            await carregarEstudos();

            renderizarEstudos();

            fecharModal();


        } catch (erro) {

            console.error(
                "Erro inesperado ao salvar estudo:",
                erro
            );

            alert(
                "Ocorreu um erro ao salvar a estudo."
            );

        }

    }
);


/* =====================================================
   EDITAR
===================================================== */

function editarEstudo(id) {

    const estudo =
        estudos.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!estudo) {
        return;
    }


    estudoEmEdicao =
        estudo.id;


    tituloModalEstudo.textContent =
        "Editar estudo";


    nomeEstudo.value =
        estudo.nome;


    dataEstudo.value =
        estudo.data;


    horarioEstudo.value =
        estudo.horario || "";


    objetivoEstudo.value =
        estudo.objetivo || "";


    preencherMaterias(
        estudo.materiaId || ""
    );


    modalEstudo.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            nomeEstudo.focus();

        },
        100
    );

}


/* =====================================================
   EXCLUIR
===================================================== */

async function excluirEstudo(id) {

    const estudo =
        estudos.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!estudo) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja realmente excluir a estudo "${estudo.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const {
            error
        } =
            await nexoSupabase
                .from("estudos")
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
                "Erro ao excluir estudo:",
                error
            );

            alert(
                "Não foi possível excluir a estudo."
            );

            return;

        }


        await carregarEstudos();

        renderizarEstudos();


    } catch (erro) {

        console.error(
            "Erro inesperado ao excluir estudo:",
            erro
        );

    }

}


/* =====================================================
   STATUS
===================================================== */

function obterStatusEstudo(estudo) {

    const hoje =
        hojeISO();


    if (
        estudo.data <
        hoje
    ) {

        return "anterior";

    }


    if (
        estudo.data ===
        hoje
    ) {

        return "hoje";

    }


    return "proxima";

}


/* =====================================================
   FILTROS
===================================================== */

function obterEstudosFiltradas() {

    if (
        filtroAtual ===
        "hoje"
    ) {

        return estudos.filter(
            function (estudo) {

                return (
                    obterStatusEstudo(
                        estudo
                    ) ===
                    "hoje"
                );

            }
        );

    }


    if (
        filtroAtual ===
        "anteriores"
    ) {

        return estudos.filter(
            function (estudo) {

                return (
                    obterStatusEstudo(
                        estudo
                    ) ===
                    "anterior"
                );

            }
        );

    }


    /*
        PRÓXIMAS

        Inclui estudos de hoje
        e estudos futuras.
    */

    return estudos.filter(
        function (estudo) {

            const status =
                obterStatusEstudo(
                    estudo
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

function ordenarEstudos(lista) {

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

    let anteriores =
        0;


    estudos.forEach(
        function (estudo) {

            const status =
                obterStatusEstudo(
                    estudo
                );


            if (
                status ===
                "anterior"
            ) {

                anteriores++;

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


    if (totalAnteriores) {

        totalAnteriores.textContent =
            anteriores;

    }

}


/* =====================================================
   RENDERIZAR
===================================================== */

function renderizarEstudos() {

    listaEstudosPagina.innerHTML =
        "";


    atualizarContadores();


    const filtradas =
        obterEstudosFiltradas();


    const ordenadas =
        ordenarEstudos(
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

            textoEstudosVazio.textContent =
                "Você não possui nenhuma estudo hoje.";

        }

        else if (
            filtroAtual ===
            "anteriores"
        ) {

            textoEstudosVazio.textContent =
                "Nenhuma estudo anterior foi encontrada.";

        }

        else {

            textoEstudosVazio.textContent =
                "Você não possui nenhuma estudo próxima.";

        }


        listaEstudosPagina.appendChild(
            estudosPaginaVazio
        );


        return;

    }


    /* =========================
       CARDS
    ========================== */

    ordenadas.forEach(
        function (estudo) {

            const card =
                criarCardEstudo(
                    estudo
                );


            listaEstudosPagina.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CARD
===================================================== */

function criarCardEstudo(estudo) {

    const status =
        obterStatusEstudo(
            estudo
        );


    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "estudo-card"
    );


    if (
        status ===
        "anterior"
    ) {

        card.classList.add(
            "estudo-anterior"
        );

    }


    if (
        status ===
        "hoje"
    ) {

        card.classList.add(
            "estudo-hoje"
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
        "estudo-data"
    );


    const partes =
        estudo.data.split(
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

    const objetivo =
        document.createElement(
            "div"
        );


    objetivo.classList.add(
        "estudo-objetivo"
    );


    const topo =
        document.createElement(
            "div"
        );


    topo.classList.add(
        "estudo-topo"
    );


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        estudo.nome;


    const materia =
        document.createElement(
            "span"
        );


    materia.classList.add(
        "estudo-materia"
    );


    materia.textContent =
        obterNomeMateria(
            estudo.materiaId
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
        "estudo-meta"
    );


    const dataCompleta =
        document.createElement(
            "span"
        );


    dataCompleta.textContent =
        formatarData(
            estudo.data
        );


    meta.appendChild(
        dataCompleta
    );


    if (
        estudo.horario
    ) {

        const horario =
            document.createElement(
                "span"
            );


        horario.textContent =
            estudo.horario;


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
        "estudo-status"
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
        "anterior"
    ) {

        statusElemento.classList.add(
            "status-anterior"
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


    objetivo.appendChild(
        topo
    );


    objetivo.appendChild(
        meta
    );


    /* CONTEÚDO DA PROVA */

    if (
        estudo.objetivo
    ) {

        const observacao =
            document.createElement(
                "p"
            );


        observacao.classList.add(
            "estudo-observacao"
        );


        observacao.textContent =
            estudo.objetivo;


        objetivo.appendChild(
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
        "estudo-acoes"
    );


    const editar =
        document.createElement(
            "button"
        );


    editar.type =
        "button";


    editar.classList.add(
        "estudo-editar"
    );


    editar.textContent =
        "Editar";


    editar.addEventListener(
        "click",
        function () {

            editarEstudo(
                estudo.id
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
        "estudo-excluir"
    );


    excluir.textContent =
        "Excluir";


    excluir.addEventListener(
        "click",
        function () {

            excluirEstudo(
                estudo.id
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
        objetivo
    );


    card.appendChild(
        acoes
    );


    return card;

}


/* =====================================================
   FILTROS
===================================================== */

botoesFiltroEstudo.forEach(
    function (botao) {

        botao.addEventListener(
            "click",
            function () {

                filtroAtual =
                    botao.dataset.filtro;


                botoesFiltroEstudo.forEach(
                    function (item) {

                        item.classList.remove(
                            "ativo"
                        );

                    }
                );


                botao.classList.add(
                    "ativo"
                );


                renderizarEstudos();

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
            carregarEstudos()
        ]);


        renderizarEstudos();

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

async function iniciarPaginaEstudos() {

    usuarioLogado =
        await protegerPagina();


    if (!usuarioLogado) {
        return;
    }


    await Promise.all([
        carregarMaterias(),
        carregarEstudos()
    ]);


    renderizarEstudos();

}


iniciarPaginaEstudos();