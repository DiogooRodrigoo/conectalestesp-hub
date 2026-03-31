# 🏢 Hub — Conecta Leste SP
## Plano Completo de Desenvolvimento

**O que é:** Painel interno da agência para gerenciar clientes, leads, financeiro e produtos contratados.
**Quem usa:** Apenas você (dono da Conecta Leste SP).
**URL futura:** `hub.conectaleste.com.br`

---

## 🎯 Regra Operacional Central

Quando você fechar um novo cliente:
1. Você entra no Hub → Clientes → Novo Cliente
2. Preenche: nome, segmento, email, slug, produto contratado, valor mensal
3. O Hub cria automaticamente no Supabase do Marque Já:
   - Registro na tabela `businesses`
   - Usuário em `auth.users` com email + senha provisória
4. O cliente recebe email com link do painel e senha para trocar
5. Você já vê o cliente listado no Hub com status "Ativo"

---

## 🗄️ Banco de Dados — Supabase próprio do Hub

> O Hub tem seu **próprio projeto Supabase**, separado do Marque Já.
> Os dois projetos se comunicam via **Supabase Service Role Key** quando necessário.

### Tabelas do Hub

```sql
-- Clientes da agência
clients (
  id uuid PRIMARY KEY,
  name text,                        -- nome do estabelecimento
  owner_name text,                  -- nome do dono
  owner_email text,                 -- email de acesso ao produto
  phone text,                       -- WhatsApp do dono
  segment text,                     -- barbearia | salão | clínica | loja | etc
  neighborhood text,                -- bairro (Zona Leste SP)
  status text,                      -- active | inactive | trial | cancelled
  created_at timestamptz
)

-- Produtos contratados por cliente
client_products (
  id uuid PRIMARY KEY,
  client_id uuid REFERENCES clients,
  product text,                     -- marque_ja | social_media | vitrine | persona_ia
  status text,                      -- active | paused | cancelled
  monthly_price_cents int,          -- valor cobrado em centavos
  billing_day int,                  -- dia do mês para cobrança (ex: 5)
  started_at date,
  cancelled_at date
)

-- Pagamentos mensais
payments (
  id uuid PRIMARY KEY,
  client_id uuid REFERENCES clients,
  product_id uuid REFERENCES client_products,
  amount_cents int,
  due_date date,
  paid_at timestamptz,
  status text,                      -- pending | paid | overdue
  payment_method text               -- pix | boleto | cartao
)

-- Leads em prospecção
leads (
  id uuid PRIMARY KEY,
  name text,
  phone text,
  segment text,
  neighborhood text,
  source text,                      -- google_maps | indicacao | abordagem | instagram
  status text,                      -- new | contacted | negotiating | won | lost
  notes text,
  created_at timestamptz,
  last_contact_at timestamptz
)

-- Referência ao negócio criado no Supabase do Marque Já
-- (armazena o business_id para consultas cruzadas quando necessário)
client_marque_ja (
  client_id uuid REFERENCES clients,
  marque_ja_business_id uuid,       -- ID na tabela businesses do Marque Já
  marque_ja_slug text,
  marque_ja_owner_email text
)
```

---

## 📱 Módulos e Páginas

### 1. Overview `/overview`
Visão geral da agência em números.

**Dados exibidos:**
- Total de clientes ativos
- MRR (Receita Recorrente Mensal) = soma de todos os `monthly_price_cents` ativos
- Pagamentos pendentes do mês
- Leads em negociação
- Clientes novos este mês

**Componentes:** 5 MetricCards + lista de próximos vencimentos

---

### 2. Clientes `/clientes`
Carteira completa de clientes ativos.

**Funcionalidades:**
- Listar todos os clientes com status, segmento e MRR individual
- Filtrar por status (ativo, trial, inativo)
- Abrir ficha do cliente: dados, produtos contratados, histórico de pagamentos
- Botão "Novo Cliente" → modal de cadastro
- Ao cadastrar: criar automaticamente no Supabase do Marque Já (se produto for marque_ja)

**Ficha do cliente inclui:**
- Dados gerais (nome, dono, telefone, bairro)
- Produtos contratados com valor e status
- Histórico de pagamentos (últimos 6 meses)
- Link direto para o painel do cliente no Marque Já
- Link público de agendamento

---

### 3. Leads `/leads`
Gestão do funil de prospecção.

**Funcionalidades:**
- Kanban ou lista por status: Novo → Contatado → Em negociação → Ganho / Perdido
- Adicionar lead manualmente
- Registrar contato (nota + data)
- Converter lead em cliente (abre modal de cadastro já preenchido)

