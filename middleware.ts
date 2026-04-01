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
  // Guard: sem as variáveis de ambiente o middleware não pode funcionar.
  // Retorna a response padrão para não travar a aplicação inteira.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] Variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas.");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ─── Verificação de sessão ─────────────────────────────────────────────────
  let isAuthenticated = false;
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    isAuthenticated = !authError && user !== null;
  } catch {
    // Se o Supabase não responder, trata como não autenticado
    isAuthenticated = false;
  }
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
