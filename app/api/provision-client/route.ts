/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseAdminClient } from "@/lib/supabase/server";

// ─── Clientes Supabase ────────────────────────────────────────────────────────

// Cliente do Marque Já — sem tipo rígido pois o Hub não contém os types do Marque Já
function createMarqueJaClient() {
  const url = process.env.MARQUE_JA_SUPABASE_URL;
  const key = process.env.MARQUE_JA_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "MARQUE_JA_SUPABASE_URL e MARQUE_JA_SERVICE_ROLE_KEY são obrigatórios"
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Horario {
  dia: number;        // 0 = domingo … 6 = sábado
  ativo: boolean;
  abertura: string;   // "HH:MM"
  fechamento: string; // "HH:MM"
}

interface Servico {
  nome: string;
  preco_cents: number;
  duracao_min: number;
}

interface Profissional {
  nome: string;
  servicos_idx: number[]; // índices do array servicos
}

interface ProvisionBody {
  client_id:      string;
  email:          string;
  nome:           string;
  slug?:          string;
  primary_color?: string;
  phone_whatsapp?: string;
  neighborhood?:  string;
  horarios?:      Horario[];
  servicos?:      Servico[];
  profissionais?: Profissional[];
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ProvisionBody = await req.json();

    if (!body.client_id || !body.email || !body.nome) {
      return NextResponse.json(
        { error: "client_id, email e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // marqueJa → Supabase do Marque Já (tabelas businesses, services, etc.)
    // hubClient → Supabase do Hub (tabela clients)
    const marqueJa = createMarqueJaClient();
    const hubClient = await createServerSupabaseAdminClient();

    const slug = (body.slug?.trim() || toSlug(body.nome)).replace(
      /[^a-z0-9-]/g,
      ""
    );

    // Verifica se slug já existe no Marque Já
    const { data: slugCheck } = await marqueJa
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugCheck) {
      return NextResponse.json(
        { error: `O slug "${slug}" já está em uso. Escolha outro.` },
        { status: 409 }
      );
    }

    // 1. Criar auth user no Marque Já
    const tempPassword = generatePassword();
    const { data: authData, error: authError } =
      await marqueJa.auth.admin.createUser({
        email: body.email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      if (!authError.message.includes("already")) {
        return NextResponse.json(
          { error: `Auth: ${authError.message}` },
          { status: 400 }
        );
      }
      // e-mail já existe — continua (não cria duplicado)
    }

    const ownerId = authData?.user?.id;
    if (!ownerId) {
      return NextResponse.json(
        { error: "Não foi possível obter o owner_id do usuário." },
        { status: 500 }
      );
    }

    // 2. Criar business no Marque Já
    const businessInsert: Record<string, any> = {
      owner_id:      ownerId,
      slug,
      name:          body.nome,
      primary_color: body.primary_color ?? "#F97316",
      phone_whatsapp: body.phone_whatsapp ?? null,
    };

    if (body.neighborhood) {
      businessInsert.address = {
        neighborhood: body.neighborhood,
        city: "São Paulo",
        state: "SP",
        formatted: `${body.neighborhood}, São Paulo - SP`,
      };
    }

    const { data: business, error: bizError } = await marqueJa
      .from("businesses")
      .insert(businessInsert)
      .select("id")
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { error: `Business: ${bizError?.message}` },
        { status: 500 }
      );
    }

    const businessId: string = business.id;

    // 3. Criar horários de funcionamento
    if (body.horarios && body.horarios.length > 0) {
      const horasInsert = body.horarios.map((h) => ({
        business_id: businessId,
        day_of_week: h.dia,
        is_open:     h.ativo,
        open_time:   h.ativo ? `${h.abertura}:00` : "09:00:00",
        close_time:  h.ativo ? `${h.fechamento}:00` : "18:00:00",
      }));

      const { error: horasError } = await marqueJa
        .from("business_hours")
        .insert(horasInsert);

      if (horasError) {
        console.error("business_hours insert error:", horasError.message);
      }
    } else {
      // Padrão: seg-sáb 09h-18h, domingo fechado
      const defaultHours = Array.from({ length: 7 }, (_, i) => ({
        business_id: businessId,
        day_of_week: i,
        is_open:     i !== 0,
        open_time:   "09:00:00",
        close_time:  "18:00:00",
      }));

      await marqueJa.from("business_hours").insert(defaultHours);
    }

    // 4. Criar serviços → guardar IDs por índice
    const serviceIds: string[] = [];
    const servicos = body.servicos ?? [];

    for (let i = 0; i < servicos.length; i++) {
      const s = servicos[i];
      const { data: svc, error: svcError } = await marqueJa
        .from("services")
        .insert({
          business_id:   businessId,
          name:          s.nome,
          duration_min:  s.duracao_min,
          price_cents:   s.preco_cents,
          display_order: i,
        })
        .select("id")
        .single();

      if (svcError || !svc) {
        console.error(`Serviço ${s.nome} falhou:`, svcError?.message);
        serviceIds.push("");
      } else {
        serviceIds.push(svc.id);
      }
    }

    // 5. Criar profissionais + vincular serviços
    for (const prof of body.profissionais ?? []) {
      const { data: professional, error: profError } = await marqueJa
        .from("professionals")
        .insert({ business_id: businessId, name: prof.nome })
        .select("id")
        .single();

      if (profError || !professional) {
        console.error(`Profissional ${prof.nome} falhou:`, profError?.message);
        continue;
      }

      const psInserts = prof.servicos_idx
        .filter((idx) => serviceIds[idx])
        .map((idx) => ({
          professional_id: professional.id,
          service_id:      serviceIds[idx],
        }));

      if (psInserts.length > 0) {
        await marqueJa.from("professional_services").insert(psInserts);
      }
    }

    // 6. Atualizar Hub client com business_id (usa cliente do Hub)
    const { error: updateError } = await (hubClient as any)
      .from("clients")
      .update({ business_id: businessId })
      .eq("id", body.client_id);

    if (updateError) {
      console.error("Falha ao atualizar client.business_id:", updateError.message);
    }

    return NextResponse.json(
      { business_id: businessId, slug, temp_password: tempPassword },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
