let usuarioLogado = null;


// ========================================
// CARREGAR PERFIL NO DASHBOARD
// ========================================

async function carregarPerfilDashboard() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const { data: perfil, error } =
            await nexoSupabase
                .from("perfis")
                .select("nome, avatar_url")
                .eq("id", usuarioLogado.id)
                .single();

        if (error) {

            console.error(
                "Erro ao carregar perfil:",
                error
            );

            return;
        }

        if (!perfil) {
            return;
        }

        const nome =
            perfil.nome || "Usuário";


        const nomeBoasVindas =
            document.getElementById(
                "nomeBoasVindas"
            );

        if (nomeBoasVindas) {
            nomeBoasVindas.textContent =
                nome;
        }


        const usuarioNome =
            document.getElementById(
                "usuarioNome"
            );

        if (usuarioNome) {
            usuarioNome.textContent =
                nome;
        }


        const usuarioAvatar =
            document.getElementById(
                "usuarioAvatar"
            );

        if (usuarioAvatar) {

            const partes =
                nome
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);

            let iniciais = "";

            if (partes.length === 1) {

                iniciais =
                    partes[0]
                        .charAt(0)
                        .toUpperCase();

            } else {

                iniciais =
                    (
                        partes[0].charAt(0) +
                        partes[
                            partes.length - 1
                        ].charAt(0)
                    ).toUpperCase();

            }

            usuarioAvatar.textContent =
                iniciais;
        }

    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar perfil:",
            erro
        );

    }

}


// ========================================
// AUTENTICAÇÃO
// ========================================

async function iniciarAutenticacaoDashboard() {

    usuarioLogado =
        await protegerPagina();

    if (!usuarioLogado) {
        return;
    }

    console.log(
        "Usuário autenticado:",
        usuarioLogado.id
    );

    await carregarPerfilDashboard();

    await Promise.all([
        carregarMateriasSupabase(),
        carregarAtividadesSupabase(),
        carregarProvasSupabase()
    ]);

    atualizarDashboard();
}


/* =====================================================
   ELEMENTOS
===================================================== */

const dataAtual =
    document.getElementById("dataAtual");

const diasSemanaContainer =
    document.getElementById("diasSemana");

const botaoCriar =
    document.getElementById("botaoCriar");

const modalCriar =
    document.getElementById("modalCriar");

const fecharModal =
    document.getElementById("fecharModal");

const criarAtividade =
    document.getElementById("criarAtividade");

const criarProva =
    document.getElementById("criarProva");

const opcaoAtividade =
    document.getElementById("opcaoAtividade");

const opcaoProva =
    document.getElementById("opcaoProva");

const opcaoMateria =
    document.getElementById("opcaoMateria");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


const quantidadeHoje =
    document.getElementById("quantidadeHoje");

const quantidadeSemana =
    document.getElementById("quantidadeSemana");

const quantidadeProvas =
    document.getElementById("quantidadeProvas");

const listaAtividadesHoje =
    document.getElementById("listaAtividadesHoje");

const listaProvas =
    document.getElementById("listaProvas");


/* =====================================================
   DADOS
===================================================== */

let materiasSupabase = [];

let atividadesSupabase = [];

let provasSupabase = [];


/* =====================================================
   DATAS
===================================================== */

function obterHoje() {

    const agora = new Date();

    return new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate()
    );

}


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


function formatarDataISO(dataISO) {

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


function inicioDaSemana(data) {

    const copia =
        copiarData(data);

    const diaSemana =
        copia.getDay();

    const diferenca =
        diaSemana === 0
            ? -6
            : 1 - diaSemana;

    copia.setDate(
        copia.getDate() +
        diferenca
    );

    return copia;

}


function fimDaSemana(data) {

    const inicio =
        inicioDaSemana(data);

    const fim =
        copiarData(inicio);

    fim.setDate(
        fim.getDate() + 6
    );

    return fim;

}


/* =====================================================
   DATA ATUAL
===================================================== */

function mostrarDataAtual() {

    if (!dataAtual) {
        return;
    }

    const hoje =
        obterHoje();

    const formatoData =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    let texto =
        formatoData.format(hoje);

    texto =
        texto.charAt(0).toUpperCase() +
        texto.slice(1);

    dataAtual.textContent =
        texto;

}


/* =====================================================
   CARREGAR MATÉRIAS
===================================================== */

async function carregarMateriasSupabase() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const { data, error } =
            await nexoSupabase
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

            materiasSupabase = [];

            return;
        }

        materiasSupabase =
            data || [];

    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar matérias:",
            erro
        );

        materiasSupabase = [];

    }

}


