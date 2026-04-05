import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// PATCH /api/clients/[id]/products/[productId] — atualiza preço, status e dia de cobrança
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await req.json();

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("client_products")
      .update({
        monthly_price_cents: body.monthly_price_cents,
        status:              body.status,
        billing_day:         body.billing_day ?? null,
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
