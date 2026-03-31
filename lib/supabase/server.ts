/**
 * Supabase Server Clients — Conecta Leste SP Hub
 *
 * Uso: Server Components, API Routes (Route Handlers), e Server Actions.
 *
 * SEGURANCA:
 *   • createServerSupabaseClient()        → usa ANON_KEY, sujeita ao RLS
 *   • createServerSupabaseAdminClient()   → usa SERVICE_ROLE_KEY, bypassa RLS
 *
 * REGRAS DE USO:
 *   • Use createServerSupabaseClient() como padrão em Server Components
 *   • Use createServerSupabaseAdminClient() APENAS em API Routes que
 *     precisam de acesso administrativo (ex: verificar usuário por email,
 *     operações que precisam contornar RLS intencionalmente)
 *   • NUNCA exponha o admin client ou a SERVICE_ROLE_KEY no browser
 *   • O admin client NÃO deve ser usado em componentes com "use client"
 *
 * IMPORTANTE:
 *   • Ambas as funções são async pois cookies() é assíncrono no Next.js 15
 */

import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// ─── Helpers de validação de env ─────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[Supabase] Variável de ambiente '${name}' não está definida. ` +
        "Configure no arquivo .env.local ou nas variáveis de ambiente da Vercel."
    );
  }
  return value;
}

// ─── Cliente padrão (anon key + RLS) ─────────────────────────────────────────

/**
 * Cria um cliente Supabase server-side usando a chave anônima.
 *
 * O acesso aos dados é controlado pelas políticas RLS do banco.
 * Use este cliente como padrão em Server Components e API Routes.
 *
 * @example
 * const supabase = await createServerSupabaseClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieOptionsWithName[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components são read-only para cookies.
            // O middleware.ts é responsável por renovar os tokens de sessão.
            // Este erro é esperado e seguro de ignorar neste contexto.
          }
        },
      },
    }
  );
}

// ─── Cliente admin (service role — bypassa RLS) ───────────────────────────────

/**
 * Cria um cliente Supabase server-side usando a chave de Service Role.
 *
 * ATENCAO: Este cliente bypassa completamente o RLS.
 * Use SOMENTE quando necessário e SOMENTE em server-side (API Routes).
 *
 * Casos de uso válidos:
 *   - Verificar se um usuário existe por email (para validação de convite)
 *   - Operações de manutenção/admin que precisam acessar dados sem filtro
 *   - Webhooks que recebem dados externos e precisam gravar sem contexto de sessão
 *
 * NUNCA use em:
 *   - Client Components ("use client")
 *   - Páginas acessíveis sem autenticação
 *   - Lógica que processa input diretamente do usuário sem validação prévia
 *
 * @example
 * // Em uma API Route protegida por auth:
 * const supabase = await createServerSupabaseAdminClient();
 * const { data } = await supabase.auth.admin.listUsers();
 */
export async function createServerSupabaseAdminClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieOptionsWithName[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // no-op em Server Components — ver comentário acima
          }
        },
      },
      // Desabilita auto-refresh de token no cliente admin
      // O admin client não deve manter sessão de usuário
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