/* =====================================================
   CARREGAR ATIVIDADES
===================================================== */

async function carregarAtividadesSupabase() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const { data, error } =
            await nexoSupabase
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
                );

        if (error) {

            console.error(
                "Erro ao carregar atividades:",
                error
            );

            atividadesSupabase = [];

            return;
        }

        atividadesSupabase =
            (data || []).map(
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
                            item.criado_em

                    };

                }
            );

    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar atividades:",
            erro
        );

        atividadesSupabase = [];

    }

}


/* =====================================================
   CARREGAR PROVAS
===================================================== */

async function carregarProvasSupabase() {

    if (!usuarioLogado) {
        return;
    }

    try {

        const { data, error } =
            await nexoSupabase
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
                );

        if (error) {

            console.error(
                "Erro ao carregar provas:",
                error
            );

            provasSupabase = [];

            return;
        }

        provasSupabase =
            (data || []).map(
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
                            item.criado_em

                    };

                }
            );

    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar provas:",
            erro
        );

        provasSupabase = [];

    }

}


/* =====================================================
   ACESSAR DADOS
===================================================== */

function carregarMaterias() {

    return materiasSupabase;

}


function carregarAtividades() {

    return atividadesSupabase;

}


function carregarProvas() {

    return provasSupabase;

}


/* =====================================================
   NOME DA MATÉRIA
===================================================== */

