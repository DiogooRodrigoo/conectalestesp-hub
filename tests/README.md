# Testes — Conecta Leste SP Hub

Infraestrutura de testes baseada em **Vitest** (mais rápido que Jest e nativamente compatível com ESM/Next.js 15).

---

## Estrutura de Pastas

```
tests/
├── setup.ts          # Configuração global: mocks do Next.js (navigation, headers)
├── unit/             # Testes unitários — funções puras, utilitários, lógica de negócio
├── integration/      # Testes de integração — API Routes, Server Actions, fluxos compostos
└── components/       # Testes de componentes React — renderização, interações, acessibilidade
```

### Quando usar cada pasta

| Pasta | Use para |
|---|---|
| `unit/` | Funções utilitárias, formatadores, validadores, hooks sem dependências externas |
| `integration/` | API Routes com Supabase mockado (MSW), fluxos de autenticação, Server Actions |
| `components/` | Componentes React isolados: renderização correta, estados, eventos de usuário |

---

## Como Rodar

```bash
# Modo watch (desenvolvimento) — re-roda ao salvar arquivos
npm test

# Execução única — para CI ou verificação pontual
npm run test:run

# Com relatório de cobertura (gera pasta /coverage)
npm run test:coverage

# Interface visual no browser (Vitest UI)
npm run test:ui
```

---

## Relatório de Cobertura

Após rodar `npm run test:coverage`, o relatório fica disponível em:

- **Terminal**: saída resumida na tela
- **HTML**: abra `coverage/index.html` no browser para visualização detalhada
- **LCOV**: `coverage/lcov.info` — usado pelo SonarCloud no CI

### Thresholds mínimos (configurados em `vitest.config.ts`)

| Métrica | Mínimo |
|---|---|
| Lines | 70% |
| Functions | 70% |
| Branches | 70% |
| Statements | 70% |

---

## Escrevendo Novos Testes

### Teste Unitário (exemplo)

```typescript
// tests/unit/formatCurrency.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/utils/formatters";

describe("formatCurrency", () => {
  it("formata valor em BRL corretamente", () => {
    expect(formatCurrency(1500)).toBe("R$ 1.500,00");
  });

  it("formata zero corretamente", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });
});
```

### Teste de Componente (exemplo)

```typescript
// tests/components/Button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza o texto corretamente", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
  });

  it("chama onClick ao ser clicado", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Salvar</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Teste de Integração com MSW (exemplo)

```typescript
// tests/integration/leads.test.ts
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

const server = setupServer(
  http.get("/api/leads", () => {
    return HttpResponse.json({ leads: [], total: 0 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("GET /api/leads", () => {
  it("retorna lista vazia quando não há leads", async () => {
    const res = await fetch("/api/leads");
    const data = await res.json();
    expect(data.leads).toHaveLength(0);
  });
});
```

---

## Convenções

- Nomeie os arquivos como `[nome-do-que-está-testando].test.ts(x)`
- Um `describe` por arquivo, focado na unidade sendo testada
- Use `vi.fn()` para mocks e `vi.spyOn()` para espiar chamadas reais
- Prefira `userEvent` a `fireEvent` para simular interações reais do usuário
- Mantenha cada teste independente — sem estado compartilhado entre `it()`s

---

## Mocks Globais Disponíveis (configurados em `setup.ts`)

| Mock | O que fornece |
|---|---|
| `next/navigation` | `useRouter`, `usePathname`, `useSearchParams`, `redirect` |
| `next/headers` | `cookies()`, `headers()` |

Para adicionar novos mocks globais, edite `tests/setup.ts`.
