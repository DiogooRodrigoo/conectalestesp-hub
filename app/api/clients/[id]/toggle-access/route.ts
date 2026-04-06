import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getClientById, updateClient } from "@/lib/supabase/hub";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await getClientById(id);
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
    if (!client.owner_email) {
      return NextResponse.json(
        { error: "Cliente sem e-mail cadastrado" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Busca auth user pelo e-mail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: usersData, error: listError } = await (supabase.auth.admin as any).listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authUser = (usersData?.users ?? []).find((u: any) => u.email === client.owner_email);
    if (!authUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado no sistema de autenticação" },
        { status: 404 }
      );
    }

    // Alterna: se bloqueado → desbloqueia; se ativo → bloqueia
    const shouldBlock = !client.access_blocked;
    const ban_duration = shouldBlock ? "876000h" : "none";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: banError } = await (supabase.auth.admin as any).updateUserById(
      authUser.id,
      { ban_duration }
    );

    if (banError) {
      return NextResponse.json({ error: banError.message }, { status: 500 });
    }

    // Sincroniza estado no Hub
    await updateClient(id, { access_blocked: shouldBlock });

    return NextResponse.json({ access_blocked: shouldBlock });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