function obterNomeMateria(id) {

    if (!id) {
        return "Sem matéria";
    }

    const materia =
        materiasSupabase.find(
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


/* =====================================================
   SELECT DE MATÉRIAS
===================================================== */

function preencherSelectMaterias(select) {

    if (!select) {
        return;
    }

    select.innerHTML =
        "";

    const materias =
        [...materiasSupabase].sort(
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

    opcaoPadrao.value =
        "";

    opcaoPadrao.textContent =
        materias.length === 0
            ? "Nenhuma matéria cadastrada"
            : "Selecione uma matéria";

    select.appendChild(
        opcaoPadrao
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
   ORDENAÇÃO
===================================================== */

function ordenarPorHorario(a, b) {

    const horarioA =
        a.horario || "99:99";

    const horarioB =
        b.horario || "99:99";

    return horarioA.localeCompare(
        horarioB
    );

}


function ordenarPorDataEHorario(a, b) {

    if (
        a.data !==
        b.data
    ) {

        return a.data.localeCompare(
            b.data
        );

    }

    return ordenarPorHorario(
        a,
        b
    );

}


/* =====================================================
   RESUMO
===================================================== */

function atualizarResumo() {

    const hoje =
        obterHoje();

    const hojeISO =
        dataParaISO(
            hoje
        );

    const inicioISO =
        dataParaISO(
            inicioDaSemana(
                hoje
            )
        );

    const fimISO =
        dataParaISO(
            fimDaSemana(
                hoje
            )
        );


    const atividades =
        carregarAtividades();

    const provas =
        carregarProvas();


    const atividadesHoje =
        atividades.filter(
            function (atividade) {

                return (
                    atividade.data ===
                        hojeISO &&
                    !atividade.concluida
                );

            }
        );


    const atividadesSemana =
        atividades.filter(
            function (atividade) {

                return (
                    !atividade.concluida &&
                    atividade.data >=
                        inicioISO &&
                    atividade.data <=
                        fimISO
                );

            }
        );


    const proximasProvas =
        provas.filter(
            function (prova) {

                return (
                    prova.data >=
                    hojeISO
                );

            }
        );


    if (quantidadeHoje) {

        quantidadeHoje.textContent =
            atividadesHoje.length;

    }


    if (quantidadeSemana) {

        quantidadeSemana.textContent =
            atividadesSemana.length;

    }


    if (quantidadeProvas) {

        quantidadeProvas.textContent =
            proximasProvas.length;

    }

}


/* =====================================================
   ATIVIDADES DE HOJE
===================================================== */

function renderizarAtividadesHoje() {

    if (!listaAtividadesHoje) {
        return;
    }


    const hojeISO =
        dataParaISO(
            obterHoje()
        );


    const atividades =
        carregarAtividades()
            .filter(
                function (atividade) {

                    return (
                        atividade.data ===
                            hojeISO &&
                        !atividade.concluida
                    );

                }
            )
            .sort(
                ordenarPorHorario
            );


    listaAtividadesHoje.innerHTML =
        "";


    if (
        atividades.length === 0
    ) {

        const vazio =
            document.createElement(
                "div"
            );

        vazio.classList.add(
            "estado-vazio"
        );

        vazio.id =
            "atividadesVazio";


        vazio.innerHTML = `
            <div class="vazio-icone">
                ✓
            </div>

            <h3>
                Nada por aqui
            </h3>

            <p>
                Você ainda não adicionou nenhuma
                atividade para hoje.
            </p>

            <button
                type="button"
                class="botao-vazio"
                id="criarAtividadeDashboard"
            >
                + Criar atividade
            </button>
        `;


        listaAtividadesHoje.appendChild(
            vazio
        );


        const botao =
            document.getElementById(
                "criarAtividadeDashboard"
            );


        if (botao) {

            botao.addEventListener(
                "click",
                function () {

                    abrirFormularioAtividade(
                        hojeISO
                    );

                }
            );

        }


        return;

    }


    atividades.forEach(
        function (atividade) {

            const card =
                document.createElement(
                    "div"
                );

            card.classList.add(
                "atividade-card"
            );


            const check =
                document.createElement(
                    "button"
                );

            check.type =
                "button";

            check.classList.add(
                "atividade-check"
            );

            check.setAttribute(
                "aria-label",
                "Concluir atividade"
            );


            check.addEventListener(
                "click",
                async function () {

                    await concluirAtividade(
                        atividade.id
                    );

                }
            );


            const conteudo =
                document.createElement(
                    "div"
                );

            conteudo.classList.add(
                "atividade-conteudo"
            );


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


            const meta =
                document.createElement(
                    "div"
                );

            meta.classList.add(
                "atividade-meta"
            );


            const textoData =
                document.createElement(
                    "span"
                );

            textoData.textContent =
                "Hoje";

            meta.appendChild(
                textoData
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


            conteudo.appendChild(
                topo
            );

            conteudo.appendChild(
                meta
            );


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


            card.appendChild(
                check
            );

            card.appendChild(
                conteudo
            );


            listaAtividadesHoje.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CONCLUIR ATIVIDADE
===================================================== */

async function concluirAtividade(id) {

    if (!usuarioLogado) {
        return;
    }

    try {

        const { error } =
            await nexoSupabase
                .from("atividades")
                .update({
                    concluida: true
                })
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
                "Erro ao concluir atividade:",
                error
            );

            alert(
                "Não foi possível concluir a atividade."
            );

            return;
        }


        await carregarAtividadesSupabase();

        atualizarDashboard();


    } catch (erro) {

        console.error(
            "Erro inesperado ao concluir atividade:",
            erro
        );

    }

}


/* =====================================================
   PRÓXIMAS PROVAS
===================================================== */

function renderizarProvas() {

    if (!listaProvas) {
        return;
    }


    const hojeISO =
        dataParaISO(
            obterHoje()
        );


    const provas =
        carregarProvas()
            .filter(
                function (prova) {

                    return (
                        prova.data >=
                        hojeISO
                    );

                }
            )
            .sort(
                ordenarPorDataEHorario
            );


    listaProvas.innerHTML =
        "";


    if (
        provas.length === 0
    ) {

        const vazio =
            document.createElement(
                "div"
            );

        vazio.classList.add(
            "estado-vazio",
            "estado-vazio-menor"
        );


        vazio.innerHTML = `
            <div class="vazio-icone">
                ✎
            </div>

            <h3>
                Nenhuma prova
            </h3>

            <p>
                Nenhuma prova futura foi cadastrada.
            </p>

            <button
                type="button"
                class="botao-vazio"
                id="criarProvaDashboard"
            >
                + Adicionar prova
            </button>
        `;


        listaProvas.appendChild(
            vazio
        );


        const botao =
            document.getElementById(
                "criarProvaDashboard"
            );


        if (botao) {

            botao.addEventListener(
                "click",
                function () {

                    abrirFormularioProva();

                }
            );

        }


        return;

    }


    provas
        .slice(
            0,
            3
        )
        .forEach(
            function (prova) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.classList.add(
                    "prova-card"
                );


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


                const dia =
                    document.createElement(
                        "strong"
                    );

                dia.textContent =
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


                const mes =
                    document.createElement(
                        "span"
                    );

                mes.textContent =
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


                blocoData.appendChild(
                    dia
                );

                blocoData.appendChild(
                    mes
                );


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


                const meta =
                    document.createElement(
                        "div"
                    );

                meta.classList.add(
                    "prova-meta"
                );


                const data =
                    document.createElement(
                        "span"
                    );

                data.textContent =
                    prova.data === hojeISO
                        ? "Hoje"
                        : formatarDataISO(
                            prova.data
                        );


                meta.appendChild(
                    data
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


                conteudo.appendChild(
                    topo
                );

                conteudo.appendChild(
                    meta
                );


                if (
                    prova.conteudo
                ) {

                    const descricao =
                        document.createElement(
                            "p"
                        );

                    descricao.classList.add(
                        "prova-observacao"
                    );

                    descricao.textContent =
                        prova.conteudo;

                    conteudo.appendChild(
                        descricao
                    );

                }


                card.appendChild(
                    blocoData
                );

                card.appendChild(
                    conteudo
                );


                listaProvas.appendChild(
                    card
                );

            }
        );

}


/* =====================================================
   RESUMO DA SEMANA
===================================================== */

function criarSemana() {

    if (!diasSemanaContainer) {
        return;
    }


    diasSemanaContainer.innerHTML =
        "";


    const hoje =
        obterHoje();

    const inicio =
        inicioDaSemana(
            hoje
        );

    const hojeISO =
        dataParaISO(
            hoje
        );


    const atividades =
        carregarAtividades();

    const provas =
        carregarProvas();


    const nomesDias = [
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb",
        "Dom"
    ];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const dataDia =
            copiarData(
                inicio
            );


        dataDia.setDate(
            inicio.getDate() +
            i
        );


        const dataISO =
            dataParaISO(
                dataDia
            );


        const atividadesDia =
            atividades.filter(
                function (atividade) {

                    return (
                        atividade.data ===
                            dataISO &&
                        !atividade.concluida
                    );

                }
            );


        const provasDia =
            provas.filter(
                function (prova) {

                    return (
                        prova.data ===
                        dataISO
                    );

                }
            );


        const totalItens =
            atividadesDia.length +
            provasDia.length;


        const card =
            document.createElement(
                "div"
            );


        card.classList.add(
            "dia-semana"
        );


        card.dataset.data =
            dataISO;


        if (
            dataISO === hojeISO
        ) {

            card.classList.add(
                "hoje"
            );

        }


        const nome =
            document.createElement(
                "span"
            );

        nome.classList.add(
            "dia-nome"
        );

        nome.textContent =
            nomesDias[i];


        const numero =
            document.createElement(
                "span"
            );

        numero.classList.add(
            "dia-numero"
        );

        numero.textContent =
            dataDia.getDate();


        const quantidade =
            document.createElement(
                "span"
            );

        quantidade.classList.add(
            "dia-quantidade"
        );


        if (
            totalItens === 0
        ) {

            quantidade.textContent =
                "Nenhum item";

        }

        else if (
            totalItens === 1
        ) {

            quantidade.textContent =
                "1 item";

        }

        else {

            quantidade.textContent =
                `${totalItens} itens`;

        }


        card.appendChild(
            nome
        );

        card.appendChild(
            numero
        );

        card.appendChild(
            quantidade
        );


        diasSemanaContainer.appendChild(
            card
        );

    }

}


/* =====================================================
   ATUALIZAR DASHBOARD
===================================================== */

function atualizarDashboard() {

    atualizarResumo();

    renderizarAtividadesHoje();

    renderizarProvas();

    criarSemana();

}


/* =====================================================
   MODAL PRINCIPAL
===================================================== */

function abrirModalCriar() {

    if (!modalCriar) {
        return;
    }

    modalCriar.classList.add(
        "ativo"
    );

}


function fecharModalCriar() {

    if (!modalCriar) {
        return;
    }

    modalCriar.classList.remove(
        "ativo"
    );

}


if (botaoCriar) {

    botaoCriar.addEventListener(
        "click",
        abrirModalCriar
    );

}


if (fecharModal) {

    fecharModal.addEventListener(
        "click",
        fecharModalCriar
    );

}


if (modalCriar) {

    modalCriar.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalCriar
            ) {

                fecharModalCriar();

            }

        }
    );

}


/* =====================================================
   BOTÕES DO ESTADO VAZIO
===================================================== */

if (criarAtividade) {

    criarAtividade.addEventListener(
        "click",
        function () {

            abrirFormularioAtividade();

        }
    );

}


if (criarProva) {

    criarProva.addEventListener(
        "click",
        function () {

            abrirFormularioProva();

        }
    );

}


/* =====================================================
   + CRIAR
===================================================== */

if (opcaoAtividade) {

    opcaoAtividade.addEventListener(
        "click",
        function () {

            abrirFormularioAtividade();

        }
    );

}


if (opcaoProva) {

    opcaoProva.addEventListener(
        "click",
        function () {

            abrirFormularioProva();

        }
    );

}


if (opcaoMateria) {

    opcaoMateria.addEventListener(
        "click",
        function () {

            window.location.href =
                "materias.html";

        }
    );

}


/* =====================================================
   ABRIR FORMULÁRIOS
===================================================== */

function abrirFormularioAtividade(
    dataSelecionada = ""
) {

    fecharModalCriar();


    const dataInicial =
        dataSelecionada ||
        dataParaISO(
            obterHoje()
        );


    criarFormularioModal({

        tipo:
            "atividade",

        titulo:
            "Nova atividade",

        data:
            dataInicial

    });

}


function abrirFormularioProva(
    dataSelecionada = ""
) {

    fecharModalCriar();


    const dataInicial =
        dataSelecionada ||
        dataParaISO(
            obterHoje()
        );


    criarFormularioModal({

        tipo:
            "prova",

        titulo:
            "Nova prova",

        data:
            dataInicial

    });

}


/* =====================================================
   MODAL DO FORMULÁRIO
===================================================== */

function criarFormularioModal(config) {

    const modalAnterior =
        document.getElementById(
            "modalFormulario"
        );


    if (modalAnterior) {

        modalAnterior.remove();

    }


    const fundo =
        document.createElement(
            "div"
        );


    fundo.classList.add(
        "modal-fundo",
        "ativo"
    );


    fundo.id =
        "modalFormulario";


    const modal =
        document.createElement(
            "div"
        );


    modal.classList.add(
        "modal"
    );


    /* CABEÇALHO */

    const cabecalho =
        document.createElement(
            "div"
        );


    cabecalho.classList.add(
        "modal-cabecalho"
    );


    const tituloArea =
        document.createElement(
            "div"
        );


    const etiqueta =
        document.createElement(
            "span"
        );


    etiqueta.textContent =
        config.tipo === "atividade"
            ? "ATIVIDADE"
            : "PROVA";


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        config.titulo;


    tituloArea.appendChild(
        etiqueta
    );

    tituloArea.appendChild(
        titulo
    );


    const fechar =
        document.createElement(
            "button"
        );


    fechar.type =
        "button";

    fechar.classList.add(
        "modal-fechar"
    );

    fechar.textContent =
        "×";

    fechar.setAttribute(
        "aria-label",
        "Fechar"
    );


    cabecalho.appendChild(
        tituloArea
    );

    cabecalho.appendChild(
        fechar
    );


    /* FORMULÁRIO */

    const formulario =
        document.createElement(
            "form"
        );


    formulario.classList.add(
        "formulario-nexo"
    );


    const campoTitulo =
        criarCampo({

            label:
                config.tipo === "atividade"
                    ? "Título"
                    : "Nome da prova",

            tipo:
                "text",

            nome:
                "titulo",

            placeholder:
                config.tipo === "atividade"
                    ? "Ex.: Fazer lista de exercícios"
                    : "Ex.: Prova de química",

            obrigatorio:
                true

        });


    const campoData =
        criarCampo({

            label:
                "Data",

            tipo:
                "date",

            nome:
                "data",

            valor:
                config.data,

            obrigatorio:
                true

        });


    /* MATÉRIA */

    const grupoMateria =
        document.createElement(
            "div"
        );


    grupoMateria.classList.add(
        "formulario-campo"
    );


    const labelMateria =
        document.createElement(
            "label"
        );


    labelMateria.textContent =
        "Matéria";


    const selectMateria =
        document.createElement(
            "select"
        );


    selectMateria.name =
        "materia";


    preencherSelectMaterias(
        selectMateria
    );


    grupoMateria.appendChild(
        labelMateria
    );

    grupoMateria.appendChild(
        selectMateria
    );


    /* HORÁRIO */

    const campoHorario =
        criarCampo({

            label:
                "Horário (opcional)",

            tipo:
                "time",

            nome:
                "horario"

        });


    /* DESCRIÇÃO */

    const grupoDescricao =
        document.createElement(
            "div"
        );


    grupoDescricao.classList.add(
        "formulario-campo"
    );


    const labelDescricao =
        document.createElement(
            "label"
        );


    labelDescricao.textContent =
        config.tipo === "atividade"
            ? "Descrição (opcional)"
            : "Conteúdo / observações (opcional)";


    const descricao =
        document.createElement(
            "textarea"
        );


    descricao.name =
        "descricao";

    descricao.rows =
        4;

    descricao.maxLength =
        config.tipo === "atividade"
            ? 500
            : 700;


    descricao.placeholder =
        config.tipo === "atividade"
            ? "Adicione detalhes sobre a atividade..."
            : "Conteúdo da prova, observações...";


    grupoDescricao.appendChild(
        labelDescricao
    );

    grupoDescricao.appendChild(
        descricao
    );


    /* CALENDÁRIO */

    const opcaoCalendario =
        document.createElement("label");

    opcaoCalendario.classList.add(
        "calendario-opcao"
    );

    const checkboxCalendario =
        document.createElement("input");

    checkboxCalendario.type = "checkbox";
    checkboxCalendario.name = "noCalendario";
    checkboxCalendario.checked = false;

    const textoCalendario =
        document.createElement("span");

    textoCalendario.innerHTML =
        "<strong>Adicionar ao meu calendário</strong><small>Mostra este item no Dashboard, Semana e Mês.</small>";

    opcaoCalendario.appendChild(
        checkboxCalendario
    );

    opcaoCalendario.appendChild(
        textoCalendario
    );


    /* BOTÕES */

    const botoes =
        document.createElement(
            "div"
        );


    botoes.classList.add(
        "formulario-botoes"
    );


    const cancelar =
        document.createElement(
            "button"
        );


    cancelar.type =
        "button";

    cancelar.classList.add(
        "botao-cancelar"
    );

    cancelar.textContent =
        "Cancelar";


    const salvar =
        document.createElement(
            "button"
        );


    salvar.type =
        "submit";

    salvar.classList.add(
        "botao-salvar"
    );


    salvar.textContent =
        config.tipo === "atividade"
            ? "Criar atividade"
            : "Criar prova";


    botoes.appendChild(
        cancelar
    );

    botoes.appendChild(
        salvar
    );


    /* MONTAGEM */

    formulario.appendChild(
        campoTitulo
    );

    formulario.appendChild(
        campoData
    );

    formulario.appendChild(
        grupoMateria
    );

    formulario.appendChild(
        campoHorario
    );

    formulario.appendChild(
        grupoDescricao
    );

    formulario.appendChild(
        opcaoCalendario
    );

    formulario.appendChild(
        botoes
    );


    modal.appendChild(
        cabecalho
    );

    modal.appendChild(
        formulario
    );


    fundo.appendChild(
        modal
    );


    document.body.appendChild(
        fundo
    );


    function fecharFormulario() {

        fundo.remove();

    }


    fechar.addEventListener(
        "click",
        fecharFormulario
    );


    cancelar.addEventListener(
        "click",
        fecharFormulario
    );


    fundo.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                fundo
            ) {

                fecharFormulario();

            }

        }
    );


    /* =================================================
       SALVAR NO SUPABASE
    ================================================= */

    formulario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuarioLogado) {
                return;
            }


            const dados =
                new FormData(
                    formulario
                );


            const titulo =
                String(
                    dados.get(
                        "titulo"
                    ) || ""
                ).trim();


            const data =
                String(
                    dados.get(
                        "data"
                    ) || ""
                );


            const materiaId =
                String(
                    dados.get(
                        "materia"
                    ) || ""
                );


            const horario =
                String(
                    dados.get(
                        "horario"
                    ) || ""
                );


            const textoDescricao =
                String(
                    dados.get(
                        "descricao"
                    ) || ""
                ).trim();


            const noCalendario =
                dados.get("noCalendario") === "on";


            if (
                !titulo ||
                !data
            ) {

                return;

            }


            salvar.disabled =
                true;


            try {

                /* =====================
                   ATIVIDADE
                ====================== */

                if (
                    config.tipo ===
                    "atividade"
                ) {

                    const { error } =
                        await nexoSupabase
                            .from(
                                "atividades"
                            )
                            .insert({

                                titulo:
                                    titulo,

                                descricao:
                                    textoDescricao ||
                                    null,

                                data:
                                    data,

                                horario:
                                    horario ||
                                    null,

                                materia_id:
                                    materiaId ||
                                    null,

                                usuario_id:
                                    usuarioLogado.id,

                                visibilidade:
                                    "privada",

                                no_calendario:
                                    noCalendario,

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


                    await carregarAtividadesSupabase();

                }


                /* =====================
                   PROVA
                ====================== */

                else {

                    const { error } =
                        await nexoSupabase
                            .from(
                                "provas"
                            )
                            .insert({

                                nome:
                                    titulo,

                                conteudo:
                                    textoDescricao ||
                                    null,

                                data:
                                    data,

                                horario:
                                    horario ||
                                    null,

                                materia_id:
                                    materiaId ||
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
                            "Erro ao criar prova:",
                            error
                        );

                        alert(
                            "Não foi possível criar a prova."
                        );

                        return;

                    }


                    await carregarProvasSupabase();

                }


                fecharFormulario();

                atualizarDashboard();


            } catch (erro) {

                console.error(
                    "Erro inesperado ao salvar:",
                    erro
                );

                alert(
                    "Ocorreu um erro ao salvar."
                );


            } finally {

                salvar.disabled =
                    false;

            }

        }
    );


    const primeiroInput =
        formulario.querySelector(
            'input[name="titulo"]'
        );


    if (primeiroInput) {

        setTimeout(
            function () {

                primeiroInput.focus();

            },
            100
        );

    }

}


