-- Migration 006 — Hub: slug dedicado + controle de acesso
-- Executar no Supabase SQL Editor do projeto compartilhado.
--
-- O que faz:
--   1. Adiciona coluna `slug` (text, unique, nullable) em clients
--      → armazena o slug do Marque Já de forma limpa, sem hack no campo notes
--   2. Adiciona coluna `access_blocked` (boolean, default false) em clients
--      → reflete o estado de ban do usuário no Marque Já (sincronizado via API)
--   3. Backfill automático: tenta popular `slug` a partir da tabela `businesses`
--      para clientes que já têm business_id vinculado

-- ─── 1. Coluna slug ───────────────────────────────────────────────────────────
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- ─── 2. Coluna access_blocked ─────────────────────────────────────────────────
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS access_blocked boolean NOT NULL DEFAULT false;

-- ─── 3. Backfill: preenche slug a partir de businesses para clientes existentes ─
UPDATE clients c
SET    slug = b.slug
FROM   businesses b
WHERE  c.business_id = b.id
  AND  c.slug IS NULL
  AND  c.business_id IS NOT NULL;
