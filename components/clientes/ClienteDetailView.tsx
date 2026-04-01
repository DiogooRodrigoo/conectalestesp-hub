"use client";

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import {
  ArrowLeft,
  PencilSimple,
  Copy,
  Check,
  Phone,
  MapPin,
  CalendarBlank,
  User,
  Tag,
} from "@phosphor-icons/react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import type { ClientWithDetails, ClientStatus, ProductStatus } from "@/types/database";
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 24px;
  transition: color 0.15s;

  &:hover { color: var(--color-text); }
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
  gap: 12px;
`;

const ClienteTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.4px;
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
`;

const CopyBtn = styled.button`
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

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  client: ClientWithDetails;
}

interface EditForm {
  name: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  segment: string;
  neighborhood: string;
  status: ClientStatus;
}

export default function ClienteDetailView({ client }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado local do cliente para refletir edições sem reload
  const [localClient, setLocalClient] = useState(client);

  const [editOpen, setEditOpen]   = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm]   = useState<EditForm>({
    name:         localClient.name,
    owner_name:   localClient.owner_name   ?? "",
    owner_email:  localClient.owner_email  ?? "",
    phone:        localClient.phone        ?? "",
    segment:      localClient.segment      ?? "",
    neighborhood: localClient.neighborhood ?? "",
    status:       localClient.status,
  });

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

  function copyLink(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const hasMarqueJa = localClient.client_products.some((p) => p.product === "marque_ja");
  const painelUrl     = localClient.business_id
    ? `https://marqueja.conectalestesp.com.br/${localClient.business_id}/painel`
    : null;
  const agendamentoUrl = localClient.business_id
    ? `https://marqueja.conectalestesp.com.br/${localClient.business_id}`
    : null;

  const productNameById = Object.fromEntries(
    localClient.client_products.map((p) => [p.id, PRODUCT_LABELS[p.product]])
  );

  return (
    <PageWrapper>
      <BackLink href="/clientes">
        <ArrowLeft size={14} weight="bold" />
        Voltar para Clientes
      </BackLink>

      <PageHeader>
        <HeaderLeft>
          <ClienteTitle>{localClient.name}</ClienteTitle>
          <Badge variant={clientStatusVariant(localClient.status)} dot>
            {CLIENT_STATUS_LABELS[localClient.status]}
          </Badge>
        </HeaderLeft>
        <Button variant="secondary" icon={<PencilSimple size={15} />} size="sm" onClick={openEdit}>
          Editar
        </Button>
      </PageHeader>

      <SectionGrid>
        {/* Dados Gerais */}
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

        {/* Produtos Contratados */}
        <Card>
          <CardTitle>
            <Tag size={15} weight="fill" />
            Produtos Contratados
          </CardTitle>
          {localClient.client_products.length === 0 ? (
            <EmptyMsg>Nenhum produto cadastrado</EmptyMsg>
          ) : (
            localClient.client_products.map((p) => (
              <ProdutoRow key={p.id}>
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
                </ProdutoRight>
              </ProdutoRow>
            ))
          )}
        </Card>
      </SectionGrid>

      {/* Links do Marque Já */}
      {hasMarqueJa && painelUrl && agendamentoUrl && (
        <CardFull>
          <CardTitle>Links do Marque Já</CardTitle>
          <LinkRow>
            <div>
              <LinkLabel>Painel do cliente</LinkLabel>
              <LinkUrl>{painelUrl}</LinkUrl>
            </div>
            <CopyBtn onClick={() => copyLink(painelUrl, "painel")} title="Copiar link">
              {copiedId === "painel" ? <Check size={13} weight="bold" /> : <Copy size={13} />}
            </CopyBtn>
          </LinkRow>
          <LinkRow>
            <div>
              <LinkLabel>Link público de agendamento</LinkLabel>
              <LinkUrl>{agendamentoUrl}</LinkUrl>
            </div>
            <CopyBtn onClick={() => copyLink(agendamentoUrl, "agendamento")} title="Copiar link">
              {copiedId === "agendamento" ? <Check size={13} weight="bold" /> : <Copy size={13} />}
            </CopyBtn>
          </LinkRow>
        </CardFull>
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

      {/* Modal de Edição */}
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
