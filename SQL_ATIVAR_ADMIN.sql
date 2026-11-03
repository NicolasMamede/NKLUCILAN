-- ETAPA 1: execute para identificar a sua conta pelo nome.
-- Copie o valor UUID da linha do SEU perfil, conferindo nome.
SELECT id, nome FROM public.perfis ORDER BY nome;

-- ETAPA 2: execute o comando abaixo APÓS substituir o UUID
-- pelo ID do SEU perfil (o mesmo id na tabela auth.users).
-- Retire o comentário '--' antes de INSERT e substitua o texto.
-- INSERT INTO public.nk_administradores (usuario_id)
-- VALUES ('COLE_AQUI_SEU_UUID');

-- ETAPA 3: confira o administrador cadastrado.
SELECT a.usuario_id, p.nome, a.criado_em
FROM public.nk_administradores a
LEFT JOIN public.perfis p ON p.id = a.usuario_id;
