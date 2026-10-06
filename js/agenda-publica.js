/* =====================================================
   NEXO - AGENDA PÚBLICA
===================================================== */


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let perfilUsuario = null;

let materiasUsuario = [];

let atividadesPublicas = [];
let provasPublicas = [];

let perfis = {};

let visaoAtual = "geral";

let inicioSemanaPublica = obterInicioSemana(new Date());

const hojePublico = new Date();

let mesPublicoAtual = new Date(
    hojePublico.getFullYear(),
    hojePublico.getMonth(),
    1
);


/* =====================================================
   ELEMENTOS GERAIS
===================================================== */

const menuMobile = document.getElementById("menuMobile");
const sidebar = document.getElementById("sidebar");

const dataAtual = document.getElementById("dataAtual");

const usuarioBotao = document.getElementById("usuarioBotao");
const usuarioAvatar = document.getElementById("usuarioAvatar");
const usuarioNome = document.getElementById("usuarioNome");

const botaoPublicar = document.getElementById("botaoPublicar");

const abasAgenda = document.querySelectorAll(".agenda-publica-aba");
const visoesAgenda = document.querySelectorAll(".agenda-publica-visao");


/* =====================================================
   RESUMO
===================================================== */

const publicaQuantidadeTotal =
    document.getElementById("publicaQuantidadeTotal");

const publicaQuantidadeAtividades =
    document.getElementById("publicaQuantidadeAtividades");

const publicaQuantidadeProvas =
    document.getElementById("publicaQuantidadeProvas");


/* =====================================================
   LISTAS
===================================================== */

const listaPublicaGeral =
    document.getElementById("listaPublicaGeral");

const listaPublicaAtividades =
    document.getElementById("listaPublicaAtividades");

const listaPublicaProvas =
    document.getElementById("listaPublicaProvas");


/* =====================================================
   SEMANA
===================================================== */

const publicaPeriodoSemana =
    document.getElementById("publicaPeriodoSemana");

const publicaSemanaGrade =
    document.getElementById("publicaSemanaGrade");

const publicaSemanaHoje =
    document.getElementById("publicaSemanaHoje");

const publicaSemanaAnterior =
    document.getElementById("publicaSemanaAnterior");

const publicaSemanaProxima =
    document.getElementById("publicaSemanaProxima");


/* =====================================================
   MÊS
===================================================== */

const publicaTituloMes =
    document.getElementById("publicaTituloMes");

const publicaCalendarioGrade =
    document.getElementById("publicaCalendarioGrade");

const publicaMesHoje =
    document.getElementById("publicaMesHoje");

const publicaMesAnterior =
    document.getElementById("publicaMesAnterior");

const publicaMesProximo =
    document.getElementById("publicaMesProximo");


/* =====================================================
   MODAL DE PUBLICAÇÃO
===================================================== */

const modalPublicar =
    document.getElementById("modalPublicar");

const fecharModalPublicar =
    document.getElementById("fecharModalPublicar");

const publicarAtividade =
    document.getElementById("publicarAtividade");

const publicarProva =
    document.getElementById("publicarProva");


/* =====================================================
   MODAL ATIVIDADE
===================================================== */

const modalAtividadePublica =
    document.getElementById("modalAtividadePublica");

const fecharAtividadePublica =
    document.getElementById("fecharAtividadePublica");

const cancelarAtividadePublica =
    document.getElementById("cancelarAtividadePublica");

const formAtividadePublica =
    document.getElementById("formAtividadePublica");

const atividadePublicaId =
    document.getElementById("atividadePublicaId");

const atividadePublicaTitulo =
    document.getElementById("atividadePublicaTitulo");

const atividadePublicaMateria =
    document.getElementById("atividadePublicaMateria");

const atividadePublicaData =
    document.getElementById("atividadePublicaData");

const atividadePublicaHorario =
    document.getElementById("atividadePublicaHorario");

const atividadePublicaDescricao =
    document.getElementById("atividadePublicaDescricao");

const tituloModalAtividadePublica =
    document.getElementById("tituloModalAtividadePublica");


/* =====================================================
   MODAL PROVA
===================================================== */

const modalProvaPublica =
    document.getElementById("modalProvaPublica");

const fecharProvaPublica =
    document.getElementById("fecharProvaPublica");

const cancelarProvaPublica =
    document.getElementById("cancelarProvaPublica");

const formProvaPublica =
    document.getElementById("formProvaPublica");

const provaPublicaId =
    document.getElementById("provaPublicaId");

const provaPublicaNome =
    document.getElementById("provaPublicaNome");

const provaPublicaMateria =
    document.getElementById("provaPublicaMateria");

const provaPublicaData =
    document.getElementById("provaPublicaData");

const provaPublicaHorario =
    document.getElementById("provaPublicaHorario");

const provaPublicaConteudo =
    document.getElementById("provaPublicaConteudo");

const tituloModalProvaPublica =
    document.getElementById("tituloModalProvaPublica");


/* =====================================================
   FUNÇÕES DE DATA
===================================================== */

function formatarDataBanco(data) {

    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function criarDataLocal(dataString) {

    if (!dataString) {
        return null;
    }

    const partes = dataString.split("-");

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );
}


function obterInicioSemana(data) {

    const copia = new Date(data);

    copia.setHours(0, 0, 0, 0);

    const dia = copia.getDay();

    const diferenca =
        dia === 0
            ? -6
            : 1 - dia;

    copia.setDate(
        copia.getDate() + diferenca
    );

    return copia;
}


function adicionarDias(data, quantidade) {

    const copia = new Date(data);

    copia.setDate(
        copia.getDate() + quantidade
    );

    return copia;
}


function formatarDataCompleta(dataString) {

    const data = criarDataLocal(dataString);

    if (!data) {
        return "";
    }

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


function formatarDataCurta(dataString) {

    const data = criarDataLocal(dataString);

    if (!data) {
        return "";
    }

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function formatarHorario(horario) {

    if (!horario) {
        return "";
    }

    return String(horario).slice(0, 5);
}


function obterHojeString() {

    return formatarDataBanco(
        new Date()
    );
}


/* =====================================================
   SEGURANÇA DE TEXTO
===================================================== */

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    const elemento =
        document.createElement("div");

    elemento.textContent =
        String(valor);

    return elemento.innerHTML;
}


/* =====================================================
   TOPO
===================================================== */

function mostrarDataAtual() {

    if (!dataAtual) {
        return;
    }

    const agora = new Date();

    const texto =
        agora.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long"
            }
        );

    dataAtual.textContent =
        texto.charAt(0).toUpperCase() +
        texto.slice(1);
}


