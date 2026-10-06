/* =====================================================
   NEXO - TRABALHOS
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const novaTrabalho =
    document.getElementById("novaTrabalho");

const criarPrimeiraTrabalho =
    document.getElementById("criarPrimeiraTrabalho");

const modalTrabalho =
    document.getElementById("modalTrabalho");

const fecharModalTrabalho =
    document.getElementById("fecharModalTrabalho");

const cancelarTrabalho =
    document.getElementById("cancelarTrabalho");

const formTrabalho =
    document.getElementById("formTrabalho");

const tituloModalTrabalho =
    document.getElementById("tituloModalTrabalho");

const nomeTrabalho =
    document.getElementById("nomeTrabalho");

const materiaTrabalho =
    document.getElementById("materiaTrabalho");

const dataTrabalho =
    document.getElementById("dataTrabalho");

const horarioTrabalho =
    document.getElementById("horarioTrabalho");

const descricaoTrabalho =
    document.getElementById("descricaoTrabalho");

const listaTrabalhosPagina =
    document.getElementById("listaTrabalhosPagina");

const trabalhosPaginaVazio =
    document.getElementById("trabalhosPaginaVazio");

const textoTrabalhosVazio =
    document.getElementById("textoTrabalhosVazio");

const totalProximas =
    document.getElementById("totalProximas");

const totalHoje =
    document.getElementById("totalHoje");

const totalRealizadas =
    document.getElementById("totalRealizadas");

const botoesFiltroTrabalho =
    document.querySelectorAll(".filtro-trabalho");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let trabalhos = [];

let materias = [];

let trabalhoEmEdicao = null;

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

function normalizarTrabalho(item) {

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

        descricao:
            item.descricao || "",

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
   CARREGAR TRABALHOS - SUPABASE
===================================================== */

async function carregarTrabalhos() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await nexoSupabase
                .from("trabalhos")
                .select(
                    "id, nome, descricao, data, horario, materia_id, no_calendario, criado_em"
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
                "Erro ao carregar trabalhos:",
                error
            );

            trabalhos = [];

            return;

        }


        trabalhos =
            (data || []).map(
                normalizarTrabalho
            );


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar trabalhos:",
            erro
        );

        trabalhos = [];

    }

}


/* =====================================================
   PREENCHER MATÉRIAS
===================================================== */

function preencherMaterias(
    materiaSelecionada = ""
) {

    materiaTrabalho.innerHTML =
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


    materiaTrabalho.appendChild(
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


            materiaTrabalho.appendChild(
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

function abrirNovaTrabalho() {

    trabalhoEmEdicao =
        null;


    tituloModalTrabalho.textContent =
        "Nova trabalho";


    formTrabalho.reset();


    preencherMaterias();


    dataTrabalho.value =
        hojeISO();


    modalTrabalho.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            nomeTrabalho.focus();

        },
        100
    );

}


/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharModal() {

    modalTrabalho.classList.remove(
        "ativo"
    );


    formTrabalho.reset();


    trabalhoEmEdicao =
        null;

}


/* =====================================================
   EVENTOS
===================================================== */

if (novaTrabalho) {

    novaTrabalho.addEventListener(
        "click",
        abrirNovaTrabalho
    );

}


if (criarPrimeiraTrabalho) {

    criarPrimeiraTrabalho.addEventListener(
        "click",
        abrirNovaTrabalho
    );

}


if (fecharModalTrabalho) {

    fecharModalTrabalho.addEventListener(
        "click",
        fecharModal
    );

}


if (cancelarTrabalho) {

    cancelarTrabalho.addEventListener(
        "click",
        fecharModal
    );

}


if (modalTrabalho) {

    modalTrabalho.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalTrabalho
            ) {

                fecharModal();

            }

        }
    );

}


/* =====================================================
   SALVAR PROVA - SUPABASE
===================================================== */

