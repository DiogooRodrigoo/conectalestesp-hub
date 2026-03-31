"use client";

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { CurrencyDollar, CheckCircle, Clock } from "@phosphor-icons/react";
import Badge from "@/components/ui/Badge";
import type { PaymentWithClient } from "@/types/database";
import { formatBRL } from "@/types/database";

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`max-width: 1100px; animation: ${fadeUp} 0.3s ease both;`;
const PageHeader  = styled.div`margin-bottom: 28px;`;
const PageTitle   = styled.h1`font-size: 22px; font-weight: 700; color: var(--color-text); letter-spacing: -0.4px; margin-bottom: 4px;`;
const PageSubtitle = styled.p`font-size: 13.5px; color: var(--color-text-muted);`;

const SummaryGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const SummaryCard = styled.div<{ $index: number }>`
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${({ $index }) => $index * 0.07}s;
`;

const SummaryHeader = styled.div`display: flex; align-items: center; justify-content: space-between;`;
const SummaryLabel  = styled.span`font-size: 12px; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;`;

const SummaryIconWrap = styled.div<{ $color: string }>`
  width: 34px; height: 34px; border-radius: var(--radius-sm);
  background: ${({ $color }) => `${$color}18`};
  display: flex; align-items: center; justify-content: center;
  color: ${({ $color }) => $color};
`;

const SummaryValue   = styled.div`font-size: 28px; font-weight: 800; color: var(--color-text); letter-spacing: -1px; line-height: 1;`;
const SummarySubtext = styled.div`font-size: 12px; color: var(--color-text-muted); margin-top: 2px;`;

const BodyGrid = styled.div`
  display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const SectionTitle = styled.h2`
  font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
  svg { color: var(--color-primary); }
`;

const Table = styled.div`background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden;`;

const TableHeader = styled.div`
  display: grid; grid-template-columns: 1.5fr 1.2fr 90px 130px 90px 100px;
  padding: 12px 16px; border-bottom: 1px solid var(--color-border); background: var(--color-surface-2);
`;

const TH = styled.span`font-size: 11.5px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;`;

const TableRow = styled.div<{ $index: number }>`
  display: grid; grid-template-columns: 1.5fr 1.2fr 90px 130px 90px 100px;
  padding: 13px 16px; align-items: center;
  border-bottom: 1px solid var(--color-border);
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${({ $index }) => 0.15 + $index * 0.04}s;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-surface-2); }
`;

const TD       = styled.div`font-size: 13.5px; color: var(--color-text);`;
const TDBold   = styled(TD)`font-weight: 600;`;
const TDMuted  = styled(TD)`color: var(--color-text-muted); font-size: 12.5px;`;
const ClienteNome = styled.p`font-size: 13.5px; font-weight: 600; color: var(--color-text);`;

const EmptyState = styled.div`padding: 40px 20px; text-align: center; color: var(--color-text-muted); font-size: 14px;`;

const MarcarPagoBtn = styled.button`
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 500;
  color: var(--color-success); border: 1px solid rgba(34,197,94,0.2); background: rgba(34,197,94,0.06);
  transition: all 0.15s; white-space: nowrap;
  &:hover { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.35); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const MrrCard   = styled.div`background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden;`;
const MrrHeader = styled.div`padding: 16px 18px; border-bottom: 1px solid var(--color-border);`;
const MrrTitle  = styled.h3`font-size: 14px; font-weight: 600; color: var(--color-text);`;

