# Hub — Conecta Leste SP
## Gerenciamento de Tarefas

---

## Fase 1 — Estrutura Base ✅

- [x] `app/(hub)/layout.tsx` — shell com Sidebar
- [x] `app/page.tsx` → redirect `/overview`
- [x] `app/(hub)/overview/page.tsx` — MetricCards + próximos vencimentos (mock)
- [x] `components/layout/Sidebar.tsx` — navegação, toggle dark/light, logout
- [x] `components/ui/` — Button, Input, Modal, Badge, Avatar, Spinner
- [x] `middleware.ts` — proteção de rotas, redirect para /login
- [x] `app/login/page.tsx` — página de login

---

## Fase 2 — Módulo Clientes

- [x] `app/(hub)/clientes/page.tsx` — lista de clientes integrada com Supabase
- [ ] `app/(hub)/clientes/[id]/page.tsx` — ficha do cliente (ainda mock, integração pendente)
- [x] **Wizard "Novo Cliente"** — 6 steps completos

  - [x] Step 1: Dados do Negócio (nome, dono, email, WhatsApp, segmento, bairro, slug auto)
  - [x] Step 2: Produtos (checkboxes, preço editável, dia cobrança, toggle Trial/Ativo)
  - [x] Step 3: Marque Já — cor do tema + horários por dia da semana *(condicional)*
  - [x] Step 4: Serviços — nome, preço, duração *(condicional)*
  - [x] Step 5: Profissionais — nome + vinculação de serviços *(condicional)*
  - [x] Step 6: Revisão com resumo completo + MRR calculado
  - [x] Salva cliente + produtos no Supabase ao confirmar

- [x] **API de Provisionamento** `app/api/provision-client/route.ts`
  - [x] Cria `auth.user` no Supabase do Marque Já (via `createServerSupabaseAdminClient`)
  - [x] Cria registro em `businesses` com slug, cor, WhatsApp, endereço
  - [x] Insere `business_hours` (usa defaults seg-sáb 09h-18h se não informado)
  - [x] Insere `services` com nome, preço, duração
  - [x] Insere `professionals` + vincula `professional_services` por índice
  - [x] Atualiza `business_id` na tabela `clients` do Hub
  - [x] Retorna `slug` + `temp_password` para exibição no Wizard

- [x] **`lib/supabase/server.ts`** — adicionada `createServerSupabaseAdminClient` (service role para acessar Marque Já)
- [x] **`lib/supabase/hub.ts`** — adicionadas funções `getClientById` e `updateClient`
- [x] **`app/api/clients/[id]/route.ts`** — PATCH para atualizar dados do cliente (nome, dono, email, phone, segmento, bairro, status, notas)

- [x] **Ficha do Cliente** `app/(hub)/clientes/[id]/page.tsx` + `components/clientes/ClienteDetailView.tsx`
  - [x] Carrega dados reais do Supabase via `getClientById` (cliente + produtos + pagamentos)
  - [x] Exibe dados do negócio com badges de status e segmento
  - [x] Modal de edição inline dos dados do cliente (chama `PATCH /api/clients/[id]`)
  - [x] Lista de produtos contratados com valor e status
  - [x] Histórico de pagamentos (últimos do Supabase)
  - [x] Link direto para o painel Marque Já quando `business_id` está presente

- [x] **Wizard "Novo Cliente"** — integração com provisionamento
  - [x] Após salvar cliente no Hub, chama `/api/provision-client` se produto `marque_já` está ativo
  - [x] Exibe resultado: slug, senha provisória e link para o painel do cliente
  - [x] Erros de provisionamento não bloqueiam criação do cliente no Hub

- [x] **Leads — Botão "Converter em Cliente"** `app/(hub)/leads/page.tsx`
  - [x] Botão no modal de detalhes do lead abre Wizard preenchido com dados do lead
  - [x] Ao confirmar wizard, atualiza status do lead para "won"

- [x] **Alterações no Cliente** (ações adicionais na ficha)
  - [x] Editar produto contratado inline (preço, status, dia de cobrança) — `PATCH /api/clients/[id]/products/[productId]`
  - [x] Adicionar novo produto — `POST /api/clients/[id]/products`
  - [ ] Editar horários de funcionamento
  - [ ] Criar bloqueio (folga, feriado, férias)

---

## Fase 3 — Módulo Leads

- [x] `app/(hub)/leads/page.tsx` — aba Prospecção + aba Pipeline
- [x] **Aba Prospecção** — busca por bairro + segmento, tabela com score, botão Captar
- [x] `app/api/leads/search/route.ts` — Google Places API real + scoring automático (0–3)
- [x] **Aba Pipeline** — grid 5 colunas, cards clicáveis, modal de detalhes, alterar status
- [x] Origens: Prospecção, Indicação, Abordagem, Instagram, Google Maps
- [x] Status: Novo, Contatado, Em negociação, Não fechado, Ganho, Perdido
- [x] Pipeline lendo dados reais do Supabase
- [ ] Botão "Converter em Cliente" abrindo o Wizard preenchido

