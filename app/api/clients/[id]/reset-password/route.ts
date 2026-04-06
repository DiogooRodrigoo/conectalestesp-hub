import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getClientById } from "@/lib/supabase/hub";

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

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

    // Busca o auth user no Marque Já pelo e-mail
    const supabase = createAdminSupabaseClient();
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

    const newPassword = generatePassword();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.auth.admin as any).updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ new_password: newPassword });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
