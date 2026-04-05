"use client";

import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Users,
  CurrencyDollar,
  Clock,
  FunnelSimple,
  UserPlus,
  CalendarBlank,
  TrendUp,
} from "@phosphor-icons/react";
import Badge from "@/components/ui/Badge";
import type { HubMetrics, MrrMonth } from "@/lib/supabase/hub";
import type { PaymentWithClient } from "@/types/database";
import { formatBRL } from "@/types/database";

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

const PageHeader = styled.div`margin-bottom: 28px;`;

const PageTitle = styled.h1`
  font-size: 22px; font-weight: 700; color: var(--color-text);
  letter-spacing: -0.4px; margin-bottom: 4px;
`;

const PageSubtitle = styled.p`font-size: 13.5px; color: var(--color-text-muted);`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 768px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px)  { grid-template-columns: 1fr; }
`;

const MetricCard = styled.div<{ $index: number }>`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${({ $index }) => $index * 0.07}s;
  transition: border-color 0.15s ease, transform 0.15s ease;
  &:hover { border-color: #3a3a3a; transform: translateY(-2px); }
`;

const MetricHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;

const MetricLabel = styled.span`
  font-size: 12px; font-weight: 500; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const MetricIconWrap = styled.div<{ $color: string }>`
  width: 34px; height: 34px;
  border-radius: var(--radius-sm);
  background: ${({ $color }) => `${$color}18`};
  display: flex; align-items: center; justify-content: center;
  color: ${({ $color }) => $color};
`;

const MetricValue = styled.div`
  font-size: 26px; font-weight: 800; color: var(--color-text);
  letter-spacing: -1px; line-height: 1;
`;

const MetricSubtext = styled.div`font-size: 12px; color: var(--color-text-muted); margin-top: 2px;`;

const SectionTitle = styled.h2`
  font-size: 16px; font-weight: 600; color: var(--color-text);
  margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
  svg { color: var(--color-primary); }
`;

const Table = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 110px 140px 110px 100px 90px;
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
  grid-template-columns: 1fr 110px 140px 110px 100px 90px;
  padding: 14px 16px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${({ $index }) => 0.3 + $index * 0.05}s;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-surface-2); }
