import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/hub";
import type { ClientInsert } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: ClientInsert = {
      name:           body.name,
      owner_name:     body.owner_name     ?? null,
      owner_email:    body.owner_email    ?? null,
      phone:          body.phone          ?? null,
      segment:        body.segment        ?? null,
      neighborhood:   body.neighborhood   ?? null,
      status:         body.status         ?? "active",
      notes:          body.notes          ?? null,
      business_id:    body.business_id    ?? null,
      slug:           body.slug           ?? null,
      access_blocked: body.access_blocked ?? false,
    };

    const client = await createClient(input);
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
