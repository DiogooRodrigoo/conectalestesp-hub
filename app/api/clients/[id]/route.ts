import { type NextRequest, NextResponse } from "next/server";
import { updateClient } from "@/lib/supabase/hub";
import type { ClientStatus } from "@/types/database";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const input: {
      name?: string;
      owner_name?: string | null;
      owner_email?: string | null;
      phone?: string | null;
      segment?: string | null;
      neighborhood?: string | null;
      status?: ClientStatus;
      notes?: string | null;
    } = {};

    if (body.name         !== undefined) input.name         = body.name;
    if (body.owner_name   !== undefined) input.owner_name   = body.owner_name   || null;
    if (body.owner_email  !== undefined) input.owner_email  = body.owner_email  || null;
    if (body.phone        !== undefined) input.phone        = body.phone        || null;
    if (body.segment      !== undefined) input.segment      = body.segment      || null;
    if (body.neighborhood !== undefined) input.neighborhood = body.neighborhood || null;
    if (body.status       !== undefined) input.status       = body.status;
    if (body.notes        !== undefined) input.notes        = body.notes        || null;

    const client = await updateClient(id, input);
    return NextResponse.json(client);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
