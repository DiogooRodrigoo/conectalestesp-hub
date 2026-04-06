/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Hub Queries — funções de acesso ao banco reutilizáveis
 *
 * Todas as funções são server-side (usam createServerSupabaseClient).
 * Usar em Server Components ou API Routes — nunca em "use client".
 */

import { createAdminSupabaseClient } from "./server";
import type {
  Client,
  ClientWithProducts,
  ClientWithDetails,
  PaymentWithClient,
  Lead,
  LeadInsert,
  ClientInsert,
  ClientProductInsert,
  PaymentInsert,
} from "@/types/database";
import { formatBRL } from "@/types/database";

// ─── Clientes ─────────────────────────────────────────────────────────────────

/** Lista todos os clientes com seus produtos */
export async function getClients(): Promise<ClientWithProducts[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*, client_products(*), payments(status, due_date)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getClients: ${error.message}`);
  return (data ?? []) as ClientWithProducts[];
}

/** Busca um cliente com produtos + pagamentos */
export async function getClientById(id: string): Promise<ClientWithDetails | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*, client_products(*), payments(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as ClientWithDetails;
}

/** Cria um novo cliente */
export async function createClient(input: ClientInsert): Promise<Client> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`createClient: ${error.message}`);
  return data as Client;
}

/** Atualiza dados de um cliente */
export async function updateClient(
  id: string,
  input: Partial<Pick<Client, "name" | "owner_name" | "owner_email" | "phone" | "segment" | "neighborhood" | "status" | "notes" | "slug" | "access_blocked">>
): Promise<Client> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateClient: ${error.message}`);
  return data as Client;
}

/** Adiciona um produto ao cliente */
export async function addClientProduct(input: ClientProductInsert) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("client_products")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`addClientProduct: ${error.message}`);
  return data;
}

// ─── Métricas (Overview) ──────────────────────────────────────────────────────

export interface HubMetrics {
  totalAtivos:        number;
  mrrCents:           number;
  mrrFormatted:       string;
  pagamentosPendentes: number;
  leadsNegociacao:    number;
  novosEsteMes:       number;
}

export async function getHubMetrics(): Promise<HubMetrics> {
  const supabase = createAdminSupabaseClient();

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [clientsRes, paymentsRes, leadsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, status, created_at, client_products(monthly_price_cents, status)"),
    supabase
      .from("payments")
      .select("id, status")
      .eq("status", "pending"),
    supabase
      .from("leads")
      .select("id, status"),
  ]);

  const clients = (clientsRes.data ?? []) as Array<{
    id: string; status: string; created_at: string;
    client_products: Array<{ monthly_price_cents: number; status: string }>;
  }>;

  const ativos = clients.filter((c) => c.status === "active" || c.status === "trial");

  const mrrCents = ativos.reduce((sum, c) => {
    const prodsMrr = (c.client_products ?? [])
      .filter((p) => p.status === "active")
      .reduce((s, p) => s + p.monthly_price_cents, 0);
    return sum + prodsMrr;
  }, 0);

  const novosEsteMes = clients.filter((c) => c.created_at >= inicioMes).length;
  const leadsNegociacao = ((leadsRes.data ?? []) as Array<{ id: string; status: string }>).filter((l) => l.status === "negotiating").length;

  return {
    totalAtivos:        ativos.length,
    mrrCents,
    mrrFormatted:       formatBRL(mrrCents),
    pagamentosPendentes: (paymentsRes.data ?? []).length,
    leadsNegociacao,
    novosEsteMes,
  };
}

// ─── Pagamentos ───────────────────────────────────────────────────────────────

/** Próximos vencimentos do mês (pendentes + atrasados) */
export async function getUpcomingPayments(limit = 10): Promise<PaymentWithClient[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*, clients(id, name, segment), client_products(product)")
    .in("status", ["pending", "overdue"])
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`getUpcomingPayments: ${error.message}`);
  return (data ?? []) as PaymentWithClient[];
}

/** Retorna todos os pagamentos do mês corrente */
export async function getMonthPayments(): Promise<PaymentWithClient[]> {
  const supabase = createAdminSupabaseClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("payments")
    .select("*, clients(id, name, segment), client_products(product)")
    .gte("due_date", startOfMonth)
    .lte("due_date", endOfMonth)
    .order("due_date", { ascending: true });

  if (error) throw new Error(`getMonthPayments: ${error.message}`);
  return (data ?? []) as PaymentWithClient[];
}

/** Cria um pagamento */
export async function createPayment(input: PaymentInsert) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`createPayment: ${error.message}`);
  return data;
}

/** Marca pagamento como pago */
export async function markPaymentAsPaid(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`markPaymentAsPaid: ${error.message}`);
}

// ─── Leads ────────────────────────────────────────────────────────────────────

/** Lista todos os leads ordenados por data de criação */
export async function getLeads(): Promise<Lead[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getLeads: ${error.message}`);
  return (data ?? []) as Lead[];
}

/** Salva um lead captado na prospecção */
export async function createLead(input: LeadInsert): Promise<Lead> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`createLead: ${error.message}`);
  return data as Lead;
}

/** Atualiza status e notas de um lead */
export async function updateLead(
  id: string,
  update: { status?: Lead["status"]; notes?: string; last_contact_at?: string }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("leads")
    .update(update)
    .eq("id", id);

  if (error) throw new Error(`updateLead: ${error.message}`);
}

export interface MrrMonth {
  label: string;      // "Jan", "Fev" etc.
  cents: number;
}

/** MRR recebido dos últimos N meses (baseado em pagamentos paid) */
export async function getMrrHistory(months = 6): Promise<MrrMonth[]> {
  const supabase = createAdminSupabaseClient();
  const now = new Date();

  const result: MrrMonth[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);

    const { data } = await supabase
      .from("payments")
      .select("amount_cents")
      .eq("status", "paid")
      .gte("due_date", start)
      .lte("due_date", end);

    const cents = (data ?? []).reduce((s: number, p: { amount_cents: number }) => s + p.amount_cents, 0);
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    result.push({ label: label.charAt(0).toUpperCase() + label.slice(1), cents });
  }

  return result;
}

/** Contagens para badges de alerta na Sidebar */
export async function getAlertCounts(): Promise<{ overdue: number; newLeads: number }> {
  const supabase = createAdminSupabaseClient();

  const [paymentsRes, leadsRes] = await Promise.all([
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return {
    overdue:  paymentsRes.count  ?? 0,
    newLeads: leadsRes.count ?? 0,
  };
}
