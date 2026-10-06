/* =====================================================
   NEXO - MATÉRIAS
===================================================== */


/* =========================
   ELEMENTOS
========================= */

const novaMateria =
    document.getElementById("novaMateria");

const criarPrimeiraMateria =
    document.getElementById("criarPrimeiraMateria");

const modalMateria =
    document.getElementById("modalMateria");

const fecharModalMateria =
    document.getElementById("fecharModalMateria");

const cancelarMateria =
    document.getElementById("cancelarMateria");

const formMateria =
    document.getElementById("formMateria");

const nomeMateria =
    document.getElementById("nomeMateria");

const professorMateria =
    document.getElementById("professorMateria");

const tituloModalMateria =
    document.getElementById("tituloModalMateria");

const listaMaterias =
    document.getElementById("listaMaterias");

const materiasVazio =
    document.getElementById("materiasVazio");

const contadorMaterias =
    document.getElementById("contadorMaterias");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


/* =====================================================
   ESTADO
===================================================== */

let usuarioLogado = null;

let materias = [];

let materiaEmEdicao = null;


/* =====================================================
   CARREGAR MATÉRIAS DO SUPABASE
===================================================== */

async function carregarMaterias() {

    if (!usuarioLogado) {
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
            .order("nome", {
                ascending: true
            });


        if (error) {

            console.error(
                "Erro ao carregar matérias:",
                error
            );

            alert(
                "Não foi possível carregar as matérias."
            );

            return;
        }


        materias = data || [];

        renderizarMaterias();


    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar matérias:",
            erro
        );

        alert(
            "Ocorreu um erro ao carregar as matérias."
        );

    }

}


/* =====================================================
   ABRIR MODAL
===================================================== */

function abrirModalNovaMateria() {

    materiaEmEdicao = null;

    tituloModalMateria.textContent =
        "Nova matéria";

    formMateria.reset();

    modalMateria.classList.add(
        "ativo"
    );

    setTimeout(
        function () {

            nomeMateria.focus();

        },
        100
    );

}


/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharModal() {

    modalMateria.classList.remove(
        "ativo"
    );

    formMateria.reset();

    materiaEmEdicao = null;

}


/* =====================================================
   EVENTOS DO MODAL
===================================================== */

if (novaMateria) {

    novaMateria.addEventListener(
        "click",
        abrirModalNovaMateria
    );

}


if (criarPrimeiraMateria) {

    criarPrimeiraMateria.addEventListener(
        "click",
        abrirModalNovaMateria
    );

}


if (fecharModalMateria) {

    fecharModalMateria.addEventListener(
        "click",
        fecharModal
    );

}


if (cancelarMateria) {

    cancelarMateria.addEventListener(
        "click",
        fecharModal
    );

}


if (modalMateria) {

    modalMateria.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalMateria
            ) {

                fecharModal();

            }

        }
    );

}


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            fecharModal();

            if (sidebar) {

                sidebar.classList.remove(
                    "ativo"
                );

            }

        }

    }
);


/* =====================================================
   VERIFICAR MATÉRIA DUPLICADA
===================================================== */

function existeMateriaDuplicada(
    nome,
    idIgnorado = null
) {

    return materias.some(
        function (materia) {

            const mesmoNome =
                materia.nome
                    .trim()
                    .toLocaleLowerCase(
                        "pt-BR"
                    ) ===
                nome
                    .trim()
                    .toLocaleLowerCase(
                        "pt-BR"
                    );

            const outroRegistro =
                materia.id !==
                idIgnorado;

            return (
                mesmoNome &&
                outroRegistro
            );

        }
    );

}


/* =====================================================
   SALVAR MATÉRIA
===================================================== */

if (formMateria) {

    formMateria.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuarioLogado) {

                alert(
                    "Sua sessão não está disponível."
                );

                return;
            }


            const nome =
                nomeMateria.value.trim();

            const professor =
                professorMateria.value.trim();


            /* =========================
               VALIDAÇÃO
            ========================== */

            if (!nome) {

                nomeMateria.focus();

                return;

            }


            if (
                existeMateriaDuplicada(
                    nome,
                    materiaEmEdicao
                )
            ) {

                alert(
                    "Já existe uma matéria com esse nome."
                );

                nomeMateria.focus();

                return;

            }


            const botaoSalvar =
                formMateria.querySelector(
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

                if (materiaEmEdicao) {

                    const {
                        error
                    } = await nexoSupabase
                        .from("materias")
                        .update({

                            nome:
                                nome,

                            professor:
                                professor || null

                        })
                        .eq(
                            "id",
                            materiaEmEdicao
                        );


                    if (error) {

                        console.error(
                            "Erro ao editar matéria:",
                            error
                        );

                        alert(
                            "Não foi possível editar a matéria."
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
                        .from("materias")
                        .insert({

                            nome:
                                nome,

                            professor:
                                professor || null,

                            usuario_id:
                                usuarioLogado.id

                        });


                    if (error) {

                        console.error(
                            "Erro ao criar matéria:",
                            error
                        );

                        alert(
                            "Não foi possível criar a matéria."
                        );

                        return;

                    }

                }


                fecharModal();

                await carregarMaterias();


            } catch (erro) {

                console.error(
                    "Erro inesperado ao salvar matéria:",
                    erro
                );

                alert(
                    "Ocorreu um erro ao salvar a matéria."
                );

            } finally {

                if (botaoSalvar) {

                    botaoSalvar.disabled =
                        false;

                }

            }

        }
    );

}


