-- Migration 007 — Controle de disparo diário para leads
-- Executar no Supabase SQL Editor do projeto compartilhado.
--
-- O que faz:
--   1. Adiciona coluna `whatsapp_opt_out` (boolean) em leads
--      → marca leads que pediram para não receber mensagens
--   2. Cria tabela `lead_dispatches` para rastrear cada disparo
--      → evita mensagem duplicada no mesmo dia
--      → permite análise de taxa de resposta por lead

-- ─── 1. Opt-out por lead ──────────────────────────────────────────────────────
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out boolean NOT NULL DEFAULT false;

-- ─── 2. Tabela de disparos ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_dispatches (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  message     text        NOT NULL,
  status      text        NOT NULL DEFAULT 'sent',  -- sent | failed | replied
  error       text,
  day_key     date        NOT NULL DEFAULT CURRENT_DATE  -- evita duplicata no mesmo dia
);

-- índice para consulta "disparou hoje?"
CREATE UNIQUE INDEX IF NOT EXISTS lead_dispatches_lead_day_uniq
  ON lead_dispatches(lead_id, day_key);

-- índice para listar disparos por data
CREATE INDEX IF NOT EXISTS lead_dispatches_sent_at_idx
  ON lead_dispatches(sent_at DESC);