/* =====================================================
   CRIAR CAMPO
===================================================== */

function criarCampo(config) {

    const grupo =
        document.createElement(
            "div"
        );


    grupo.classList.add(
        "formulario-campo"
    );


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        config.label;


    const input =
        document.createElement(
            "input"
        );


    input.type =
        config.tipo || "text";


    input.name =
        config.nome;


    if (
        config.placeholder
    ) {

        input.placeholder =
            config.placeholder;

    }


    if (
        config.valor
    ) {

        input.value =
            config.valor;

    }


    if (
        config.obrigatorio
    ) {

        input.required =
            true;

    }


    grupo.appendChild(
        label
    );

    grupo.appendChild(
        input
    );


    return grupo;

}


/* =====================================================
   CLICAR EM UM DIA
===================================================== */

if (
    diasSemanaContainer
) {

    diasSemanaContainer.addEventListener(
        "click",
        function (event) {

            const dia =
                event.target.closest(
                    ".dia-semana"
                );


            if (!dia) {
                return;
            }


            const dataSelecionada =
                dia.dataset.data;


            abrirMenuDoDia(
                dataSelecionada
            );

        }
    );

}


/* =====================================================
   MENU DO DIA
===================================================== */

function abrirMenuDoDia(
    dataSelecionada
) {

    const modalAnterior =
        document.getElementById(
            "modalDia"
        );


    if (modalAnterior) {

        modalAnterior.remove();

    }


    const dataFormatada =
        formatarDataISO(
            dataSelecionada
        );


    const fundo =
        document.createElement(
            "div"
        );


    fundo.classList.add(
        "modal-fundo",
        "ativo"
    );


    fundo.id =
        "modalDia";


    const modal =
        document.createElement(
            "div"
        );


    modal.classList.add(
        "modal"
    );


    modal.innerHTML = `
        <div class="modal-cabecalho">

            <div>

                <span>
                    ${dataFormatada}
                </span>

                <h2>
                    Adicionar neste dia
                </h2>

            </div>

            <button
                type="button"
                class="modal-fechar"
                id="fecharModalDia"
                aria-label="Fechar"
            >
                ×
            </button>

        </div>

        <div class="modal-opcoes">

            <button
                type="button"
                class="modal-opcao"
                id="atividadeDia"
            >

                <div class="modal-opcao-icone">
                    ✓
                </div>

                <div>

                    <strong>
                        Atividade
                    </strong>

                    <span>
                        Criar uma atividade para
                        ${dataFormatada}.
                    </span>

                </div>

            </button>

            <button
                type="button"
                class="modal-opcao"
                id="provaDia"
            >

                <div class="modal-opcao-icone">
                    ✎
                </div>

                <div>

                    <strong>
                        Prova
                    </strong>

                    <span>
                        Adicionar uma prova para
                        ${dataFormatada}.
                    </span>

                </div>

            </button>

        </div>
    `;


    fundo.appendChild(
        modal
    );


    document.body.appendChild(
        fundo
    );


    const fecharModalDia =
        document.getElementById(
            "fecharModalDia"
        );


    const atividadeDia =
        document.getElementById(
            "atividadeDia"
        );


    const provaDia =
        document.getElementById(
            "provaDia"
        );


    fecharModalDia.addEventListener(
        "click",
        function () {

            fundo.remove();

        }
    );


    atividadeDia.addEventListener(
        "click",
        function () {

            fundo.remove();

            abrirFormularioAtividade(
                dataSelecionada
            );

        }
    );


    provaDia.addEventListener(
        "click",
        function () {

            fundo.remove();

            abrirFormularioProva(
                dataSelecionada
            );

        }
    );


    fundo.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                fundo
            ) {

                fundo.remove();

            }

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


        fecharModalCriar();


        const formulario =
            document.getElementById(
                "modalFormulario"
            );


        if (formulario) {

            formulario.remove();

        }


        const modalDia =
            document.getElementById(
                "modalDia"
            );


        if (modalDia) {

            modalDia.remove();

        }


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


        await Promise.all([

            carregarMateriasSupabase(),

            carregarAtividadesSupabase(),

            carregarProvasSupabase()

        ]);


        atualizarDashboard();

    }
);


/* =====================================================
   PERFIL
===================================================== */

const usuarioBotao =
    document.getElementById(
        "usuarioBotao"
    );


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
   INICIAR
===================================================== */

mostrarDataAtual();

iniciarAutenticacaoDashboard();