/* =====================================================
   PERFIL
===================================================== */

async function carregarPerfil() {

    const {
        data,
        error
    } = await nexoSupabase
        .from("perfis")
        .select("id, nome, avatar_url")
        .eq("id", usuarioLogado.id)
        .single();

    if (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        return;
    }

    perfilUsuario = data;

    const nome =
        perfilUsuario?.nome ||
        usuarioLogado.email ||
        "Usuário";

    if (usuarioNome) {
        usuarioNome.textContent = nome;
    }

    if (usuarioAvatar) {

        usuarioAvatar.textContent =
            nome
                .trim()
                .charAt(0)
                .toUpperCase() || "N";
    }
}


/* =====================================================
   CARREGAR MATÉRIAS DO USUÁRIO
===================================================== */

async function carregarMaterias() {

    const {
        data,
        error
    } = await nexoSupabase
        .from("materias")
        .select("id, nome, professor")
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

        materiasUsuario = [];

        return;
    }

    materiasUsuario =
        data || [];

    preencherSelectsMaterias();
}


function preencherSelectsMaterias() {

    const selects = [
        atividadePublicaMateria,
        provaPublicaMateria
    ];

    selects.forEach(function (select) {

        if (!select) {
            return;
        }

        const valorAtual =
            select.value;

        select.innerHTML =
            `<option value="">Sem matéria</option>`;

        materiasUsuario.forEach(
            function (materia) {

                const option =
                    document.createElement("option");

                option.value =
                    materia.id;

                option.textContent =
                    materia.nome;

                select.appendChild(option);
            }
        );

        if (
            valorAtual &&
            materiasUsuario.some(
                materia =>
                    materia.id === valorAtual
            )
        ) {
            select.value =
                valorAtual;
        }
    });
}


/* =====================================================
   CARREGAR PERFIS
===================================================== */

async function carregarPerfis() {

    const {
        data,
        error
    } = await nexoSupabase
        .from("perfis")
        .select("id, nome, avatar_url");

    if (error) {

        console.error(
            "Erro ao carregar perfis:",
            error
        );

        perfis = {};

        return;
    }

    perfis = {};

    (data || []).forEach(
        function (perfil) {

            perfis[perfil.id] =
                perfil;
        }
    );
}


function obterNomeAutor(usuarioId) {

    if (
        perfis[usuarioId] &&
        perfis[usuarioId].nome
    ) {
        return perfis[usuarioId].nome;
    }

    if (
        usuarioLogado &&
        usuarioId === usuarioLogado.id
    ) {
        return (
            perfilUsuario?.nome ||
            "Você"
        );
    }

    return "Usuário";
}


/* =====================================================
   CARREGAR AGENDA PÚBLICA
===================================================== */

async function carregarAgendaPublica() {

    const [
        resultadoAtividades,
        resultadoProvas
    ] = await Promise.all([

        nexoSupabase
            .from("atividades")
            .select(
                "id, titulo, descricao, data, horario, materia_id, materia_nome, usuario_id, concluida, visibilidade, criado_em"
            )
            .eq(
                "visibilidade",
                "publica"
            )
            .order(
                "data",
                {
                    ascending: true
                }
            )
            .order(
                "horario",
                {
                    ascending: true,
                    nullsFirst: false
                }
            ),

        nexoSupabase
            .from("provas")
            .select(
                "id, nome, conteudo, data, horario, materia_id, materia_nome, usuario_id, visibilidade, criado_em"
            )
            .eq(
                "visibilidade",
                "publica"
            )
            .order(
                "data",
                {
                    ascending: true
                }
            )
            .order(
                "horario",
                {
                    ascending: true,
                    nullsFirst: false
                }
            )
    ]);


    if (resultadoAtividades.error) {

        console.error(
            "Erro ao carregar atividades públicas:",
            resultadoAtividades.error
        );

        atividadesPublicas = [];

    } else {

        atividadesPublicas =
            (resultadoAtividades.data || [])
                .map(
                    function (item) {

                        return {
                            id: item.id,
                            titulo: item.titulo,
                            descricao:
                                item.descricao || "",
                            data: item.data,
                            horario:
                                formatarHorario(
                                    item.horario
                                ),
                            materiaId:
                                item.materia_id || "",
                            materiaNome:
                                item.materia_nome || "",
                            usuarioId:
                                item.usuario_id,
                            concluida:
                                Boolean(
                                    item.concluida
                                ),
                            criadoEm:
                                item.criado_em || "",
                            tipo: "atividade"
                        };
                    }
                );
    }


    if (resultadoProvas.error) {

        console.error(
            "Erro ao carregar provas públicas:",
            resultadoProvas.error
        );

        provasPublicas = [];

    } else {

        provasPublicas =
            (resultadoProvas.data || [])
                .map(
                    function (item) {

                        return {
                            id: item.id,
                            titulo: item.nome,
                            nome: item.nome,
                            descricao:
                                item.conteudo || "",
                            conteudo:
                                item.conteudo || "",
                            data: item.data,
                            horario:
                                formatarHorario(
                                    item.horario
                                ),
                            materiaId:
                                item.materia_id || "",
                            materiaNome:
                                item.materia_nome || "",
                            usuarioId:
                                item.usuario_id,
                            criadoEm:
                                item.criado_em || "",
                            tipo: "prova"
                        };
                    }
                );
    }
}


/* =====================================================
   ITENS UNIFICADOS
===================================================== */

function obterTodosItensPublicos() {

    const atividades =
        atividadesPublicas
            .filter(
                atividade =>
                    !atividade.concluida
            );

    return [
        ...atividades,
        ...provasPublicas
    ].sort(compararItens);
}


function compararItens(a, b) {

    if (a.data !== b.data) {

        return a.data.localeCompare(
            b.data
        );
    }

    const horarioA =
        a.horario || "23:59";

    const horarioB =
        b.horario || "23:59";

    if (horarioA !== horarioB) {

        return horarioA.localeCompare(
            horarioB
        );
    }

    return (
        a.titulo || ""
    ).localeCompare(
        b.titulo || "",
        "pt-BR"
    );
}


/* =====================================================
   RESUMO
===================================================== */

function atualizarResumo() {

    const hoje =
        obterHojeString();

    const atividadesFuturas =
        atividadesPublicas.filter(
            atividade =>
                !atividade.concluida &&
                atividade.data >= hoje
        );

    const provasFuturas =
        provasPublicas.filter(
            prova =>
                prova.data >= hoje
        );

    if (publicaQuantidadeAtividades) {

        publicaQuantidadeAtividades.textContent =
            atividadesFuturas.length;
    }

    if (publicaQuantidadeProvas) {

        publicaQuantidadeProvas.textContent =
            provasFuturas.length;
    }

    if (publicaQuantidadeTotal) {

        publicaQuantidadeTotal.textContent =
            atividadesFuturas.length +
            provasFuturas.length;
    }
}


