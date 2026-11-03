-- ==============================================================
-- NK Lucilan • Central de Atualizações e Sugestões
-- Execute uma única vez no Supabase > SQL Editor.
-- Não altera tabelas existentes nem as Edge Functions de push.
-- IMPORTANTE: para ativar seu perfil administrador, veja depois
-- o arquivo SQL_ATIVAR_ADMIN.sql (etapa separada).
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.nk_administradores (
  usuario_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now()
);
-- A proposta possui um único administrador; esta regra impede
-- atribuição acidental de privilégios a uma segunda conta.
CREATE UNIQUE INDEX IF NOT EXISTS nk_administrador_unico
  ON public.nk_administradores ((true));

ALTER TABLE public.nk_administradores ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.nk_administradores FROM anon, authenticated;
GRANT SELECT ON TABLE public.nk_administradores TO authenticated;

DROP POLICY IF EXISTS "NK admins veem propria permissao" ON public.nk_administradores;
CREATE POLICY "NK admins veem propria permissao" ON public.nk_administradores
  FOR SELECT TO authenticated USING (usuario_id = (select auth.uid()));

-- Verificação de privilégio pela identidade autenticada, não pelo nome
-- que pode ser alterado em Minha conta.
CREATE OR REPLACE FUNCTION public.nk_eh_administrador()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.nk_administradores a
    WHERE a.usuario_id = (select auth.uid())
  );
$$;
REVOKE ALL ON FUNCTION public.nk_eh_administrador() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nk_eh_administrador() TO authenticated;

CREATE TABLE IF NOT EXISTS public.nk_comunicados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 3 AND 120),
  mensagem text NOT NULL CHECK (char_length(btrim(mensagem)) BETWEEN 5 AND 5000),
  categoria text NOT NULL DEFAULT 'atualizacao'
    CHECK (categoria IN ('atualizacao', 'importante', 'manutencao')),
  ativo boolean NOT NULL DEFAULT true,
  autor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nk_comunicados ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.nk_comunicados TO authenticated;
DROP POLICY IF EXISTS "NK comunicados visiveis a usuarios" ON public.nk_comunicados;
CREATE POLICY "NK comunicados visiveis a usuarios" ON public.nk_comunicados
  FOR SELECT TO authenticated USING (ativo OR (select public.nk_eh_administrador()));
DROP POLICY IF EXISTS "NK admins criam comunicados" ON public.nk_comunicados;
CREATE POLICY "NK admins criam comunicados" ON public.nk_comunicados
  FOR INSERT TO authenticated WITH CHECK (
    (select public.nk_eh_administrador()) AND autor_id = (select auth.uid())
  );
DROP POLICY IF EXISTS "NK admins editam comunicados" ON public.nk_comunicados;
CREATE POLICY "NK admins editam comunicados" ON public.nk_comunicados
  FOR UPDATE TO authenticated USING ((select public.nk_eh_administrador()))
  WITH CHECK ((select public.nk_eh_administrador()));
DROP POLICY IF EXISTS "NK admins apagam comunicados" ON public.nk_comunicados;
CREATE POLICY "NK admins apagam comunicados" ON public.nk_comunicados
  FOR DELETE TO authenticated USING ((select public.nk_eh_administrador()));

CREATE TABLE IF NOT EXISTS public.nk_comunicados_leituras (
  comunicado_id uuid NOT NULL REFERENCES public.nk_comunicados(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lido_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comunicado_id, usuario_id)
);
ALTER TABLE public.nk_comunicados_leituras ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON TABLE public.nk_comunicados_leituras TO authenticated;
DROP POLICY IF EXISTS "NK usuarios veem suas leituras" ON public.nk_comunicados_leituras;
CREATE POLICY "NK usuarios veem suas leituras" ON public.nk_comunicados_leituras
  FOR SELECT TO authenticated USING (usuario_id = (select auth.uid()));
