// ========================================
// NEXO
// PROTEÇÃO DE AUTENTICAÇÃO
// ========================================


// ========================================
// VERIFICAR USUÁRIO
// ========================================

async function protegerPagina() {

    try {

        const {
            data: { session },
            error
        } = await nexoSupabase.auth.getSession();


        if (error) {

            console.error(
                "Erro ao verificar autenticação:",
                error
            );

            window.location.replace("index.html");

            return null;

        }


        // ========================================
        // NÃO ESTÁ LOGADO
        // ========================================

        if (!session) {

            window.location.replace("index.html");

            return null;

        }


        // ========================================
        // USUÁRIO AUTENTICADO
        // ========================================

        return session.user;


    } catch (erro) {

        console.error(
            "Erro inesperado ao verificar autenticação:",
            erro
        );

        window.location.replace("index.html");

        return null;

    }

}


// ========================================
// LOGOUT
// ========================================

async function sairDoNexo() {

    try {

        const { error } =
            await nexoSupabase.auth.signOut();


        if (error) {

            console.error(
                "Erro ao sair:",
                error
            );

            return false;

        }


        window.location.replace("index.html");

        return true;


    } catch (erro) {

        console.error(
            "Erro inesperado ao sair:",
            erro
        );

        return false;

    }

}


// ========================================
// MONITORAR LOGOUT
// ========================================

nexoSupabase.auth.onAuthStateChange(
    function (evento) {

        if (evento === "SIGNED_OUT") {

            window.location.replace("index.html");

        }

    }
);