/* =====================================================
   CARD PÚBLICO
===================================================== */

function criarCardPublico(item) {

    const card =
        document.createElement("article");

    card.className =
        `agenda-publica-card agenda-publica-card-${item.tipo}`;

    const ehAutor =
        usuarioLogado &&
        item.usuarioId === usuarioLogado.id;

    const autor =
        obterNomeAutor(
            item.usuarioId
        );

    const tipoTexto =
        item.tipo === "prova"
            ? "PROVA"
            : "ATIVIDADE";

    const icone =
        item.tipo === "prova"
            ? "✎"
            : "✓";

    const materia =
        item.materiaNome ||
        "Sem matéria";

    const horario =
        item.horario
            ? item.horario
            : "Sem horário";


    card.innerHTML = `
        <div class="agenda-publica-card-icone">
            ${icone}
        </div>

        <div class="agenda-publica-card-conteudo">

            <div class="agenda-publica-card-topo">

                <span class="agenda-publica-tipo agenda-publica-tipo-${item.tipo}">
                    ${tipoTexto}
                </span>

                <span class="agenda-publica-materia">
                    ${escaparHTML(materia)}
                </span>

            </div>

            <h3>
                ${escaparHTML(item.titulo)}
            </h3>

            <div class="agenda-publica-meta">

                <span>
                    ${escaparHTML(formatarDataCompleta(item.data))}
                </span>

                <span>
                    ${escaparHTML(horario)}
                </span>

            </div>

            ${
                item.descricao
                    ? `
                        <p class="agenda-publica-descricao">
                            ${escaparHTML(item.descricao)}
                        </p>
                    `
                    : ""
            }

            <div class="agenda-publica-autor">

                <span class="agenda-publica-autor-avatar">
                    ${escaparHTML(
                        autor
                            .trim()
                            .charAt(0)
                            .toUpperCase()
                    )}
                </span>

                <span>
                    Adicionado por
                    <strong>
                        ${escaparHTML(autor)}
                    </strong>
                </span>

            </div>

        </div>

        <div class="agenda-publica-acoes">

            ${
                !ehAutor
                    ? `
                        <button
                            type="button"
                            class="agenda-publica-adicionar"
                            data-acao="adicionar"
                            data-tipo="${item.tipo}"
                            data-id="${item.id}"
                        >
                            + Minha agenda
                        </button>
                    `
                    : `
                        <span class="agenda-publica-seu-item">
                            Sua publicação
                        </span>

                        <button
                            type="button"
                            class="agenda-publica-editar"
                            data-acao="editar"
                            data-tipo="${item.tipo}"
                            data-id="${item.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="agenda-publica-excluir"
                            data-acao="excluir"
                            data-tipo="${item.tipo}"
                            data-id="${item.id}"
                        >
                            Excluir
                        </button>
                    `
            }

        </div>
    `;

    return card;
}


/* =====================================================
   ESTADO VAZIO
===================================================== */

function criarEstadoVazio(
    titulo,
    texto
) {

    const div =
        document.createElement("div");

    div.className =
        "estado-vazio";

    div.innerHTML = `
        <div class="vazio-icone">
            ◉
        </div>

        <h3>
            ${escaparHTML(titulo)}
        </h3>

        <p>
            ${escaparHTML(texto)}
        </p>
    `;

    return div;
}


/* =====================================================
   VISÃO GERAL
===================================================== */

function renderizarGeral() {

    if (!listaPublicaGeral) {
        return;
    }

    listaPublicaGeral.innerHTML = "";

    const hoje =
        obterHojeString();

    const itens =
        obterTodosItensPublicos()
            .filter(
                item =>
                    item.data >= hoje
            );

    if (itens.length === 0) {

        listaPublicaGeral.appendChild(
            criarEstadoVazio(
                "Nenhum compromisso compartilhado",
                "Quando alguém publicar uma atividade ou prova, ela aparecerá aqui."
            )
        );

        return;
    }

    itens.forEach(
        function (item) {

            listaPublicaGeral.appendChild(
                criarCardPublico(item)
            );
        }
    );
}


/* =====================================================
   ATIVIDADES
===================================================== */

function renderizarAtividades() {

    if (!listaPublicaAtividades) {
        return;
    }

    listaPublicaAtividades.innerHTML = "";

    const itens =
        atividadesPublicas
            .filter(
                atividade =>
                    !atividade.concluida
            )
            .sort(compararItens);

    if (itens.length === 0) {

        listaPublicaAtividades.appendChild(
            criarEstadoVazio(
                "Nenhuma atividade compartilhada",
                "Ainda não existem atividades públicas no Nexo."
            )
        );

        return;
    }

    itens.forEach(
        function (atividade) {

            listaPublicaAtividades.appendChild(
                criarCardPublico(
                    atividade
                )
            );
        }
    );
}


/* =====================================================
   PROVAS
===================================================== */

function renderizarProvas() {

    if (!listaPublicaProvas) {
        return;
    }

    listaPublicaProvas.innerHTML = "";

    const itens =
        [...provasPublicas]
            .sort(compararItens);

    if (itens.length === 0) {

        listaPublicaProvas.appendChild(
            criarEstadoVazio(
                "Nenhuma prova compartilhada",
                "Ainda não existem provas públicas no Nexo."
            )
        );

        return;
    }

    itens.forEach(
        function (prova) {

            listaPublicaProvas.appendChild(
                criarCardPublico(
                    prova
                )
            );
        }
    );
}


/* =====================================================
   SEMANA
===================================================== */

