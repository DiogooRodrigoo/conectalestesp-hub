import { type NextRequest, NextResponse } from "next/server";
import { addClientProduct } from "@/lib/supabase/hub";
import type { ClientProductInsert } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: ClientProductInsert = {
      client_id:           body.client_id,
      product:             body.product,
      status:              body.status            ?? "active",
      monthly_price_cents: body.monthly_price_cents ?? 0,
      billing_day:         body.billing_day        ?? 5,
      started_at:          body.started_at         ?? new Date().toISOString().slice(0, 10),
      cancelled_at:        null,
    };

    const product = await addClientProduct(input);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
