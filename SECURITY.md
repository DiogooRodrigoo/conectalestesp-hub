# Security Checklist — Conecta Leste SP Hub

> Painel interno SaaS/CRM. Acesso exclusivo do dono da agência.
> Última revisão: 2026-03-29

---

## Legenda de Status

| Status | Significado |
|---|---|
| [x] IMPLEMENTADO | Controle ativo e verificado |
| [ ] PENDENTE | Necessário, ainda não feito |
| [N/A] NÃO APLICÁVEL | Fora do escopo deste projeto |

---

## 1. Autenticação e Autorização

| # | Controle | Status | Notas |
|---|---|---|---|
| 1.1 | Autenticação via Supabase Auth (email + senha) | [x] IMPLEMENTADO | Configurado via `@supabase/ssr` |
| 1.2 | Middleware protege todas as rotas exceto `/login` | [x] IMPLEMENTADO | `middleware.ts` na raiz do projeto |
| 1.3 | Redirect para `/login` se sessão inválida ou expirada | [x] IMPLEMENTADO | Verificação SSR no middleware |
| 1.4 | Redirect para `/overview` se usuário autenticado tentar acessar `/login` | [x] IMPLEMENTADO | Evita duplo login |
| 1.5 | Sessão verificada server-side (SSR), nunca só client-side | [x] IMPLEMENTADO | `createServerClient` com cookies |
| 1.6 | Token de sessão armazenado em cookie HttpOnly | [x] IMPLEMENTADO | Padrão do `@supabase/ssr` |
| 1.7 | Expiração de sessão configurada no Supabase | [ ] PENDENTE | Definir no painel Supabase: Auth > Settings > JWT Expiry (recomendado: 3600s) |
| 1.8 | MFA habilitado para o dono da agência | [ ] PENDENTE | Habilitar TOTP no Supabase Auth > MFA |
| 1.9 | Política de senha forte no Supabase | [ ] PENDENTE | Auth > Password Settings: mín 12 chars, complexidade |
| 1.10 | Proteção contra brute-force (rate limit de login) | [ ] PENDENTE | Supabase aplica limit nativo; verificar no painel |
| 1.11 | Single-user: confirmar que cadastro de novos usuários está DESABILITADO | [ ] PENDENTE | Supabase Auth > Settings > desabilitar "Enable email confirmations" para signup público ou usar `allowedEmailDomains` |

---

## 2. Segurança de API Routes

| # | Controle | Status | Notas |
|---|---|---|---|
| 2.1 | Toda API Route verifica sessão antes de processar | [ ] PENDENTE | Usar `createServerSupabaseClient()` e checar `getUser()` |
| 2.2 | Retorno de erro 401 para requisições não autenticadas | [ ] PENDENTE | Implementar em cada handler |
| 2.3 | Retorno de erro 403 (nunca 404) para recursos de outro usuário | [N/A] NÃO APLICÁVEL | Projeto single-user, não há multi-tenancy |
| 2.4 | Nenhum endpoint expõe `service_role` key | [x] IMPLEMENTADO | `SUPABASE_SERVICE_ROLE_KEY` nunca em `NEXT_PUBLIC_*` |
| 2.5 | Validação de schema em todos os inputs de API (Zod ou similar) | [ ] PENDENTE | Instalar `zod` e criar schemas antes de processar body |
| 2.6 | Sanitização de inputs antes de queries SQL | [ ] PENDENTE | Usar sempre queries parametrizadas do Supabase client |
| 2.7 | Respostas de erro não expõem stack traces ou detalhes internos | [ ] PENDENTE | Centralizar error handler com mensagens genéricas |
| 2.8 | Método HTTP verificado (GET não muta estado) | [ ] PENDENTE | Checar `request.method` nos handlers |
| 2.9 | Nenhum uso de `eval()`, `Function()`, ou `new Function()` | [x] IMPLEMENTADO | ESLint `no-eval` habilitado na config |

---

## 3. Variáveis de Ambiente

