import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// POST /api/clients/[id]/products — adiciona um produto ao cliente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: client_id } = await params;
    const body = await req.json();

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("client_products")
      .insert({
        client_id,
        product:             body.product,
        monthly_price_cents: body.monthly_price_cents,
        billing_day:         body.billing_day ?? null,
        status:              body.status ?? "active",
        started_at:          new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
