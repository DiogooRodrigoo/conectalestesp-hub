import { NextResponse } from "next/server";
import { getMrrHistory } from "@/lib/supabase/hub";

// GET /api/mrr-history — MRR recebido dos últimos 6 meses
export async function GET() {
  try {
    const history = await getMrrHistory(6);
    return NextResponse.json(history);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
