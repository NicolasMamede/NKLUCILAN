-- NK Lucilan • Preferências de cores (executar 1 vez no Supabase SQL Editor)
-- Não altera registros existentes, nem políticas de segurança.
ALTER TABLE public.materias
  ADD COLUMN IF NOT EXISTS cor text;
ALTER TABLE public.atividades
  ADD COLUMN IF NOT EXISTS cor_personalizada text;
ALTER TABLE public.provas
  ADD COLUMN IF NOT EXISTS cor_personalizada text;
ALTER TABLE public.trabalhos
  ADD COLUMN IF NOT EXISTS cor_personalizada text;

-- Garante que as cores sejam hexadecimais válidas ou nulas.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nk_materias_cor_hex') THEN
    ALTER TABLE public.materias ADD CONSTRAINT nk_materias_cor_hex
      CHECK (cor IS NULL OR cor ~ '^#[A-Fa-f0-9]{6}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nk_atividades_cor_hex') THEN
    ALTER TABLE public.atividades ADD CONSTRAINT nk_atividades_cor_hex
      CHECK (cor_personalizada IS NULL OR cor_personalizada ~ '^#[A-Fa-f0-9]{6}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nk_provas_cor_hex') THEN
    ALTER TABLE public.provas ADD CONSTRAINT nk_provas_cor_hex
      CHECK (cor_personalizada IS NULL OR cor_personalizada ~ '^#[A-Fa-f0-9]{6}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nk_trabalhos_cor_hex') THEN
    ALTER TABLE public.trabalhos ADD CONSTRAINT nk_trabalhos_cor_hex
      CHECK (cor_personalizada IS NULL OR cor_personalizada ~ '^#[A-Fa-f0-9]{6}$');
  END IF;
END $$;