function renderizarSemanaPublica() {

    if (
        !publicaSemanaGrade ||
        !publicaPeriodoSemana
    ) {
        return;
    }

    publicaSemanaGrade.innerHTML = "";

    const fimSemana =
        adicionarDias(
            inicioSemanaPublica,
            6
        );

    const inicioTexto =
        inicioSemanaPublica.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short"
            }
        );

    const fimTexto =
        fimSemana.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    publicaPeriodoSemana.textContent =
        `${inicioTexto} — ${fimTexto}`;

    const itens =
        obterTodosItensPublicos();

    const hoje =
        obterHojeString();


    for (
        let indice = 0;
        indice < 7;
        indice++
    ) {

        const data =
            adicionarDias(
                inicioSemanaPublica,
                indice
            );

        const dataString =
            formatarDataBanco(data);

        const itensDia =
            itens.filter(
                item =>
                    item.data === dataString
            );

        const dia =
            document.createElement("article");

        dia.className =
            "semana-dia";

        if (dataString === hoje) {

            dia.classList.add(
                "semana-dia-hoje"
            );
        }


        const nomeDia =
            data.toLocaleDateString(
                "pt-BR",
                {
                    weekday: "short"
                }
            )
                .replace(".", "")
                .toUpperCase();


        dia.innerHTML = `
            <div class="semana-dia-cabecalho">

                <div>

                    <span class="semana-dia-nome">
                        ${escaparHTML(nomeDia)}
                    </span>

                    <strong class="semana-dia-numero">
                        ${data.getDate()}
                    </strong>

                </div>

            </div>

            <div class="semana-itens"></div>
        `;


        const containerItens =
            dia.querySelector(
                ".semana-itens"
            );


        if (itensDia.length === 0) {

            const vazio =
                document.createElement("div");

            vazio.className =
                "semana-dia-vazio";

            vazio.textContent =
                "Nenhum item";

            containerItens.appendChild(
                vazio
            );

        } else {

            itensDia.forEach(
                function (item) {

                    const elemento =
                        document.createElement("div");

                    elemento.className =
                        `semana-item semana-item-${item.tipo}`;

                    const autor =
                        obterNomeAutor(
                            item.usuarioId
                        );

                    elemento.innerHTML = `
                        <span class="semana-item-tipo">
                            ${
                                item.tipo === "prova"
                                    ? "PROVA"
                                    : "ATIVIDADE"
                            }
                        </span>

                        <strong>
                            ${escaparHTML(item.titulo)}
                        </strong>

                        <span class="semana-item-materia">
                            ${escaparHTML(
                                item.materiaNome ||
                                "Sem matéria"
                            )}
                        </span>

                        ${
                            item.horario
                                ? `
                                    <span class="semana-item-horario">
                                        ${escaparHTML(item.horario)}
                                    </span>
                                `
                                : ""
                        }

                        <span class="agenda-publica-semana-autor">
                            ${escaparHTML(autor)}
                        </span>
                    `;

                    containerItens.appendChild(
                        elemento
                    );
                }
            );
        }

        publicaSemanaGrade.appendChild(
            dia
        );
    }
}


/* =====================================================
   MÊS
===================================================== */

function renderizarMesPublico() {

    if (
        !publicaCalendarioGrade ||
        !publicaTituloMes
    ) {
        return;
    }

    publicaCalendarioGrade.innerHTML = "";

    const ano =
        mesPublicoAtual.getFullYear();

    const mes =
        mesPublicoAtual.getMonth();


    publicaTituloMes.textContent =
        mesPublicoAtual
            .toLocaleDateString(
                "pt-BR",
                {
                    month: "long",
                    year: "numeric"
                }
            )
            .replace(
                /^./,
                letra =>
                    letra.toUpperCase()
            );


    const primeiroDia =
        new Date(
            ano,
            mes,
            1
        );

    const diaSemana =
        primeiroDia.getDay();

    const deslocamento =
        diaSemana === 0
            ? 6
            : diaSemana - 1;

    const inicioGrade =
        new Date(
            ano,
            mes,
            1 - deslocamento
        );

    const itens =
        obterTodosItensPublicos();

    const hoje =
        obterHojeString();


    for (
        let indice = 0;
        indice < 42;
        indice++
    ) {

        const data =
            adicionarDias(
                inicioGrade,
                indice
            );

        const dataString =
            formatarDataBanco(data);

        const itensDia =
            itens
                .filter(
                    item =>
                        item.data === dataString
                )
                .sort(compararItens);


        const dia =
            document.createElement("div");

        dia.className =
            "calendario-dia";


        if (
            data.getMonth() !== mes
        ) {

            dia.classList.add(
                "calendario-outro-mes"
            );
        }


        if (
            dataString === hoje
        ) {

            dia.classList.add(
                "calendario-hoje"
            );
        }


        dia.innerHTML = `
            <div class="calendario-dia-topo">

                <span class="calendario-numero">
                    ${data.getDate()}
                </span>

            </div>

            <div class="calendario-itens"></div>
        `;


        const container =
            dia.querySelector(
                ".calendario-itens"
            );


        itensDia
            .slice(0, 3)
            .forEach(
                function (item) {

                    const elemento =
                        document.createElement("div");

                    elemento.className =
                        `calendario-item calendario-item-${item.tipo}`;

                    elemento.innerHTML = `
                        <strong>
                            ${escaparHTML(item.titulo)}
                        </strong>

                        <span>
                            ${
                                item.horario
                                    ? escaparHTML(item.horario)
                                    : escaparHTML(
                                        item.materiaNome ||
                                        "Sem matéria"
                                    )
                            }
                        </span>
                    `;

                    container.appendChild(
                        elemento
                    );
                }
            );


        if (
            itensDia.length > 3
        ) {

            const mais =
                document.createElement("div");

            mais.className =
                "calendario-mais";

            mais.textContent =
                `+${itensDia.length - 3} itens`;

            container.appendChild(
                mais
            );
        }


        publicaCalendarioGrade.appendChild(
            dia
        );
    }
}


/* =====================================================
   RENDERIZAÇÃO COMPLETA
===================================================== */

function renderizarTudo() {

    atualizarResumo();

    renderizarGeral();

    renderizarAtividades();

    renderizarProvas();

    renderizarSemanaPublica();

    renderizarMesPublico();
}


/* =====================================================
   TROCAR VISÃO
===================================================== */

function trocarVisao(visao) {

    visaoAtual = visao;

    abasAgenda.forEach(
        function (aba) {

            aba.classList.toggle(
                "ativo",
                aba.dataset.visao === visao
            );
        }
    );


    visoesAgenda.forEach(
        function (secao) {

            secao.classList.toggle(
                "ativo",
                secao.dataset.visaoConteudo === visao
            );
        }
    );


    if (visao === "semana") {

        renderizarSemanaPublica();
    }

    if (visao === "mes") {

        renderizarMesPublico();
    }
}


/* =====================================================
   MODAIS
===================================================== */

function abrirModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add("ativo");
}


function fecharModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("ativo");
}


/* =====================================================
   NOVA ATIVIDADE
===================================================== */

function prepararNovaAtividade() {

    formAtividadePublica.reset();

    atividadePublicaId.value = "";

    tituloModalAtividadePublica.textContent =
        "Publicar atividade";

    preencherSelectsMaterias();

    fecharModal(
        modalPublicar
    );

    abrirModal(
        modalAtividadePublica
    );

    setTimeout(
        function () {

            atividadePublicaTitulo.focus();
        },
        100
    );
}