DROP POLICY IF EXISTS "NK usuarios registram sua leitura" ON public.nk_comunicados_leituras;
CREATE POLICY "NK usuarios registram sua leitura" ON public.nk_comunicados_leituras
  FOR INSERT TO authenticated WITH CHECK (
    usuario_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.nk_comunicados c
      WHERE c.id = comunicado_id AND c.ativo
    )
  );

CREATE TABLE IF NOT EXISTS public.nk_sugestoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_nome text NOT NULL DEFAULT 'Usuário',
  titulo text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 3 AND 120),
  descricao text NOT NULL CHECK (char_length(btrim(descricao)) BETWEEN 5 AND 5000),
  categoria text NOT NULL DEFAULT 'sugestao'
    CHECK (categoria IN ('sugestao','problema')),
  status text NOT NULL DEFAULT 'recebida'
    CHECK (status IN ('recebida','em_analise','em_desenvolvimento','implementada','recusada')),
  resposta_admin text CHECK (resposta_admin IS NULL OR char_length(resposta_admin) <= 5000),
  respondido_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Identifica o autor no banco e impede criar sugestões já "aprovadas".
CREATE OR REPLACE FUNCTION public.nk_preparar_sugestao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  NEW.usuario_id := auth.uid();
  NEW.autor_nome := COALESCE(
    (SELECT p.nome FROM public.perfis p WHERE p.id = auth.uid()),
    'Usuário'
  );
  NEW.status := 'recebida';
  NEW.resposta_admin := NULL;
  NEW.respondido_em := NULL;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS nk_sugestao_identificar_autor ON public.nk_sugestoes;
CREATE TRIGGER nk_sugestao_identificar_autor
BEFORE INSERT ON public.nk_sugestoes FOR EACH ROW
EXECUTE FUNCTION public.nk_preparar_sugestao();

CREATE OR REPLACE FUNCTION public.nk_atualizar_modificado()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS nk_comunicados_atualizar_em ON public.nk_comunicados;
CREATE TRIGGER nk_comunicados_atualizar_em
BEFORE UPDATE ON public.nk_comunicados FOR EACH ROW
EXECUTE FUNCTION public.nk_atualizar_modificado();
DROP TRIGGER IF EXISTS nk_sugestoes_atualizar_em ON public.nk_sugestoes;
CREATE TRIGGER nk_sugestoes_atualizar_em
BEFORE UPDATE ON public.nk_sugestoes FOR EACH ROW
EXECUTE FUNCTION public.nk_atualizar_modificado();

ALTER TABLE public.nk_sugestoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON TABLE public.nk_sugestoes TO authenticated;
DROP POLICY IF EXISTS "NK usuarios leem suas sugestoes e admin le todas" ON public.nk_sugestoes;
CREATE POLICY "NK usuarios leem suas sugestoes e admin le todas" ON public.nk_sugestoes
  FOR SELECT TO authenticated USING (
    usuario_id = (select auth.uid()) OR (select public.nk_eh_administrador())
  );
DROP POLICY IF EXISTS "NK usuarios criam suas sugestoes" ON public.nk_sugestoes;
CREATE POLICY "NK usuarios criam suas sugestoes" ON public.nk_sugestoes
  FOR INSERT TO authenticated WITH CHECK (usuario_id = (select auth.uid()));
DROP POLICY IF EXISTS "NK apenas admin responde sugestoes" ON public.nk_sugestoes;
CREATE POLICY "NK apenas admin responde sugestoes" ON public.nk_sugestoes
  FOR UPDATE TO authenticated USING ((select public.nk_eh_administrador()))
  WITH CHECK ((select public.nk_eh_administrador()));

CREATE INDEX IF NOT EXISTS nk_comunicados_ativos_data
 ON public.nk_comunicados (ativo, criado_em DESC);
CREATE INDEX IF NOT EXISTS nk_sugestoes_autor_data
 ON public.nk_sugestoes (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS nk_sugestoes_status_data
 ON public.nk_sugestoes (status, criado_em DESC);