### Automação WhatsApp (fase futura)
- [ ] Template de mensagem por segmento (baseado nos gaps do score)
- [ ] `app/api/leads/send-whatsapp/route.ts` — via Evolution API
- [ ] Evolution API self-hosted + N8N para orquestração
- [ ] Webhook bidirecional — lead responde → chatbot qualifica

---

## Fase 4 — Módulo Financeiro

- [x] `app/(hub)/financeiro/page.tsx` — integrado com Supabase (dados reais do mês)
- [x] Marcar pagamento como recebido (`PATCH /api/payments/mark-paid`)
- [x] MRR recebido por produto (card lateral)
- [x] Ver inadimplentes em destaque — seção "Em Atraso" com fundo vermelho, contagem e total

---

## Fase 5 — Banco de Dados (Supabase Hub)

- [x] Migration 004: tabelas `clients`, `client_products`, `payments`, `leads`, `hub_admins`
- [x] Migration 005: RLS — só hub_admins têm acesso (`is_hub_admin()`)
- [x] Usuário admin inserido em `hub_admins` + login funcionando
- [x] `types/database.ts` — tipos completos de todas as tabelas do Hub
- [x] `lib/supabase/hub.ts` — funções de query reutilizáveis (server-side)
- [x] `app/api/clients/route.ts` — POST para criar cliente
- [x] Integrar `app/(hub)/clientes/page.tsx` com dados reais do Supabase
- [x] Integrar `app/(hub)/overview/page.tsx` com métricas reais
- [x] Integrar `app/(hub)/financeiro/page.tsx` com dados reais (+ API mark-paid)
- [x] Integrar `app/(hub)/leads/page.tsx` — captar salva no Supabase, pipeline carrega do banco, editar status/notas persiste

---

## Fase 6 — Deploy

- [ ] Deploy na Vercel
- [ ] Domínio `hub.conectaleste.com.br`
- [ ] Variáveis de ambiente configuradas na Vercel

---

## Fase 7 — Curadoria UX / Polimento

> Levantamento completo em `CURADORIA.md`. Todos os 15 itens implementados.

- [x] **Fix colunas tabela "Próximos Vencimentos"** — grid corrigido de 5 para 6 colunas (`OverviewView.tsx`)
- [x] **Configurações reais** — e-mail via Supabase Auth, dados da agência editáveis (localStorage), `resetPasswordForEmail` funcional, toast de feedback (`configuracoes/page.tsx`)
- [x] **Inadimplentes em destaque** — seção "Em Atraso" no topo do Financeiro com total e ações de marcar pago (`FinanceiroView.tsx`)
- [x] **Badges de alerta na Sidebar e Drawer mobile** — badge vermelho em Financeiro (overdue) e Leads (novos), poll a cada 60s via `GET /api/alerts` (`Sidebar.tsx`, `MobileHeader.tsx`)
- [x] **Tempo no status no Pipeline** — "há X dias" em cada card do pipeline com helper `daysAgo` (`leads/page.tsx`)
- [x] **Filtro de período no Financeiro** — seletor ‹ Mês Ano › com navegação, recarrega via `GET /api/payments?year=&month=` (`FinanceiroView.tsx`, `api/payments/route.ts`)
- [x] **Gráfico de MRR no Overview** — sparkline SVG puro (linha + área gradiente + pontos), 6 meses, via `GET /api/mrr-history` (`OverviewView.tsx`, `api/mrr-history/route.ts`)
- [x] **Template WhatsApp por segmento** — caixa verde no modal do lead com mensagem pré-formatada e botão copiar (`leads/page.tsx`)
- [x] **Confirmar marcar como pago** — confirmação de dois passos inline "Confirmar? Sim / ✕" sem modal (`FinanceiroView.tsx`)
- [x] **Estado vazio útil no Pipeline** — empty state com ícone, texto contextual e CTA "Ir para Prospecção" (`leads/page.tsx`)
- [x] **Breadcrumb na ficha do cliente** — `← Clientes / Nome do Negócio` substituindo o BackLink simples (`ClienteDetailView.tsx`)
- [x] **Exportar cobrança CSV** — botão no header do Financeiro, arquivo BOM UTF-8, nome com mês/ano (`FinanceiroView.tsx`)
- [x] **Busca global ⌘K** — modal com debounce 280ms, navegação teclado ↑↓ Enter Esc, busca em clientes + leads via `GET /api/search`, badge por tipo, botão na sidebar desktop (`GlobalSearch.tsx`, `Sidebar.tsx`, `api/search/route.ts`)
- [x] **Edição inline de produto** — formulário colapsável por produto: preço, status, dia de cobrança + adicionar novo produto com seletor completo (`ClienteDetailView.tsx`, `api/clients/[id]/products/route.ts`, `api/clients/[id]/products/[productId]/route.ts`)