/* =====================================================
   NOVA PROVA
===================================================== */

function prepararNovaProva() {

    formProvaPublica.reset();

    provaPublicaId.value = "";

    tituloModalProvaPublica.textContent =
        "Publicar prova";

    preencherSelectsMaterias();

    fecharModal(
        modalPublicar
    );

    abrirModal(
        modalProvaPublica
    );

    setTimeout(
        function () {

            provaPublicaNome.focus();
        },
        100
    );
}


/* =====================================================
   OBTER MATÉRIA
===================================================== */

function obterMateriaSelecionada(id) {

    if (!id) {
        return null;
    }

    return materiasUsuario.find(
        materia =>
            materia.id === id
    ) || null;
}


/* =====================================================
   SALVAR ATIVIDADE PÚBLICA
===================================================== */

async function salvarAtividadePublica(
    evento
) {

    evento.preventDefault();

    const id =
        atividadePublicaId.value;

    const titulo =
        atividadePublicaTitulo
            .value
            .trim();

    const data =
        atividadePublicaData.value;

    const materiaId =
        atividadePublicaMateria.value || null;

    const materia =
        obterMateriaSelecionada(
            materiaId
        );

    const horario =
        atividadePublicaHorario.value || null;

    const descricao =
        atividadePublicaDescricao
            .value
            .trim() || null;


    if (
        !titulo ||
        !data
    ) {
        return;
    }


    const dados = {

        titulo: titulo,

        descricao: descricao,

        data: data,

        horario: horario,

        materia_id: materiaId,

        materia_nome:
            materia
                ? materia.nome
                : null,

        usuario_id:
            usuarioLogado.id,

        visibilidade:
            "publica",

        concluida:
            false
    };


    let resultado;


    if (id) {

        resultado =
            await nexoSupabase
                .from("atividades")
                .update({
                    titulo:
                        dados.titulo,

                    descricao:
                        dados.descricao,

                    data:
                        dados.data,

                    horario:
                        dados.horario,

                    materia_id:
                        dados.materia_id,

                    materia_nome:
                        dados.materia_nome
                })
                .eq(
                    "id",
                    id
                )
                .eq(
                    "usuario_id",
                    usuarioLogado.id
                );

    } else {

        resultado =
            await nexoSupabase
                .from("atividades")
                .insert(dados);
    }


    if (resultado.error) {

        console.error(
            "Erro ao salvar atividade pública:",
            resultado.error
        );

        alert(
            "Não foi possível salvar a atividade."
        );

        return;
    }


    fecharModal(
        modalAtividadePublica
    );

    await atualizarDadosPublicos();
}


/* =====================================================
   SALVAR PROVA PÚBLICA
===================================================== */

async function salvarProvaPublica(
    evento
) {

    evento.preventDefault();

    const id =
        provaPublicaId.value;

    const nome =
        provaPublicaNome
            .value
            .trim();

    const data =
        provaPublicaData.value;

    const materiaId =
        provaPublicaMateria.value || null;

    const materia =
        obterMateriaSelecionada(
            materiaId
        );

    const horario =
        provaPublicaHorario.value || null;

    const conteudo =
        provaPublicaConteudo
            .value
            .trim() || null;


    if (
        !nome ||
        !data
    ) {
        return;
    }


    const dados = {

        nome: nome,

        conteudo: conteudo,

        data: data,

        horario: horario,

        materia_id: materiaId,

        materia_nome:
            materia
                ? materia.nome
                : null,

        usuario_id:
            usuarioLogado.id,

        visibilidade:
            "publica"
    };


    let resultado;


    if (id) {

        resultado =
            await nexoSupabase
                .from("provas")
                .update({
                    nome:
                        dados.nome,

                    conteudo:
                        dados.conteudo,

                    data:
                        dados.data,

                    horario:
                        dados.horario,

                    materia_id:
                        dados.materia_id,

                    materia_nome:
                        dados.materia_nome
                })
                .eq(
                    "id",
                    id
                )
                .eq(
                    "usuario_id",
                    usuarioLogado.id
                );

    } else {

        resultado =
            await nexoSupabase
                .from("provas")
                .insert(dados);
    }


    if (resultado.error) {

        console.error(
            "Erro ao salvar prova pública:",
            resultado.error
        );

        alert(
            "Não foi possível salvar a prova."
        );

        return;
    }


    fecharModal(
        modalProvaPublica
    );

    await atualizarDadosPublicos();
}


/* =====================================================
   EDITAR
===================================================== */

function editarItem(
    tipo,
    id
) {

    if (tipo === "atividade") {

        const item =
            atividadesPublicas.find(
                atividade =>
                    atividade.id === id
            );

        if (
            !item ||
            item.usuarioId !== usuarioLogado.id
        ) {
            return;
        }


        preencherSelectsMaterias();

        atividadePublicaId.value =
            item.id;

        atividadePublicaTitulo.value =
            item.titulo;

        atividadePublicaData.value =
            item.data;

        atividadePublicaHorario.value =
            item.horario || "";

        atividadePublicaDescricao.value =
            item.descricao || "";

        atividadePublicaMateria.value =
            item.materiaId || "";

        tituloModalAtividadePublica.textContent =
            "Editar atividade";

        abrirModal(
            modalAtividadePublica
        );

        return;
    }


    if (tipo === "prova") {

        const item =
            provasPublicas.find(
                prova =>
                    prova.id === id
            );

        if (
            !item ||
            item.usuarioId !== usuarioLogado.id
        ) {
            return;
        }


        preencherSelectsMaterias();

        provaPublicaId.value =
            item.id;

        provaPublicaNome.value =
            item.nome;

        provaPublicaData.value =
            item.data;

        provaPublicaHorario.value =
            item.horario || "";

        provaPublicaConteudo.value =
            item.conteudo || "";

        provaPublicaMateria.value =
            item.materiaId || "";

        tituloModalProvaPublica.textContent =
            "Editar prova";

        abrirModal(
            modalProvaPublica
        );
    }
}


/* =====================================================
   EXCLUIR
===================================================== */

