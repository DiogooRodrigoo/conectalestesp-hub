"use client";

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import { MagnifyingGlass, Plus, ArrowRight, CurrencyCircleDollar } from "@phosphor-icons/react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import NovoClienteWizard from "./NovoClienteWizard";
import type { ClientWithProducts } from "@/types/database";
import { PRODUCT_LABELS, formatBRL, calcClientMrr } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "Todos" | "active" | "trial" | "inactive";
const TABS: { value: FilterTab; label: string }[] = [
  { value: "Todos",    label: "Todos" },
  { value: "active",   label: "Ativo" },
  { value: "trial",    label: "Trial" },
  { value: "inactive", label: "Inativo" },
];

type PaymentHighlight = "paid" | "pending" | "overdue" | null;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  max-width: 1100px;
  animation: ${fadeUp} 0.3s ease both;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  @media (max-width: 640px) { flex-direction: column; }
`;

const PageTitle = styled.h1`
  font-size: 22px; font-weight: 700; color: var(--color-text);
  letter-spacing: -0.4px; margin-bottom: 4px;
`;

const PageSubtitle = styled.p`font-size: 13.5px; color: var(--color-text-muted);`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  background: var(--color-surface-2);
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--color-text)" : "var(--color-text-muted)")};
  background: ${({ $active }) => ($active ? "var(--color-surface)" : "transparent")};
  border: ${({ $active }) => ($active ? "1px solid var(--color-border)" : "1px solid transparent")};
  transition: all 0.15s;
  &:hover { color: var(--color-text); background: var(--color-surface); }
`;

const SearchWrap = styled.div`
  flex: 1;
  max-width: 300px;
  @media (max-width: 640px) { max-width: 100%; }
`;

/* ── Tabela desktop ── */

const TableWrapper = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 720px) { display: none; }
`;

const Table = styled.div`
  min-width: 820px;
`;

const COLS = "1.5fr 100px 100px 1fr 100px 90px 96px 48px";

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${COLS};
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
`;

const TH = styled.span`
  font-size: 11.5px; font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const TableRow = styled.div<{ $index: number }>`
  display: grid;
  grid-template-columns: ${COLS};
  padding: 14px 16px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${({ $index }) => 0.05 + $index * 0.04}s;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-surface-2); }
`;

const TD = styled.div`font-size: 13.5px; color: var(--color-text);`;
const TDMuted = styled(TD)`color: var(--color-text-muted); font-size: 13px;`;

const ClienteName = styled.p`font-size: 13.5px; font-weight: 600; color: var(--color-text); margin-bottom: 2px;`;
const ClienteSub = styled.p`font-size: 12px; color: var(--color-text-muted);`;

const ProdutosList = styled.div`display: flex; flex-wrap: wrap; gap: 4px;`;
const ProdutoBadge = styled.span`
  font-size: 11px; padding: 2px 7px; border-radius: 4px;
  background: rgba(249,115,22,0.08); color: var(--color-primary);
  border: 1px solid rgba(249,115,22,0.15); font-weight: 500;
`;

const ActionLink = styled(Link)`
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  transition: all 0.15s;
  &:hover { background: var(--color-surface-2); color: var(--color-text); border-color: #3a3a3a; }
`;

const EmptyState = styled.div`padding: 60px 20px; text-align: center; color: var(--color-text-muted); font-size: 14px;`;

/* ── Cards mobile ── */

const CardList = styled.div`
  display: none;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 720px) { display: flex; }
`;

const MobileCard = styled.div<{ $index: number }>`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${({ $index }) => 0.05 + $index * 0.04}s;
  transition: background 0.15s;
  &:hover { background: var(--color-surface-2); }
`;

const MobileCardMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const MobileCardName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MobileCardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
`;

const MobileCardRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
`;

const MrroText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "trial")  return "warning" as const;
  return "default" as const;
}

function getStatusLabel(status: string) {
  if (status === "active")    return "Ativo";
  if (status === "trial")     return "Trial";
  if (status === "inactive")  return "Inativo";
  if (status === "cancelled") return "Cancelado";
  return status;
}

function getPaymentHighlight(
  payments: { status: string; due_date: string }[] | undefined
): PaymentHighlight {
  if (!payments || payments.length === 0) return null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear  = now.getFullYear();

  const thisPeriod = payments.filter((p) => {
    const d = new Date(p.due_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const relevant = thisPeriod.length > 0 ? thisPeriod : payments;

  if (relevant.some((p) => p.status === "overdue"))  return "overdue";
  if (relevant.some((p) => p.status === "pending"))  return "pending";
  if (relevant.every((p) => p.status === "paid"))    return "paid";
  return null;
}

function pagHighlightVariant(h: PaymentHighlight) {
  if (h === "paid")    return "success" as const;
  if (h === "overdue") return "danger"  as const;
  if (h === "pending") return "warning" as const;
  return "default" as const;
}

const PAG_LABELS: Record<NonNullable<PaymentHighlight>, string> = {
  paid:    "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  clients: ClientWithProducts[];
}

export default function ClientesView({ clients }: Props) {
  const [activeTab, setActiveTab]   = useState<FilterTab>("Todos");
  const [search, setSearch]         = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);

  const filtered = clients.filter((c) => {
    const matchTab    = activeTab === "Todos" || c.status === activeTab;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const activosCount = clients.filter((c) => c.status === "active" || c.status === "trial").length;

  function handleWizardSuccess() {
    setWizardOpen(false);
    window.location.reload();
  }

  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <PageTitle>Clientes</PageTitle>
          <PageSubtitle>{activosCount} ativos · {clients.length} no total</PageSubtitle>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} weight="bold" />}
          onClick={() => setWizardOpen(true)}
        >
          Novo Cliente
        </Button>
      </PageHeader>

      <Toolbar>
        <TabsRow>
          {TABS.map((tab) => (
            <Tab key={tab.value} $active={activeTab === tab.value} onClick={() => setActiveTab(tab.value)}>
              {tab.label}
            </Tab>
          ))}
        </TabsRow>
        <SearchWrap>
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MagnifyingGlass size={15} />}
            fullWidth
          />
        </SearchWrap>
      </Toolbar>

      {/* ── Tabela desktop ── */}
      <TableWrapper>
        <Table>
          <TableHeader>
            <TH>Cliente</TH>
            <TH>Segmento</TH>
            <TH>Bairro</TH>
            <TH>Produtos</TH>
            <TH>MRR</TH>
            <TH>Status</TH>
            <TH>Financeiro</TH>
            <TH></TH>
          </TableHeader>

          {filtered.length === 0 ? (
            <EmptyState>
              {clients.length === 0
                ? "Nenhum cliente cadastrado. Clique em Novo Cliente para começar."
                : "Nenhum cliente encontrado."}
            </EmptyState>
          ) : (
            filtered.map((c, i) => {
              const mrr  = calcClientMrr(c.client_products ?? []);
              const pag  = getPaymentHighlight(c.payments);
              return (
                <TableRow key={c.id} $index={i}>
                  <TD>
                    <ClienteName>{c.name}</ClienteName>
                    <ClienteSub>{c.owner_name ?? c.phone ?? "—"}</ClienteSub>
                  </TD>
                  <TDMuted>{c.segment ?? "—"}</TDMuted>
                  <TDMuted>{c.neighborhood ?? "—"}</TDMuted>
                  <TD>
                    <ProdutosList>
                      {(c.client_products ?? []).filter((p) => p.status === "active").map((p) => (
                        <ProdutoBadge key={p.id}>{PRODUCT_LABELS[p.product]}</ProdutoBadge>
                      ))}
                      {(c.client_products ?? []).length === 0 && (
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Sem produtos</span>
                      )}
                    </ProdutosList>
                  </TD>
                  <TD style={{ fontWeight: 600 }}>
                    {mrr > 0 ? formatBRL(mrr) : <span style={{ color: "var(--color-text-muted)" }}>—</span>}
                  </TD>
                  <TD>
                    <Badge variant={getStatusVariant(c.status)} size="sm" dot>
                      {getStatusLabel(c.status)}
                    </Badge>
                  </TD>
                  <TD>
                    {pag ? (
                      <Badge variant={pagHighlightVariant(pag)} size="sm" dot>
                        {PAG_LABELS[pag]}
                      </Badge>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </TD>
                  <TD>
                    <ActionLink href={`/clientes/${c.id}`} title="Ver ficha">
                      <ArrowRight size={14} weight="bold" />
                    </ActionLink>
                  </TD>
                </TableRow>
              );
            })
          )}
        </Table>
      </TableWrapper>

      {/* ── Cards mobile ── */}
      <CardList>
        {filtered.length === 0 ? (
          <EmptyState>
            {clients.length === 0
              ? "Nenhum cliente cadastrado."
              : "Nenhum cliente encontrado."}
          </EmptyState>
        ) : (
          filtered.map((c, i) => {
            const mrr = calcClientMrr(c.client_products ?? []);
            const pag = getPaymentHighlight(c.payments);
            return (
              <Link key={c.id} href={`/clientes/${c.id}`} style={{ textDecoration: "none" }}>
                <MobileCard $index={i}>
                  <MobileCardMain>
                    <MobileCardName>{c.name}</MobileCardName>
                    <MobileCardMeta>
                      {c.segment && <span>{c.segment}</span>}
                      {c.segment && c.neighborhood && <span>·</span>}
                      {c.neighborhood && <span>{c.neighborhood}</span>}
                    </MobileCardMeta>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      <Badge variant={getStatusVariant(c.status)} size="sm" dot>
                        {getStatusLabel(c.status)}
                      </Badge>
                      {pag && (
                        <Badge variant={pagHighlightVariant(pag)} size="sm" dot>
                          {PAG_LABELS[pag]}
                        </Badge>
                      )}
                    </div>
                  </MobileCardMain>
                  <MobileCardRight>
                    {mrr > 0 && <MrroText>{formatBRL(mrr)}</MrroText>}
                    <CurrencyCircleDollar
                      size={20}
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  </MobileCardRight>
                </MobileCard>
              </Link>
            );
          })
        )}
      </CardList>

      {wizardOpen && (
        <NovoClienteWizard
          onClose={() => setWizardOpen(false)}
          onSuccess={handleWizardSuccess}
        />
      )}
    </PageWrapper>
  );
}
