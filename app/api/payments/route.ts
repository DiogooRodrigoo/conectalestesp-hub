import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { PaymentWithClient } from "@/types/database";

// GET /api/payments?year=2025&month=4
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year  = parseInt(searchParams.get("year")  ?? String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1), 10);

    const startOfMonth = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const endOfMonth   = new Date(year, month, 0).toISOString().slice(0, 10);

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*, clients(id, name, segment), client_products(product)")
      .gte("due_date", startOfMonth)
      .lte("due_date", endOfMonth)
      .order("due_date", { ascending: true });

    if (error) throw new Error(error.message);
    return NextResponse.json((data ?? []) as PaymentWithClient[]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