`;

const TD = styled.div`font-size: 13.5px; color: var(--color-text);`;
const TDMuted = styled(TD)`color: var(--color-text-muted); font-size: 13px;`;

const EmptyState = styled.div`
  padding: 40px 20px; text-align: center;
  color: var(--color-text-muted); font-size: 14px;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToday() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function formatDueDate(dateStr: string) {
  // dateStr is "YYYY-MM-DD"
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getPaymentVariant(status: string) {
  if (status === "paid")    return "success" as const;
  if (status === "overdue") return "danger"  as const;
  return "warning" as const;
}

function getPaymentLabel(status: string) {
  if (status === "paid")    return "Pago";
  if (status === "overdue") return "Atrasado";
  return "Pendente";
}

// ─── MRR Chart ────────────────────────────────────────────────────────────────

const ChartCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 32px;
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: 0.25s;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 7px;
  svg { color: var(--color-primary); }
`;

const ChartSubtitle = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 3px;
`;

const ChartCurrentValue = styled.div`
  text-align: right;
`;

const ChartBigNum = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.5px;
`;

const ChartBigSub = styled.p`
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
`;

const ChartLabelsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const ChartLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
  flex: 1;
`;

const ChartSkeleton = styled.div`
  width: 100%;
  height: 120px;
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

function MrrSparkline({ data }: { data: MrrMonth[] }) {
  if (!data.length) return null;

  const W = 600, H = 110, PAD = 16;
  const max = Math.max(...data.map((d) => d.cents), 1);
  const step = (W - PAD * 2) / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: PAD + i * step,
    y: PAD + (1 - d.cents / max) * (H - PAD * 2),
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="mrr-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F97316" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={PAD} y1={PAD + (1 - t) * (H - PAD * 2)}
          x2={W - PAD} y2={PAD + (1 - t) * (H - PAD * 2)}
          stroke="var(--color-border)"
          strokeWidth="0.8"
          strokeDasharray="4 4"
          opacity="0.6"
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#mrr-grad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#F97316" stroke="var(--color-surface)" strokeWidth="2" />
      ))}
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  metrics:  HubMetrics;
  payments: PaymentWithClient[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OverviewView({ metrics, payments }: Props) {
  const [mrrHistory, setMrrHistory] = useState<MrrMonth[] | null>(null);

  useEffect(() => {
    fetch("/api/mrr-history")
      .then((r) => r.json())
      .then((data) => setMrrHistory(data as MrrMonth[]))
      .catch(() => setMrrHistory([]));
  }, []);

  const METRICS_CONFIG = [
    {
      label:   "Clientes Ativos",
      value:   String(metrics.totalAtivos),
      subtext: "estabelecimentos",
      icon:    Users,
      color:   "#22C55E",
    },
    {
      label:   "MRR",
      value:   metrics.mrrFormatted,
      subtext: "receita recorrente mensal",
      icon:    CurrencyDollar,
      color:   "#F97316",
    },
    {
      label:   "Pagamentos Pendentes",
      value:   String(metrics.pagamentosPendentes),
      subtext: "aguardando confirmação",
      icon:    Clock,
      color:   "#EAB308",
    },
    {
      label:   "Leads em Negociação",
      value:   String(metrics.leadsNegociacao),
      subtext: "em andamento",
      icon:    FunnelSimple,
      color:   "#818CF8",
    },
    {
      label:   "Novos este mês",
      value:   String(metrics.novosEsteMes),
      subtext: "clientes captados",
      icon:    UserPlus,
      color:   "#34D399",
    },
  ];

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Visão Geral</PageTitle>
        <PageSubtitle>{getToday()}</PageSubtitle>
      </PageHeader>

      <MetricsGrid>
        {METRICS_CONFIG.map((m, i) => {
          const Icon = m.icon;
          return (
            <MetricCard key={m.label} $index={i}>
              <MetricHeader>
                <MetricLabel>{m.label}</MetricLabel>
                <MetricIconWrap $color={m.color}>
                  <Icon size={18} weight="fill" />
                </MetricIconWrap>
              </MetricHeader>
              <div>
                <MetricValue>{m.value}</MetricValue>
                <MetricSubtext>{m.subtext}</MetricSubtext>
              </div>
            </MetricCard>
          );
        })}
      </MetricsGrid>

      {/* Gráfico MRR */}
      <ChartCard>
        <ChartHeader>
          <div>
            <ChartTitle>
              <TrendUp size={16} weight="fill" />
              Evolução do MRR
            </ChartTitle>
            <ChartSubtitle>Receita recebida nos últimos 6 meses</ChartSubtitle>
          </div>
          <ChartCurrentValue>
            <ChartBigNum>{metrics.mrrFormatted}</ChartBigNum>
            <ChartBigSub>MRR atual</ChartBigSub>
          </ChartCurrentValue>
        </ChartHeader>

        {mrrHistory === null ? (
          <ChartSkeleton />
        ) : mrrHistory.length === 0 ? (
          <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Nenhum dado disponível</span>
          </div>
        ) : (
          <>
            <ChartWrapper>
              <MrrSparkline data={mrrHistory} />
            </ChartWrapper>
            <ChartLabelsRow>
              {mrrHistory.map((m) => (
                <ChartLabel key={m.label}>{m.label}</ChartLabel>
              ))}
            </ChartLabelsRow>
          </>
        )}
      </ChartCard>

      <SectionTitle>
        <CalendarBlank size={18} weight="fill" />
        Próximos Vencimentos
      </SectionTitle>

      <Table>
        <TableHeader>
          <TH>Cliente</TH>
          <TH>Segmento</TH>
          <TH>Produto</TH>
          <TH>Valor</TH>
          <TH>Vencimento</TH>
          <TH>Status</TH>
        </TableHeader>

        {payments.length === 0 ? (
          <EmptyState>Nenhum vencimento pendente.</EmptyState>
        ) : (
          payments.map((p, i) => (
            <TableRow key={p.id} $index={i}>
              <TD style={{ fontWeight: 500 }}>{p.clients?.name ?? "—"}</TD>
              <TDMuted>{p.clients?.segment ?? "—"}</TDMuted>
              <TDMuted>{p.client_products?.product ?? "—"}</TDMuted>
              <TD style={{ fontWeight: 600 }}>{formatBRL(p.amount_cents)}</TD>
              <TDMuted>{formatDueDate(p.due_date)}</TDMuted>
              <TD>
                <Badge variant={getPaymentVariant(p.status)} size="sm" dot>
                  {getPaymentLabel(p.status)}
                </Badge>
              </TD>
            </TableRow>
          ))
        )}
      </Table>
    </PageWrapper>
  );
}
