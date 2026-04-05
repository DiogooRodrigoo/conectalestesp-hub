# Curadoria do Hub — Conecta Leste SP

> Levantamento de melhorias, bugs e novas funcionalidades para o Hub.
> Itens organizados por prioridade. Marcar como `[x]` conforme concluído.

---

## Bugs / Inconsistências

- [x] **#1 — Fix colunas tabela "Próximos Vencimentos"** `XS`
  - `TableHeader` tinha 5 colunas no grid mas renderizava 6 `<TH>` — corrigido para 6 colunas
  - Arquivo: `components/overview/OverviewView.tsx`

- [x] **#2 — Configurações com dados hardcoded** `S`
  - E-mail carregado via `Supabase Auth`. Dados da agência editáveis com persistência em `localStorage`. Botão "Alterar senha" funcional via `auth.resetPasswordForEmail`. Toast de feedback.
  - Arquivo: `app/(hub)/configuracoes/page.tsx`

---

## Alta Prioridade

- [x] **#3 — Inadimplentes em destaque no Financeiro** `S`
  - Seção "Em Atraso" adicionada no topo com fundo vermelho sutil, contagem e total da dívida
  - Arquivo: `components/financeiro/FinanceiroView.tsx`

- [x] **#4 — Badges de alerta na Sidebar** `S`
  - Badge vermelho em "Financeiro" (overdue) e "Leads" (novos) — atualiza a cada 60s via `/api/alerts`
  - Arquivos: `components/layout/Sidebar.tsx`, `components/layout/MobileHeader.tsx`, `app/api/alerts/route.ts`

- [x] **#5 — Mobile: Sidebar com drawer hambúrguer** `M`
  - Já implementado via `MobileHeader.tsx` — drawer completo com backdrop, animação e badges de alerta adicionados
  - Arquivos: `components/layout/MobileHeader.tsx`

- [x] **#6 — Ações pendentes na Ficha do Cliente** `M`
  - Edição inline de produto (preço, status, dia de cobrança) com formulário colapsável por item
  - Adição de novo produto com seletor de tipo, preço, dia e status
  - APIs: `POST /api/clients/[id]/products` e `PATCH /api/clients/[id]/products/[productId]`
  - Arquivo: `components/clientes/ClienteDetailView.tsx`

---

## Média Prioridade

- [x] **#7 — Tempo no status no Pipeline de Leads** `XS`
  - "há X dias" exibido em cada card do pipeline com ícone de calendário
  - Arquivo: `app/(hub)/leads/page.tsx`

- [x] **#8 — Filtro de período no Financeiro** `S`
  - Seletor ‹ Mês Ano › no header — navega meses anteriores e recarrega dados via `/api/payments?year=&month=`
  - Arquivos: `components/financeiro/FinanceiroView.tsx`, `app/api/payments/route.ts`

- [x] **#9 — Gráfico de MRR no Overview** `M`
  - Gráfico SVG puro (sem biblioteca) com linha, área gradiente e pontos interativos
  - Busca histórico dos últimos 6 meses via `/api/mrr-history`
  - Arquivos: `components/overview/OverviewView.tsx`, `app/api/mrr-history/route.ts`, `lib/supabase/hub.ts`

- [x] **#10 — Template de mensagem WhatsApp por segmento** `M`
  - Caixa verde no modal do lead com mensagem pré-formatada por segmento + botão copiar
  - Arquivo: `app/(hub)/leads/page.tsx`

---

## Polimento UX

- [x] **#11 — Confirmar antes de marcar como pago** `XS`
  - Confirmação de dois passos inline: "Confirmar? [Sim] [✕]" sem modal
  - Arquivo: `components/financeiro/FinanceiroView.tsx`

- [x] **#12 — Estado vazio útil no Pipeline** `XS`
  - Empty state com ícone, texto contextual e botão "Ir para Prospecção"
  - Arquivo: `app/(hub)/leads/page.tsx`

- [x] **#13 — Breadcrumb na ficha do cliente** `XS`
  - `← Clientes / Nome do Negócio` substituindo o BackLink simples
  - Arquivo: `components/clientes/ClienteDetailView.tsx`

- [x] **#14 — Exportar cobrança CSV** `S`
  - Botão "Exportar CSV" no header do Financeiro — gera arquivo com BOM UTF-8 para Excel, nome inclui mês/ano atual
  - Arquivo: `components/financeiro/FinanceiroView.tsx`

- [x] **#15 — Busca global (Cmd+K)** `M`
  - Modal de busca com atalho ⌘K/Ctrl+K, resultados em tempo real (debounce 280ms), navegação por teclado (↑↓ Enter Esc), badge por tipo (cliente/lead)
  - Arquivos: `components/layout/GlobalSearch.tsx`, `components/layout/Sidebar.tsx`, `app/api/search/route.ts`

---

## ✅ Curadoria completa — todos os 15 itens implementados

---

## Legenda de Esforço

| Sigla | Descrição |
|-------|-----------|
| XS | < 1h, mudança pontual |
| S | 1–3h, lógica simples |
| M | 3–8h, múltiplos arquivos |
| L | > 8h, feature completa |
