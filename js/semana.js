/* =====================================================
   NEXO - SEMANA
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const semanaGrade =
    document.getElementById("semanaGrade");

const periodoSemana =
    document.getElementById("periodoSemana");

const semanaAnterior =
    document.getElementById("semanaAnterior");

const semanaProxima =
    document.getElementById("semanaProxima");

const semanaHoje =
    document.getElementById("semanaHoje");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


/* MODAL DO DIA */

const modalDiaSemana =
    document.getElementById("modalDiaSemana");

const modalDiaData =
    document.getElementById("modalDiaData");

const fecharModalDiaSemana =
    document.getElementById("fecharModalDiaSemana");

const criarAtividadeSemana =
    document.getElementById("criarAtividadeSemana");

const criarProvaSemana =
    document.getElementById("criarProvaSemana");


/* ATIVIDADE */

const modalAtividadeSemana =
    document.getElementById("modalAtividadeSemana");

const fecharAtividadeSemana =
    document.getElementById("fecharAtividadeSemana");

const cancelarAtividadeSemana =
    document.getElementById("cancelarAtividadeSemana");

const formAtividadeSemana =
    document.getElementById("formAtividadeSemana");

const tituloAtividadeSemana =
    document.getElementById("tituloAtividadeSemana");

const dataAtividadeSemana =
    document.getElementById("dataAtividadeSemana");

const materiaAtividadeSemana =
    document.getElementById("materiaAtividadeSemana");

const horarioAtividadeSemana =
    document.getElementById("horarioAtividadeSemana");

const descricaoAtividadeSemana =
    document.getElementById("descricaoAtividadeSemana");

const atividadeSemanaNoCalendario =
    document.getElementById("atividadeSemanaNoCalendario");


/* PROVA */

const modalProvaSemana =
    document.getElementById("modalProvaSemana");

const fecharProvaSemana =
    document.getElementById("fecharProvaSemana");

const cancelarProvaSemana =
    document.getElementById("cancelarProvaSemana");

const formProvaSemana =
    document.getElementById("formProvaSemana");

const nomeProvaSemana =
    document.getElementById("nomeProvaSemana");

const dataProvaSemana =
    document.getElementById("dataProvaSemana");

const materiaProvaSemana =
    document.getElementById("materiaProvaSemana");

const horarioProvaSemana =
    document.getElementById("horarioProvaSemana");

const conteudoProvaSemana =
    document.getElementById("conteudoProvaSemana");

const provaSemanaNoCalendario =
    document.getElementById("provaSemanaNoCalendario");


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let atividadesSupabase = [];

let provasSupabase = [];

let materiasSupabase = [];

let inicioSemanaAtual =
    obterInicioSemana(
        new Date()
    );

let dataSelecionada =
    "";


/* =====================================================
   DATAS
===================================================== */

function copiarData(data) {

    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
    );

}


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


function obterInicioSemana(data) {

    const copia =
        copiarData(data);

    const dia =
        copia.getDay();

    const diferenca =
        dia === 0
            ? -6
            : 1 - dia;

    copia.setDate(
        copia.getDate() +
        diferenca
    );

    return copia;

}


function formatarDataCurta(
    data
) {

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "short"
        }
    )
        .format(data)
        .replace(".", "");

}


