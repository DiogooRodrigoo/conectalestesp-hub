/**
 * Supabase Server Clients — Conecta Leste SP Hub
 *
 * Uso: Server Components, API Routes (Route Handlers), e Server Actions.
 *
 * SEGURANCA:
 *   • createServerSupabaseClient()  → usa ANON_KEY + cookies de sessão, sujeita ao RLS
 *   • createAdminSupabaseClient()   → usa SERVICE_ROLE_KEY pura (supabase-js), bypassa RLS
 *
 * REGRAS DE USO:
 *   • Use createServerSupabaseClient() como padrão em Server Components
 *   • Use createAdminSupabaseClient() APENAS em API Routes que precisam de acesso admin
 *   • NUNCA exponha o admin client ou a SERVICE_ROLE_KEY no browser
 *   • O admin client NÃO deve ser usado em componentes com "use client"
 *
 * IMPORTANTE:
 *   • createServerSupabaseClient é async pois cookies() é assíncrono no Next.js 15
 *   • createAdminSupabaseClient é síncrono (não usa cookies)
 */

import { createClient }                       from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
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
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
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
 * Cria um cliente Supabase admin usando a chave de Service Role pura.
 *
 * Usa @supabase/supabase-js diretamente (sem cookie-based SSR) para garantir
 * que o service role key seja usado como credencial de autorização, não o JWT
 * do usuário logado nos cookies. Isso garante o bypass completo de RLS.
 *
 * ATENCAO: Este cliente bypassa completamente o RLS.
 * Use SOMENTE em server-side (API Routes). NUNCA em "use client".
 */
export function createAdminSupabaseClient() {
  return createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  );
}

/**
 * @deprecated Use createAdminSupabaseClient() — síncrono e sem cookies.
 * Mantido para compatibilidade retroativa.
 */
export async function createServerSupabaseAdminClient() {
  return createAdminSupabaseClient();
}
