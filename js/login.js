// ========================================
// NEXO - LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");
const senha = document.getElementById("senha");

const botaoMostrar = document.getElementById("mostrarSenha");
const loginMensagem = document.getElementById("loginMensagem");

const botaoEntrar = loginForm.querySelector(".botao-login");


// ========================================
// MOSTRAR / OCULTAR SENHA
// ========================================

botaoMostrar.addEventListener("click", function () {

    if (senha.type === "password") {

        senha.type = "text";
        botaoMostrar.textContent = "Ocultar";

    } else {

        senha.type = "password";
        botaoMostrar.textContent = "Mostrar";

    }

});


// ========================================
// MENSAGEM
// ========================================

function mostrarMensagem(texto, tipo = "erro") {

    loginMensagem.textContent = texto;
    loginMensagem.dataset.tipo = tipo;

}


// ========================================
// VERIFICAR SE JÁ ESTÁ LOGADO
// ========================================

async function verificarSessao() {

    const {
        data: { session }
    } = await nexoSupabase.auth.getSession();

    if (session) {
        window.location.href = "dashboard.html";
    }

}

verificarSessao();


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const emailDigitado = email.value.trim();
    const senhaDigitada = senha.value;

    if (!emailDigitado || !senhaDigitada) {

        mostrarMensagem(
            "Preencha seu e-mail e sua senha."
        );

        return;
    }


    // Estado de carregamento

    botaoEntrar.disabled = true;
    botaoEntrar.textContent = "Entrando...";

    mostrarMensagem("");


    try {

        const { data, error } =
            await nexoSupabase.auth.signInWithPassword({

                email: emailDigitado,
                password: senhaDigitada

            });


        if (error) {

            console.error(error);

            mostrarMensagem(
                "E-mail ou senha incorretos."
            );

            return;
        }


        if (!data.session) {

            mostrarMensagem(
                "Não foi possível iniciar sua sessão."
            );

            return;
        }


        mostrarMensagem(
            "Login realizado. Entrando...",
            "sucesso"
        );


        window.location.href = "dashboard.html";


    } catch (erro) {

        console.error(
            "Erro ao realizar login:",
            erro
        );

        mostrarMensagem(
            "Não foi possível conectar ao Nexo. Tente novamente."
        );


    } finally {

        botaoEntrar.disabled = false;
        botaoEntrar.textContent = "Entrar";

    }

});


// ========================================
// ESQUECI MINHA SENHA
// ========================================

const esqueciSenha =
    document.getElementById("esqueciSenha");


esqueciSenha.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        mostrarMensagem(
            "A recuperação de senha será disponibilizada em breve."
        );

    }
);