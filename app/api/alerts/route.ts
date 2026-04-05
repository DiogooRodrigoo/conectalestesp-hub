import { NextResponse } from "next/server";
import { getAlertCounts } from "@/lib/supabase/hub";

// GET /api/alerts — contagens de overdue e leads novos para badges da Sidebar
export async function GET() {
  try {
    const counts = await getAlertCounts();
    return NextResponse.json(counts);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
