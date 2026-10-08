/* =====================================================
   NEXO - MÊS
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const calendarioGrade =
    document.getElementById("calendarioGrade");

const tituloMes =
    document.getElementById("tituloMes");

const mesAnterior =
    document.getElementById("mesAnterior");

const mesProximo =
    document.getElementById("mesProximo");

const mesHoje =
    document.getElementById("mesHoje");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


/* DIA */

const modalDiaMes =
    document.getElementById("modalDiaMes");

const modalMesData =
    document.getElementById("modalMesData");

const fecharModalDiaMes =
    document.getElementById("fecharModalDiaMes");

const criarAtividadeMes =
    document.getElementById("criarAtividadeMes");

const criarProvaMes =
    document.getElementById("criarProvaMes");


/* ATIVIDADE */

const modalAtividadeMes =
    document.getElementById("modalAtividadeMes");

const fecharAtividadeMes =
    document.getElementById("fecharAtividadeMes");

const cancelarAtividadeMes =
    document.getElementById("cancelarAtividadeMes");

const formAtividadeMes =
    document.getElementById("formAtividadeMes");

const tituloAtividadeMes =
    document.getElementById("tituloAtividadeMes");

const dataAtividadeMes =
    document.getElementById("dataAtividadeMes");

const materiaAtividadeMes =
    document.getElementById("materiaAtividadeMes");

const horarioAtividadeMes =
    document.getElementById("horarioAtividadeMes");

const descricaoAtividadeMes =
    document.getElementById("descricaoAtividadeMes");

const atividadeMesNoCalendario =
    document.getElementById("atividadeMesNoCalendario");


/* PROVA */

const modalProvaMes =
    document.getElementById("modalProvaMes");

const fecharProvaMes =
    document.getElementById("fecharProvaMes");

const cancelarProvaMes =
    document.getElementById("cancelarProvaMes");

const formProvaMes =
    document.getElementById("formProvaMes");

const nomeProvaMes =
    document.getElementById("nomeProvaMes");

const dataProvaMes =
    document.getElementById("dataProvaMes");

const materiaProvaMes =
    document.getElementById("materiaProvaMes");

const horarioProvaMes =
    document.getElementById("horarioProvaMes");

const conteudoProvaMes =
    document.getElementById("conteudoProvaMes");

const provaMesNoCalendario =
    document.getElementById("provaMesNoCalendario");


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let atividadesSupabase = [];

let provasSupabase = [];

let trabalhosSupabase = [];

let materiasSupabase = [];


const hoje =
    new Date();


let dataMesAtual =
    new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
    );


let dataSelecionada =
    "";


/* =====================================================
   DATAS
===================================================== */

function dataParaISO(data) {

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


function formatarData(dataISO) {

    const partes =
        dataISO.split("-");

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );

}


/* =====================================================
   CARREGAR DADOS DO SUPABASE
===================================================== */