function formatarDataCompleta(
    dataISO
) {

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
            respostaProvas
        ] = await Promise.all([

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
                    "no_calendario",
                    true
                )
                .order(
                    "data",
                    {
                        ascending: true
                    }
                )

        ]);


        /* MATÉRIAS */

        if (respostaMaterias.error) {

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

        if (respostaAtividades.error) {

            console.error(
                "Erro ao carregar atividades:",
                respostaAtividades.error
            );

            atividadesSupabase = [];

        } else {

            atividadesSupabase =
                (
                    respostaAtividades.data ||
                    []
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

        if (respostaProvas.error) {

            console.error(
                "Erro ao carregar provas:",
                respostaProvas.error
            );

            provasSupabase = [];

        } else {

            provasSupabase =
                (
                    respostaProvas.data ||
                    []
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

    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar dados da semana:",
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

                return item.id === id;

            }
        );

    return materia
        ? materia.nome
        : "Matéria removida";

}


function preencherSelectMaterias(
    select
) {

    select.innerHTML = "";

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

    padrao.value = "";

    padrao.textContent =
        materias.length > 0
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
   RENDERIZAR SEMANA
===================================================== */

function renderizarSemana() {

    if (
        !semanaGrade ||
        !periodoSemana
    ) {

        console.error(
            "Elementos da semana não encontrados no HTML."
        );

        return;

    }


    semanaGrade.innerHTML =
        "";


    const hojeISO =
        dataParaISO(
            new Date()
        );


    const fimSemana =
        copiarData(
            inicioSemanaAtual
        );


    fimSemana.setDate(
        fimSemana.getDate() + 6
    );


    periodoSemana.textContent =
        `${formatarDataCurta(inicioSemanaAtual)} até ${formatarDataCurta(fimSemana)}`;


    const nomes = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo"
    ];


    const atividades =
        atividadesSupabase;


    const provas =
        provasSupabase;


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const data =
            copiarData(
                inicioSemanaAtual
            );


        data.setDate(
            data.getDate() + i
        );


        const iso =
            dataParaISO(data);


        const coluna =
            document.createElement(
                "article"
            );


        coluna.classList.add(
            "semana-dia"
        );


        if (
            iso === hojeISO
        ) {

            coluna.classList.add(
                "semana-dia-hoje"
            );

        }


        /* =========================
           CABEÇALHO
        ========================== */

        const cabecalho =
            document.createElement(
                "div"
            );


        cabecalho.classList.add(
            "semana-dia-cabecalho"
        );


        const info =
            document.createElement(
                "div"
            );


        const nome =
            document.createElement(
                "span"
            );


        nome.classList.add(
            "semana-dia-nome"
        );


        nome.textContent =
            nomes[i];


        const numero =
            document.createElement(
                "strong"
            );


        numero.classList.add(
            "semana-dia-numero"
        );


        numero.textContent =
            data.getDate();


        info.appendChild(
            nome
        );


        info.appendChild(
            numero
        );


        /* BOTÃO + */

        const adicionar =
            document.createElement(
                "button"
            );


        adicionar.type =
            "button";


        adicionar.classList.add(
            "semana-adicionar"
        );


        adicionar.textContent =
            "+";


        adicionar.setAttribute(
            "aria-label",
            `Adicionar em ${formatarDataCompleta(iso)}`
        );


        adicionar.addEventListener(
            "click",
            function () {

                abrirModalDia(
                    iso
                );

            }
        );


        cabecalho.appendChild(
            info
        );


        cabecalho.appendChild(
            adicionar
        );


        coluna.appendChild(
            cabecalho
        );


        /* =========================
           ITENS
        ========================== */

        const itens =
            document.createElement(
                "div"
            );


        itens.classList.add(
            "semana-itens"
        );


        /*
            Atividades concluídas
            não aparecem na semana.
        */

        const atividadesDia =
            atividades
                .filter(
                    function (atividade) {

                        return (
                            atividade.data === iso &&
                            !atividade.concluida
                        );

                    }
                )
                .sort(
                    ordenarPorHorario
                );


        const provasDia =
            provas
                .filter(
                    function (prova) {

                        return (
                            prova.data === iso
                        );

                    }
                )
                .sort(
                    ordenarPorHorario
                );


        const todosItens =
            [];


        atividadesDia.forEach(
            function (atividade) {

                todosItens.push({

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


        provasDia.forEach(
            function (prova) {

                todosItens.push({

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


        todosItens.sort(
            ordenarPorHorario
        );


        if (
            todosItens.length === 0
        ) {

            const vazio =
                document.createElement(
                    "div"
                );


            vazio.classList.add(
                "semana-dia-vazio"
            );


            vazio.textContent =
                "Nenhum item";


            itens.appendChild(
                vazio
            );

        }


        todosItens.forEach(
            function (item) {

                itens.appendChild(
                    criarItemSemana(
                        item
                    )
                );

            }
        );


        coluna.appendChild(
            itens
        );


        semanaGrade.appendChild(
            coluna
        );

    }

}


/* =====================================================
   ORDENAR POR HORÁRIO
===================================================== */

function ordenarPorHorario(
    a,
    b
) {

    const horarioA =
        a.horario || "99:99";


    const horarioB =
        b.horario || "99:99";


    return horarioA.localeCompare(
        horarioB
    );

}


/* =====================================================
   ITEM DA SEMANA
===================================================== */

function criarItemSemana(
    item
) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.classList.add(
        "semana-item"
    );


    elemento.classList.add(
        item.tipo === "prova"
            ? "semana-item-prova"
            : "semana-item-atividade"
    );


    const tipo =
        document.createElement(
            "span"
        );


    tipo.classList.add(
        "semana-item-tipo"
    );


    tipo.textContent =
        item.tipo === "prova"
            ? "PROVA"
            : "ATIVIDADE";


    const titulo =
        document.createElement(
            "strong"
        );


    titulo.textContent =
        item.titulo;


    const materia =
        document.createElement(
            "span"
        );


    materia.classList.add(
        "semana-item-materia"
    );


    materia.textContent =
        obterNomeMateria(
            item.materiaId
        );


    elemento.appendChild(
        tipo
    );


    elemento.appendChild(
        titulo
    );


    elemento.appendChild(
        materia
    );


    if (
        item.horario
    ) {

        const horario =
            document.createElement(
                "span"
            );


        horario.classList.add(
            "semana-item-horario"
        );


        horario.textContent =
            item.horario;


        elemento.appendChild(
            horario
        );

    }


    return elemento;

}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

if (semanaAnterior) {

    semanaAnterior.addEventListener(
        "click",
        function () {

            inicioSemanaAtual.setDate(
                inicioSemanaAtual.getDate() - 7
            );


            renderizarSemana();

        }
    );

}


if (semanaProxima) {

    semanaProxima.addEventListener(
        "click",
        function () {

            inicioSemanaAtual.setDate(
                inicioSemanaAtual.getDate() + 7
            );


            renderizarSemana();

        }
    );

}


if (semanaHoje) {

    semanaHoje.addEventListener(
        "click",
        function () {

            inicioSemanaAtual =
                obterInicioSemana(
                    new Date()
                );


            renderizarSemana();

        }
    );

}


/* =====================================================
   MODAL DO DIA
===================================================== */

function abrirModalDia(
    dataISO
) {

    dataSelecionada =
        dataISO;


    modalDiaData.textContent =
        formatarDataCompleta(
            dataISO
        );


    modalDiaSemana.classList.add(
        "ativo"
    );

}


function fecharModalDia() {

    if (modalDiaSemana) {

        modalDiaSemana.classList.remove(
            "ativo"
        );

    }

}


if (fecharModalDiaSemana) {

    fecharModalDiaSemana.addEventListener(
        "click",
        fecharModalDia
    );

}


if (modalDiaSemana) {

    modalDiaSemana.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalDiaSemana
            ) {

                fecharModalDia();

            }

        }
    );

}


/* =====================================================
   CRIAR ATIVIDADE
===================================================== */

if (criarAtividadeSemana) {

    criarAtividadeSemana.addEventListener(
        "click",
        function () {

            fecharModalDia();


            formAtividadeSemana.reset();


            dataAtividadeSemana.value =
                dataSelecionada;


            preencherSelectMaterias(
                materiaAtividadeSemana
            );


            modalAtividadeSemana.classList.add(
                "ativo"
            );


            setTimeout(
                function () {

                    tituloAtividadeSemana.focus();

                },
                100
            );

        }
    );

}


function fecharModalAtividade() {

    if (modalAtividadeSemana) {

        modalAtividadeSemana.classList.remove(
            "ativo"
        );

    }

}


if (fecharAtividadeSemana) {

    fecharAtividadeSemana.addEventListener(
        "click",
        fecharModalAtividade
    );

}


if (cancelarAtividadeSemana) {

    cancelarAtividadeSemana.addEventListener(
        "click",
        fecharModalAtividade
    );

}


if (modalAtividadeSemana) {

    modalAtividadeSemana.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalAtividadeSemana
            ) {

                fecharModalAtividade();

            }

        }
    );

}


/* =====================================================
   SALVAR ATIVIDADE NO SUPABASE
===================================================== */

if (formAtividadeSemana) {

    formAtividadeSemana.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuarioLogado) {
                return;
            }


            const titulo =
                tituloAtividadeSemana.value.trim();


            const data =
                dataAtividadeSemana.value;


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

                            titulo:
                                titulo,

                            data:
                                data,

                            materia_id:
                                materiaAtividadeSemana.value ||
                                null,

                            horario:
                                horarioAtividadeSemana.value ||
                                null,

                            descricao:
                                descricaoAtividadeSemana.value.trim() ||
                                null,

                            concluida:
                                false,

                            usuario_id:
                                usuarioLogado.id,

                            visibilidade:
                                "privada",

                            no_calendario:
                                Boolean(provaSemanaNoCalendario && provaSemanaNoCalendario.checked),

                            no_calendario:
                                Boolean(atividadeSemanaNoCalendario && atividadeSemanaNoCalendario.checked)

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


                renderizarSemana();


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
   CRIAR PROVA
===================================================== */

if (criarProvaSemana) {

    criarProvaSemana.addEventListener(
        "click",
        function () {

            fecharModalDia();


            formProvaSemana.reset();


            dataProvaSemana.value =
                dataSelecionada;


            preencherSelectMaterias(
                materiaProvaSemana
            );


            modalProvaSemana.classList.add(
                "ativo"
            );


            setTimeout(
                function () {

                    nomeProvaSemana.focus();

                },
                100
            );

        }
    );

}


function fecharModalProva() {

    if (modalProvaSemana) {

        modalProvaSemana.classList.remove(
            "ativo"
        );

    }

}


if (fecharProvaSemana) {

    fecharProvaSemana.addEventListener(
        "click",
        fecharModalProva
    );

}


if (cancelarProvaSemana) {

    cancelarProvaSemana.addEventListener(
        "click",
        fecharModalProva
    );

}


if (modalProvaSemana) {

    modalProvaSemana.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalProvaSemana
            ) {

                fecharModalProva();

            }

        }
    );

}


