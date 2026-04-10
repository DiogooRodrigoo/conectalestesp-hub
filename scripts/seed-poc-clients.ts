/**
 * seed-poc-clients.ts
 *
 * Cria contas demo (POC) no Marque Já para cada segmento de comércio.
 * Uso: npx tsx scripts/seed-poc-clients.ts
 *
 * Pré-requisito: arquivo .env.local na raiz do hub com as envs do Supabase.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ─── Lê .env.local manualmente (sem dotenv) ──────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local não encontrado");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}
loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function defaultHours(businessId: string) {
  return Array.from({ length: 7 }, (_, i) => ({
    business_id: businessId,
    day_of_week: i,
    is_open: i !== 0,        // dom fechado
    open_time: "09:00:00",
    close_time: "18:00:00",
  }));
}

// ─── Definição dos POCs ──────────────────────────────────────────────────────

interface Svc  { nome: string; preco: number; duracao: number }
interface Prof { nome: string; servicos: string[] }

interface Poc {
  slug:    string;
  nome:    string;
  email:   string;
  cor:     string;
  bairro:  string;
  servicos: Svc[];
  profissionais: Prof[];
}

const POCS: Poc[] = [
  {
    slug:   "barbearia-demo",
    nome:   "Barbearia do João",
    email:  "poc.barbearia@conectalestesp.com.br",
    cor:    "#1e3a5f",
    bairro: "Itaquera",
    servicos: [
      { nome: "Corte Masculino",    preco: 3500,  duracao: 30 },
      { nome: "Barba",              preco: 2500,  duracao: 20 },
      { nome: "Corte + Barba",      preco: 5500,  duracao: 50 },
      { nome: "Degradê",            preco: 4500,  duracao: 35 },
      { nome: "Sobrancelha",        preco: 1500,  duracao: 15 },
      { nome: "Pigmentação de barba", preco: 4000, duracao: 30 },
    ],
    profissionais: [
      { nome: "João Silva",   servicos: ["Corte Masculino", "Degradê", "Corte + Barba"] },
      { nome: "Carlos Santos", servicos: ["Barba", "Sobrancelha", "Pigmentação de barba"] },
    ],
  },
  {
    slug:   "salao-demo",
    nome:   "Salão Glamour",
    email:  "poc.salao@conectalestesp.com.br",
    cor:    "#9333ea",
    bairro: "Penha",
    servicos: [
      { nome: "Corte Feminino",   preco: 8000,  duracao: 60 },
      { nome: "Escova",           preco: 6000,  duracao: 50 },
      { nome: "Hidratação",       preco: 9000,  duracao: 60 },
      { nome: "Coloração",        preco: 15000, duracao: 120 },
      { nome: "Progressiva",      preco: 20000, duracao: 150 },
      { nome: "Luzes",            preco: 18000, duracao: 180 },
      { nome: "Corte + Escova",   preco: 12000, duracao: 90 },
    ],
    profissionais: [
      { nome: "Ana Lima",     servicos: ["Corte Feminino", "Coloração", "Luzes", "Corte + Escova"] },
      { nome: "Maria Oliveira", servicos: ["Escova", "Hidratação", "Progressiva"] },
    ],
  },
  {
    slug:   "estetica-demo",
    nome:   "Studio de Estética Bella",
    email:  "poc.estetica@conectalestesp.com.br",
    cor:    "#db2777",
    bairro: "Tatuapé",
    servicos: [
      { nome: "Limpeza de Pele",             preco: 12000, duracao: 60 },
      { nome: "Design de Sobrancelha",       preco: 4000,  duracao: 30 },
      { nome: "Depilação Perna Inteira",     preco: 8000,  duracao: 60 },
      { nome: "Depilação Buço",              preco: 2500,  duracao: 15 },
      { nome: "Micropigmentação Sobrancelha", preco: 35000, duracao: 120 },
      { nome: "Drenagem Linfática",          preco: 11000, duracao: 60 },
      { nome: "Massagem Relaxante",          preco: 10000, duracao: 60 },
    ],
    profissionais: [
      { nome: "Fernanda Costa", servicos: ["Limpeza de Pele", "Micropigmentação Sobrancelha", "Drenagem Linfática", "Massagem Relaxante"] },
      { nome: "Patrícia Alves", servicos: ["Design de Sobrancelha", "Depilação Perna Inteira", "Depilação Buço"] },
    ],
  },
  {
    slug:   "manicure-demo",
    nome:   "Nail Studio da Ju",
    email:  "poc.manicure@conectalestesp.com.br",
    cor:    "#f43f5e",
    bairro: "Mooca",
    servicos: [
      { nome: "Manicure",             preco: 3000,  duracao: 40 },
      { nome: "Pedicure",             preco: 4000,  duracao: 50 },
      { nome: "Manicure + Pedicure",  preco: 6500,  duracao: 80 },
      { nome: "Gel",                  preco: 8000,  duracao: 60 },
      { nome: "Fibra de Vidro",       preco: 10000, duracao: 90 },
      { nome: "Nail Art (por unha)",  preco: 500,   duracao: 10 },
      { nome: "Esmaltação em Gel",    preco: 4500,  duracao: 30 },
    ],
    profissionais: [
      { nome: "Juliana Reis",   servicos: ["Manicure", "Pedicure", "Manicure + Pedicure", "Nail Art (por unha)"] },
      { nome: "Camila Souza",   servicos: ["Gel", "Fibra de Vidro", "Esmaltação em Gel"] },
    ],
  },
  {
    slug:   "clinica-demo",
    nome:   "Clínica Saúde & Bem-Estar",
    email:  "poc.clinica@conectalestesp.com.br",
    cor:    "#0ea5e9",
    bairro: "Água Rasa",
    servicos: [
      { nome: "Consulta Clínica Geral",     preco: 20000, duracao: 30 },
      { nome: "Avaliação Nutricional",      preco: 18000, duracao: 50 },
      { nome: "Consulta Dermatologista",    preco: 25000, duracao: 30 },
      { nome: "Retorno",                    preco: 10000, duracao: 20 },
      { nome: "Exame de Rotina",            preco: 15000, duracao: 20 },
    ],
    profissionais: [
      { nome: "Dra. Ana Beatriz",  servicos: ["Consulta Clínica Geral", "Retorno", "Exame de Rotina"] },
      { nome: "Dr. Roberto Mendes", servicos: ["Avaliação Nutricional"] },
      { nome: "Dra. Carla Nunes",  servicos: ["Consulta Dermatologista", "Retorno"] },
    ],
  },
];

// ─── Provisiona um POC ────────────────────────────────────────────────────────

async function provision(poc: Poc) {
  console.log(`\n▶  ${poc.nome} (${poc.slug})`);

  // 1. Verifica se slug já existe
  const { data: existing } = await supabase
    .from("businesses").select("id").eq("slug", poc.slug).maybeSingle();
  if (existing) {
    console.log(`   ⚠  slug já existe — pulando`);
    return;
  }

  // 2. Cria auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: poc.email,
    password: "Demo@2025",
    email_confirm: true,
  });
  if (authErr && !authErr.message.includes("already")) {
    console.error(`   ✗  auth: ${authErr.message}`);
    return;
  }
  const ownerId = authData?.user?.id;
  if (!ownerId) {
    console.error("   ✗  não obteve owner_id");
    return;
  }

  // 3. Cria business
  const { data: biz, error: bizErr } = await supabase
    .from("businesses")
    .insert({
      owner_id:      ownerId,
      slug:          poc.slug,
      name:          poc.nome,
      primary_color: poc.cor,
      address: {
        neighborhood: poc.bairro,
        city: "São Paulo",
        state: "SP",
        formatted: `${poc.bairro}, São Paulo - SP`,
      },
    })
    .select("id").single();
  if (bizErr || !biz) {
    console.error(`   ✗  business: ${bizErr?.message}`);
    return;
  }

  // 4. Horários padrão
  await supabase.from("business_hours").insert(defaultHours(biz.id));

  // 5. Serviços
  const serviceMap: Record<string, string> = {};
  for (let i = 0; i < poc.servicos.length; i++) {
    const s = poc.servicos[i];
    const { data: svc, error: svcErr } = await supabase
      .from("services")
      .insert({
        business_id:   biz.id,
        name:          s.nome,
        price_cents:   s.preco,
        duration_min:  s.duracao,
        display_order: i,
      })
      .select("id").single();
    if (svcErr || !svc) {
      console.error(`   ✗  serviço "${s.nome}": ${svcErr?.message}`);
    } else {
      serviceMap[s.nome] = svc.id;
    }
  }

  // 6. Profissionais + vínculos
  for (const prof of poc.profissionais) {
    const { data: p, error: pErr } = await supabase
      .from("professionals")
      .insert({ business_id: biz.id, name: prof.nome })
      .select("id").single();
    if (pErr || !p) {
      console.error(`   ✗  profissional "${prof.nome}": ${pErr?.message}`);
      continue;
    }
    const links = prof.servicos
      .filter(n => serviceMap[n])
      .map(n => ({ professional_id: p.id, service_id: serviceMap[n] }));
    if (links.length) await supabase.from("professional_services").insert(links);
  }

  console.log(`   ✓  criado — ${poc.servicos.length} serviços, ${poc.profissionais.length} profissionais`);
  console.log(`   📧  ${poc.email}  🔑  Demo@2025`);
  console.log(`   🔗  /{slug}: ${poc.slug}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  Seed POC Clients — Conecta Leste SP  ");
  console.log("═══════════════════════════════════════");

  for (const poc of POCS) {
    await provision(poc);
  }

  console.log("\n═══════════════════════════════════════");
  console.log("  Concluído!");
  console.log("  Senha padrão de todas as contas: Demo@2025");
  console.log("═══════════════════════════════════════\n");
}

main().catch(console.error);
