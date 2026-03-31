import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";

// ----------------------------------------------------------------------------
// MSW server — intercepts fetch() calls made during tests.
// Add handlers here as API routes are implemented in app/api/.
// ----------------------------------------------------------------------------

const server = setupServer(
  // ---- Leads ----------------------------------------------------------------
  http.get("/api/leads", ({ request }) => {
    const url = new URL(request.url);
    const bairro = url.searchParams.get("bairro");

    if (bairro === "cidade-tiradentes") {
      return HttpResponse.json({
        leads: [
          {
            id: "lead-1",
            nome: "Barbearia do Zé",
            telefone: "(11) 99999-0001",
            bairro: "Cidade Tiradentes",
            segmento: "barbearia",
            temSite: false,
            temGoogleMeuNegocio: true,
          },
        ],
        total: 1,
      });
    }

    return HttpResponse.json({ leads: [], total: 0 });
  }),

  http.post("/api/leads/captar", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    if (!body || !body.nome) {
      return HttpResponse.json(
        { error: "Campo 'nome' é obrigatório" },
        { status: 422 }
      );
    }

    return HttpResponse.json(
      { id: "new-lead-id", ...body },
      { status: 201 }
    );
  }),

  // ---- Auth (Supabase pattern) ----------------------------------------------
  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    if (body?.email === "admin@conectaleste.com.br" && body?.password === "correct-password") {
      return HttpResponse.json({ user: { id: "user-1", email: body.email } });
    }

    return HttpResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  })
);

// Start/stop MSW around the test suite
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers()); // Prevents handler leakage between tests
afterAll(() => server.close());

// ----------------------------------------------------------------------------
// GET /api/leads
// ----------------------------------------------------------------------------
describe("GET /api/leads", () => {
  it("returns empty list when no leads exist for a bairro", async () => {
    const res = await fetch("/api/leads?bairro=itaquera");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.leads).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  it("returns leads for Cidade Tiradentes", async () => {
    const res = await fetch("/api/leads?bairro=cidade-tiradentes");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.leads).toHaveLength(1);
    expect(data.leads[0].segmento).toBe("barbearia");
  });

  it("handles server errors gracefully", async () => {
    // Override handler for this single test to simulate a 500
    server.use(
      http.get("/api/leads", () =>
        HttpResponse.json({ error: "Internal server error" }, { status: 500 })
      )
    );

    const res = await fetch("/api/leads");
    expect(res.status).toBe(500);
  });
});

// ----------------------------------------------------------------------------
// POST /api/leads/captar
// ----------------------------------------------------------------------------
describe("POST /api/leads/captar", () => {
  it("creates a new captured lead and returns 201", async () => {
    const payload = {
      nome: "Salão da Maria",
      telefone: "(11) 98888-1234",
      bairro: "Guaianases",
      segmento: "salao",
    };

    const res = await fetch("/api/leads/captar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.id).toBe("new-lead-id");
    expect(data.nome).toBe("Salão da Maria");
  });

  it("returns 422 when nome is missing", async () => {
    const res = await fetch("/api/leads/captar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone: "(11) 90000-0000" }),
    });

    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toMatch(/nome/i);
  });
});

// ----------------------------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------------------------
describe("POST /api/auth/login", () => {
  it("returns user object on valid credentials", async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@conectaleste.com.br",
        password: "correct-password",
      }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.email).toBe("admin@conectaleste.com.br");
  });

  it("returns 401 on wrong credentials", async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@conectaleste.com.br",
        password: "wrong-password",
      }),
    });

    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBeTruthy();
  });
});

// ----------------------------------------------------------------------------
// Supabase client mock pattern
// Use this when testing code that imports createClient directly instead of
// going through a fetch() call.
// ----------------------------------------------------------------------------
describe("Supabase client mock pattern (reference)", () => {
  it("demonstrates how to mock @supabase/supabase-js in unit tests", () => {
    // In a real test file, place this vi.mock() at the top level (not inside describe):
    //
    // vi.mock("@supabase/supabase-js", () => ({
    //   createClient: vi.fn(() => ({
    //     from: vi.fn().mockReturnThis(),
    //     select: vi.fn().mockReturnThis(),
    //     insert: vi.fn().mockReturnThis(),
    //     eq: vi.fn().mockReturnThis(),
    //     single: vi.fn().mockResolvedValue({ data: { id: "1" }, error: null }),
    //   })),
    // }));
    //
    // Then import and use your module that depends on Supabase normally.

    expect(true).toBe(true); // Placeholder — remove when real test is added
  });
});
