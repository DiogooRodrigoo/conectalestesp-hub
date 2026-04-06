"use client";

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import {
  ArrowLeft,
  PencilSimple,
  Copy,
  Check,
  Plus,
  Phone,
  MapPin,
  CalendarBlank,
  User,
  Tag,
  ArrowSquareOut,
  Lock,
  LockOpen,
  Key,
  CaretDown,
  CaretUp,
  Clock,
  Scissors,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import type { ClientWithDetails, ClientStatus, ClientProduct, ProductStatus } from "@/types/database";
import { formatBRL, PRODUCT_LABELS } from "@/types/database";

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  max-width: 900px;
  animation: ${fadeUp} 0.3s ease both;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 24px;
`;

const BreadcrumbLink = styled(Link)`
  color: var(--color-text-muted);
  transition: color 0.15s;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover { color: var(--color-text); }
`;

const BreadcrumbSep = styled.span`
  font-size: 12px;
  opacity: 0.4;
`;

const BreadcrumbCurrent = styled.span`
  color: var(--color-text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ClienteTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.4px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
`;

const CardFull = styled(Card)`
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 8px;

  svg { color: var(--color-primary); }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child { border-bottom: none; }
`;

const InfoIcon = styled.div`
  width: 28px;
  height: 28px;
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
`;

const InfoLabel = styled.span`
  font-size: 11.5px;
  color: var(--color-text-muted);
  display: block;
  line-height: 1;
  margin-bottom: 2px;
`;

const InfoValue = styled.span`
  font-size: 13.5px;
  color: var(--color-text);
  font-weight: 500;
`;

const ProdutoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child { border-bottom: none; }
`;

const ProdutoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ProdutoNome = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
`;

const ProdutoMeta = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
`;

const ProdutoRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

// ─── Acesso ao Marque Já ──────────────────────────────────────────────────────

const AccessCard = styled(CardFull)`
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
`;

const AccessHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
`;

const AccessTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;

  svg { color: var(--color-primary); }
`;

const AccessActions = styled.div`
  display: flex;
  gap: 8px;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;

  &:last-child { margin-bottom: 0; }
`;

const LinkLeft = styled.div`
  min-width: 0;
  flex: 1;
`;

const LinkLabel = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: 2px;
`;

const LinkUrl = styled.span`
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const LinkBtns = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  margin-left: 10px;
`;

const IconBtn = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: var(--color-surface);
    color: var(--color-text);
  }
`;

const OwnerEmailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-top: 8px;
`;

const OwnerEmailLabel = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
`;

const OwnerEmailValue = styled.span`
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
`;

// ─── Nova senha modal ─────────────────────────────────────────────────────────

const NewPasswordBox = styled.div`
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
`;

const NewPasswordLabel = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
`;

const NewPasswordValue = styled.p`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--color-primary);
  font-family: monospace;
`;

const NewPasswordHint = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 12px;
`;

// ─── Configurações Marque Já ──────────────────────────────────────────────────

const ConfigToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 8px 0;
  transition: color 0.15s;
  width: 100%;
  justify-content: space-between;

  &:hover { color: var(--color-text); }
`;

const ConfigSection = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ConfigSubTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
`;

const HorariosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const HorarioChip = styled.div<{ $aberto: boolean }>`
  background: ${(p) =>
    p.$aberto
      ? "color-mix(in srgb, var(--color-success) 12%, var(--color-surface-2))"
      : "var(--color-surface-2)"};
  border: 1px solid ${(p) =>
    p.$aberto ? "color-mix(in srgb, var(--color-success) 40%, transparent)" : "var(--color-border)"};
  border-radius: var(--radius-sm);
  padding: 8px 6px;
  text-align: center;
`;

const HorarioDia = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 4px;
`;

const HorarioHora = styled.div`
  font-size: 10px;
  color: var(--color-text-muted);
  line-height: 1.4;
`;

const ServicoTable = styled.div`
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
`;

const ServicoHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px 70px 60px;
  padding: 8px 14px;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
`;

const ServicoHeaderCell = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ServicoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px 70px 60px;
  padding: 10px 14px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);

  &:last-child { border-bottom: none; }