| # | Controle | Status | Notas |
|---|---|---|---|
| 3.1 | `.env.local` no `.gitignore` | [x] IMPLEMENTADO | `.gitignore` criado cobrindo todos os `.env*` |
| 3.2 | `.env.local.example` documentado sem valores reais | [x] IMPLEMENTADO | Arquivo criado com comentários explicativos |
| 3.3 | `SUPABASE_SERVICE_ROLE_KEY` NUNCA em variável `NEXT_PUBLIC_*` | [x] IMPLEMENTADO | Convenção de nomenclatura respeitada |
| 3.4 | Variáveis de produção definidas no painel Vercel (não em arquivo) | [ ] PENDENTE | Configurar em vercel.com > Project > Settings > Environment Variables |
| 3.5 | Rotação de `service_role` key em caso de exposição acidental | [ ] PENDENTE | Procedimento: Supabase > Settings > API > Regenerate |
| 3.6 | Nenhuma secret commitada no histórico git | [ ] PENDENTE | Rodar `git log --all --full-history -- '**/.env*'` para verificar |

---

## 4. Headers HTTP de Segurança

| # | Controle | Status | Notas |
|---|---|---|---|
| 4.1 | `Content-Security-Policy` configurado | [x] IMPLEMENTADO | `next.config.ts` — ajustado para Supabase + Vercel |
| 4.2 | `X-Frame-Options: DENY` | [x] IMPLEMENTADO | `next.config.ts` |
| 4.3 | `X-Content-Type-Options: nosniff` | [x] IMPLEMENTADO | `next.config.ts` |
| 4.4 | `Referrer-Policy: strict-origin-when-cross-origin` | [x] IMPLEMENTADO | `next.config.ts` |
| 4.5 | `Permissions-Policy` restritiva | [x] IMPLEMENTADO | `next.config.ts` — camera, mic, geolocation bloqueados |
| 4.6 | `Strict-Transport-Security` (HSTS) | [x] IMPLEMENTADO | `next.config.ts` — 1 ano + subdomains + preload |
| 4.7 | `X-XSS-Protection: 1; mode=block` | [x] IMPLEMENTADO | `next.config.ts` — para browsers legados |
| 4.8 | Header `Server` não expõe versão do framework | [x] IMPLEMENTADO | Next.js remove por padrão; `X-Powered-By` desabilitado |
| 4.9 | Verificar headers em produção via securityheaders.com | [ ] PENDENTE | Rodar após deploy na Vercel |

---

## 5. Input Validation e Sanitização

| # | Controle | Status | Notas |
|---|---|---|---|
| 5.1 | Biblioteca de validação de schema instalada (Zod) | [ ] PENDENTE | `npm install zod` |
| 5.2 | Validação no servidor, não apenas no cliente | [ ] PENDENTE | Nunca confiar em validação client-side isolada |
| 5.3 | Queries SQL via Supabase client (nunca string concatenation) | [ ] PENDENTE | Usar `.select()`, `.eq()`, `.insert()` — nunca `rpc` com input raw |
| 5.4 | Sanitização de HTML antes de renderizar conteúdo dinâmico | [ ] PENDENTE | Instalar `dompurify` se houver rich text; evitar `dangerouslySetInnerHTML` |
| 5.5 | Paths de arquivo validados (path traversal prevention) | [ ] PENDENTE | Aplicar quando houver upload de arquivos |
| 5.6 | Validação de URLs externas antes de fetch (SSRF prevention) | [ ] PENDENTE | Whitelist de domínios permitidos nas API Routes que fazem fetch |

---

## 6. Rate Limiting

| # | Controle | Status | Notas |
|---|---|---|---|
| 6.1 | Rate limiting no endpoint de login | [ ] PENDENTE | Supabase Auth tem limite nativo; verificar configuração |
| 6.2 | Rate limiting em API Routes sensíveis | [ ] PENDENTE | Implementar com `@upstash/ratelimit` + Upstash Redis, ou middleware simples por IP |
| 6.3 | Proteção contra enumeração de usuários | [ ] PENDENTE | Garantir que mensagens de erro de login sejam genéricas ("Credenciais inválidas") |
| 6.4 | Limitar tamanho de payload nas API Routes | [ ] PENDENTE | `next.config.ts` `bodyParser.sizeLimit` ou verificar no handler |

