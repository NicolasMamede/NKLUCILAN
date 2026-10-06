// ========================================
// NEXO
// USUÁRIO COMPARTILHADO
// ========================================

let usuarioNexo = null;
let perfilNexo = null;


// ========================================
// GERAR INICIAIS
// ========================================

function gerarIniciaisUsuario(nome) {

    const partes = String(nome || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) {
        return "U";
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
// ATUALIZAR INTERFACE
// ========================================

function atualizarUsuarioNaInterface(perfil) {

    const nome =
        perfil?.nome || "Usuário";

    const iniciais =
        gerarIniciaisUsuario(nome);


    // Nome da sidebar

    const usuarioNome =
        document.getElementById("usuarioNome");

    if (usuarioNome) {
        usuarioNome.textContent = nome;
    }


    // Avatar da sidebar

    const usuarioAvatar =
        document.getElementById("usuarioAvatar");

    if (usuarioAvatar) {
        usuarioAvatar.textContent = iniciais;
    }


    // Caso alguma página possua boas-vindas

    const nomeBoasVindas =
        document.getElementById("nomeBoasVindas");

    if (nomeBoasVindas) {
        nomeBoasVindas.textContent = nome;
    }

}


// ========================================
// CARREGAR PERFIL
// ========================================

async function carregarUsuarioNexo() {

    try {

        usuarioNexo =
            await protegerPagina();

        if (!usuarioNexo) {
            return null;
        }


        const { data: perfil, error } =
            await nexoSupabase
                .from("perfis")
                .select("nome, avatar_url")
                .eq("id", usuarioNexo.id)
                .single();


        if (error) {

            console.error(
                "Erro ao carregar perfil do usuário:",
                error
            );

            return usuarioNexo;
        }


        perfilNexo = perfil;

        atualizarUsuarioNaInterface(
            perfil
        );


        return usuarioNexo;

    } catch (erro) {

        console.error(
            "Erro inesperado ao carregar usuário:",
            erro
        );

        return null;
    }

}


// ========================================
// ABRIR PERFIL
// ========================================

function configurarBotaoPerfil() {

    const usuarioBotao =
        document.getElementById(
            "usuarioBotao"
        );

    if (!usuarioBotao) {
        return;
    }


    usuarioBotao.addEventListener(
        "click",
        function () {

            window.location.href =
                "perfil.html";

        }
    );

}


// ========================================
// INICIALIZAR
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        configurarBotaoPerfil();

        await carregarUsuarioNexo();

    }
);