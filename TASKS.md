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

- [ ] **API de Provisionamento** `app/api/provision-client/route.ts`
  - [ ] Cria `auth.user` no Supabase do Marque Já
  - [ ] Cria registro em `businesses`
  - [ ] Insere `business_hours`, `services`, `professionals`, `professional_services`
  - [ ] Salva `business_id` + `slug` na tabela `clients` do Hub

- [ ] **Alterações no Cliente** (ficha do cliente com ações reais)
  - [ ] Editar dados do negócio (nome, WhatsApp, cor)
  - [ ] Adicionar / editar / remover serviços
  - [ ] Adicionar / editar / remover profissionais
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
- [ ] Ver inadimplentes em destaque (overdue com cor vermelha)

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