async function excluirItem(
    tipo,
    id
) {

    const lista =
        tipo === "atividade"
            ? atividadesPublicas
            : provasPublicas;

    const item =
        lista.find(
            registro =>
                registro.id === id
        );


    if (
        !item ||
        item.usuarioId !== usuarioLogado.id
    ) {
        return;
    }


    const confirmou =
        confirm(
            `Deseja excluir "${item.titulo}" da Agenda Pública?`
        );


    if (!confirmou) {
        return;
    }


    const tabela =
        tipo === "atividade"
            ? "atividades"
            : "provas";


    const {
        error
    } = await nexoSupabase
        .from(tabela)
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
            "Erro ao excluir publicação:",
            error
        );

        alert(
            "Não foi possível excluir a publicação."
        );

        return;
    }


    await atualizarDadosPublicos();
}


/* =====================================================
   VERIFICAR SE JÁ FOI ADICIONADO
===================================================== */

async function verificarDuplicado(
    item
) {

    const tabela =
        item.tipo === "atividade"
            ? "atividades"
            : "provas";

    const campoTitulo =
        item.tipo === "atividade"
            ? "titulo"
            : "nome";


    let consulta =
        nexoSupabase
            .from(tabela)
            .select("id")
            .eq(
                "usuario_id",
                usuarioLogado.id
            )
            .eq(
                "visibilidade",
                "privada"
            )
            .eq(
                campoTitulo,
                item.titulo
            )
            .eq(
                "data",
                item.data
            );


    if (item.horario) {

        consulta =
            consulta.eq(
                "horario",
                item.horario
            );
    }


    const {
        data,
        error
    } = await consulta.limit(1);


    if (error) {

        console.error(
            "Erro ao verificar duplicidade:",
            error
        );

        return false;
    }


    return (
        data &&
        data.length > 0
    );
}


/* =====================================================
   DESCOBRIR MATÉRIA LOCAL
===================================================== */

function procurarMateriaLocal(
    nomeMateria
) {

    if (!nomeMateria) {
        return null;
    }

    const nomeNormalizado =
        nomeMateria
            .trim()
            .toLocaleLowerCase("pt-BR");


    return (
        materiasUsuario.find(
            materia =>
                materia.nome
                    .trim()
                    .toLocaleLowerCase("pt-BR") ===
                nomeNormalizado
        ) || null
    );
}


/* =====================================================
   ADICIONAR À MINHA AGENDA
===================================================== */

async function adicionarMinhaAgenda(
    tipo,
    id
) {

    const lista =
        tipo === "atividade"
            ? atividadesPublicas
            : provasPublicas;

    const item =
        lista.find(
            registro =>
                registro.id === id
        );


    if (!item) {
        return;
    }


    if (
        item.usuarioId === usuarioLogado.id
    ) {

        alert(
            "Esta publicação já pertence a você."
        );

        return;
    }


    const duplicado =
        await verificarDuplicado(
            item
        );


    if (duplicado) {

        const continuar =
            confirm(
                "Parece que este item já está na sua agenda. Deseja adicionar outra cópia mesmo assim?"
            );

        if (!continuar) {
            return;
        }
    }


    const materiaLocal =
        procurarMateriaLocal(
            item.materiaNome
        );


    if (tipo === "atividade") {

        const {
            error
        } = await nexoSupabase
            .from("atividades")
            .insert({

                titulo:
                    item.titulo,

                descricao:
                    item.descricao || null,

                data:
                    item.data,

                horario:
                    item.horario || null,

                materia_id:
                    materiaLocal
                        ? materiaLocal.id
                        : null,

                materia_nome:
                    item.materiaNome || null,

                usuario_id:
                    usuarioLogado.id,

                visibilidade:
                    "privada",

                concluida:
                    false
            });


        if (error) {

            console.error(
                "Erro ao adicionar atividade à agenda:",
                error
            );

            alert(
                "Não foi possível adicionar a atividade."
            );

            return;
        }


        alert(
            "Atividade adicionada à sua agenda!"
        );

        return;
    }


    if (tipo === "prova") {

        const {
            error
        } = await nexoSupabase
            .from("provas")
            .insert({

                nome:
                    item.nome,

                conteudo:
                    item.conteudo || null,

                data:
                    item.data,

                horario:
                    item.horario || null,

                materia_id:
                    materiaLocal
                        ? materiaLocal.id
                        : null,

                materia_nome:
                    item.materiaNome || null,

                usuario_id:
                    usuarioLogado.id,

                visibilidade:
                    "privada"
            });


        if (error) {

            console.error(
                "Erro ao adicionar prova à agenda:",
                error
            );

            alert(
                "Não foi possível adicionar a prova."
            );

            return;
        }


        alert(
            "Prova adicionada à sua agenda!"
        );
    }
}


/* =====================================================
   CLIQUES NOS CARDS
===================================================== */

async function tratarCliqueLista(
    evento
) {

    const botao =
        evento.target.closest(
            "[data-acao]"
        );

    if (!botao) {
        return;
    }

    const acao =
        botao.dataset.acao;

    const tipo =
        botao.dataset.tipo;

    const id =
        botao.dataset.id;


    if (
        !acao ||
        !tipo ||
        !id
    ) {
        return;
    }


    if (acao === "editar") {

        editarItem(
            tipo,
            id
        );

        return;
    }


    if (acao === "excluir") {

        await excluirItem(
            tipo,
            id
        );

        return;
    }


    if (acao === "adicionar") {

        botao.disabled = true;

        const textoOriginal =
            botao.textContent;

        botao.textContent =
            "Adicionando...";

        try {

            await adicionarMinhaAgenda(
                tipo,
                id
            );

        } finally {

            botao.disabled = false;

            botao.textContent =
                textoOriginal;
        }
    }
}


/* =====================================================
   ATUALIZAR DADOS
===================================================== */

async function atualizarDadosPublicos() {

    await Promise.all([
        carregarPerfis(),
        carregarAgendaPublica()
    ]);

    renderizarTudo();
}


/* =====================================================
   EVENTOS - ABAS
===================================================== */

abasAgenda.forEach(
    function (aba) {

        aba.addEventListener(
            "click",
            function () {

                trocarVisao(
                    aba.dataset.visao
                );
            }
        );
    }
);


/* =====================================================
   EVENTOS - PUBLICAÇÃO
===================================================== */

if (botaoPublicar) {

    botaoPublicar.addEventListener(
        "click",
        function () {

            abrirModal(
                modalPublicar
            );
        }
    );
}


if (fecharModalPublicar) {

    fecharModalPublicar.addEventListener(
        "click",
        function () {

            fecharModal(
                modalPublicar
            );
        }
    );
}


if (publicarAtividade) {

    publicarAtividade.addEventListener(
        "click",
        prepararNovaAtividade
    );
}


if (publicarProva) {

    publicarProva.addEventListener(
        "click",
        prepararNovaProva
    );
}


/* =====================================================
   EVENTOS - ATIVIDADE
===================================================== */