/* =====================================================
   SALVAR PROVA NO SUPABASE
===================================================== */

if (formProvaSemana) {

    formProvaSemana.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuarioLogado) {
                return;
            }


            const nome =
                nomeProvaSemana.value.trim();


            const data =
                dataProvaSemana.value;


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

                            nome:
                                nome,

                            data:
                                data,

                            materia_id:
                                materiaProvaSemana.value ||
                                null,

                            horario:
                                horarioProvaSemana.value ||
                                null,

                            conteudo:
                                conteudoProvaSemana.value.trim() ||
                                null,

                            usuario_id:
                                usuarioLogado.id,

                            visibilidade:
                                "privada"

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


                renderizarSemana();


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
   ATUALIZAR QUANDO VOLTAR PARA A PÁGINA
===================================================== */

window.addEventListener(
    "focus",
    async function () {

        if (!usuarioLogado) {
            return;
        }


        await carregarDadosSupabase();


        renderizarSemana();

    }
);


/* =====================================================
   INICIAR
===================================================== */

async function iniciarSemana() {

    try {

        usuarioLogado =
            await protegerPagina();


        if (!usuarioLogado) {
            return;
        }


        await carregarDadosSupabase();


        renderizarSemana();


    } catch (erro) {

        console.error(
            "Erro ao iniciar a página Semana:",
            erro
        );

    }

}


iniciarSemana();