formTrabalho.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!usuarioLogado) {
            return;
        }


        const nome =
            nomeTrabalho.value.trim();


        const materiaId =
            materiaTrabalho.value;


        const data =
            dataTrabalho.value;


        const horario =
            horarioTrabalho.value;


        const descricao =
            descricaoTrabalho.value.trim();

        const noCalendario =
            true;


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

            if (trabalhoEmEdicao) {

                const {
                    error
                } =
                    await nexoSupabase
                        .from("trabalhos")
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

                            descricao:
                                descricao ||
                                null,

                            no_calendario:
                                noCalendario

                        })
                        .eq(
                            "id",
                            trabalhoEmEdicao
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
                        "Erro ao editar trabalho:",
                        error
                    );

                    alert(
                        "Não foi possível editar a trabalho."
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
                        .from("trabalhos")
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

                            descricao:
                                descricao ||
                                null,

                            usuario_id:
                                usuarioLogado.id,

                            visibilidade:
                                "privada",

                            no_calendario:
                                noCalendario

                        });


                if (error) {

                    console.error(
                        "Erro ao criar trabalho:",
                        error
                    );

                    alert(
                        "Não foi possível criar a trabalho."
                    );

                    return;

                }

            }


            await carregarTrabalhos();

            renderizarTrabalhos();

            fecharModal();


        } catch (erro) {

            console.error(
                "Erro inesperado ao salvar trabalho:",
                erro
            );

            alert(
                "Ocorreu um erro ao salvar a trabalho."
            );

        }

    }
);


/* =====================================================
   EDITAR
===================================================== */

function editarTrabalho(id) {

    const trabalho =
        trabalhos.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!trabalho) {
        return;
    }


    trabalhoEmEdicao =
        trabalho.id;


    tituloModalTrabalho.textContent =
        "Editar trabalho";


    nomeTrabalho.value =
        trabalho.nome;


    dataTrabalho.value =
        trabalho.data;


    horarioTrabalho.value =
        trabalho.horario || "";


    descricaoTrabalho.value =
        trabalho.descricao || "";


    preencherMaterias(
        trabalho.materiaId || ""
    );


    modalTrabalho.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            nomeTrabalho.focus();

        },
        100
    );

}


/* =====================================================
   EXCLUIR
===================================================== */

async function excluirTrabalho(id) {

    const trabalho =
        trabalhos.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!trabalho) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja realmente excluir a trabalho "${trabalho.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const {
            error
        } =
            await nexoSupabase
                .from("trabalhos")
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
                "Erro ao excluir trabalho:",
                error
            );

            alert(
                "Não foi possível excluir a trabalho."
            );

            return;

        }


        await carregarTrabalhos();

        renderizarTrabalhos();


    } catch (erro) {

        console.error(
            "Erro inesperado ao excluir trabalho:",
            erro
        );

    }

}


/* =====================================================
   STATUS
===================================================== */

function obterStatusTrabalho(trabalho) {

    const hoje =
        hojeISO();


    if (
        trabalho.data <
        hoje
    ) {

        return "realizada";

    }


    if (
        trabalho.data ===
        hoje
    ) {

        return "hoje";

    }


    return "proxima";

}


/* =====================================================
   FILTROS
===================================================== */

