/**
 * Supabase Browser Client — Conecta Leste SP Hub
 *
 * Uso: componentes client-side ("use client") que precisam interagir
 * com o Supabase diretamente no browser.
 *
 * SEGURANCA:
 *   • Usa apenas NEXT_PUBLIC_SUPABASE_ANON_KEY (chave anônima)
 *   • Acesso ao banco é controlado pelo RLS do Supabase
 *   • NUNCA use service_role key no cliente
 *
 * IMPORTANTE:
 *   • Este cliente NÃO deve ser usado em Server Components ou API Routes
 *   • Para server-side, use lib/supabase/server.ts
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Cria uma nova instância do cliente Supabase para uso no browser.
 * Internamente o @supabase/ssr gerencia o singleton de sessão.
 */
export function createSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL não está definida. " +
        "Configure no arquivo .env.local ou nas variáveis de ambiente da Vercel."
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida. " +
        "Configure no arquivo .env.local ou nas variáveis de ambiente da Vercel."
    );
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ─── Singleton para componentes client-side ────────────────────────────────
// Evita criar múltiplas instâncias do cliente durante re-renders.
// O @supabase/ssr já gerencia isso internamente, mas o singleton explícito
// garante consistência e evita overhead de instanciação desnecessária.
let _client: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseClient(): ReturnType<typeof createSupabaseClient> {
  if (!_client) {
    _client = createSupabaseClient();
  }
  return _client;
}
