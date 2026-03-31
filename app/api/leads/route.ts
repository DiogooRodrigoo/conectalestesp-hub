import { NextRequest, NextResponse } from "next/server";
import { createLead, getLeads, updateLead } from "@/lib/supabase/hub";
import type { LeadInsert, LeadSource, LeadStatus } from "@/types/database";

// GET /api/leads — lista todos os leads
export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/leads — cria um novo lead
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: LeadInsert = {
      name:         body.name,
      phone:        body.phone        ?? null,
      segment:      body.segment      ?? null,
      neighborhood: body.neighborhood ?? null,
      source:       (body.source as LeadSource) ?? null,
      status:       (body.status as LeadStatus) ?? "new",
      notes:        body.notes        ?? null,
      converted_to_client_id: null,
      last_contact_at: null,
    };

    const lead = await createLead(input);
    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/leads — atualiza status/notas de um lead
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...update } = body;
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

    await updateLead(id, update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