`;

const ServicoCell = styled.div`
  font-size: 13px;
  color: var(--color-text);
`;

const ProfGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ProfChip = styled.div<{ $ativo: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: ${(p) => (p.$ativo ? "var(--color-text)" : "var(--color-text-muted)")};
  opacity: ${(p) => (p.$ativo ? 1 : 0.6)};
`;

const ConfigEmpty = styled.p`
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 16px 0;
`;

const ConfigError = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-danger);
  font-size: 13px;
  padding: 12px 0;
`;

// ─── Tabela de pagamentos ─────────────────────────────────────────────────────

const PagTable = styled.div`
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
`;

const PagHeader = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr 140px 80px;
  padding: 10px 14px;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
`;

const PagHeaderCell = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PagRow = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr 140px 80px;
  padding: 11px 14px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-surface-2); }
`;

const PagCell = styled.div`
  font-size: 13px;
  color: var(--color-text);
`;

const EmptyMsg = styled.p`
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 24px 0;
`;

// ─── Produto inline edit ─────────────────────────────────────────────────────

const ProdutoEditRow = styled.div`
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-top: 4px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ProdutoEditGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ProdutoEditLabel = styled.label`
  font-size: 11.5px;
  font-weight: 500;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: 4px;
`;

const ProdutoEditInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  &:focus { border-color: var(--color-primary); }
`;

const ProdutoEditSelect = styled.select`
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  &:focus { border-color: var(--color-primary); }
`;

const ProdutoEditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const AddProdutoBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--color-primary);
  border: 1px dashed rgba(249,115,22,0.3);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  width: 100%;
  justify-content: center;
  transition: all 0.15s;
  background: rgba(249,115,22,0.04);
  &:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.5); }
`;

// ─── Modal de edição ──────────────────────────────────────────────────────────

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const EditRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const EditLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: 6px;
`;

const EditSelect = styled.select`
  width: 100%;
  height: 40px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 13.5px;
  font-family: inherit;
  padding: 0 12px;
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: var(--color-primary); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active:    "Ativo",
  trial:     "Trial",
  inactive:  "Inativo",
  cancelled: "Cancelado",
};

function clientStatusVariant(status: ClientStatus) {
  if (status === "active")    return "success" as const;
  if (status === "trial")     return "warning" as const;
  if (status === "cancelled") return "danger"  as const;
  return "default" as const;
}

function productStatusVariant(status: ProductStatus) {
  if (status === "active")    return "success" as const;
  if (status === "paused")    return "warning" as const;
  return "danger" as const;
}

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active:    "Ativo",
  paused:    "Pausado",
  cancelled: "Cancelado",
};

function pagStatusVariant(status: string) {
  if (status === "paid")    return "success" as const;
  if (status === "overdue") return "danger"  as const;
  return "warning" as const;
}