---

## 7. Proteção CSRF

| # | Controle | Status | Notas |
|---|---|---|---|
| 7.1 | Supabase Auth usa cookies `SameSite=Lax` por padrão | [x] IMPLEMENTADO | Proteção CSRF nativa do `@supabase/ssr` |
| 7.2 | API Routes que mutam estado verificam `Content-Type: application/json` | [ ] PENDENTE | Implementar verificação no handler |
| 7.3 | Origem verificada para requisições sensíveis | [ ] PENDENTE | Checar `request.headers.get('origin')` contra `NEXT_PUBLIC_APP_URL` |

---

## 8. Segurança do Banco — Supabase RLS

| # | Controle | Status | Notas |
|---|---|---|---|
| 8.1 | Row Level Security (RLS) habilitado em TODAS as tabelas | [ ] PENDENTE | Supabase > Table Editor > RLS: Enable para cada tabela |
| 8.2 | Política padrão `DENY ALL` (sem policy = sem acesso via anon/authenticated) | [ ] PENDENTE | Verificar que nenhuma tabela tem RLS desabilitado |
| 8.3 | Políticas RLS restritas ao `auth.uid()` do dono | [ ] PENDENTE | `USING (auth.uid() = owner_id)` em cada policy |
| 8.4 | Chave `anon` só acessa o necessário para login (tabela `auth.*`) | [x] IMPLEMENTADO | Por padrão Supabase restringe `anon` ao schema público |
| 8.5 | `service_role` usada APENAS em operações administrativas server-side | [x] IMPLEMENTADO | Apenas em `server.ts` com `createServerSupabaseClientWithServiceRole()` |
| 8.6 | Backups automáticos habilitados no Supabase | [ ] PENDENTE | Supabase Pro: Settings > Backups |
| 8.7 | Extensões desnecessárias desabilitadas no banco | [ ] PENDENTE | Database > Extensions: revisar e desabilitar o que não usar |
| 8.8 | Nenhuma tabela exposta via `public` schema sem RLS | [ ] PENDENTE | Auditar com `SELECT tablename FROM pg_tables WHERE schemaname='public'` |

---

## 9. Secrets e Chaves

| # | Controle | Status | Notas |
|---|---|---|---|
| 9.1 | Nenhuma chave hardcoded no código-fonte | [x] IMPLEMENTADO | ESLint `no-hardcoded-credentials` via plugin:security |
| 9.2 | `.gitignore` cobre todos os arquivos `.env*` | [x] IMPLEMENTADO | `.gitignore` criado |
| 9.3 | Secrets de produção armazenados na Vercel, não em arquivo | [ ] PENDENTE | Configurar no painel Vercel |
| 9.4 | Processo de rotação de chaves documentado | [ ] PENDENTE | Documentar SOP em wiki interna |
| 9.5 | Gitleaks ou similar rodando no CI para detectar secrets | [ ] PENDENTE | Adicionar GitHub Action com `gitleaks/gitleaks-action@v2` |
| 9.6 | Chaves de APIs de terceiros (Google Maps, etc.) com restrição de domínio | [ ] PENDENTE | Google Cloud Console: restringir API key ao domínio de produção |

---

## 10. Logging e Monitoramento

| # | Controle | Status | Notas |
|---|---|---|---|
| 10.1 | Logs de autenticação habilitados no Supabase | [ ] PENDENTE | Supabase > Logs > Auth Logs — verificar retenção |
| 10.2 | Logs de API Routes sem dados sensíveis (sem senhas, tokens, PII) | [ ] PENDENTE | Garantir que `console.log` não loga body completo de requests |
| 10.3 | Alertas de erro em produção configurados | [ ] PENDENTE | Integrar Sentry (`@sentry/nextjs`) ou Vercel Log Drains |
| 10.4 | Monitoramento de tentativas de login falho | [ ] PENDENTE | Supabase Auth Logs + alerta manual se necessário |
| 10.5 | Audit log de ações críticas (criação, deleção de leads/clientes) | [ ] PENDENTE | Criar tabela `audit_log` com trigger no banco |

---

