"use client";

import { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { CurrencyDollar, CheckCircle, Clock, X, Warning, CaretLeft, CaretRight, DownloadSimple } from "@phosphor-icons/react";
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

const ConfirmRow = styled.div`
  display: inline-flex; align-items: center; gap: 4px;
`;

const ConfirmLabel = styled.span`
  font-size: 12px; font-weight: 500; color: var(--color-text-muted); margin-right: 2px;
`;

const ConfirmYes = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
  color: #fff; background: var(--color-success); border: none;
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ConfirmNo = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: var(--radius-sm);
  color: var(--color-text-muted); border: 1px solid var(--color-border); background: transparent;
  transition: all 0.15s;
  &:hover { color: var(--color-danger); border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.06); }
`;

// ─── Seletor de Período ───────────────────────────────────────────────────────

const PeriodRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PeriodBtn = styled.button`
  width: 30px; height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  &:hover { color: var(--color-text); border-color: #3a3a3a; }
`;

const PeriodLabel = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text);
  min-width: 110px;
  text-align: center;
`;

// ─── Inadimplentes ────────────────────────────────────────────────────────────

const OverdueSection = styled.div`
  background: rgba(239,68,68,0.04);
  border: 1px solid rgba(239,68,68,0.18);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 24px;
`;

const OverdueHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(239,68,68,0.14);
  background: rgba(239,68,68,0.06);
`;

const OverdueTitle = styled.h3`
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 7px;
`;

const OverdueTotal = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-danger);
`;

const OverdueRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 90px 130px 100px;
  padding: 12px 16px;
  align-items: center;
  border-bottom: 1px solid rgba(239,68,68,0.1);
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(239,68,68,0.04); }
`;

const OverdueTH = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-danger);
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ─── MRR ──────────────────────────────────────────────────────────────────────

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

// ─── CSV Export ───────────────────────────────────────────────────────────────

const ExportBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: all 0.15s;
  &:hover { color: var(--color-text); border-color: #3a3a3a; }
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

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function FinanceiroView({ initialPayments }: Props) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [payments, setPayments] = useState(initialPayments);
  const [loading,   setLoading]   = useState(false);
  const [marking,   setMarking]   = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchPayments = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments?year=${y}&month=${m}`);
      if (res.ok) setPayments(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); fetchPayments(year - 1, 12); }
    else             { setMonth(m => m - 1); fetchPayments(year, month - 1); }
  }

  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return; // não avança além do mês atual
    if (month === 12) { setYear(y => y + 1); setMonth(1); fetchPayments(year + 1, 1); }
    else              { setMonth(m => m + 1); fetchPayments(year, month + 1); }
  }

  // Recarrega quando os initialPayments mudam (primeira carga SSR)
  useEffect(() => { setPayments(initialPayments); }, [initialPayments]);

  const recebidoCents = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
  const pendenteCents = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount_cents, 0);
  const mrrTotal = payments.reduce((s, p) => s + p.amount_cents, 0);
  const overdue = payments.filter((p) => p.status === "overdue");
  const overdueCents = overdue.reduce((s, p) => s + p.amount_cents, 0);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const mrrByProduct = calcMrrByProduct(payments);
  const productEntries = Object.entries(mrrByProduct);

  function exportCSV() {
    const MONTHS_SHORT = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    const header = ["Cliente","Segmento","Produto","Valor (R$)","Vencimento","Status"];
    const rows = payments.map((p) => [
      p.clients?.name ?? "",
      p.clients?.segment ?? "",
      p.client_products?.product ?? "",
      (p.amount_cents / 100).toFixed(2).replace(".", ","),
      p.due_date,
      p.status === "paid" ? "Pago" : p.status === "overdue" ? "Atrasado" : "Pendente",
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro_${MONTHS_SHORT[month - 1]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
      <PageHeader style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <PageTitle>Financeiro</PageTitle>
          <PageSubtitle>Controle de mensalidades e pagamentos</PageSubtitle>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ExportBtn onClick={exportCSV} title="Exportar como CSV">
            <DownloadSimple size={15} />
            Exportar CSV
          </ExportBtn>
        <PeriodRow>
          <PeriodBtn onClick={prevMonth} title="Mês anterior">
            <CaretLeft size={14} weight="bold" />
          </PeriodBtn>
          <PeriodLabel style={{ opacity: loading ? 0.5 : 1 }}>
            {MONTHS[month - 1]} {year}
          </PeriodLabel>
          <PeriodBtn onClick={nextMonth} title="Próximo mês" disabled={isCurrentMonth} style={{ opacity: isCurrentMonth ? 0.3 : 1 }}>
            <CaretRight size={14} weight="bold" />
          </PeriodBtn>
        </PeriodRow>
        </div>
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

      {overdue.length > 0 && (
        <OverdueSection>
          <OverdueHeader>
            <OverdueTitle>
              <Warning size={16} weight="fill" />
              {overdue.length} {overdue.length === 1 ? "cliente inadimplente" : "clientes inadimplentes"}
            </OverdueTitle>
            <OverdueTotal>{formatBRL(overdueCents)} em aberto</OverdueTotal>
          </OverdueHeader>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.2fr 90px 130px 100px", padding: "8px 16px", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
            <OverdueTH>Cliente</OverdueTH>
            <OverdueTH>Produto</OverdueTH>
            <OverdueTH>Valor</OverdueTH>
            <OverdueTH>Vencimento</OverdueTH>
            <OverdueTH>Ações</OverdueTH>
          </div>

          {overdue.map((p) => (
            <OverdueRow key={p.id}>
              <TD style={{ fontWeight: 600 }}>{p.clients?.name ?? "—"}</TD>
              <TDMuted>{p.client_products?.product ?? "—"}</TDMuted>
              <TDBold style={{ color: "var(--color-danger)" }}>{formatBRL(p.amount_cents)}</TDBold>
              <TDMuted>{formatDueDate(p.due_date)}</TDMuted>
              <TD>
                {confirming === p.id ? (
                  <ConfirmRow>
                    <ConfirmLabel>Confirmar?</ConfirmLabel>
                    <ConfirmYes
                      disabled={marking === p.id}
                      onClick={() => { setConfirming(null); marcarPago(p.id); }}
                    >
                      <CheckCircle size={12} weight="fill" />
                      {marking === p.id ? "Salvando..." : "Sim"}
                    </ConfirmYes>
                    <ConfirmNo onClick={() => setConfirming(null)}>
                      <X size={12} />
                    </ConfirmNo>
                  </ConfirmRow>
                ) : (
                  <MarcarPagoBtn disabled={marking === p.id} onClick={() => setConfirming(p.id)}>
                    <CheckCircle size={13} weight="fill" />
                    Marcar pago
                  </MarcarPagoBtn>
                )}
              </TD>
            </OverdueRow>
          ))}
        </OverdueSection>
      )}

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
                      confirming === p.id ? (
                        <ConfirmRow>
                          <ConfirmLabel>Confirmar?</ConfirmLabel>
                          <ConfirmYes
                            disabled={marking === p.id}
                            onClick={() => { setConfirming(null); marcarPago(p.id); }}
                          >
                            <CheckCircle size={12} weight="fill" />
                            {marking === p.id ? "Salvando..." : "Sim"}
                          </ConfirmYes>
                          <ConfirmNo onClick={() => setConfirming(null)}>
                            <X size={12} />
                          </ConfirmNo>
                        </ConfirmRow>
                      ) : (
                        <MarcarPagoBtn disabled={marking === p.id} onClick={() => setConfirming(p.id)}>
                          <CheckCircle size={13} weight="fill" />
                          Marcar pago
                        </MarcarPagoBtn>
                      )
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