function obterTrabalhosFiltradas() {

    if (
        filtroAtual ===
        "hoje"
    ) {

        return trabalhos.filter(
            function (trabalho) {

                return (
                    obterStatusTrabalho(
                        trabalho
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

        return trabalhos.filter(
            function (trabalho) {

                return (
                    obterStatusTrabalho(
                        trabalho
                    ) ===
                    "realizada"
                );

            }
        );

    }


    /*
        PRÓXIMAS

        Inclui trabalhos de hoje
        e trabalhos futuras.
    */

    return trabalhos.filter(
        function (trabalho) {

            const status =
                obterStatusTrabalho(
                    trabalho
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

function ordenarTrabalhos(lista) {

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


    trabalhos.forEach(
        function (trabalho) {

            const status =
                obterStatusTrabalho(
                    trabalho
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

function renderizarTrabalhos() {

    listaTrabalhosPagina.innerHTML =
        "";


    atualizarContadores();


    const filtradas =
        obterTrabalhosFiltradas();


    const ordenadas =
        ordenarTrabalhos(
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

            textoTrabalhosVazio.textContent =
                "Você não possui nenhuma trabalho hoje.";

        }

        else if (
            filtroAtual ===
            "realizadas"
        ) {

            textoTrabalhosVazio.textContent =
                "Nenhuma trabalho realizada foi encontrada.";

        }

        else {

            textoTrabalhosVazio.textContent =
                "Você não possui nenhuma trabalho próxima.";

        }


        listaTrabalhosPagina.appendChild(
            trabalhosPaginaVazio
        );


        return;

    }


    /* =========================
       CARDS
    ========================== */

    ordenadas.forEach(
        function (trabalho) {

            const card =
                criarCardTrabalho(
                    trabalho
                );


            listaTrabalhosPagina.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CARD
===================================================== */

function criarCardTrabalho(trabalho) {

    const status =
        obterStatusTrabalho(
            trabalho
        );


    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "trabalho-card"
    );


    if (
        status ===
        "realizada"
    ) {

        card.classList.add(
            "trabalho-realizada"
        );

    }


    if (
        status ===
        "hoje"
    ) {

        card.classList.add(
            "trabalho-hoje"
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
        "trabalho-data"
    );


    const partes =
        trabalho.data.split(
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

    const descricao =
        document.createElement(
            "div"
        );


    descricao.classList.add(
        "trabalho-descricao"
    );


    const topo =
        document.createElement(
            "div"
        );


    topo.classList.add(
        "trabalho-topo"
    );


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        trabalho.nome;


    const materia =
        document.createElement(
            "span"
        );


    materia.classList.add(
        "trabalho-materia"
    );


    materia.textContent =
        obterNomeMateria(
            trabalho.materiaId
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
        "trabalho-meta"
    );


    const dataCompleta =
        document.createElement(
            "span"
        );


    dataCompleta.textContent =
        formatarData(
            trabalho.data
        );


    meta.appendChild(
        dataCompleta
    );


    if (
        trabalho.horario
    ) {

        const horario =
            document.createElement(
                "span"
            );


        horario.textContent =
            trabalho.horario;


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
        "trabalho-status"
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


    descricao.appendChild(
        topo
    );


    descricao.appendChild(
        meta
    );


    /* CONTEÚDO DA PROVA */

    if (
        trabalho.descricao
    ) {

        const observacao =
            document.createElement(
                "p"
            );


        observacao.classList.add(
            "trabalho-observacao"
        );


        observacao.textContent =
            trabalho.descricao;


        descricao.appendChild(
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
        "trabalho-acoes"
    );


    const editar =
        document.createElement(
            "button"
        );


    editar.type =
        "button";


    editar.classList.add(
        "trabalho-editar"
    );


    editar.textContent =
        "Editar";


    editar.addEventListener(
        "click",
        function () {

            editarTrabalho(
                trabalho.id
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
        "trabalho-excluir"
    );


    excluir.textContent =
        "Excluir";


    excluir.addEventListener(
        "click",
        function () {

            excluirTrabalho(
                trabalho.id
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
        descricao
    );


    card.appendChild(
        acoes
    );


    return card;

}


/* =====================================================
   FILTROS
===================================================== */

botoesFiltroTrabalho.forEach(
    function (botao) {

        botao.addEventListener(
            "click",
            function () {

                filtroAtual =
                    botao.dataset.filtro;


                botoesFiltroTrabalho.forEach(
                    function (item) {

                        item.classList.remove(
                            "ativo"
                        );

                    }
                );


                botao.classList.add(
                    "ativo"
                );


                renderizarTrabalhos();

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
            carregarTrabalhos()
        ]);


        renderizarTrabalhos();

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

async function iniciarPaginaTrabalhos() {

    usuarioLogado =
        await protegerPagina();


    if (!usuarioLogado) {
        return;
    }


    await Promise.all([
        carregarMaterias(),
        carregarTrabalhos()
    ]);


    renderizarTrabalhos();

}


iniciarPaginaTrabalhos();