const MrrRow = styled.div<{ $isTotal?: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-bottom: 1px solid var(--color-border);
  background: ${({ $isTotal }) => ($isTotal ? "var(--color-surface-2)" : "transparent")};
  &:last-child { border-bottom: none; }
`;

const MrrLabel = styled.span<{ $isTotal?: boolean }>`
  font-size: 13px; font-weight: ${({ $isTotal }) => ($isTotal ? "700" : "400")};
  color: ${({ $isTotal }) => ($isTotal ? "var(--color-text)" : "var(--color-text-muted)")};
`;

const MrrValue = styled.span<{ $isTotal?: boolean }>`
  font-size: 14px; font-weight: ${({ $isTotal }) => ($isTotal ? "800" : "600")};
  color: ${({ $isTotal }) => ($isTotal ? "var(--color-primary)" : "var(--color-text)")};
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusVariant(status: string) {
  if (status === "paid")    return "success" as const;
  if (status === "overdue") return "danger"  as const;
  return "warning" as const;
}

function getStatusLabel(status: string) {
  if (status === "paid")    return "Pago";
  if (status === "overdue") return "Atrasado";
  return "Pendente";
}

function formatDueDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function calcMrrByProduct(payments: PaymentWithClient[]) {
  const paid = payments.filter((p) => p.status === "paid");
  const map: Record<string, number> = {};
  for (const p of paid) {
    const label = p.client_products?.product ?? "Outro";
    map[label] = (map[label] ?? 0) + p.amount_cents;
  }
  return map;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialPayments: PaymentWithClient[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinanceiroView({ initialPayments }: Props) {
  const [payments, setPayments] = useState(initialPayments);
  const [marking, setMarking] = useState<string | null>(null);

  const recebidoCents = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
  const pendenteCents = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount_cents, 0);
  const mrrTotal = payments.reduce((s, p) => s + p.amount_cents, 0);

  const mrrByProduct = calcMrrByProduct(payments);
  const productEntries = Object.entries(mrrByProduct);

  async function marcarPago(id: string) {
    setMarking(id);
    try {
      await fetch("/api/payments/mark-paid", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "paid", paid_at: new Date().toISOString() } : p))
      );
    } finally {
      setMarking(null);
    }
  }

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Financeiro</PageTitle>
        <PageSubtitle>Controle de mensalidades e pagamentos</PageSubtitle>
      </PageHeader>

      <SummaryGrid>
        <SummaryCard $index={0}>
          <SummaryHeader>
            <SummaryLabel>Total do Mês</SummaryLabel>
            <SummaryIconWrap $color="#F97316"><CurrencyDollar size={18} weight="fill" /></SummaryIconWrap>
          </SummaryHeader>
          <div>
            <SummaryValue>{formatBRL(mrrTotal)}</SummaryValue>
            <SummarySubtext>faturamento previsto no mês</SummarySubtext>
          </div>
        </SummaryCard>

        <SummaryCard $index={1}>
          <SummaryHeader>
            <SummaryLabel>Recebido</SummaryLabel>
            <SummaryIconWrap $color="#22C55E"><CheckCircle size={18} weight="fill" /></SummaryIconWrap>
          </SummaryHeader>
          <div>
            <SummaryValue>{formatBRL(recebidoCents)}</SummaryValue>
            <SummarySubtext>pagamentos confirmados</SummarySubtext>
          </div>
        </SummaryCard>

        <SummaryCard $index={2}>
          <SummaryHeader>
            <SummaryLabel>A Receber</SummaryLabel>
            <SummaryIconWrap $color="#EAB308"><Clock size={18} weight="fill" /></SummaryIconWrap>
          </SummaryHeader>
          <div>
            <SummaryValue>{formatBRL(pendenteCents)}</SummaryValue>
            <SummarySubtext>aguardando pagamento</SummarySubtext>
          </div>
        </SummaryCard>
      </SummaryGrid>

      <BodyGrid>
        <div>
          <SectionTitle>
            <CurrencyDollar size={18} weight="fill" />
            Pagamentos do Mês
          </SectionTitle>

          <Table>
            <TableHeader>
              <TH>Cliente</TH>
              <TH>Produto</TH>
              <TH>Valor</TH>
              <TH>Vencimento</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TableHeader>

            {payments.length === 0 ? (
              <EmptyState>Nenhum pagamento registrado neste mês.</EmptyState>
            ) : (
              payments.map((p, i) => (
                <TableRow key={p.id} $index={i}>
                  <TD><ClienteNome>{p.clients?.name ?? "—"}</ClienteNome></TD>
                  <TDMuted>{p.client_products?.product ?? "—"}</TDMuted>
                  <TDBold>{formatBRL(p.amount_cents)}</TDBold>
                  <TDMuted>{formatDueDate(p.due_date)}</TDMuted>
                  <TD>
                    <Badge variant={getStatusVariant(p.status)} size="sm" dot>
                      {getStatusLabel(p.status)}
                    </Badge>
                  </TD>
                  <TD>
                    {p.status !== "paid" && (
                      <MarcarPagoBtn disabled={marking === p.id} onClick={() => marcarPago(p.id)}>
                        <CheckCircle size={13} weight="fill" />
                        {marking === p.id ? "Salvando..." : "Marcar pago"}
                      </MarcarPagoBtn>
                    )}
                  </TD>
                </TableRow>
              ))
            )}
          </Table>
        </div>

        <div>
          <SectionTitle>Recebido por Produto</SectionTitle>
          <MrrCard>
            <MrrHeader><MrrTitle>Distribuição de Receita</MrrTitle></MrrHeader>

            {productEntries.length === 0 ? (
              <MrrRow><MrrLabel>Nenhum recebimento</MrrLabel><MrrValue>{formatBRL(0)}</MrrValue></MrrRow>
            ) : (
              <>
                {productEntries.map(([produto, cents]) => (
                  <MrrRow key={produto}>
                    <MrrLabel>{produto}</MrrLabel>
                    <MrrValue>{formatBRL(cents)}</MrrValue>
                  </MrrRow>
                ))}
                <MrrRow $isTotal>
                  <MrrLabel $isTotal>Total Recebido</MrrLabel>
                  <MrrValue $isTotal>{formatBRL(recebidoCents)}</MrrValue>
                </MrrRow>
              </>
            )}
          </MrrCard>
        </div>
      </BodyGrid>
    </PageWrapper>
  );
}
