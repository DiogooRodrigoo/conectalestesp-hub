/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getClientById } from "@/lib/supabase/hub";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await getClientById(id);
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
    if (!client.business_id) {
      return NextResponse.json(
        { error: "Cliente sem Marque Já provisionado" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    const businessId = client.business_id;

    const [hoursRes, servicesRes, professionalsRes] = await Promise.all([
      (supabase as any)
        .from("business_hours")
        .select("day_of_week, is_open, open_time, close_time")
        .eq("business_id", businessId)
        .order("day_of_week"),
      (supabase as any)
        .from("services")
        .select("id, name, price_cents, duration_min, is_active")
        .eq("business_id", businessId)
        .order("display_order"),
      (supabase as any)
        .from("professionals")
        .select("id, name, is_active")
        .eq("business_id", businessId)
        .order("created_at"),
    ]);

    // Formata horários com nome do dia
    const horarios = (hoursRes.data ?? []).map((h: any) => ({
      dia:       DIAS[h.day_of_week] ?? `Dia ${h.day_of_week}`,
      aberto:    h.is_open,
      abertura:  h.open_time?.slice(0, 5) ?? "—",
      fechamento: h.close_time?.slice(0, 5) ?? "—",
    }));

    // Formata serviços
    const servicos = (servicesRes.data ?? []).map((s: any) => ({
      id:          s.id,
      nome:        s.name,
      preco_cents: s.price_cents,
      duracao_min: s.duration_min,
      ativo:       s.is_active,
    }));

    // Formata profissionais
    const profissionais = (professionalsRes.data ?? []).map((p: any) => ({
      id:    p.id,
      nome:  p.name,
      ativo: p.is_active,
    }));

    return NextResponse.json({ horarios, servicos, profissionais });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
