/**
 * Tipos do banco de dados Supabase — Conecta Leste SP Hub
 *
 * O Hub compartilha o mesmo projeto Supabase do Marque Já.
 * As tabelas do Hub (clients, client_products, payments, leads, hub_admins)
 * foram criadas pelas migrations 004 e 005.
 *
 * Para regenerar com a CLI:
 *   npx supabase gen types typescript \
 *     --project-id xyshrrgogkqguofpneie \
 *     --schema public \
 *     > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ClientStatus    = "active" | "inactive" | "trial" | "cancelled";
export type ProductType     = "marque_ja" | "social_media" | "vitrine" | "persona_ia";
export type ProductStatus   = "active" | "paused" | "cancelled";
export type PaymentStatus   = "pending" | "paid" | "overdue";
export type PaymentMethod   = "pix" | "boleto" | "cartao" | "dinheiro";
export type LeadSource      = "google_maps" | "indicacao" | "abordagem" | "instagram" | "outro";
export type LeadStatus      = "new" | "contacted" | "negotiating" | "won" | "lost" | "not_closed";

// ─── Row Types ────────────────────────────────────────────────────────────────

export interface HubAdmin {
  user_id:    string;
  created_at: string;
}

export interface Client {
  id:             string;
  business_id:    string | null;
  slug:           string | null;
  name:           string;
  owner_name:     string | null;
  owner_email:    string | null;
  phone:          string | null;
  segment:        string | null;
  neighborhood:   string | null;
  status:         ClientStatus;
  access_blocked: boolean;
  notes:          string | null;
  created_at:     string;
  updated_at:     string;
}

export interface ClientProduct {
  id:                   string;
  client_id:            string;
  product:              ProductType;
  status:               ProductStatus;
  monthly_price_cents:  number;
  billing_day:          number | null;
  started_at:           string | null;
  cancelled_at:         string | null;
  created_at:           string;
}

export interface Payment {
  id:             string;
  client_id:      string;
  product_id:     string | null;
  amount_cents:   number;
  due_date:       string;
  paid_at:        string | null;
  status:         PaymentStatus;
  payment_method: PaymentMethod | null;
  notes:          string | null;
  created_at:     string;
}

export interface Lead {
  id:                     string;
  name:                   string;
  phone:                  string | null;
  segment:                string | null;
  neighborhood:           string | null;
  source:                 LeadSource | null;
  status:                 LeadStatus;
  notes:                  string | null;
  converted_to_client_id: string | null;
  created_at:             string;
  last_contact_at:        string | null;
}

// ─── Insert Types ─────────────────────────────────────────────────────────────

export type ClientInsert = Omit<Client, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type ClientProductInsert = Omit<ClientProduct, "id" | "created_at"> & {
  id?: string;
};

export type PaymentInsert = Omit<Payment, "id" | "created_at"> & {
  id?: string;
};

export type LeadInsert = Omit<Lead, "id" | "created_at"> & {
  id?: string;
};

// ─── Joined Types (para queries com JOIN) ────────────────────────────────────

export interface ClientWithProducts extends Client {
  client_products: ClientProduct[];
}

export interface ClientWithDetails extends Client {
  client_products: ClientProduct[];
  payments:        Payment[];
}

export interface PaymentWithClient extends Payment {
  clients: Pick<Client, "id" | "name" | "segment">;
  client_products: Pick<ClientProduct, "product"> | null;
}

// ─── Computed helpers ─────────────────────────────────────────────────────────

/** Soma o MRR de um cliente (todos os produtos ativos) */
export function calcClientMrr(products: ClientProduct[]): number {
  return products
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + p.monthly_price_cents, 0);
}

/** Formata centavos → "R$ 89,00" */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** Mapa de produto → label legível */
export const PRODUCT_LABELS: Record<ProductType, string> = {
  marque_ja:    "Marque Já",
  social_media: "Social Media",
  vitrine:      "Vitrine Digital",
  persona_ia:   "Persona IA",
};

/** Mapa de status do lead → label em PT */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new:         "Novo",
  contacted:   "Contatado",
  negotiating: "Em negociação",
  not_closed:  "Não fechado",
  won:         "Ganho",
  lost:        "Perdido",
};

/** Mapa de source do lead → label em PT */
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  google_maps: "Google Maps",
  indicacao:   "Indicação",
  abordagem:   "Abordagem",
  instagram:   "Instagram",
  outro:       "Outro",
};

// ─── Database interface (para tipagem do Supabase client) ────────────────────

export interface Database {
  public: {
    Tables: {
      hub_admins: {
        Row:           HubAdmin;
        Insert:        Omit<HubAdmin, "created_at">;
        Update:        Partial<Omit<HubAdmin, "user_id">>;
        Relationships: [];
      };
      clients: {
        Row:           Client;
        Insert:        ClientInsert;
        Update:        Partial<ClientInsert>;
        Relationships: [];
      };
      client_products: {
        Row:           ClientProduct;
        Insert:        ClientProductInsert;
        Update:        Partial<ClientProductInsert>;
        Relationships: [{ foreignKeyName: "client_products_client_id_fkey"; columns: ["client_id"]; referencedRelation: "clients"; referencedColumns: ["id"] }];
      };
      payments: {
        Row:           Payment;
        Insert:        PaymentInsert;
        Update:        Partial<PaymentInsert>;
        Relationships: [{ foreignKeyName: "payments_client_id_fkey"; columns: ["client_id"]; referencedRelation: "clients"; referencedColumns: ["id"] }];
      };
      leads: {
        Row:           Lead;
        Insert:        LeadInsert;
        Update:        Partial<LeadInsert>;
        Relationships: [];
      };
      // Tabelas do Marque Já (read-only para o Hub quando necessário)
      businesses: {
        Row:           Record<string, Json | null>;
        Insert:        Record<string, Json | null>;
        Update:        Record<string, Json | null>;
        Relationships: [];
      };
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