async function carregarDadosSupabase() {

    if (!usuarioLogado) {
        return;
    }


    try {

        const [
            respostaMaterias,
            respostaAtividades,
            respostaProvas,
            respostaTrabalhos
        ] =
            await Promise.all([

                nexoSupabase
                    .from("materias")
                    .select(
                        "id, nome, professor"
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
                    ),

                nexoSupabase
                    .from("atividades")
                    .select(
                        "id, titulo, descricao, data, horario, materia_id, concluida, no_calendario, criado_em"
                    )
                    .eq(
                        "usuario_id",
                        usuarioLogado.id
                    )
                .eq(
                    "visibilidade",
                    "privada"
                )
                    .eq(
                        "no_calendario",
                        true
                    )
                    .order(
                        "data",
                        {
                            ascending: true
                        }
                    ),

                nexoSupabase
                    .from("provas")
                    .select(
                        "id, nome, conteudo, data, horario, materia_id, no_calendario, criado_em"
                    )
                    .eq(
                        "usuario_id",
                        usuarioLogado.id
                    )
                .eq(
                    "visibilidade",
                    "privada"
                )
                    .eq(
                        "no_calendario",
                        true
                    )
                    .order(
                        "data",
                        {
                            ascending: true
                        }
                    ),

                nexoSupabase
                    .from("trabalhos")
                    .select("id, nome, descricao, data, horario, materia_id, criado_em")
                    .eq("usuario_id", usuarioLogado.id)
                    .order("data", { ascending: true })

            ]);


        /* MATÉRIAS */

        if (
            respostaMaterias.error
        ) {

            console.error(
                "Erro ao carregar matérias:",
                respostaMaterias.error
            );

            materiasSupabase = [];

        } else {

            materiasSupabase =
                respostaMaterias.data || [];

        }


        /* ATIVIDADES */

        if (
            respostaAtividades.error
        ) {

            console.error(
                "Erro ao carregar atividades:",
                respostaAtividades.error
            );

            atividadesSupabase = [];

        } else {

            atividadesSupabase =
                (
                    respostaAtividades.data || []
                ).map(
                    function (item) {

                        return {

                            id:
                                item.id,

                            titulo:
                                item.titulo,

                            descricao:
                                item.descricao || "",

                            data:
                                item.data,

                            horario:
                                item.horario
                                    ? String(
                                        item.horario
                                    ).slice(0, 5)
                                    : "",

                            materiaId:
                                item.materia_id || "",

                            concluida:
                                Boolean(
                                    item.concluida
                                ),

                            criadoEm:
                                item.criado_em || ""

                        };

                    }
                );

        }


        /* PROVAS */

        if (
            respostaProvas.error
        ) {

            console.error(
                "Erro ao carregar provas:",
                respostaProvas.error
            );

            provasSupabase = [];

        } else {

            provasSupabase =
                (
                    respostaProvas.data || []
                ).map(
                    function (item) {

                        return {

                            id:
                                item.id,

                            nome:
                                item.nome,

                            conteudo:
                                item.conteudo || "",

                            data:
                                item.data,

                            horario:
                                item.horario
                                    ? String(
                                        item.horario
                                    ).slice(0, 5)
                                    : "",

                            materiaId:
                                item.materia_id || "",

                            criadoEm:
                                item.criado_em || ""

                        };

                    }
                );

        }


        /* TRABALHOS */
        if (respostaTrabalhos.error) {
            console.error("Erro ao carregar trabalhos:", respostaTrabalhos.error);
            trabalhosSupabase = [];
        } else {
            trabalhosSupabase = (respostaTrabalhos.data || []).map(function (item) {
                return { id: item.id, nome: item.nome, descricao: item.descricao || "", data: item.data,
                    horario: item.horario ? String(item.horario).slice(0,5) : "",
                    materiaId: item.materia_id || "", criadoEm: item.criado_em || "" };
            });
        }


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar dados do mês:",
            erro
        );

    }

}


/* =====================================================
   MATÉRIAS
===================================================== */

function obterMaterias() {

    return materiasSupabase;

}


function obterNomeMateria(id) {

    if (!id) {

        return "Sem matéria";

    }


    const materia =
        obterMaterias().find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    return materia
        ? materia.nome
        : "Matéria removida";

}


