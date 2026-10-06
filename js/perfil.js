// ========================================
// NEXO
// PERFIL DO USUÁRIO
// ========================================


// ========================================
// ELEMENTOS
// ========================================

const perfilForm =
    document.getElementById("perfilForm");

const perfilNome =
    document.getElementById("perfilNome");

const perfilEmail =
    document.getElementById("perfilEmail");

const perfilId =
    document.getElementById("perfilId");

const perfilAvatar =
    document.getElementById("perfilAvatar");

const perfilNomeTitulo =
    document.getElementById("perfilNomeTitulo");

const perfilEmailTitulo =
    document.getElementById("perfilEmailTitulo");

const perfilMensagem =
    document.getElementById("perfilMensagem");

const salvarPerfil =
    document.getElementById("salvarPerfil");

const botaoSair =
    document.getElementById("botaoSair");

const usuarioNome =
    document.getElementById("usuarioNome");

const usuarioAvatar =
    document.getElementById("usuarioAvatar");

const usuarioBotao =
    document.getElementById("usuarioBotao");

const menuMobile =
    document.getElementById("menuMobile");

const sidebar =
    document.getElementById("sidebar");


let usuarioAtual = null;


// ========================================
// INICIAIS
// ========================================

function obterIniciais(nome) {

    if (!nome) {
        return "N";
    }

    const partes =
        nome
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (partes.length === 0) {
        return "N";
    }


    if (partes.length === 1) {

        return partes[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
    ).toUpperCase();

}


// ========================================
// MENSAGEM
// ========================================

function mostrarMensagemPerfil(
    texto,
    tipo = "erro"
) {

    perfilMensagem.textContent = texto;
    perfilMensagem.dataset.tipo = tipo;

}


// ========================================
// ATUALIZAR INTERFACE
// ========================================

function atualizarInterfacePerfil(
    nome,
    email
) {

    const iniciais =
        obterIniciais(nome);


    perfilNomeTitulo.textContent =
        nome;

    perfilEmailTitulo.textContent =
        email;


    perfilAvatar.textContent =
        iniciais;

    usuarioAvatar.textContent =
        iniciais;

    usuarioNome.textContent =
        nome;

}


// ========================================
// CARREGAR PERFIL
// ========================================

async function carregarPerfil() {

    usuarioAtual =
        await protegerPagina();


    if (!usuarioAtual) {
        return;
    }


    perfilEmail.value =
        usuarioAtual.email || "";

    perfilEmailTitulo.textContent =
        usuarioAtual.email || "";

    perfilId.value =
        usuarioAtual.id;


    try {

        const {
            data,
            error
        } =
            await nexoSupabase
                .from("perfis")
                .select("nome, avatar_url")
                .eq("id", usuarioAtual.id)
                .single();


        if (error) {

            console.error(
                "Erro ao carregar perfil:",
                error
            );

            mostrarMensagemPerfil(
                "Não foi possível carregar seu perfil."
            );

            return;

        }


        const nome =
            data.nome || "Usuário";


        perfilNome.value =
            nome;


        atualizarInterfacePerfil(
            nome,
            usuarioAtual.email || ""
        );


    } catch (erro) {

        console.error(
            "Erro inesperado:",
            erro
        );

        mostrarMensagemPerfil(
            "Não foi possível carregar seu perfil."
        );

    }

}


// ========================================
// SALVAR PERFIL
// ========================================

perfilForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!usuarioAtual) {
            return;
        }


        const nome =
            perfilNome.value.trim();


        if (nome.length < 2) {

            mostrarMensagemPerfil(
                "Digite um nome válido."
            );

            return;

        }


        salvarPerfil.disabled = true;

        salvarPerfil.textContent =
            "Salvando...";

        mostrarMensagemPerfil("");


        try {

            const {
                error
            } =
                await nexoSupabase
                    .from("perfis")
                    .update({
                        nome: nome
                    })
                    .eq(
                        "id",
                        usuarioAtual.id
                    );


            if (error) {

                console.error(
                    "Erro ao atualizar perfil:",
                    error
                );

                mostrarMensagemPerfil(
                    "Não foi possível salvar as alterações."
                );

                return;

            }


            atualizarInterfacePerfil(
                nome,
                usuarioAtual.email || ""
            );


            mostrarMensagemPerfil(
                "Perfil atualizado com sucesso.",
                "sucesso"
            );


        } catch (erro) {

            console.error(
                "Erro inesperado:",
                erro
            );

            mostrarMensagemPerfil(
                "Não foi possível salvar as alterações."
            );


        } finally {

            salvarPerfil.disabled = false;

            salvarPerfil.textContent =
                "Salvar alterações";

        }

    }
);


// ========================================
// SAIR
// ========================================

botaoSair.addEventListener(
    "click",
    async function () {

        botaoSair.disabled = true;

        botaoSair.textContent =
            "Saindo...";


        const saiu =
            await sairDoNexo();


        if (!saiu) {

            botaoSair.disabled = false;

            botaoSair.textContent =
                "Sair";

            mostrarMensagemPerfil(
                "Não foi possível encerrar sua sessão."
            );

        }

    }
);


// ========================================
// BOTÃO DO USUÁRIO
// ========================================

usuarioBotao.addEventListener(
    "click",
    function () {

        window.location.href =
            "perfil.html";

    }
);


// ========================================
// MENU MOBILE
// ========================================

if (menuMobile && sidebar) {

    menuMobile.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "aberta"
            );

        }
    );

}


// ========================================
// INICIAR
// ========================================

carregarPerfil();