---

### 4. Financeiro `/financeiro`
Controle de mensalidades e pagamentos.

**Funcionalidades:**
- Calendário de vencimentos do mês
- Marcar pagamento como recebido
- Ver inadimplentes
- MRR por produto (quanto vem do Marque Já, quanto vem de Social Media, etc.)
- Exportar relatório mensal

---

### 5. Configurações `/configuracoes`
Dados da agência e integrações.

---

## 🔌 Regras de Conexão e Integração

### Hub ↔ Marque Já
Quando um cliente é cadastrado no Hub com produto `marque_ja`:

```
Hub chama API Route interna → /api/provision-client
  → usa MARQUE_JA_SERVICE_ROLE_KEY (env do Hub)
  → cria auth.user no Supabase do Marque Já
  → cria registro em businesses
  → salva marque_ja_business_id na tabela client_marque_ja do Hub
  → (futuro) envia email para o cliente com credenciais
```

### Variáveis de ambiente do Hub
```
# Supabase do Hub (próprio)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Supabase do Marque Já (para provisionar clientes)
MARQUE_JA_SUPABASE_URL=https://xyshrrgogkqguofpneie.supabase.co
MARQUE_JA_SERVICE_ROLE_KEY=   ← service_role do projeto Marque Já
```

---

## 🎨 Design System

**Regra:** reutilizar tudo do Marque Já.

| O que copiar | De onde |
|---|---|
| `components/ui/` completa | `marque-ja/frontend/components/ui/` |
| `app/styles/global.ts` | `marque-ja/frontend/app/styles/global.ts` |
| `app/lib/registry.tsx` | `marque-ja/frontend/app/lib/registry.tsx` |
| `app/layout.tsx` (base) | adaptar do Marque Já |
| Sidebar layout | adaptar `app/dashboard/layout.tsx` |

**Mesmas variáveis CSS, mesma paleta, mesmos componentes.** O Hub deve parecer parte da mesma família de produtos.

---

## ✅ Checklist de Desenvolvimento

### Fase 1 — Estrutura base
- [ ] `npm install` na pasta `/hub`
- [ ] Copiar `components/ui/` do Marque Já
- [ ] Copiar `app/styles/global.ts`
- [ ] Copiar `app/lib/registry.tsx`
- [ ] Criar `app/layout.tsx`
- [ ] Criar `app/dashboard/layout.tsx` (Sidebar com módulos do Hub)
- [ ] Criar `app/page.tsx` → redirect para `/overview`
- [ ] Criar `middleware.ts` → proteger todas as rotas

### Fase 2 — Páginas com mock data
- [ ] `app/overview/page.tsx` — MetricCards + vencimentos
- [ ] `app/clientes/page.tsx` — lista + modal de cadastro
- [ ] `app/clientes/[id]/page.tsx` — ficha do cliente
- [ ] `app/leads/page.tsx` — lista/kanban de leads
- [ ] `app/financeiro/page.tsx` — calendário de pagamentos
- [ ] `app/configuracoes/page.tsx` — dados da agência

### Fase 3 — Supabase do Hub
- [ ] Criar projeto no Supabase
- [ ] Escrever e executar migrations (tabelas acima)
- [ ] Configurar RLS (só o dono acessa tudo)
- [ ] Configurar `.env.local`
- [ ] Substituir mock data por queries reais

### Fase 4 — Integração com Marque Já
- [ ] Criar `app/api/provision-client/route.ts`
- [ ] Testar provisionamento: cadastrar cliente no Hub → verificar criação no Marque Já
- [ ] Adicionar link "Abrir painel" na ficha do cliente

### Fase 5 — Deploy
- [ ] Deploy na Vercel
- [ ] Domínio `hub.conectaleste.com.br`
- [ ] Variáveis de ambiente configuradas na Vercel

---

## 📦 Estrutura de Pastas

```
hub/
├── PLAN.md                        ← este arquivo
├── package.json
├── next.config.ts
├── tsconfig.json
├── middleware.ts
├── .env.local.example
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   → redirect /overview
│   ├── lib/registry.tsx
│   ├── styles/global.ts
│   ├── login/page.tsx
│   ├── overview/page.tsx
│   ├── clientes/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── leads/page.tsx
│   ├── financeiro/page.tsx
│   ├── configuracoes/page.tsx
│   └── api/
│       └── provision-client/route.ts
├── components/
│   ├── ui/                        ← copiado do Marque Já
│   └── layout/
│       └── Sidebar.tsx
└── types/
    └── database.ts                ← tipos das tabelas do Hub
```