function preencherMaterias(select) {

    select.innerHTML =
        "";


    const materias =
        [...obterMaterias()].sort(
            function (a, b) {

                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );

            }
        );


    const padrao =
        document.createElement(
            "option"
        );


    padrao.value =
        "";


    padrao.textContent =
        materias.length
            ? "Selecione uma matéria"
            : "Nenhuma matéria cadastrada";


    select.appendChild(
        padrao
    );


    materias.forEach(
        function (materia) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                materia.id;


            option.textContent =
                materia.nome;


            select.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   CALENDÁRIO
===================================================== */

function renderizarMes() {

    if (
        !calendarioGrade ||
        !tituloMes
    ) {

        console.error(
            "Elementos do calendário mensal não encontrados."
        );

        return;

    }


    calendarioGrade.innerHTML =
        "";


    const ano =
        dataMesAtual.getFullYear();


    const mes =
        dataMesAtual.getMonth();


    /* TÍTULO */

    const titulo =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        ).format(
            dataMesAtual
        );


    tituloMes.textContent =
        titulo.charAt(0).toUpperCase() +
        titulo.slice(1);


    const primeiroDia =
        new Date(
            ano,
            mes,
            1
        );


    /*
        JS:
        domingo = 0
        segunda = 1

        Nosso calendário começa
        segunda-feira.
    */

    const deslocamento =
        primeiroDia.getDay() === 0
            ? 6
            : primeiroDia.getDay() - 1;


    const inicioGrade =
        new Date(
            ano,
            mes,
            1 - deslocamento
        );


    const atividades =
        atividadesSupabase;


    const provas =
        provasSupabase;

    const trabalhos = trabalhosSupabase;


    const hojeISO =
        dataParaISO(
            new Date()
        );


    /*
        Sempre mostramos 42 células:
        6 semanas × 7 dias.
    */

    for (
        let i = 0;
        i < 42;
        i++
    ) {

        const data =
            new Date(
                inicioGrade.getFullYear(),
                inicioGrade.getMonth(),
                inicioGrade.getDate() + i
            );


        const iso =
            dataParaISO(
                data
            );


        const celula =
            document.createElement(
                "article"
            );


        celula.classList.add(
            "calendario-dia"
        );


        if (
            data.getMonth() !== mes
        ) {

            celula.classList.add(
                "calendario-outro-mes"
            );

        }


        if (
            iso === hojeISO
        ) {

            celula.classList.add(
                "calendario-hoje"
            );

        }


        /* CABEÇALHO */

        const cabecalho =
            document.createElement(
                "div"
            );


        cabecalho.classList.add(
            "calendario-dia-topo"
        );


        const numero =
            document.createElement(
                "span"
            );


        numero.classList.add(
            "calendario-numero"
        );


        numero.textContent =
            data.getDate();


        const adicionar =
            document.createElement(
                "button"
            );


        adicionar.type =
            "button";


        adicionar.classList.add(
            "calendario-adicionar"
        );


        adicionar.textContent =
            "+";


        adicionar.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                abrirModalDia(
                    iso
                );

            }
        );


        cabecalho.appendChild(
            numero
        );


        cabecalho.appendChild(
            adicionar
        );


        celula.appendChild(
            cabecalho
        );


        /* ITENS */

        const areaItens =
            document.createElement(
                "div"
            );


        areaItens.classList.add(
            "calendario-itens"
        );


        const itens =
            [];


        /*
            Atividade concluída
            não aparece no calendário.
        */

        atividades
            .filter(
                function (atividade) {

                    return (
                        atividade.data === iso &&
                        !atividade.concluida
                    );

                }
            )
            .forEach(
                function (atividade) {

                    itens.push({

                        tipo:
                            "atividade",

                        titulo:
                            atividade.titulo,

                        materiaId:
                            atividade.materiaId,

                        horario:
                            atividade.horario || ""

                    });

                }
            );


        provas
            .filter(
                function (prova) {

                    return (
                        prova.data === iso
                    );

                }
            )
            .forEach(
                function (prova) {

                    itens.push({

                        tipo:
                            "prova",

                        titulo:
                            prova.nome,

                        materiaId:
                            prova.materiaId,

                        horario:
                            prova.horario || ""

                    });

                }
            );


        trabalhos
            .filter(function (trabalho) { return trabalho.data === iso; })
            .forEach(function (trabalho) {
                itens.push({ tipo: "trabalho", titulo: trabalho.nome, materiaId: trabalho.materiaId, horario: trabalho.horario || "" });
            });


        itens.sort(
            function (a, b) {

                return (
                    (
                        a.horario ||
                        "99:99"
                    ).localeCompare(
                        b.horario ||
                        "99:99"
                    )
                );

            }
        );


        /*
            Mostra até 3 itens diretamente.
        */

        itens
            .slice(
                0,
                3
            )
            .forEach(
                function (item) {

                    areaItens.appendChild(
                        criarItemCalendario(
                            item
                        )
                    );

                }
            );


        /*
            Se tiver mais que 3.
        */

        if (
            itens.length > 3
        ) {

            const mais =
                document.createElement(
                    "span"
                );


            mais.classList.add(
                "calendario-mais"
            );


            mais.textContent =
                `+${itens.length - 3} itens`;


            areaItens.appendChild(
                mais
            );

        }


        celula.appendChild(
            areaItens
        );


        /*
            Clicar duas vezes na área
            do dia abre o menu.
        */

        celula.addEventListener(
            "dblclick",
            function () {

                abrirModalDia(
                    iso
                );

            }
        );


        calendarioGrade.appendChild(
            celula
        );

    }

}


