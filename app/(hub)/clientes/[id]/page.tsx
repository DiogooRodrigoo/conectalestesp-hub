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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CLIENTE_MOCK = {
  id: "1",
  nome: "Barbearia do Zé",
  status: "Ativo" as const,
  donoCome: "José Silva",
  telefone: "(11) 98765-4321",
  bairro: "Itaquera",
  segmento: "Barbearia",
  clienteDesde: "15/01/2026",
  slug: "barbearia-do-ze",
  produtos: [
    {
      id: "p1",
      nome: "Marque Já",
      valor: "R$ 89/mês",
      status: "Ativo" as const,
      diaCobranca: 2,
    },
  ],
  pagamentos: [
    { id: "pg1", mes: "Mar/2026", valor: "R$ 89", vencimento: "02/03/2026", status: "Pago" as const },
    { id: "pg2", mes: "Fev/2026", valor: "R$ 89", vencimento: "02/02/2026", status: "Pago" as const },
    { id: "pg3", mes: "Jan/2026", valor: "R$ 89", vencimento: "02/01/2026", status: "Pago" as const },
    { id: "pg4", mes: "Dez/2025", valor: "R$ 89", vencimento: "02/12/2025", status: "Pago" as const },
    { id: "pg5", mes: "Nov/2025", valor: "R$ 89", vencimento: "02/11/2025", status: "Atrasado" as const },
    { id: "pg6", mes: "Out/2025", valor: "R$ 89", vencimento: "02/10/2025", status: "Pago" as const },
  ],
};

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
  grid-template-columns: 100px 1fr 140px 80px;
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
  grid-template-columns: 100px 1fr 140px 80px;
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

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusVariant(status: "Ativo" | "Inativo") {
  return status === "Ativo" ? "success" as const : "default" as const;
}

function getPagStatusVariant(status: "Pago" | "Pendente" | "Atrasado") {
  if (status === "Pago") return "success" as const;
  if (status === "Atrasado") return "danger" as const;
  return "warning" as const;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClienteDetailPage() {
  const c = CLIENTE_MOCK;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyLink(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const painelUrl = `https://app.marqueja.com.br/${c.slug}/painel`;
  const agendamentoUrl = `https://app.marqueja.com.br/${c.slug}`;

  return (
    <PageWrapper>
      <BackLink href="/clientes">
        <ArrowLeft size={14} weight="bold" />
        Voltar para Clientes
      </BackLink>

      <PageHeader>
        <HeaderLeft>
          <ClienteTitle>{c.nome}</ClienteTitle>
          <Badge variant={getStatusVariant(c.status)} dot>
            {c.status}
          </Badge>
        </HeaderLeft>
        <Button variant="secondary" icon={<PencilSimple size={15} />} size="sm">
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
          <InfoRow>
            <InfoIcon><User size={14} /></InfoIcon>
            <div>
              <InfoLabel>Nome do dono</InfoLabel>
              <InfoValue>{c.donoCome}</InfoValue>
            </div>
          </InfoRow>
          <InfoRow>
            <InfoIcon><Phone size={14} /></InfoIcon>
            <div>
              <InfoLabel>Telefone</InfoLabel>
              <InfoValue>{c.telefone}</InfoValue>
            </div>
          </InfoRow>
          <InfoRow>
            <InfoIcon><MapPin size={14} /></InfoIcon>
            <div>
              <InfoLabel>Bairro</InfoLabel>
              <InfoValue>{c.bairro}</InfoValue>
            </div>
          </InfoRow>
          <InfoRow>
            <InfoIcon><Tag size={14} /></InfoIcon>
            <div>
              <InfoLabel>Segmento</InfoLabel>
              <InfoValue>{c.segmento}</InfoValue>
            </div>
          </InfoRow>
          <InfoRow>
            <InfoIcon><CalendarBlank size={14} /></InfoIcon>
            <div>
              <InfoLabel>Cliente desde</InfoLabel>
              <InfoValue>{c.clienteDesde}</InfoValue>
            </div>
          </InfoRow>
        </Card>

        {/* Produtos Contratados */}
        <Card>
          <CardTitle>
            <Tag size={15} weight="fill" />
            Produtos Contratados
          </CardTitle>
          {c.produtos.map((p) => (
            <ProdutoRow key={p.id}>
              <ProdutoInfo>
                <ProdutoNome>{p.nome}</ProdutoNome>
                <ProdutoMeta>{p.valor} · Dia {p.diaCobranca} de cada mês</ProdutoMeta>
              </ProdutoInfo>
              <ProdutoRight>
                <Badge variant={getStatusVariant(p.status)} size="sm" dot>
                  {p.status}
                </Badge>
              </ProdutoRight>
            </ProdutoRow>
          ))}
        </Card>
      </SectionGrid>

      {/* Links do Marque Já */}
      <CardFull>
        <CardTitle>
          Links do Marque Já
        </CardTitle>
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

      {/* Histórico de Pagamentos */}
      <CardFull>
        <CardTitle>
          <CalendarBlank size={15} weight="fill" />
          Histórico de Pagamentos
        </CardTitle>
        <PagTable>
          <PagHeader>
            <PagHeaderCell>Mês</PagHeaderCell>
            <PagHeaderCell>Produto</PagHeaderCell>
            <PagHeaderCell>Vencimento</PagHeaderCell>
            <PagHeaderCell>Status</PagHeaderCell>
          </PagHeader>
          {c.pagamentos.map((pag) => (
            <PagRow key={pag.id}>
              <PagCell style={{ fontWeight: 600 }}>{pag.mes}</PagCell>
              <PagCell style={{ color: "var(--color-text-muted)" }}>Marque Já · {pag.valor}</PagCell>
              <PagCell style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{pag.vencimento}</PagCell>
              <PagCell>
                <Badge variant={getPagStatusVariant(pag.status)} size="sm" dot>
                  {pag.status}
                </Badge>
              </PagCell>
            </PagRow>
          ))}
        </PagTable>
      </CardFull>
    </PageWrapper>
  );
}