if (fecharAtividadePublica) {

    fecharAtividadePublica.addEventListener(
        "click",
        function () {

            fecharModal(
                modalAtividadePublica
            );
        }
    );
}


if (cancelarAtividadePublica) {

    cancelarAtividadePublica.addEventListener(
        "click",
        function () {

            fecharModal(
                modalAtividadePublica
            );
        }
    );
}


if (formAtividadePublica) {

    formAtividadePublica.addEventListener(
        "submit",
        salvarAtividadePublica
    );
}


/* =====================================================
   EVENTOS - PROVA
===================================================== */

if (fecharProvaPublica) {

    fecharProvaPublica.addEventListener(
        "click",
        function () {

            fecharModal(
                modalProvaPublica
            );
        }
    );
}


if (cancelarProvaPublica) {

    cancelarProvaPublica.addEventListener(
        "click",
        function () {

            fecharModal(
                modalProvaPublica
            );
        }
    );
}


if (formProvaPublica) {

    formProvaPublica.addEventListener(
        "submit",
        salvarProvaPublica
    );
}


/* =====================================================
   FECHAR MODAL CLICANDO FORA
===================================================== */

[
    modalPublicar,
    modalAtividadePublica,
    modalProvaPublica
].forEach(
    function (modal) {

        if (!modal) {
            return;
        }

        modal.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target === modal
                ) {

                    fecharModal(
                        modal
                    );
                }
            }
        );
    }
);


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key !== "Escape"
        ) {
            return;
        }

        fecharModal(
            modalPublicar
        );

        fecharModal(
            modalAtividadePublica
        );

        fecharModal(
            modalProvaPublica
        );
    }
);


/* =====================================================
   EVENTOS - CARDS
===================================================== */

[
    listaPublicaGeral,
    listaPublicaAtividades,
    listaPublicaProvas
].forEach(
    function (lista) {

        if (!lista) {
            return;
        }

        lista.addEventListener(
            "click",
            tratarCliqueLista
        );
    }
);


/* =====================================================
   NAVEGAÇÃO DA SEMANA
===================================================== */

if (publicaSemanaAnterior) {

    publicaSemanaAnterior.addEventListener(
        "click",
        function () {

            inicioSemanaPublica =
                adicionarDias(
                    inicioSemanaPublica,
                    -7
                );

            renderizarSemanaPublica();
        }
    );
}


if (publicaSemanaProxima) {

    publicaSemanaProxima.addEventListener(
        "click",
        function () {

            inicioSemanaPublica =
                adicionarDias(
                    inicioSemanaPublica,
                    7
                );

            renderizarSemanaPublica();
        }
    );
}


if (publicaSemanaHoje) {

    publicaSemanaHoje.addEventListener(
        "click",
        function () {

            inicioSemanaPublica =
                obterInicioSemana(
                    new Date()
                );

            renderizarSemanaPublica();
        }
    );
}


/* =====================================================
   NAVEGAÇÃO DO MÊS
===================================================== */

if (publicaMesAnterior) {

    publicaMesAnterior.addEventListener(
        "click",
        function () {

            mesPublicoAtual =
                new Date(
                    mesPublicoAtual.getFullYear(),
                    mesPublicoAtual.getMonth() - 1,
                    1
                );

            renderizarMesPublico();
        }
    );
}


if (publicaMesProximo) {

    publicaMesProximo.addEventListener(
        "click",
        function () {

            mesPublicoAtual =
                new Date(
                    mesPublicoAtual.getFullYear(),
                    mesPublicoAtual.getMonth() + 1,
                    1
                );

            renderizarMesPublico();
        }
    );
}


if (publicaMesHoje) {

    publicaMesHoje.addEventListener(
        "click",
        function () {

            const hoje =
                new Date();

            mesPublicoAtual =
                new Date(
                    hoje.getFullYear(),
                    hoje.getMonth(),
                    1
                );

            renderizarMesPublico();
        }
    );
}


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
   PERFIL
===================================================== */

if (usuarioBotao) {

    usuarioBotao.addEventListener(
        "click",
        function () {

            window.location.href =
                "perfil.html";
        }
    );
}


/* =====================================================
   ATUALIZAR AO VOLTAR PARA A ABA
===================================================== */

window.addEventListener(
    "focus",
    async function () {

        if (!usuarioLogado) {
            return;
        }

        try {

            await carregarMaterias();

            await atualizarDadosPublicos();

        } catch (erro) {

            console.error(
                "Erro ao atualizar Agenda Pública:",
                erro
            );
        }
    }
);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function iniciarAgendaPublica() {

    try {

        mostrarDataAtual();

        usuarioLogado =
            await protegerPagina();

        if (!usuarioLogado) {
            return;
        }


        await Promise.all([
            carregarPerfil(),
            carregarMaterias(),
            carregarPerfis()
        ]);


        await carregarAgendaPublica();


        renderizarTudo();


        console.log(
            "Agenda Pública carregada."
        );

    } catch (erro) {

        console.error(
            "Erro ao iniciar Agenda Pública:",
            erro
        );


        if (listaPublicaGeral) {

            listaPublicaGeral.innerHTML = "";

            listaPublicaGeral.appendChild(
                criarEstadoVazio(
                    "Não foi possível carregar",
                    "Ocorreu um erro ao acessar a Agenda Pública."
                )
            );
        }
    }
}


iniciarAgendaPublica();

/* =====================================================
   NEXO - AVISOS EM DESTAQUE
   Tabela: public.avisos (titulo, mensagem, usuario_id, criado_em)
===================================================== */

let avisosPublicos = [];

const avisosDestaque = document.getElementById("avisosDestaque");
const avisosContador = document.getElementById("avisosContador");
const listaAvisosPublicos = document.getElementById("listaAvisosPublicos");
const publicarAviso = document.getElementById("publicarAviso");
const modalAvisoPublico = document.getElementById("modalAvisoPublico");
const fecharAvisoPublico = document.getElementById("fecharAvisoPublico");
const cancelarAvisoPublico = document.getElementById("cancelarAvisoPublico");
const formAvisoPublico = document.getElementById("formAvisoPublico");
const avisoPublicoId = document.getElementById("avisoPublicoId");
const avisoPublicoTitulo = document.getElementById("avisoPublicoTitulo");
const avisoPublicoMensagem = document.getElementById("avisoPublicoMensagem");
const tituloModalAvisoPublico = document.getElementById("tituloModalAvisoPublico");