/* =====================================================
   RENDERIZAR MATÉRIAS
===================================================== */

function renderizarMaterias() {

    if (
        !listaMaterias ||
        !contadorMaterias
    ) {
        return;
    }


    listaMaterias.innerHTML = "";


    /* =========================
       CONTADOR
    ========================== */

    if (materias.length === 1) {

        contadorMaterias.textContent =
            "1 matéria";

    } else {

        contadorMaterias.textContent =
            `${materias.length} matérias`;

    }


    /* =========================
       NENHUMA MATÉRIA
    ========================== */

    if (materias.length === 0) {

        if (materiasVazio) {

            listaMaterias.appendChild(
                materiasVazio
            );

        }

        return;

    }


    /* =========================
       ORDENAR
    ========================== */

    const materiasOrdenadas =
        [...materias].sort(
            function (a, b) {

                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );

            }
        );


    /* =========================
       CRIAR CARDS
    ========================== */

    materiasOrdenadas.forEach(
        function (materia) {

            const card =
                criarCardMateria(
                    materia
                );

            listaMaterias.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CARD DA MATÉRIA
===================================================== */

function criarCardMateria(materia) {

    const card =
        document.createElement(
            "article"
        );

    card.classList.add(
        "materia-card"
    );


    /* =========================
       ÍCONE
    ========================== */

    const icone =
        document.createElement(
            "div"
        );

    icone.classList.add(
        "materia-icone"
    );

    const inicial =
        materia.nome
            .charAt(0)
            .toUpperCase();

    icone.textContent =
        inicial || "M";


    /* =========================
       INFORMAÇÕES
    ========================== */

    const info =
        document.createElement(
            "div"
        );

    info.classList.add(
        "materia-info"
    );


    const nome =
        document.createElement(
            "h3"
        );

    nome.textContent =
        materia.nome;


    const professor =
        document.createElement(
            "p"
        );


    if (materia.professor) {

        professor.textContent =
            materia.professor;

    } else {

        professor.textContent =
            "Professor não informado";

    }


    info.appendChild(
        nome
    );

    info.appendChild(
        professor
    );


    /* =========================
       AÇÕES
    ========================== */

    const acoes =
        document.createElement(
            "div"
        );

    acoes.classList.add(
        "materia-acoes"
    );


    /* EDITAR */

    const editar =
        document.createElement(
            "button"
        );

    editar.type =
        "button";

    editar.classList.add(
        "materia-editar"
    );

    editar.textContent =
        "Editar";

    editar.setAttribute(
        "aria-label",
        `Editar ${materia.nome}`
    );


    editar.addEventListener(
        "click",
        function () {

            editarMateria(
                materia.id
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
        "materia-excluir"
    );

    excluir.textContent =
        "Excluir";

    excluir.setAttribute(
        "aria-label",
        `Excluir ${materia.nome}`
    );


    excluir.addEventListener(
        "click",
        function () {

            excluirMateria(
                materia.id
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
       MONTAR CARD
    ========================== */

    card.appendChild(
        icone
    );

    card.appendChild(
        info
    );

    card.appendChild(
        acoes
    );


    return card;

}


/* =====================================================
   EDITAR MATÉRIA
===================================================== */

function editarMateria(id) {

    const materia =
        materias.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!materia) {
        return;
    }


    materiaEmEdicao =
        materia.id;


    tituloModalMateria.textContent =
        "Editar matéria";


    nomeMateria.value =
        materia.nome;


    professorMateria.value =
        materia.professor || "";


    modalMateria.classList.add(
        "ativo"
    );


    setTimeout(
        function () {

            nomeMateria.focus();

        },
        100
    );

}


/* =====================================================
   EXCLUIR MATÉRIA
===================================================== */

async function excluirMateria(id) {

    const materia =
        materias.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!materia) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja realmente excluir a matéria "${materia.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const {
            error
        } = await nexoSupabase
            .from("materias")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Erro ao excluir matéria:",
                error
            );

            alert(
                "Não foi possível excluir a matéria."
            );

            return;

        }


        await carregarMaterias();


    } catch (erro) {

        console.error(
            "Erro inesperado ao excluir matéria:",
            erro
        );

        alert(
            "Ocorreu um erro ao excluir a matéria."
        );

    }

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
   INICIAR
===================================================== */

async function iniciarPaginaMaterias() {

    usuarioLogado =
        await protegerPagina();


    if (!usuarioLogado) {
        return;
    }


    await carregarMaterias();

}


iniciarPaginaMaterias();