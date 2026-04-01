"use client";

import { useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  X, ArrowLeft, ArrowRight, Check, Plus, Trash,
  Buildings, ShoppingBag, Gear, Wrench, Users, ClipboardText,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductKey = "marque_ja" | "social_media" | "vitrine" | "persona_ia";

interface Produto {
  product: ProductKey;
  monthly_price_cents: number;
  billing_day: number;
  status: "active" | "trial";
}

interface Horario {
  dia: number;
  ativo: boolean;
  abertura: string;
  fechamento: string;
}

interface Servico {
  nome: string;
  preco_cents: number;
  duracao_min: number;
}

interface Profissional {
  nome: string;
  servicos_idx: number[];
}

interface WizardData {
  // Step 1
  nome: string;
  dono: string;
  email: string;
  telefone: string;
  segmento: string;
  bairro: string;
  slug: string;
  // Step 2
  produtos: Produto[];
  // Step 3 — Marque Já
  tema_cor: string;
  horarios: Horario[];
  // Step 4
  servicos: Servico[];
  // Step 5
  profissionais: Profissional[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_OPTIONS: { key: ProductKey; label: string; desc: string; price: number }[] = [
  { key: "marque_ja",    label: "Marque Já",       desc: "Sistema de agendamento online",   price: 8900 },
  { key: "social_media", label: "Social Media",     desc: "Gestão de redes sociais",         price: 11900 },
  { key: "vitrine",      label: "Vitrine Digital",  desc: "Página de apresentação do negócio", price: 4900 },
  { key: "persona_ia",   label: "Persona IA",       desc: "Atendente virtual no WhatsApp",   price: 14900 },
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const TEMA_CORES = [
  "#F97316", "#3B82F6", "#8B5CF6", "#EC4899",
  "#10B981", "#EF4444", "#F59E0B", "#14B8A6",
  "#6366F1", "#84CC16", "#06B6D4", "#A855F7",
];

const SEGMENTOS = [
  "Barbearia", "Salão de Beleza", "Clínica", "Restaurante",
  "Lanchonete", "Padaria", "Pet Shop", "Academia",
  "Loja de Roupas", "Mercado", "Mecânica", "Farmácia", "Outro",
];

function defaultHorarios(): Horario[] {
  return DIAS_SEMANA.map((_, i) => ({
    dia: i,
    ativo: i >= 1 && i <= 6, // Seg–Sáb aberto, Dom fechado
    abertura: "09:00",
    fechamento: "18:00",
  }));
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Step config ──────────────────────────────────────────────────────────────

interface StepConfig {
  id: number;
  label: string;
  icon: React.ElementType;
  conditional?: boolean; // só aparece se Marque Já selecionado
}

const ALL_STEPS: StepConfig[] = [
  { id: 1, label: "Negócio",      icon: Buildings    },
  { id: 2, label: "Produtos",     icon: ShoppingBag  },
  { id: 3, label: "Marque Já",    icon: Gear,         conditional: true },
  { id: 4, label: "Serviços",     icon: Wrench,       conditional: true },
  { id: 5, label: "Profissionais",icon: Users,        conditional: true },
  { id: 6, label: "Revisão",      icon: ClipboardText },
];

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.18s ease;
`;

const Sheet = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%; max-width: 620px;
  max-height: calc(100dvh - 40px);
  display: flex; flex-direction: column;
  animation: ${slideUp} 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7),
              0 0 0 1px rgba(255, 255, 255, 0.04);
`;

const SheetHeader = styled.div`
  padding: 22px 24px 0;
  flex-shrink: 0;
`;

const HeaderRow = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 18px;
`;

const HeaderText = styled.div`flex: 1; min-width: 0;`;

const Title = styled.h2`
  font-size: 16px; font-weight: 700;
  color: var(--color-text); letter-spacing: -0.3px;
`;
const Subtitle = styled.p`
  font-size: 13px; color: var(--color-text-muted); margin-top: 4px; line-height: 1.5;
`;

const CloseBtn = styled.button`
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted); flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
  &:hover { background: var(--color-surface-2); color: var(--color-text); }
`;

// Progress bar
const ProgressWrap = styled.div`
  padding: 0 24px 20px;
  border-bottom: 1px solid var(--color-border);
`;

const ProgressBar = styled.div`
  display: flex; gap: 4px; margin-bottom: 10px;
`;

const ProgressSegment = styled.div<{ $done: boolean; $active: boolean }>`
  flex: 1; height: 3px; border-radius: 99px;
  background: ${({ $done, $active }) =>
    $done || $active ? "var(--color-primary)" : "var(--color-border)"};
  opacity: ${({ $active, $done }) => ($done ? 1 : $active ? 0.6 : 0.3)};
  transition: background 0.3s ease, opacity 0.3s ease;
`;

const StepMeta = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;

const StepCounter = styled.span`
  font-size: 11.5px; font-weight: 600; color: var(--color-primary); letter-spacing: 0.3px;
`;

const StepTitle = styled.span`
  font-size: 11.5px; color: var(--color-text-muted);
`;

// Body
const SheetBody = styled.div`
  flex: 1; overflow-y: auto; padding: 24px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
`;

// Footer
const SheetFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-shrink: 0;
  background: var(--color-surface);
`;

const FooterLeft  = styled.div`display: flex; gap: 8px;`;
const FooterRight = styled.div`display: flex; gap: 8px;`;

// Form primitives
const FieldGroup = styled.div`display: flex; flex-direction: column; gap: 18px;`;
const Row2 = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 14px;`;
const _Row3 = styled.div`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;`;

const FieldLabel = styled.label`font-size: 12.5px; font-weight: 500; color: var(--color-text-muted); display: block; margin-bottom: 6px;`;

const StyledSelect = styled.select`
  width: 100%; height: 40px;
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); color: var(--color-text);
  font-size: 13.5px; font-family: inherit; padding: 0 12px; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
`;

const SectionTitle = styled.p`
  font-size: 12px; font-weight: 600; color: var(--color-text-muted);
  letter-spacing: 0; padding-bottom: 12px; margin-top: 8px;
  border-bottom: 1px solid var(--color-border);
`;

// Product cards
const ProductGrid = styled.div`display: flex; flex-direction: column; gap: 10px;`;

const ProductCard = styled.div<{ $selected: boolean }>`
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid ${({ $selected }) => ($selected ? "var(--color-primary)" : "var(--color-border)")};
  background: ${({ $selected }) => ($selected ? "rgba(249,115,22,0.04)" : "var(--color-surface-2)")};
  cursor: pointer; transition: all 0.15s;
  &:hover { border-color: ${({ $selected }) => ($selected ? "var(--color-primary)" : "#3a3a3a")}; }
`;

const ProductCheckbox = styled.div<{ $selected: boolean }>`
  width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;
  border: 2px solid ${({ $selected }) => ($selected ? "var(--color-primary)" : "var(--color-border)")};
  background: ${({ $selected }) => ($selected ? "var(--color-primary)" : "transparent")};
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
`;

const ProductInfo = styled.div`flex: 1;`;
const ProductName = styled.p`font-size: 13.5px; font-weight: 600; color: var(--color-text);`;
const ProductDesc = styled.p`font-size: 12px; color: var(--color-text-muted); margin-top: 1px;`;

const ProductPriceWrap = styled.div`display: flex; align-items: center; gap: 8px;`;

const PriceInput = styled.input`
  width: 110px; height: 34px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); color: var(--color-text);
  font-size: 13px; font-family: inherit; padding: 0 10px; outline: none;
  text-align: right;
  transition: border-color 0.15s;
  &:focus { border-color: var(--color-primary); }
`;

const StatusToggle = styled.button<{ $trial: boolean }>`
  padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 600;
  color: ${({ $trial }) => ($trial ? "#EAB308" : "var(--color-success)")};
  background: ${({ $trial }) => ($trial ? "rgba(234,179,8,0.1)" : "rgba(34,197,94,0.1)")};
  border: 1px solid ${({ $trial }) => ($trial ? "rgba(234,179,8,0.3)" : "rgba(34,197,94,0.3)")};
  transition: all 0.15s; white-space: nowrap;
`;

// Color picker
const ColorGrid = styled.div`display: flex; flex-wrap: wrap; gap: 10px;`;
const ColorSwatch = styled.button<{ $color: string; $selected: boolean }>`
  width: 36px; height: 36px; border-radius: 10px;
  background: ${({ $color }) => $color};
  border: 3px solid ${({ $selected }) => ($selected ? "var(--color-text)" : "transparent")};
  box-shadow: ${({ $selected }) => ($selected ? "0 0 0 1px var(--color-border)" : "none")};
  transition: all 0.15s; cursor: pointer;
  &:hover { transform: scale(1.1); }
`;

// Horários
const HorariosTable = styled.div`display: flex; flex-direction: column; gap: 6px;`;
const HorarioRow = styled.div`
  display: grid; grid-template-columns: 48px 1fr 1fr 1fr;
  align-items: center; gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
`;

const DiaLabel = styled.span<{ $ativo: boolean }>`
  font-size: 12.5px; font-weight: 600;
  color: ${({ $ativo }) => ($ativo ? "var(--color-text)" : "var(--color-text-muted)")};
`;

const Toggle = styled.button<{ $on: boolean }>`
  width: 36px; height: 20px; border-radius: 10px;
  background: ${({ $on }) => ($on ? "var(--color-primary)" : "var(--color-border)")};
  position: relative; transition: background 0.2s; cursor: pointer;
  &::after {
    content: ""; position: absolute;
    top: 2px; left: ${({ $on }) => ($on ? "18px" : "2px")};
    width: 16px; height: 16px; border-radius: 50%;
    background: white; transition: left 0.2s;
  }
`;

const TimeInput = styled.input`
  height: 32px; border-radius: var(--radius-sm);
  background: var(--color-surface); border: 1px solid var(--color-border);
  color: var(--color-text); font-size: 13px; font-family: inherit;
  padding: 0 10px; outline: none; width: 100%;
  &:focus { border-color: var(--color-primary); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`;

// Serviços / Profissionais
const ListSection = styled.div`display: flex; flex-direction: column; gap: 8px;`;

const ListItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
`;

const DeleteBtn = styled.button`
  width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted); border: 1px solid var(--color-border);
  transition: all 0.15s;
  &:hover { background: rgba(239,68,68,0.08); color: #EF4444; border-color: rgba(239,68,68,0.25); }
`;

const AddRow = styled.div`
  display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;
`;

const SmallInput = styled.input`
  height: 36px; border-radius: var(--radius-sm);
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  color: var(--color-text); font-size: 13px; font-family: inherit;
  padding: 0 10px; outline: none;
  &:focus { border-color: var(--color-primary); }
  &::placeholder { color: var(--color-text-muted); opacity: 0.6; }
`;

// Revisão
const ReviewSection = styled.div`
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px;
`;

const ReviewTitle = styled.p`font-size: 11px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;`;
const ReviewRow   = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;`;
const ReviewKey   = styled.span`font-size: 13px; color: var(--color-text-muted);`;
const ReviewVal   = styled.span`font-size: 13px; font-weight: 500; color: var(--color-text); text-align: right; max-width: 60%;`;

const SlugPreview = styled.div`
  font-size: 12px; color: var(--color-text-muted); margin-top: 4px;
  span { color: var(--color-primary); font-weight: 500; }
`;

const TagsRow = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;
const Tag = styled.span`
  font-size: 11.5px; padding: 3px 9px; border-radius: 4px;
  background: rgba(249,115,22,0.08); color: var(--color-primary);
  border: 1px solid rgba(249,115,22,0.15); font-weight: 500;
`;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<WizardData>;
}

// ─── Wizard Component ─────────────────────────────────────────────────────────

const INITIAL: WizardData = {
  nome: "", dono: "", email: "", telefone: "", segmento: SEGMENTOS[0], bairro: "", slug: "",
  produtos: [],
  tema_cor: TEMA_CORES[0],
  horarios: defaultHorarios(),
  servicos: [],
  profissionais: [],
};

export default function NovoClienteWizard({ onClose, onSuccess, initialData }: Props) {
  const [data, setData] = useState<WizardData>({ ...INITIAL, ...initialData });
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [provisionResult, setProvisionResult] = useState<{ slug: string; temp_password: string } | null>(null);

  // temp state for add forms
  const [newServico,    setNewServico]    = useState({ nome: "", preco: "", duracao: "" });
  const [newProfissional, setNewProfissional] = useState({ nome: "", servicos_idx: [] as number[] });

  const temMarqueJa = data.produtos.some((p) => p.product === "marque_ja");

  const visibleSteps = ALL_STEPS.filter((s) => !s.conditional || temMarqueJa);

  // Current step index in visibleSteps
  const currentIdx  = visibleSteps.findIndex((s) => s.id === step);
  const _currentStep = visibleSteps[currentIdx];
  const isFirst     = currentIdx === 0;
  const isLast      = currentIdx === visibleSteps.length - 1;

  function goNext() {
    if (isLast) return;
    setStep(visibleSteps[currentIdx + 1].id);
  }

  function goPrev() {
    if (isFirst) return;
    setStep(visibleSteps[currentIdx - 1].id);
  }

  function set<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    setData((d) => ({ ...d, [key]: val }));
  }

  // ─── Step 1 helpers ───────────────────────────────────────────────────────

  function handleNomeChange(nome: string) {
    setData((d) => ({ ...d, nome, slug: slugify(nome) }));
  }

  // ─── Step 2 helpers ───────────────────────────────────────────────────────

  function toggleProduct(key: ProductKey, defaultPrice: number) {
    setData((d) => {
      const exists = d.produtos.find((p) => p.product === key);
      if (exists) return { ...d, produtos: d.produtos.filter((p) => p.product !== key) };
      return {
        ...d,
        produtos: [...d.produtos, { product: key, monthly_price_cents: defaultPrice, billing_day: 5, status: "active" }],
      };
    });
  }

  function updateProduto(key: ProductKey, patch: Partial<Omit<Produto, "product">>) {
    setData((d) => ({
      ...d,
      produtos: d.produtos.map((p) => (p.product === key ? { ...p, ...patch } : p)),
    }));
  }

  // ─── Step 4 helpers ───────────────────────────────────────────────────────

  function addServico() {
    if (!newServico.nome.trim()) return;
    const preco    = Math.round(parseFloat(newServico.preco.replace(",", ".")) * 100) || 0;
    const duracao  = parseInt(newServico.duracao) || 30;
    setData((d) => ({ ...d, servicos: [...d.servicos, { nome: newServico.nome.trim(), preco_cents: preco, duracao_min: duracao }] }));
    setNewServico({ nome: "", preco: "", duracao: "" });
  }

  function removeServico(idx: number) {
    setData((d) => ({
      ...d,
      servicos: d.servicos.filter((_, i) => i !== idx),
      profissionais: d.profissionais.map((pr) => ({
        ...pr,
        servicos_idx: pr.servicos_idx.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)),
      })),
    }));
  }

  // ─── Step 5 helpers ───────────────────────────────────────────────────────

  function addProfissional() {
    if (!newProfissional.nome.trim()) return;
    setData((d) => ({
      ...d,
      profissionais: [...d.profissionais, { nome: newProfissional.nome.trim(), servicos_idx: newProfissional.servicos_idx }],
    }));
    setNewProfissional({ nome: "", servicos_idx: [] });
  }

  function removeProfissional(idx: number) {
    setData((d) => ({ ...d, profissionais: d.profissionais.filter((_, i) => i !== idx) }));
  }

  function toggleProfServico(sIdx: number) {
    setNewProfissional((p) => ({
      ...p,
      servicos_idx: p.servicos_idx.includes(sIdx)
        ? p.servicos_idx.filter((i) => i !== sIdx)
        : [...p.servicos_idx, sIdx],
    }));
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    try {
      // 1. Criar cliente
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         data.nome.trim(),
          owner_name:   data.dono.trim()     || null,
          owner_email:  data.email.trim()    || null,
          phone:        data.telefone.trim() || null,
          segment:      data.segmento        || null,
          neighborhood: data.bairro.trim()   || null,
          status:       "active",
          notes:        data.slug ? `slug:${data.slug}` : null,
        }),
      });
      if (!clientRes.ok) throw new Error("Falha ao criar cliente.");
      const client = await clientRes.json();

      // 2. Criar produtos
      for (const produto of data.produtos) {
        await fetch("/api/clients/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: client.id, ...produto }),
        });
      }

      // 3. Provisionar Marque Já (se tem produto marque_ja e e-mail informado)
      const temMarqueJa = data.produtos.some((p) => p.product === "marque_ja");
      if (temMarqueJa && data.email.trim()) {
        const provRes = await fetch("/api/provision-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id:     client.id,
            email:         data.email.trim(),
            nome:          data.nome.trim(),
            slug:          data.slug.trim() || undefined,
            primary_color: data.tema_cor,
            phone_whatsapp: data.telefone.trim() || undefined,
            neighborhood:  data.bairro.trim()   || undefined,
            horarios:      data.horarios,
            servicos:      data.servicos,
            profissionais: data.profissionais,
          }),
        });

        if (provRes.ok) {
          const prov = await provRes.json();
          setProvisionResult({ slug: prov.slug, temp_password: prov.temp_password });
          return; // não chama onSuccess() ainda — aguarda o usuário fechar o modal de credenciais
        } else {
          const err = await provRes.json();
          console.error("Provisionamento falhou:", err.error);
          // Não bloqueia — cliente foi criado no Hub, provisionamento pode ser refeito
        }
      }

      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  }, [data, onSuccess]);

  // ─── Validation per step ──────────────────────────────────────────────────

  function canProceed() {
    if (step === 1) return data.nome.trim().length >= 2;
    if (step === 2) return data.produtos.length > 0;
    return true;
  }

  // ─── Step renderers ───────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {
      // ─── Step 1: Dados do Negócio ────────────────────────────────────────
      case 1:
        return (
          <FieldGroup>
            <SectionTitle>Informações do Estabelecimento</SectionTitle>
            <Input
              label="Nome do estabelecimento *"
              placeholder="Ex: Barbearia do Zé"
              value={data.nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              fullWidth
            />
            {data.slug && (
              <SlugPreview>
                Link do agendamento: marqueja.conectalestesp.com.br/<span>{data.slug}</span>
                {" "}·{" "}
                <input
                  style={{ background: "transparent", border: "none", color: "var(--color-primary)", fontWeight: 500, fontSize: 12, outline: "none", padding: 0 }}
                  value={data.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                />
              </SlugPreview>
            )}
            <Row2>
              <div>
                <FieldLabel>Segmento</FieldLabel>
                <StyledSelect value={data.segmento} onChange={(e) => set("segmento", e.target.value)}>
                  {SEGMENTOS.map((s) => <option key={s}>{s}</option>)}
                </StyledSelect>
              </div>
              <Input
                label="Bairro"
                placeholder="Ex: Itaquera"
                value={data.bairro}
                onChange={(e) => set("bairro", e.target.value)}
                fullWidth
              />
            </Row2>
            <SectionTitle style={{ marginTop: 4 }}>Contato do Dono</SectionTitle>
            <Row2>
              <Input
                label="Nome do dono"
                placeholder="Ex: José Silva"
                value={data.dono}
                onChange={(e) => set("dono", e.target.value)}
                fullWidth
              />
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                value={data.telefone}
                onChange={(e) => set("telefone", e.target.value)}
                fullWidth
              />
            </Row2>
            <Input
              label="E-mail"
              placeholder="jose@email.com"
              value={data.email}
              onChange={(e) => set("email", e.target.value)}
              fullWidth
            />
          </FieldGroup>
        );

      // ─── Step 2: Produtos ────────────────────────────────────────────────
      case 2:
        return (
          <FieldGroup>
            <SectionTitle>Selecione os produtos contratados</SectionTitle>
            <ProductGrid>
              {PRODUCT_OPTIONS.map((opt) => {
                const selected = data.produtos.find((p) => p.product === opt.key);
                return (
                  <ProductCard key={opt.key} $selected={!!selected} onClick={() => toggleProduct(opt.key, opt.price)}>
                    <ProductCheckbox $selected={!!selected}>
                      {selected && <Check size={12} weight="bold" color="white" />}
                    </ProductCheckbox>
                    <ProductInfo>
                      <ProductName>{opt.label}</ProductName>
                      <ProductDesc>{opt.desc}</ProductDesc>
                    </ProductInfo>
                    {selected && (
                      <ProductPriceWrap onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 500 }}>R$/mês</span>
                          <PriceInput
                            type="number"
                            value={(selected.monthly_price_cents / 100).toFixed(2)}
                            onChange={(e) => updateProduto(opt.key, { monthly_price_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                            min={0}
                            step={1}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 500 }}>Dia cobr.</span>
                          <PriceInput
                            type="number"
                            value={selected.billing_day}
                            onChange={(e) => updateProduto(opt.key, { billing_day: parseInt(e.target.value) || 5 })}
                            min={1} max={28} style={{ width: 64 }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 500 }}>Status</span>
                          <StatusToggle
                            $trial={selected.status === "trial"}
                            onClick={() => updateProduto(opt.key, { status: selected.status === "trial" ? "active" : "trial" })}
                          >
                            {selected.status === "trial" ? "Trial" : "Ativo"}
                          </StatusToggle>
                        </div>
                      </ProductPriceWrap>
                    )}
                  </ProductCard>
                );
              })}
            </ProductGrid>
          </FieldGroup>
        );

      // ─── Step 3: Setup Marque Já ─────────────────────────────────────────
      case 3:
        return (
          <FieldGroup>
            <SectionTitle>Identidade Visual</SectionTitle>
            <div>
              <FieldLabel>Cor principal do tema</FieldLabel>
              <ColorGrid>
                {TEMA_CORES.map((cor) => (
                  <ColorSwatch key={cor} $color={cor} $selected={data.tema_cor === cor} onClick={() => set("tema_cor", cor)} />
                ))}
              </ColorGrid>
            </div>

            <SectionTitle style={{ marginTop: 8 }}>Horários de Funcionamento</SectionTitle>
            <HorariosTable>
              {data.horarios.map((h, i) => (
                <HorarioRow key={h.dia}>
                  <DiaLabel $ativo={h.ativo}>{DIAS_SEMANA[h.dia]}</DiaLabel>
                  <Toggle $on={h.ativo} onClick={() => {
                    const updated = [...data.horarios];
                    updated[i] = { ...h, ativo: !h.ativo };
                    set("horarios", updated);
                  }} />
                  <TimeInput
                    type="time" value={h.abertura} disabled={!h.ativo}
                    onChange={(e) => {
                      const updated = [...data.horarios];
                      updated[i] = { ...h, abertura: e.target.value };
                      set("horarios", updated);
                    }}
                  />
                  <TimeInput
                    type="time" value={h.fechamento} disabled={!h.ativo}
                    onChange={(e) => {
                      const updated = [...data.horarios];
                      updated[i] = { ...h, fechamento: e.target.value };
                      set("horarios", updated);
                    }}
                  />
                </HorarioRow>
              ))}
            </HorariosTable>
          </FieldGroup>
        );

      // ─── Step 4: Serviços ────────────────────────────────────────────────
      case 4:
        return (
          <FieldGroup>
            <SectionTitle>Serviços oferecidos</SectionTitle>
            <ListSection>
              {data.servicos.map((s, i) => (
                <ListItem key={i}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text)" }}>{s.nome}</p>
                    <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                      {formatBRL(s.preco_cents)} · {s.duracao_min} min
                    </p>
                  </div>
                  <DeleteBtn onClick={() => removeServico(i)}><Trash size={13} /></DeleteBtn>
                </ListItem>
              ))}
            </ListSection>

            <AddRow>
              <SmallInput style={{ flex: 2, minWidth: 120 }} placeholder="Nome do serviço *" value={newServico.nome}
                onChange={(e) => setNewServico((s) => ({ ...s, nome: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addServico()}
              />
              <SmallInput style={{ width: 90 }} placeholder="R$ preço" value={newServico.preco}
                onChange={(e) => setNewServico((s) => ({ ...s, preco: e.target.value }))}
              />
              <SmallInput style={{ width: 80 }} placeholder="Min" type="number" value={newServico.duracao}
                onChange={(e) => setNewServico((s) => ({ ...s, duracao: e.target.value }))}
              />
              <Button variant="secondary" size="sm" icon={<Plus size={13} weight="bold" />} onClick={addServico}
                disabled={!newServico.nome.trim()}
              >
                Adicionar
              </Button>
            </AddRow>
            {data.servicos.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", textAlign: "center", padding: "12px 0" }}>
                Nenhum serviço adicionado ainda.
              </p>
            )}
          </FieldGroup>
        );

      // ─── Step 5: Profissionais ───────────────────────────────────────────
      case 5:
        return (
          <FieldGroup>
            <SectionTitle>Profissionais</SectionTitle>
            <ListSection>
              {data.profissionais.map((pr, i) => (
                <ListItem key={i}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text)" }}>{pr.nome}</p>
                    {pr.servicos_idx.length > 0 && (
                      <TagsRow style={{ marginTop: 4 }}>
                        {pr.servicos_idx.map((si) => data.servicos[si] && (
                          <Tag key={si}>{data.servicos[si].nome}</Tag>
                        ))}
                      </TagsRow>
                    )}
                  </div>
                  <DeleteBtn onClick={() => removeProfissional(i)}><Trash size={13} /></DeleteBtn>
                </ListItem>
              ))}
            </ListSection>

            <div>
              <FieldLabel>Novo profissional</FieldLabel>
              <AddRow style={{ marginBottom: 8 }}>
                <SmallInput style={{ flex: 1 }} placeholder="Nome do profissional *"
                  value={newProfissional.nome}
                  onChange={(e) => setNewProfissional((p) => ({ ...p, nome: e.target.value }))}
                />
              </AddRow>
              {data.servicos.length > 0 && (
                <div>
                  <FieldLabel>Serviços que realiza</FieldLabel>
                  <TagsRow style={{ marginBottom: 10 }}>
                    {data.servicos.map((s, si) => {
                      const sel = newProfissional.servicos_idx.includes(si);
                      return (
                        <button key={si} onClick={() => toggleProfServico(si)} style={{
                          padding: "3px 9px", borderRadius: 4, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                          background: sel ? "rgba(249,115,22,0.12)" : "var(--color-surface-2)",
                          color: sel ? "var(--color-primary)" : "var(--color-text-muted)",
                          border: `1px solid ${sel ? "rgba(249,115,22,0.3)" : "var(--color-border)"}`,
                          transition: "all 0.15s",
                        }}>
                          {s.nome}
                        </button>
                      );
                    })}
                  </TagsRow>
                </div>
              )}
              <Button variant="secondary" size="sm" icon={<Plus size={13} weight="bold" />}
                onClick={addProfissional} disabled={!newProfissional.nome.trim()}
              >
                Adicionar Profissional
              </Button>
            </div>
            {data.profissionais.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", textAlign: "center", padding: "8px 0" }}>
                Nenhum profissional adicionado ainda.
              </p>
            )}
          </FieldGroup>
        );

      // ─── Step 6: Revisão ─────────────────────────────────────────────────
      case 6:
        return (
          <div>
            <ReviewSection>
              <ReviewTitle>Dados do Negócio</ReviewTitle>
              <ReviewRow><ReviewKey>Nome</ReviewKey><ReviewVal>{data.nome || "—"}</ReviewVal></ReviewRow>
              <ReviewRow><ReviewKey>Segmento</ReviewKey><ReviewVal>{data.segmento}</ReviewVal></ReviewRow>
              <ReviewRow><ReviewKey>Bairro</ReviewKey><ReviewVal>{data.bairro || "—"}</ReviewVal></ReviewRow>
              <ReviewRow><ReviewKey>Dono</ReviewKey><ReviewVal>{data.dono || "—"}</ReviewVal></ReviewRow>
              <ReviewRow><ReviewKey>WhatsApp</ReviewKey><ReviewVal>{data.telefone || "—"}</ReviewVal></ReviewRow>
              <ReviewRow><ReviewKey>E-mail</ReviewKey><ReviewVal>{data.email || "—"}</ReviewVal></ReviewRow>
              {data.slug && <ReviewRow><ReviewKey>Slug</ReviewKey><ReviewVal style={{ color: "var(--color-primary)" }}>{data.slug}</ReviewVal></ReviewRow>}
            </ReviewSection>

            <ReviewSection>
              <ReviewTitle>Produtos Contratados</ReviewTitle>
              {data.produtos.length === 0 ? (
                <ReviewRow><ReviewKey style={{ color: "var(--color-danger)" }}>Nenhum produto selecionado</ReviewKey></ReviewRow>
              ) : (
                data.produtos.map((p) => {
                  const opt = PRODUCT_OPTIONS.find((o) => o.key === p.product)!;
                  return (
                    <ReviewRow key={p.product}>
                      <ReviewKey>{opt?.label}</ReviewKey>
                      <ReviewVal>{formatBRL(p.monthly_price_cents)}/mês · dia {p.billing_day} · {p.status === "trial" ? "Trial" : "Ativo"}</ReviewVal>
                    </ReviewRow>
                  );
                })
              )}
              {data.produtos.length > 0 && (
                <ReviewRow style={{ marginTop: 8, borderTop: "1px solid var(--color-border)", paddingTop: 8 }}>
                  <ReviewKey style={{ fontWeight: 700, color: "var(--color-text)" }}>MRR Total</ReviewKey>
                  <ReviewVal style={{ fontWeight: 800, color: "var(--color-primary)" }}>
                    {formatBRL(data.produtos.reduce((s, p) => s + p.monthly_price_cents, 0))}/mês
                  </ReviewVal>
                </ReviewRow>
              )}
            </ReviewSection>

            {temMarqueJa && (
              <>
                <ReviewSection>
                  <ReviewTitle>Marque Já</ReviewTitle>
                  <ReviewRow>
                    <ReviewKey>Cor do tema</ReviewKey>
                    <ReviewVal>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 3, background: data.tema_cor, display: "inline-block" }} />
                        {data.tema_cor}
                      </span>
                    </ReviewVal>
                  </ReviewRow>
                  <ReviewRow>
                    <ReviewKey>Dias ativos</ReviewKey>
                    <ReviewVal>{data.horarios.filter((h) => h.ativo).map((h) => DIAS_SEMANA[h.dia]).join(", ")}</ReviewVal>
                  </ReviewRow>
                </ReviewSection>

                {data.servicos.length > 0 && (
                  <ReviewSection>
                    <ReviewTitle>Serviços ({data.servicos.length})</ReviewTitle>
                    {data.servicos.map((s, i) => (
                      <ReviewRow key={i}>
                        <ReviewKey>{s.nome}</ReviewKey>
                        <ReviewVal>{formatBRL(s.preco_cents)} · {s.duracao_min} min</ReviewVal>
                      </ReviewRow>
                    ))}
                  </ReviewSection>
                )}

                {data.profissionais.length > 0 && (
                  <ReviewSection>
                    <ReviewTitle>Profissionais ({data.profissionais.length})</ReviewTitle>
                    {data.profissionais.map((pr, i) => (
                      <ReviewRow key={i}>
                        <ReviewKey>{pr.nome}</ReviewKey>
                        <ReviewVal>{pr.servicos_idx.length > 0 ? pr.servicos_idx.map((si) => data.servicos[si]?.nome).join(", ") : "Todos os serviços"}</ReviewVal>
                      </ReviewRow>
                    ))}
                  </ReviewSection>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: "Dados do Negócio",       subtitle: "Informações do estabelecimento e contato" },
    2: { title: "Produtos Contratados",   subtitle: "Selecione o que o cliente vai contratar" },
    3: { title: "Setup Marque Já",        subtitle: "Tema e horários de funcionamento" },
    4: { title: "Serviços",               subtitle: "Serviços oferecidos pelo estabelecimento" },
    5: { title: "Profissionais",          subtitle: "Equipe e seus serviços" },
    6: { title: "Revisão",                subtitle: "Confira os dados antes de confirmar" },
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Sheet>
        <SheetHeader>
          <HeaderRow>
            <HeaderText>
              <Title>{stepTitles[step].title}</Title>
              <Subtitle>{stepTitles[step].subtitle}</Subtitle>
            </HeaderText>
            <CloseBtn onClick={onClose}><X size={16} weight="bold" /></CloseBtn>
          </HeaderRow>
        </SheetHeader>

        <ProgressWrap>
          <ProgressBar>
            {visibleSteps.map((s) => (
              <ProgressSegment
                key={s.id}
                $done={visibleSteps.findIndex((vs) => vs.id === step) > visibleSteps.findIndex((vs) => vs.id === s.id)}
                $active={step === s.id}
              />
            ))}
          </ProgressBar>
          <StepMeta>
            <StepCounter>Passo {currentIdx + 1} de {visibleSteps.length}</StepCounter>
            <StepTitle>{visibleSteps[currentIdx]?.label}</StepTitle>
          </StepMeta>
        </ProgressWrap>

        <SheetBody>{renderStep()}</SheetBody>

        <SheetFooter>
          <FooterLeft>
            <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={isFirst ? onClose : goPrev}>
              {isFirst ? "Cancelar" : "Voltar"}
            </Button>
          </FooterLeft>
          <FooterRight>
            {isLast ? (
              <Button variant="primary" loading={saving} onClick={handleSubmit}>
                Criar Cliente
              </Button>
            ) : (
              <Button
                variant="primary"
                iconRight={<ArrowRight size={15} weight="bold" />}
                disabled={!canProceed()}
                onClick={goNext}
              >
                Próximo
              </Button>
            )}
          </FooterRight>
        </SheetFooter>
      </Sheet>

      {/* Modal de credenciais Marque Já */}
      {provisionResult && (
        <Overlay onClick={() => { setProvisionResult(null); onSuccess(); }} style={{ zIndex: 110 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              maxWidth: 420,
              width: "90%",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>
                ✅ Cliente provisionado!
              </p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Conta Marque Já criada com sucesso. Anote e envie as credenciais ao cliente.
              </p>
            </div>
            <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>Link de agendamento</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>
                  marqueja.conectalestesp.com.br/{provisionResult.slug}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>Senha temporária</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)", letterSpacing: 2 }}>
                  {provisionResult.temp_password}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 20 }}>
              O cliente deve alterar a senha no primeiro acesso em marqueja.conectalestesp.com.br/{provisionResult.slug}/painel
            </p>
            <button
              onClick={() => { setProvisionResult(null); onSuccess(); }}
              style={{
                width: "100%", height: 40, borderRadius: "var(--radius-sm)",
                background: "var(--color-primary)", color: "#fff",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </Overlay>
      )}
    </Overlay>
  );
}