const PAG_STATUS_LABELS: Record<string, string> = {
  paid:    "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    month: "short",
    year:  "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

const SEGMENTOS = [
  "Barbearia", "Salão de Beleza", "Clínica", "Restaurante",
  "Lanchonete", "Padaria", "Pet Shop", "Academia",
  "Loja de Roupas", "Mercado", "Mecânica", "Farmácia", "Outro",
];

const BASE_URL = "https://marqueja.conectalestesp.com.br";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarqueJaConfig {
  horarios: { dia: string; aberto: boolean; abertura: string; fechamento: string }[];
  servicos: { id: string; nome: string; preco_cents: number; duracao_min: number; ativo: boolean }[];
  profissionais: { id: string; nome: string; ativo: boolean }[];
}

interface Props {
  client: ClientWithDetails;
}

interface EditFormState {
  name: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  segment: string;
  neighborhood: string;
  status: ClientStatus;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClienteDetailView({ client }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localClient, setLocalClient] = useState(client);

  // ── Edição ──
  const [editOpen, setEditOpen]     = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm]     = useState<EditFormState>({
    name:         localClient.name,
    owner_name:   localClient.owner_name   ?? "",
    owner_email:  localClient.owner_email  ?? "",
    phone:        localClient.phone        ?? "",
    segment:      localClient.segment      ?? "",
    neighborhood: localClient.neighborhood ?? "",
    status:       localClient.status,
  });

  // ── Editar produto ──
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<{ price: string; status: string; billing_day: string }>({ price: "", status: "active", billing_day: "" });
  const [productSaving, setProductSaving] = useState(false);
  // ── Adicionar produto ──
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<{ product: string; price: string; billing_day: string; status: string }>({ product: "social_media", price: "", billing_day: "", status: "active" });
  const [addProductSaving, setAddProductSaving] = useState(false);

  // ── Reset de senha ──
  const [resetLoading, setResetLoading]   = useState(false);
  const [newPassword,  setNewPassword]    = useState<string | null>(null);
  const [resetError,   setResetError]     = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);

  // ── Bloquear/reativar acesso ──
  const [toggleLoading, setToggleLoading] = useState(false);

  // ── Configurações Marque Já ──
  const [configOpen,    setConfigOpen]    = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [config,        setConfig]        = useState<MarqueJaConfig | null>(null);
  const [configError,   setConfigError]   = useState<string | null>(null);

  // ─── Derived ────────────────────────────────────────────────────────────────

  const hasMarqueJa    = localClient.client_products.some((p) => p.product === "marque_ja");
  const slug           = localClient.slug;
  const agendamentoUrl = slug ? `${BASE_URL}/${slug}` : null;
  const painelUrl      = slug ? `${BASE_URL}/${slug}/painel` : null;

  const productNameById = Object.fromEntries(
    localClient.client_products.map((p) => [p.id, PRODUCT_LABELS[p.product]])
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function copyLink(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function openEdit() {
    setEditForm({
      name:         localClient.name,
      owner_name:   localClient.owner_name   ?? "",
      owner_email:  localClient.owner_email  ?? "",
      phone:        localClient.phone        ?? "",
      segment:      localClient.segment      ?? "",
      neighborhood: localClient.neighborhood ?? "",
      status:       localClient.status,
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    setEditSaving(true);
    try {
      const res = await fetch(`/api/clients/${localClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         editForm.name.trim(),
          owner_name:   editForm.owner_name.trim()   || null,
          owner_email:  editForm.owner_email.trim()  || null,
          phone:        editForm.phone.trim()        || null,
          segment:      editForm.segment             || null,
          neighborhood: editForm.neighborhood.trim() || null,
          status:       editForm.status,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      const updated = await res.json();
      setLocalClient((prev) => ({ ...prev, ...updated }));
      setEditOpen(false);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleResetPassword() {
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await fetch(`/api/clients/${localClient.id}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao redefinir senha");
      setNewPassword(data.new_password);
      setPasswordModal(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleToggleAccess() {
    setToggleLoading(true);
    try {
      const res = await fetch(`/api/clients/${localClient.id}/toggle-access`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao alterar acesso");
      setLocalClient((prev) => ({ ...prev, access_blocked: data.access_blocked }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao alterar acesso");
    } finally {
      setToggleLoading(false);
    }
  }

  async function loadConfig() {
    if (config) {
      setConfigOpen((o) => !o);
      return;
    }
    setConfigOpen(true);
    setConfigLoading(true);
    setConfigError(null);
    try {
      const res = await fetch(`/api/clients/${localClient.id}/marque-ja-config`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar configurações");
      setConfig(data);
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setConfigLoading(false);
    }
  }

  function openProductEdit(p: ClientProduct) {
    setProductDraft({
      price:       String(p.monthly_price_cents / 100),
      status:      p.status,
      billing_day: p.billing_day ? String(p.billing_day) : "",
    });
    setEditingProductId(p.id);
  }

  async function saveProduct() {
    if (!editingProductId) return;
    setProductSaving(true);
    try {
      const res = await fetch(`/api/clients/${localClient.id}/products/${editingProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_price_cents: Math.round(parseFloat(productDraft.price.replace(",", ".")) * 100),
          status:              productDraft.status,
          billing_day:         productDraft.billing_day ? parseInt(productDraft.billing_day) : null,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      const updated = await res.json();
      setLocalClient((prev) => ({
        ...prev,
        client_products: prev.client_products.map((p) =>
          p.id === editingProductId ? { ...p, ...updated } : p
        ),
      }));
      setEditingProductId(null);
    } finally {
      setProductSaving(false);
    }
  }

  async function saveAddProduct() {
    setAddProductSaving(true);
    try {
      const res = await fetch(`/api/clients/${localClient.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product:             newProduct.product,
          monthly_price_cents: Math.round(parseFloat(newProduct.price.replace(",", ".")) * 100),
          billing_day:         newProduct.billing_day ? parseInt(newProduct.billing_day) : null,
          status:              newProduct.status,
        }),
      });
      if (!res.ok) throw new Error("Erro ao adicionar");
      const created = await res.json();
      setLocalClient((prev) => ({
        ...prev,
        client_products: [...prev.client_products, created],
      }));
      setAddProductOpen(false);
      setNewProduct({ product: "social_media", price: "", billing_day: "", status: "active" });
    } finally {
      setAddProductSaving(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Breadcrumb>
        <BreadcrumbLink href="/clientes">
          <ArrowLeft size={13} weight="bold" />
          Clientes
        </BreadcrumbLink>
        <BreadcrumbSep>/</BreadcrumbSep>
        <BreadcrumbCurrent>{client.name}</BreadcrumbCurrent>
      </Breadcrumb>

      {/* Header */}
      <PageHeader>
        <HeaderLeft>
          <ClienteTitle>{localClient.name}</ClienteTitle>
          <Badge variant={clientStatusVariant(localClient.status)} dot>
            {CLIENT_STATUS_LABELS[localClient.status]}
          </Badge>
          {localClient.access_blocked && (
            <Badge variant="danger" dot>Acesso Bloqueado</Badge>
          )}
        </HeaderLeft>
        <HeaderActions>
          {hasMarqueJa && localClient.owner_email && (
            <Button
              variant={localClient.access_blocked ? "secondary" : "danger"}
              icon={localClient.access_blocked ? <LockOpen size={14} /> : <Lock size={14} />}
              size="sm"
              loading={toggleLoading}
              onClick={handleToggleAccess}
            >
              {localClient.access_blocked ? "Reativar acesso" : "Bloquear acesso"}
            </Button>
          )}
          <Button variant="secondary" icon={<PencilSimple size={15} />} size="sm" onClick={openEdit}>
            Editar
          </Button>
        </HeaderActions>
      </PageHeader>

      {/* Grid: Dados Gerais + Produtos */}
      <SectionGrid>
        <Card>
          <CardTitle>
            <User size={15} weight="fill" />
            Dados Gerais
          </CardTitle>
          {localClient.owner_name && (
            <InfoRow>
              <InfoIcon><User size={14} /></InfoIcon>
              <div>
                <InfoLabel>Nome do dono</InfoLabel>
                <InfoValue>{localClient.owner_name}</InfoValue>
              </div>
            </InfoRow>
          )}
          {localClient.phone && (
            <InfoRow>
              <InfoIcon><Phone size={14} /></InfoIcon>
              <div>
                <InfoLabel>Telefone</InfoLabel>
                <InfoValue>{localClient.phone}</InfoValue>
              </div>
            </InfoRow>
          )}
          {localClient.neighborhood && (
            <InfoRow>
              <InfoIcon><MapPin size={14} /></InfoIcon>
              <div>
                <InfoLabel>Bairro</InfoLabel>
                <InfoValue>{localClient.neighborhood}</InfoValue>
              </div>
            </InfoRow>
          )}
          {localClient.segment && (
            <InfoRow>
              <InfoIcon><Tag size={14} /></InfoIcon>
              <div>
                <InfoLabel>Segmento</InfoLabel>
                <InfoValue>{localClient.segment}</InfoValue>
              </div>
            </InfoRow>
          )}
          <InfoRow>
            <InfoIcon><CalendarBlank size={14} /></InfoIcon>
            <div>
              <InfoLabel>Cliente desde</InfoLabel>
              <InfoValue>{formatDate(localClient.created_at)}</InfoValue>
            </div>
          </InfoRow>
        </Card>

        <Card>
          <CardTitle>
            <Tag size={15} weight="fill" />
            Produtos Contratados
          </CardTitle>
          {localClient.client_products.length === 0 && !addProductOpen && (
            <EmptyMsg>Nenhum produto cadastrado</EmptyMsg>
          )}

          {localClient.client_products.map((p) => (
            <div key={p.id}>
              <ProdutoRow>
                <ProdutoInfo>
                  <ProdutoNome>{PRODUCT_LABELS[p.product]}</ProdutoNome>
                  <ProdutoMeta>
                    {formatBRL(p.monthly_price_cents)}/mês
                    {p.billing_day ? ` · Dia ${p.billing_day}` : ""}
                  </ProdutoMeta>
                </ProdutoInfo>
                <ProdutoRight>
                  <Badge variant={productStatusVariant(p.status)} size="sm" dot>
                    {PRODUCT_STATUS_LABELS[p.status]}
                  </Badge>
                  <IconBtn onClick={() => editingProductId === p.id ? setEditingProductId(null) : openProductEdit(p)} title="Editar produto">
                    <PencilSimple size={13} />
                  </IconBtn>
                </ProdutoRight>
              </ProdutoRow>

              {editingProductId === p.id && (
                <ProdutoEditRow>
                  <ProdutoEditGrid>
                    <div>
                      <ProdutoEditLabel>Preço mensal (R$)</ProdutoEditLabel>
                      <ProdutoEditInput
                        value={productDraft.price}
                        onChange={(e) => setProductDraft((d) => ({ ...d, price: e.target.value }))}
                        placeholder="89.00"
                      />
                    </div>
                    <div>
                      <ProdutoEditLabel>Dia de cobrança</ProdutoEditLabel>
                      <ProdutoEditInput
                        type="number"
                        min={1} max={28}
                        value={productDraft.billing_day}
                        onChange={(e) => setProductDraft((d) => ({ ...d, billing_day: e.target.value }))}
                        placeholder="10"
                      />
                    </div>
                  </ProdutoEditGrid>
                  <div>
                    <ProdutoEditLabel>Status</ProdutoEditLabel>
                    <ProdutoEditSelect value={productDraft.status} onChange={(e) => setProductDraft((d) => ({ ...d, status: e.target.value }))}>
                      <option value="active">Ativo</option>
                      <option value="paused">Pausado</option>
                      <option value="cancelled">Cancelado</option>
                    </ProdutoEditSelect>
                  </div>
                  <ProdutoEditActions>
                    <Button variant="secondary" size="sm" onClick={() => setEditingProductId(null)}>Cancelar</Button>
                    <Button variant="primary" size="sm" loading={productSaving} onClick={saveProduct}>Salvar</Button>
                  </ProdutoEditActions>
                </ProdutoEditRow>
              )}
            </div>
          ))}

          {addProductOpen && (
            <ProdutoEditRow>
              <ProdutoEditGrid>
                <div>
                  <ProdutoEditLabel>Produto</ProdutoEditLabel>
                  <ProdutoEditSelect value={newProduct.product} onChange={(e) => setNewProduct((d) => ({ ...d, product: e.target.value }))}>
                    <option value="social_media">Social Media</option>
                    <option value="marque_ja">Marque Já</option>
                    <option value="vitrine">Vitrine Digital</option>
                    <option value="persona_ia">Persona IA</option>
                  </ProdutoEditSelect>
                </div>
                <div>
                  <ProdutoEditLabel>Preço mensal (R$)</ProdutoEditLabel>
                  <ProdutoEditInput
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((d) => ({ ...d, price: e.target.value }))}
                    placeholder="89.00"
                  />
                </div>
                <div>
                  <ProdutoEditLabel>Dia de cobrança</ProdutoEditLabel>
                  <ProdutoEditInput
                    type="number"
                    min={1} max={28}
                    value={newProduct.billing_day}
                    onChange={(e) => setNewProduct((d) => ({ ...d, billing_day: e.target.value }))}
                    placeholder="10"
                  />
                </div>
                <div>
                  <ProdutoEditLabel>Status</ProdutoEditLabel>
                  <ProdutoEditSelect value={newProduct.status} onChange={(e) => setNewProduct((d) => ({ ...d, status: e.target.value }))}>
                    <option value="active">Ativo</option>
                    <option value="trial">Trial</option>
                    <option value="paused">Pausado</option>
                  </ProdutoEditSelect>
                </div>
              </ProdutoEditGrid>
              <ProdutoEditActions>
                <Button variant="secondary" size="sm" onClick={() => setAddProductOpen(false)}>Cancelar</Button>
                <Button variant="primary" size="sm" loading={addProductSaving} onClick={saveAddProduct}>Adicionar</Button>
              </ProdutoEditActions>
            </ProdutoEditRow>
          )}

          {!addProductOpen && (
            <AddProdutoBtn onClick={() => setAddProductOpen(true)}>
              <Plus size={13} weight="bold" />
              Adicionar produto
            </AddProdutoBtn>
          )}
        </Card>
      </SectionGrid>

      {/* Card: Acesso ao Marque Já */}
      {hasMarqueJa && (
        <AccessCard>
          <AccessHeader>
            <AccessTitle>
              <Key size={15} weight="fill" />
              Acesso ao Marque Já
            </AccessTitle>
            <AccessActions>
              {resetError && (
                <span style={{ fontSize: 12, color: "var(--color-danger)" }}>{resetError}</span>
              )}
              <Button
                variant="secondary"
                icon={<Key size={14} />}
                size="sm"
                loading={resetLoading}
                onClick={handleResetPassword}
              >
                Redefinir senha
              </Button>
            </AccessActions>
          </AccessHeader>

          {agendamentoUrl ? (
            <>
              <LinkRow>
                <LinkLeft>
                  <LinkLabel>Link público de agendamento</LinkLabel>
                  <LinkUrl>{agendamentoUrl}</LinkUrl>
                </LinkLeft>
                <LinkBtns>
                  <IconBtn onClick={() => copyLink(agendamentoUrl, "agendamento")} title="Copiar link">
                    {copiedId === "agendamento" ? <Check size={13} weight="bold" /> : <Copy size={13} />}
                  </IconBtn>
                  <IconBtn
                    as="a"
                    href={agendamentoUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir"
                  >
                    <ArrowSquareOut size={13} />
                  </IconBtn>
                </LinkBtns>
              </LinkRow>

              <LinkRow>
                <LinkLeft>
                  <LinkLabel>Painel do cliente</LinkLabel>
                  <LinkUrl>{painelUrl}</LinkUrl>
                </LinkLeft>
                <LinkBtns>
                  <IconBtn onClick={() => copyLink(painelUrl!, "painel")} title="Copiar link">
                    {copiedId === "painel" ? <Check size={13} weight="bold" /> : <Copy size={13} />}
                  </IconBtn>
                  <IconBtn
                    as="a"
                    href={painelUrl!}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir"
                  >
                    <ArrowSquareOut size={13} />
                  </IconBtn>
                </LinkBtns>
              </LinkRow>
            </>
          ) : (
            <EmptyMsg>
              Slug não cadastrado — reprovisionne o cliente para gerar os links corretos.
            </EmptyMsg>
          )}

          {localClient.owner_email && (
            <OwnerEmailRow>
              <User size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
              <OwnerEmailLabel>E-mail de acesso:</OwnerEmailLabel>
              <OwnerEmailValue>{localClient.owner_email}</OwnerEmailValue>
              <IconBtn
                style={{ marginLeft: "auto" }}
                onClick={() => copyLink(localClient.owner_email!, "email")}
                title="Copiar e-mail"
              >
                {copiedId === "email" ? <Check size={13} weight="bold" /> : <Copy size={13} />}
              </IconBtn>
            </OwnerEmailRow>
          )}

          {/* Configurações Marque Já (collapsible) */}
          {localClient.business_id && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
              <ConfigToggle onClick={loadConfig}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Scissors size={14} style={{ color: "var(--color-primary)" }} />
                  Configurações do negócio
                </span>
                {configOpen ? <CaretUp size={13} /> : <CaretDown size={13} />}
              </ConfigToggle>

              {configOpen && (
                <ConfigSection>
                  {configLoading && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                      <Spinner size="md" />
                    </div>
                  )}

                  {configError && (
                    <ConfigError>
                      <WarningCircle size={16} />
                      {configError}
                    </ConfigError>
                  )}

                  {config && !configLoading && (
                    <>
                      {/* Horários */}
                      <div>
                        <ConfigSubTitle>
                          <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                          Horários de funcionamento
                        </ConfigSubTitle>
                        <HorariosGrid>
                          {config.horarios.map((h) => (
                            <HorarioChip key={h.dia} $aberto={h.aberto}>
                              <HorarioDia>{h.dia}</HorarioDia>
                              {h.aberto ? (
                                <HorarioHora>{h.abertura}<br />{h.fechamento}</HorarioHora>
                              ) : (
                                <HorarioHora style={{ color: "var(--color-danger)" }}>fechado</HorarioHora>
                              )}
                            </HorarioChip>
                          ))}
                        </HorariosGrid>
                      </div>

                      {/* Serviços */}
                      <div>
                        <ConfigSubTitle>
                          <Scissors size={12} style={{ display: "inline", marginRight: 4 }} />
                          Serviços ({config.servicos.length})
                        </ConfigSubTitle>
                        {config.servicos.length === 0 ? (
                          <ConfigEmpty>Nenhum serviço cadastrado</ConfigEmpty>
                        ) : (
                          <ServicoTable>
                            <ServicoHeader>
                              <ServicoHeaderCell>Nome</ServicoHeaderCell>
                              <ServicoHeaderCell>Preço</ServicoHeaderCell>
                              <ServicoHeaderCell>Duração</ServicoHeaderCell>
                              <ServicoHeaderCell>Status</ServicoHeaderCell>
                            </ServicoHeader>
                            {config.servicos.map((s) => (
                              <ServicoRow key={s.id}>
                                <ServicoCell style={{ fontWeight: 500 }}>{s.nome}</ServicoCell>
                                <ServicoCell>{formatBRL(s.preco_cents)}</ServicoCell>
                                <ServicoCell style={{ color: "var(--color-text-muted)" }}>
                                  {s.duracao_min} min
                                </ServicoCell>
                                <ServicoCell>
                                  <Badge variant={s.ativo ? "success" : "default"} size="sm" dot>
                                    {s.ativo ? "Ativo" : "Inativo"}
                                  </Badge>
                                </ServicoCell>
                              </ServicoRow>
                            ))}
                          </ServicoTable>
                        )}
                      </div>

                      {/* Profissionais */}
                      <div>
                        <ConfigSubTitle>
                          <UserCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                          Profissionais ({config.profissionais.length})
                        </ConfigSubTitle>
                        {config.profissionais.length === 0 ? (
                          <ConfigEmpty>Nenhum profissional cadastrado</ConfigEmpty>
                        ) : (
                          <ProfGrid>
                            {config.profissionais.map((p) => (
                              <ProfChip key={p.id} $ativo={p.ativo}>
                                <UserCircle size={14} />
                                {p.nome}
                                {!p.ativo && (
                                  <Badge variant="default" size="sm">Inativo</Badge>
                                )}
                              </ProfChip>
                            ))}
                          </ProfGrid>
                        )}
                      </div>
                    </>
                  )}
                </ConfigSection>
              )}
            </div>
          )}
        </AccessCard>
      )}

      {/* Histórico de Pagamentos */}
      <CardFull>
        <CardTitle>
          <CalendarBlank size={15} weight="fill" />
          Histórico de Pagamentos
        </CardTitle>
        {localClient.payments.length === 0 ? (
          <EmptyMsg>Nenhum pagamento registrado</EmptyMsg>
        ) : (
          <PagTable>
            <PagHeader>
              <PagHeaderCell>Mês</PagHeaderCell>
              <PagHeaderCell>Produto</PagHeaderCell>
              <PagHeaderCell>Vencimento</PagHeaderCell>
              <PagHeaderCell>Status</PagHeaderCell>
            </PagHeader>
            {localClient.payments.map((pag) => (
              <PagRow key={pag.id}>
                <PagCell style={{ fontWeight: 600 }}>
                  {formatMonthYear(pag.due_date)}
                </PagCell>
                <PagCell style={{ color: "var(--color-text-muted)" }}>
                  {pag.product_id ? (productNameById[pag.product_id] ?? "—") : "—"}
                  {" · "}
                  {formatBRL(pag.amount_cents)}
                </PagCell>
                <PagCell style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                  {formatDate(pag.due_date)}
                </PagCell>
                <PagCell>
                  <Badge variant={pagStatusVariant(pag.status)} size="sm" dot>
                    {PAG_STATUS_LABELS[pag.status] ?? pag.status}
                  </Badge>
                </PagCell>
              </PagRow>
            ))}
          </PagTable>
        )}
      </CardFull>

      {/* Modal: Nova senha */}
      <Modal
        open={passwordModal}
        onClose={() => { setPasswordModal(false); setNewPassword(null); }}
        title="Nova senha gerada"
        size="sm"
        footer={
          <Button
            variant="primary"
            onClick={() => { setPasswordModal(false); setNewPassword(null); }}
          >
            Fechar
          </Button>
        }
      >
        <NewPasswordBox>
          <NewPasswordLabel>Copie e envie ao cliente via WhatsApp</NewPasswordLabel>
          <NewPasswordValue>{newPassword}</NewPasswordValue>
          <NewPasswordHint>
            Esta senha é exibida apenas uma vez. O cliente pode alterá-la após o login.
          </NewPasswordHint>
        </NewPasswordBox>
        {newPassword && (
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={copiedId === "newpwd" ? <Check size={14} weight="bold" /> : <Copy size={14} />}
              onClick={() => copyLink(newPassword, "newpwd")}
            >
              {copiedId === "newpwd" ? "Copiado!" : "Copiar senha"}
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal: Editar cliente */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Cliente"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              loading={editSaving}
              disabled={!editForm.name.trim()}
              onClick={saveEdit}
            >
              Salvar
            </Button>
          </>
        }
      >
        <EditForm>
          <Input
            label="Nome do estabelecimento *"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
          />
          <EditRow>
            <Input
              label="Nome do dono"
              value={editForm.owner_name}
              onChange={(e) => setEditForm((f) => ({ ...f, owner_name: e.target.value }))}
              fullWidth
            />
            <Input
              label="WhatsApp"
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              fullWidth
            />
          </EditRow>
          <EditRow>
            <div>
              <EditLabel>Segmento</EditLabel>
              <EditSelect
                value={editForm.segment}
                onChange={(e) => setEditForm((f) => ({ ...f, segment: e.target.value }))}
              >
                <option value="">— Selecione —</option>
                {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </EditSelect>
            </div>
            <Input
              label="Bairro"
              value={editForm.neighborhood}
              onChange={(e) => setEditForm((f) => ({ ...f, neighborhood: e.target.value }))}
              fullWidth
            />
          </EditRow>
          <EditRow>
            <Input
              label="E-mail"
              value={editForm.owner_email}
              onChange={(e) => setEditForm((f) => ({ ...f, owner_email: e.target.value }))}
              fullWidth
            />
            <div>
              <EditLabel>Status</EditLabel>
              <EditSelect
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as ClientStatus }))}
              >
                <option value="active">Ativo</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inativo</option>
                <option value="cancelled">Cancelado</option>
              </EditSelect>
            </div>
          </EditRow>
        </EditForm>
      </Modal>
    </PageWrapper>
  );
}