async function carregarAvisosPublicos() {
    const { data, error } = await nexoSupabase
        .from("avisos")
        .select("id, titulo, mensagem, usuario_id, criado_em")
        .order("criado_em", { ascending: false });

    if (error) {
        console.error("Erro ao carregar avisos:", error);
        avisosPublicos = [];
        renderizarAvisosPublicos();
        return;
    }

    avisosPublicos = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        mensagem: item.mensagem || "",
        usuarioId: item.usuario_id,
        criadoEm: item.criado_em
    }));

    renderizarAvisosPublicos();
}

function formatarDataHoraAviso(valor) {
    if (!valor) return "";
    const data = new Date(valor);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(data).replace(".", "");
}

function avisoEhNovo(valor) {
    if (!valor) return false;
    const diferenca = Date.now() - new Date(valor).getTime();
    return diferenca >= 0 && diferenca <= 48 * 60 * 60 * 1000;
}

function renderizarAvisosPublicos() {
    if (!avisosDestaque || !listaAvisosPublicos) return;

    if (avisosPublicos.length === 0) {
        avisosDestaque.hidden = true;
        listaAvisosPublicos.innerHTML = "";
        return;
    }

    avisosDestaque.hidden = false;
    if (avisosContador) {
        avisosContador.textContent = `${avisosPublicos.length} ${avisosPublicos.length === 1 ? "aviso" : "avisos"}`;
    }

    listaAvisosPublicos.innerHTML = avisosPublicos.map(aviso => {
        const proprio = usuarioLogado && aviso.usuarioId === usuarioLogado.id;
        const novo = avisoEhNovo(aviso.criadoEm);
        return `
            <article class="aviso-publico-card ${novo ? "aviso-publico-novo" : ""}">
                <div class="aviso-publico-marcador">!</div>
                <div class="aviso-publico-conteudo">
                    <div class="aviso-publico-topo">
                        <div class="aviso-publico-titulo-linha">
                            <h3>${escaparHTML(aviso.titulo)}</h3>
                            ${novo ? '<span class="aviso-publico-selo">NOVO</span>' : ''}
                        </div>
                        ${proprio ? `
                            <div class="aviso-publico-acoes">
                                <button type="button" data-aviso-acao="editar" data-aviso-id="${aviso.id}">Editar</button>
                                <button type="button" class="excluir" data-aviso-acao="excluir" data-aviso-id="${aviso.id}">Excluir</button>
                            </div>
                        ` : ''}
                    </div>
                    <p>${escaparHTML(aviso.mensagem)}</p>
                    <div class="aviso-publico-meta">
                        <span>Publicado por <strong>${escaparHTML(obterNomeAutor(aviso.usuarioId))}</strong></span>
                        <span>•</span>
                        <span>${escaparHTML(formatarDataHoraAviso(aviso.criadoEm))}</span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function prepararNovoAviso() {
    if (!formAvisoPublico) return;
    formAvisoPublico.reset();
    avisoPublicoId.value = "";
    tituloModalAvisoPublico.textContent = "Publicar aviso";
    fecharModal(modalPublicar);
    abrirModal(modalAvisoPublico);
    setTimeout(() => avisoPublicoTitulo.focus(), 100);
}

async function salvarAvisoPublico(evento) {
    evento.preventDefault();
    if (!usuarioLogado) return;

    const titulo = avisoPublicoTitulo.value.trim();
    const mensagem = avisoPublicoMensagem.value.trim();
    const id = avisoPublicoId.value;
    if (!titulo || !mensagem) return;

    let resultado;
    if (id) {
        resultado = await nexoSupabase
            .from("avisos")
            .update({ titulo, mensagem })
            .eq("id", id)
            .eq("usuario_id", usuarioLogado.id);
    } else {
        resultado = await nexoSupabase
            .from("avisos")
            .insert({ titulo, mensagem, usuario_id: usuarioLogado.id });
    }

    if (resultado.error) {
        console.error("Erro ao salvar aviso:", resultado.error);
        alert("Não foi possível salvar o aviso.");
        return;
    }

    fecharModal(modalAvisoPublico);
    await carregarAvisosPublicos();
}

function editarAviso(id) {
    const aviso = avisosPublicos.find(item => item.id === id);
    if (!aviso || !usuarioLogado || aviso.usuarioId !== usuarioLogado.id) return;
    avisoPublicoId.value = aviso.id;
    avisoPublicoTitulo.value = aviso.titulo;
    avisoPublicoMensagem.value = aviso.mensagem;
    tituloModalAvisoPublico.textContent = "Editar aviso";
    abrirModal(modalAvisoPublico);
}

async function excluirAviso(id) {
    const aviso = avisosPublicos.find(item => item.id === id);
    if (!aviso || !usuarioLogado || aviso.usuarioId !== usuarioLogado.id) return;
    if (!confirm(`Deseja excluir o aviso "${aviso.titulo}"?`)) return;

    const { error } = await nexoSupabase
        .from("avisos")
        .delete()
        .eq("id", id)
        .eq("usuario_id", usuarioLogado.id);

    if (error) {
        console.error("Erro ao excluir aviso:", error);
        alert("Não foi possível excluir o aviso.");
        return;
    }
    await carregarAvisosPublicos();
}

if (publicarAviso) publicarAviso.addEventListener("click", prepararNovoAviso);
if (fecharAvisoPublico) fecharAvisoPublico.addEventListener("click", () => fecharModal(modalAvisoPublico));
if (cancelarAvisoPublico) cancelarAvisoPublico.addEventListener("click", () => fecharModal(modalAvisoPublico));
if (formAvisoPublico) formAvisoPublico.addEventListener("submit", salvarAvisoPublico);

if (modalAvisoPublico) {
    modalAvisoPublico.addEventListener("click", evento => {
        if (evento.target === modalAvisoPublico) fecharModal(modalAvisoPublico);
    });
}

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharModal(modalAvisoPublico);
});

if (listaAvisosPublicos) {
    listaAvisosPublicos.addEventListener("click", async evento => {
        const botao = evento.target.closest("[data-aviso-acao]");
        if (!botao) return;
        const id = botao.dataset.avisoId;
        if (botao.dataset.avisoAcao === "editar") editarAviso(id);
        if (botao.dataset.avisoAcao === "excluir") await excluirAviso(id);
    });
}

/* O carregamento inicial da agenda termina depois da autenticação.
   Este pequeno observador espera o usuário estar disponível antes de buscar avisos. */
(async function iniciarAvisosNexo() {
    for (let tentativa = 0; tentativa < 50 && !usuarioLogado; tentativa++) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (usuarioLogado) await carregarAvisosPublicos();
})();

window.addEventListener("focus", function () {
    if (usuarioLogado) carregarAvisosPublicos();
});