/* =====================================================
   ITEM
===================================================== */

function criarItemCalendario(item) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.classList.add(
        "calendario-item"
    );


    elemento.classList.add(
        item.tipo === "prova"
            ? "calendario-item-prova"
            : item.tipo === "trabalho"
                ? "calendario-item-trabalho"
                : "calendario-item-atividade"
    );


    const titulo =
        document.createElement(
            "strong"
        );


    titulo.textContent =
        item.titulo;


    const detalhe =
        document.createElement(
            "span"
        );


    const materia =
        obterNomeMateria(
            item.materiaId
        );


    detalhe.textContent =
        item.horario
            ? `${item.horario} • ${materia}`
            : materia;


    elemento.appendChild(
        titulo
    );


    elemento.appendChild(
        detalhe
    );


    return elemento;

}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

if (mesAnterior) {

    mesAnterior.addEventListener(
        "click",
        function () {

            dataMesAtual =
                new Date(
                    dataMesAtual.getFullYear(),
                    dataMesAtual.getMonth() - 1,
                    1
                );


            renderizarMes();

        }
    );

}


if (mesProximo) {

    mesProximo.addEventListener(
        "click",
        function () {

            dataMesAtual =
                new Date(
                    dataMesAtual.getFullYear(),
                    dataMesAtual.getMonth() + 1,
                    1
                );


            renderizarMes();

        }
    );

}


if (mesHoje) {

    mesHoje.addEventListener(
        "click",
        function () {

            const agora =
                new Date();


            dataMesAtual =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth(),
                    1
                );


            renderizarMes();

        }
    );

}


/* =====================================================
   MODAL DIA
===================================================== */

function abrirModalDia(dataISO) {

    dataSelecionada =
        dataISO;


    if (modalMesData) {

        modalMesData.textContent =
            formatarData(
                dataISO
            );

    }


    if (modalDiaMes) {

        modalDiaMes.classList.add(
            "ativo"
        );

    }

}


function fecharModalDia() {

    if (modalDiaMes) {

        modalDiaMes.classList.remove(
            "ativo"
        );

    }

}


if (fecharModalDiaMes) {

    fecharModalDiaMes.addEventListener(
        "click",
        fecharModalDia
    );

}


if (modalDiaMes) {

    modalDiaMes.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalDiaMes
            ) {

                fecharModalDia();

            }

        }
    );

}


/* =====================================================
   ABRIR ATIVIDADE
===================================================== */

if (criarAtividadeMes) {

    criarAtividadeMes.addEventListener(
        "click",
        function () {

            fecharModalDia();


            formAtividadeMes.reset();


            dataAtividadeMes.value =
                dataSelecionada;


            preencherMaterias(
                materiaAtividadeMes
            );


            modalAtividadeMes.classList.add(
                "ativo"
            );


            setTimeout(
                function () {

                    tituloAtividadeMes.focus();

                },
                100
            );

        }
    );

}


function fecharModalAtividade() {

    if (modalAtividadeMes) {

        modalAtividadeMes.classList.remove(
            "ativo"
        );

    }

}


if (fecharAtividadeMes) {

    fecharAtividadeMes.addEventListener(
        "click",
        fecharModalAtividade
    );

}


if (cancelarAtividadeMes) {

    cancelarAtividadeMes.addEventListener(
        "click",
        fecharModalAtividade
    );

}


if (modalAtividadeMes) {

    modalAtividadeMes.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalAtividadeMes
            ) {

                fecharModalAtividade();

            }

        }
    );

}


/* =====================================================
   SALVAR ATIVIDADE NO SUPABASE
===================================================== */

