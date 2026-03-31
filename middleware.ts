import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ─── Rotas públicas ──────────────────────────────────────────────────────────
// Apenas /login é acessível sem autenticação.
// Todas as outras rotas exigem sessão válida.
const PUBLIC_ROUTES = ["/login"];

// ─── Rota padrão após login ──────────────────────────────────────────────────
const AUTHENTICATED_HOME = "/overview";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cria uma response mutável para que o Supabase SSR possa
  // atualizar os cookies de sessão na resposta
  let supabaseResponse = NextResponse.next({
    request,
  });

  // ─── Cliente Supabase SSR ──────────────────────────────────────────────────
  // O createServerClient com callbacks de cookie é o padrão oficial do
  // @supabase/ssr para Next.js middleware. Ele renova tokens automaticamente.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Primeiro seta na request (para que a rota atual veja os cookies)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Recria a response com os cookies atualizados
          supabaseResponse = NextResponse.next({ request });

          // Seta na response (para que o browser receba os cookies novos)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ─── Verificação de sessão ─────────────────────────────────────────────────
  // IMPORTANTE: Usar getUser() e não getSession() — getUser() faz validação
  // server-side com a Supabase Auth API, enquanto getSession() apenas lê
  // o JWT local sem verificar com o servidor (inseguro para decisões de auth).
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const isAuthenticated = !authError && user !== null;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // ─── Regra 1: Usuário autenticado tenta acessar rota pública ──────────────
  // Ex: usuário logado acessa /login → redireciona para /overview
  if (isAuthenticated && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = AUTHENTICATED_HOME;
    return NextResponse.redirect(url);
  }

  // ─── Regra 2: Usuário não autenticado tenta acessar rota protegida ────────
  // → Redireciona para /login preservando a URL original como `next` param
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";

    // Salva a URL que o usuário tentou acessar para redirecionar após login
    // Evitar passar senhas ou dados sensíveis como query param — apenas o path
    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  // ─── Regra 3: Acesso permitido ────────────────────────────────────────────
  // Retorna a supabaseResponse (que pode conter cookies de sessão renovados)
  return supabaseResponse;
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Exclui arquivos estáticos e rotas internas do Next.js para não
// executar o middleware em assets (imagens, fontes, etc.)
export const config = {
  matcher: [
    /*
     * Executa em todas as rotas EXCETO:
     * - _next/static  → arquivos estáticos do build
     * - _next/image   → otimização de imagens do Next.js
     * - favicon.ico   → ícone do site
     * - ícones SVG e PNG na raiz
     * - api/health    → endpoint de health check (se existir)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
