import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export interface SearchResult {
  type:    "client" | "lead";
  id:      string;
  title:   string;
  sub:     string;
  href:    string;
}

// GET /api/search?q=texto — busca em clientes e leads
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const supabase = createAdminSupabaseClient();
  const pattern = `%${q}%`;

  const [clientsRes, leadsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, segment, neighborhood, status")
      .or(`name.ilike.${pattern},owner_name.ilike.${pattern},phone.ilike.${pattern}`)
      .limit(6),
    supabase
      .from("leads")
      .select("id, name, segment, neighborhood, status")
      .or(`name.ilike.${pattern},phone.ilike.${pattern}`)
      .limit(4),
  ]);

  const results: SearchResult[] = [];

  for (const c of (clientsRes.data ?? []) as Array<{ id: string; name: string; segment: string | null; neighborhood: string | null; status: string }>) {
    results.push({
      type:  "client",
      id:    c.id,
      title: c.name,
      sub:   [c.segment, c.neighborhood].filter(Boolean).join(" · ") || c.status,
      href:  `/clientes/${c.id}`,
    });
  }

  for (const l of (leadsRes.data ?? []) as Array<{ id: string; name: string; segment: string | null; neighborhood: string | null; status: string }>) {
    results.push({
      type:  "lead",
      id:    l.id,
      title: l.name,
      sub:   [l.segment, l.neighborhood].filter(Boolean).join(" · ") || l.status,
      href:  `/leads`,
    });
  }

  return NextResponse.json(results);
}