## 11. Deploy e Infraestrutura

| # | Controle | Status | Notas |
|---|---|---|---|
| 11.1 | HTTPS forçado (Vercel faz por padrão) | [x] IMPLEMENTADO | HSTS configurado no `next.config.ts` |
| 11.2 | Domínio customizado com certificado TLS gerenciado pela Vercel | [ ] PENDENTE | Configurar após ter domínio definido |
| 11.3 | Variáveis de ambiente de produção separadas das de desenvolvimento | [ ] PENDENTE | Vercel: Environment = Production vs Preview vs Development |
| 11.4 | Branch `main` protegida (require PR + CI passing) | [ ] PENDENTE | GitHub > Settings > Branch protection rules |
| 11.5 | Dependências auditadas regularmente (`npm audit`) | [ ] PENDENTE | Rodar `npm audit` antes de cada deploy |
| 11.6 | Dependências atualizadas (Dependabot ou similar) | [ ] PENDENTE | Ativar Dependabot no GitHub |
| 11.7 | Preview deploys protegidos por senha ou desabilitados | [ ] PENDENTE | Vercel: Settings > Git > Preview Deployment Protection |
| 11.8 | Vercel Analytics e Speed Insights sem PII | [ ] PENDENTE | Verificar se está coletando dados além do necessário |

---

## Resumo Executivo

| Categoria | Implementado | Pendente | N/A |
|---|---|---|---|
| Autenticação e Autorização | 6 | 5 | 0 |
| Segurança de API Routes | 2 | 6 | 1 |
| Variáveis de Ambiente | 4 | 2 | 0 |
| Headers HTTP | 8 | 1 | 0 |
| Input Validation | 0 | 6 | 0 |
| Rate Limiting | 0 | 4 | 0 |
| Proteção CSRF | 1 | 2 | 0 |
| Supabase RLS | 2 | 6 | 0 |
| Secrets e Chaves | 2 | 4 | 0 |
| Logging e Monitoramento | 0 | 5 | 0 |
| Deploy e Infraestrutura | 1 | 7 | 0 |
| **TOTAL** | **26** | **48** | **1** |

---

## Prioridade de Remediacao

### Critico — Fazer antes do primeiro deploy
1. Habilitar RLS em todas as tabelas do Supabase (8.1, 8.2, 8.3)
2. Desabilitar signup público no Supabase Auth (1.11)
3. Configurar variáveis de ambiente na Vercel (3.4)
4. Instalar Zod e validar todos os inputs de API (5.1, 5.2)
5. Verificar session em toda API Route (2.1, 2.2)

### Alto — Fazer na primeira semana pos-launch
6. Habilitar MFA para o dono (1.8)
7. Configurar rate limiting em APIs sensíveis (6.2)
8. Integrar Sentry para monitoramento de erros (10.3)
9. Rodar `npm audit` e corrigir vulnerabilidades criticas (11.5)
10. Proteger preview deploys na Vercel (11.7)

### Medio — Proximas iteracoes
11. Implementar audit log de acoes criticas (10.5)
12. Configurar Gitleaks no CI (9.5)
13. Ativar Dependabot (11.6)
14. Documentar processo de rotacao de chaves (9.4)

---

## SonarCloud — Checklist de Configuracao

> Fazer quando o repositorio estiver no GitHub.

- [ ] Criar conta gratuita em https://sonarcloud.io (login com GitHub)
- [ ] Clicar em "Import an organization" e selecionar sua conta/org do GitHub
- [ ] Clicar em "Set Up" no repositorio `hub` (ou o nome que estiver no GitHub)
- [ ] Copiar o `SONAR_TOKEN` gerado
- [ ] No GitHub: Settings > Secrets and Variables > Actions > New repository secret
  - Nome: `SONAR_TOKEN` | Valor: o token copiado
- [ ] No `sonar-project.properties` confirmar que `sonar.projectKey` bate com o criado no SonarCloud
- [ ] Fazer um push para `main` — o workflow `.github/workflows/sonar.yml` roda automaticamente
- [ ] Acessar o SonarCloud e verificar o Quality Gate (deve aparecer "Passed")