if (formAtividadeMes) {

    formAtividadeMes.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuarioLogado) {
                return;
            }


            const titulo =
                tituloAtividadeMes.value.trim();


            const data =
                dataAtividadeMes.value;


            if (
                !titulo ||
                !data
            ) {

                return;

            }


            try {

                const {
                    error
                } =
                    await nexoSupabase
                        .from(
                            "atividades"
                        )
                        .insert({
                            lembretes: NexoLembretes.valores(formAtividadeMes),

                            titulo:
                                titulo,

                            data:
                                data,

                            materia_id:
                                materiaAtividadeMes.value ||
                                null,

                            horario:
                                horarioAtividadeMes.value ||
                                null,

                            descricao:
                                descricaoAtividadeMes.value.trim() ||
                                null,

                            concluida:
                                false,

                            usuario_id:
                                usuarioLogado.id,

                            visibilidade:
                                "privada",

                            no_calendario:
                                Boolean(atividadeMesNoCalendario && atividadeMesNoCalendario.checked)

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


                await carregarDadosSupabase();


                fecharModalAtividade();


                renderizarMes();


            } catch (erro) {

                console.error(
                    "Erro inesperado ao criar atividade:",
                    erro
                );


                alert(
                    "Ocorreu um erro ao criar a atividade."
                );

            }

        }
    );

}


/* =====================================================
   ABRIR PROVA
===================================================== */

if (criarProvaMes) {

    criarProvaMes.addEventListener(
        "click",
        function () {

            fecharModalDia();


            formProvaMes.reset();


            dataProvaMes.value =
                dataSelecionada;


            preencherMaterias(
                materiaProvaMes
            );


            modalProvaMes.classList.add(
                "ativo"
            );


            setTimeout(
                function () {

                    nomeProvaMes.focus();

                },
                100
            );

        }
    );

}


function fecharModalProva() {

    if (modalProvaMes) {

        modalProvaMes.classList.remove(
            "ativo"
        );

    }

}


if (fecharProvaMes) {

    fecharProvaMes.addEventListener(
        "click",
        fecharModalProva
    );

}


if (cancelarProvaMes) {

    cancelarProvaMes.addEventListener(
        "click",
        fecharModalProva
    );

}


if (modalProvaMes) {

    modalProvaMes.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalProvaMes
            ) {

                fecharModalProva();

            }

        }
    );

}


/* =====================================================
   SALVAR PROVA NO SUPABASE
===================================================== */

if (formProvaMes) {

    formProvaMes.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuarioLogado) {
                return;
            }


            const nome =
                nomeProvaMes.value.trim();


            const data =
                dataProvaMes.value;


            if (
                !nome ||
                !data
            ) {

                return;

            }


            try {

                const {
                    error
                } =
                    await nexoSupabase
                        .from(
                            "provas"
                        )
                        .insert({
                            lembretes: NexoLembretes.valores(formProvaMes),

                            nome:
                                nome,

                            data:
                                data,

                            materia_id:
                                materiaProvaMes.value ||
                                null,

                            horario:
                                horarioProvaMes.value ||
                                null,

                            conteudo:
                                conteudoProvaMes.value.trim() ||
                                null,

                            usuario_id:
                                usuarioLogado.id,

                            visibilidade:
                                "privada",

                            no_calendario:
                                Boolean(provaMesNoCalendario && provaMesNoCalendario.checked)

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


                await carregarDadosSupabase();


                fecharModalProva();


                renderizarMes();


            } catch (erro) {

                console.error(
                    "Erro inesperado ao criar prova:",
                    erro
                );


                alert(
                    "Ocorreu um erro ao criar a prova."
                );

            }

        }
    );

}


/* =====================================================
   MOBILE
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
            event.key !== "Escape"
        ) {

            return;

        }


        fecharModalDia();

        fecharModalAtividade();

        fecharModalProva();


        if (sidebar) {

            sidebar.classList.remove(
                "ativo"
            );

        }

    }
);


/* =====================================================
   ATUALIZAR AO VOLTAR PARA A ABA
===================================================== */

window.addEventListener(
    "focus",
    async function () {

        if (!usuarioLogado) {
            return;
        }


        await carregarDadosSupabase();


        renderizarMes();

    }
);


/* =====================================================
   INICIAR
===================================================== */

async function iniciarMes() {

    try {

        usuarioLogado =
            await protegerPagina();


        if (!usuarioLogado) {
            return;
        }


        await carregarDadosSupabase();


        renderizarMes();


    } catch (erro) {

        console.error(
            "Erro ao iniciar a página Mês:",
            erro
        );

    }

}


iniciarMes();