import { NextRequest, NextResponse } from "next/server";
import { markPaymentAsPaid } from "@/lib/supabase/hub";

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    await markPaymentAsPaid(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
