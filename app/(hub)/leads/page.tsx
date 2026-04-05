"use client";

import { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  MagnifyingGlass,
  Plus,
  Globe,
  Phone,
  Star,
  Warning,
  CheckCircle,
  XCircle,
  FunnelSimple,
  ArrowsClockwise,
  UserPlus,
  MapPin,
  Tag,
  CalendarBlank,
  ArrowSquareOut,
  NotePencil,
  UserCirclePlus,
  Copy,
} from "@phosphor-icons/react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import NovoClienteWizard from "@/components/clientes/NovoClienteWizard";
import type { LeadResult } from "@/app/api/leads/search/route";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus = "Novo" | "Contatado" | "Em negociação" | "Não fechado" | "Ganho" | "Perdido";
type LeadOrigem = "Prospecção" | "Indicação" | "Abordagem" | "Instagram" | "Google Maps";

interface PipelineLead {
  id: string;
  nome: string;
  segmento: string;
  bairro: string;
  telefone?: string;
  site?: string;
  status: LeadStatus;
  origem: LeadOrigem;
  notas?: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEGMENTOS = [
  "Barbearia", "Salão de Beleza", "Clínica", "Restaurante",
  "Lanchonete", "Padaria", "Pet Shop", "Academia",
  "Loja de Roupas", "Mercado", "Mecânica", "Farmácia", "Outro",
];

const STATUS_OPTIONS: LeadStatus[] = [
  "Novo", "Contatado", "Em negociação", "Não fechado", "Ganho", "Perdido",
];

const ORIGEM_OPTIONS: LeadOrigem[] = [
  "Prospecção", "Indicação", "Abordagem", "Instagram", "Google Maps",
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  "Novo":           "#818CF8",
  "Contatado":      "#EAB308",
  "Em negociação":  "#F97316",
  "Não fechado":    "#EF4444",
  "Ganho":          "#22C55E",
  "Perdido":        "#71717A",
};

type MainTab = "prospeccao" | "pipeline";
type PipelineTab = "Todos" | LeadStatus;
const PIPELINE_TABS: PipelineTab[] = ["Todos", ...STATUS_OPTIONS];

// ─── Status / Source maps ─────────────────────────────────────────────────────

const DB_TO_STATUS: Record<string, LeadStatus> = {
  new:         "Novo",
  contacted:   "Contatado",
  negotiating: "Em negociação",
  not_closed:  "Não fechado",
  won:         "Ganho",
  lost:        "Perdido",
};

const STATUS_TO_DB: Record<LeadStatus, string> = {
  "Novo":           "new",
  "Contatado":      "contacted",
  "Em negociação":  "negotiating",
  "Não fechado":    "not_closed",
  "Ganho":          "won",
  "Perdido":        "lost",
};

const DB_TO_ORIGEM: Record<string, LeadOrigem> = {
  google_maps: "Google Maps",
  indicacao:   "Indicação",
  abordagem:   "Abordagem",
  instagram:   "Instagram",
  outro:       "Prospecção",
};

const ORIGEM_TO_DB: Record<LeadOrigem, string> = {
  "Google Maps": "google_maps",
  "Indicação":   "indicacao",
  "Abordagem":   "abordagem",
  "Instagram":   "instagram",
  "Prospecção":  "outro",
};

function dbLeadToPipeline(l: Record<string, unknown>): PipelineLead {
  return {
    id:         l.id as string,
    nome:       l.name as string,
    segmento:   (l.segment as string) ?? "",
    bairro:     (l.neighborhood as string) ?? "",
    telefone:   (l.phone as string) ?? undefined,
    status:     DB_TO_STATUS[l.status as string] ?? "Novo",
    origem:     DB_TO_ORIGEM[l.source as string] ?? "Prospecção",
    notas:      (l.notes as string) ?? undefined,
    created_at: (l.created_at as string).slice(0, 10),
  };
}

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

// ─── Shared Layout ────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  max-width: 1160px;
  animation: ${fadeUp} 0.3s ease both;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.4px;
  margin-bottom: 4px;
`;

const PageSubtitle = styled.p`
  font-size: 13.5px;
  color: var(--color-text-muted);
`;

const MainTabsRow = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 28px;
`;

const MainTabBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-muted)")};
  border-bottom: 2px solid ${({ $active }) => ($active ? "var(--color-primary)" : "transparent")};
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
  &:hover { color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text)")}; }
`;

const CountPill = styled.span`
  margin-left: 4px;
  font-size: 10.5px;
  background: var(--color-surface-2);
  padding: 0 5px;
  border-radius: 4px;
  color: var(--color-text-muted);
`;

const EmptyBox = styled.div`
  padding: 56px 20px;
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
`;

const EmptyTitle = styled.p`
  font-size: 14.5px; font-weight: 600; color: var(--color-text); margin-bottom: 6px;
`;

const EmptyDesc = styled.p`
  font-size: 13px; color: var(--color-text-muted);
`;

const ErrorBox = styled.div`
  padding: 16px 20px;
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// ─── Prospecção ───────────────────────────────────────────────────────────────

const SearchPanel = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
`;

const SearchPanelTitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: flex-end;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const SelectWrapper = styled.div`display: flex; flex-direction: column; gap: 6px;`;
const SelectLabel = styled.label`font-size: 12.5px; font-weight: 500; color: var(--color-text-muted);`;
const StyledSelect = styled.select`
  height: 40px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 13.5px;
  font-family: inherit;
  padding: 0 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
  }
`;

const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: var(--color-text-muted);
  font-size: 13.5px;
`;

const SpinnerEl = styled.div`
  width: 18px; height: 18px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  flex-shrink: 0;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ResultsCount = styled.p`
  font-size: 13px;
  color: var(--color-text-muted);
  span { color: var(--color-text); font-weight: 600; }
`;

const Table = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 2fr 130px 120px 110px 80px 100px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
  gap: 8px;
`;

const TH = styled.span`
  font-size: 11px; font-weight: 700; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.6px;
`;

const TableRow = styled.div<{ $index: number }>`
  display: grid;
  grid-template-columns: 2fr 130px 120px 110px 80px 100px;
  padding: 13px 16px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  gap: 8px;
  animation: ${fadeUp} 0.25s ease both;
  animation-delay: ${({ $index }) => $index * 0.04}s;
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-surface-2); }
`;

const CellNome = styled.div``;
const NomeText = styled.p`
  font-size: 13.5px; font-weight: 600; color: var(--color-text);
  margin-bottom: 2px; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; max-width: 280px;
`;
const EnderecoText = styled.p`
  font-size: 11.5px; color: var(--color-text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px;
`;
const CellWithIcon = styled.div`display: flex; align-items: center; gap: 6px; font-size: 12.5px;`;
const IconOk = styled.span`color: var(--color-success);`;
const IconNo = styled.span`color: var(--color-text-muted); opacity: 0.4;`;
const SiteLink = styled.a`
  font-size: 12px; color: var(--color-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 110px; display: block;
  &:hover { text-decoration: underline; }
`;
const RatingText = styled.span<{ $low: boolean }>`
  font-size: 12.5px;
  color: ${({ $low }) => ($low ? "#EAB308" : "var(--color-text)")};
  font-weight: 500;
`;
const ScoreBadge = styled.div<{ $score: number }>`
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 700; border: 1px solid;
  ${({ $score }) => $score >= 3
    ? css`background:rgba(34,197,94,.1);color:#22C55E;border-color:rgba(34,197,94,.25);`
    : $score === 2
    ? css`background:rgba(234,179,8,.1);color:#EAB308;border-color:rgba(234,179,8,.25);`
    : css`background:rgba(161,161,170,.08);color:var(--color-text-muted);border-color:rgba(161,161,170,.15);`
  }
`;
const ScoreLabel = styled.p<{ $score: number }>`
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.4px; color: inherit; opacity: 0.8; margin-top: 3px;
`;
const MotivosBox = styled.div`display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;`;
const MotivoBadge = styled.span`
  font-size: 10.5px; padding: 1px 6px; border-radius: 4px;
  background: rgba(249,115,22,.08); color: var(--color-primary);
  border: 1px solid rgba(249,115,22,.15);
`;

// ─── Pipeline — Grid de Cards ─────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  background: var(--color-surface-2);
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--color-text)" : "var(--color-text-muted)")};
  background: ${({ $active }) => ($active ? "var(--color-surface)" : "transparent")};
  border: ${({ $active }) => ($active ? "1px solid var(--color-border)" : "1px solid transparent")};
  transition: all 0.15s;
  &:hover { color: var(--color-text); background: var(--color-surface); }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;

  @media (max-width: 1100px) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 860px)  { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: repeat(2, 1fr); }
`;

const CardWrap = styled.div<{ $index: number }>`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  animation: ${fadeUp} 0.25s ease both;
  animation-delay: ${({ $index }) => $index * 0.04}s;
  transition: border-color 0.15s, transform 0.18s, box-shadow 0.18s;

  &:hover {
    border-color: #3a3a3a;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
`;

const CardColorBar = styled.div<{ $color: string }>`
  height: 4px;
  background: ${({ $color }) => $color};
`;

const CardBody = styled.div`
  padding: 14px 14px 12px;
`;

const CardAvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const CardAvatar = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => $color}22;
  border: 1px solid ${({ $color }) => $color}44;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
  letter-spacing: -0.5px;
`;

const CardName = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  color: var(--color-text-muted);
  font-size: 12px;
`;

const CardMetaDot = styled.span`
  width: 3px; height: 3px; border-radius: 50%;
  background: var(--color-border); flex-shrink: 0;
`;

const CardPhone = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--color-text-muted);
  margin-bottom: 12px;
  min-height: 18px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px;
`;

const StatusDot = styled.span<{ $color: string }>`
  width: 6px; height: 6px; border-radius: 50%;
  background: ${({ $color }) => $color};
  display: inline-block; flex-shrink: 0;
`;

const CardStatusText = styled.span<{ $color: string }>`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const OrigemChip = styled.span`
  font-size: 10.5px;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
`;

const CardDaysAgo = styled.div`
  font-size: 10.5px;
  color: var(--color-text-muted);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.7;
`;

// ─── WhatsApp Template Box ────────────────────────────────────────────────────

const TemplateBox = styled.div`
  background: rgba(34,197,94,0.05);
  border: 1px solid rgba(34,197,94,0.18);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 14px;
`;

const TemplateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const TemplateLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #22c55e;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TemplateCopyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  font-weight: 600;
  color: #22c55e;
  border: 1px solid rgba(34,197,94,0.25);
  background: rgba(34,197,94,0.08);
  transition: all 0.15s;
  &:hover { background: rgba(34,197,94,0.15); }
`;

const TemplateText = styled.p`
  font-size: 12.5px;
  color: var(--color-text);
  line-height: 1.55;
  margin: 0;
`;

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 18px;
`;

const DetailAvatar = styled.div<{ $color: string }>`
  width: 52px; height: 52px;
  border-radius: 14px;
  background: ${({ $color }) => $color}20;
  border: 1.5px solid ${({ $color }) => $color}40;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800;
  color: ${({ $color }) => $color};
  flex-shrink: 0; letter-spacing: -1px;
`;

const DetailHeaderInfo = styled.div`flex: 1; min-width: 0;`;

const DetailName = styled.h3`
  font-size: 17px; font-weight: 700; color: var(--color-text);
  letter-spacing: -0.3px; margin-bottom: 6px;
`;

const DetailInfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const DetailIcon = styled.div`
  width: 32px; height: 32px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
`;

const DetailRowContent = styled.div`flex: 1;`;
const DetailRowLabel = styled.p`font-size: 11px; color: var(--color-text-muted); margin-bottom: 2px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;`;
const DetailRowValue = styled.p`font-size: 13.5px; color: var(--color-text);`;
const DetailLink = styled.a`font-size: 13.5px; color: var(--color-primary); &:hover { text-decoration: underline; }`;

const DetailSeparator = styled.div`height: 1px; background: var(--color-border); margin: 14px 0;`;

const NotesArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 13.5px;
  font-family: inherit;
  padding: 10px 12px;
  resize: vertical;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.15s, box-shadow 0.15s;
  &::placeholder { color: var(--color-text-muted); opacity: 0.6; }
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
  }
`;

const DetailLabel = styled.p`font-size: 12.5px; font-weight: 500; color: var(--color-text-muted); margin-bottom: 6px;`;

const StatusSelect = styled.select`
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
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
  }
`;

// ─── Add Modal Form ───────────────────────────────────────────────────────────

const ModalForm = styled.div`display: flex; flex-direction: column; gap: 14px;`;
const FormRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 12px;`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreLabel(score: number) {
  if (score >= 3) return "Quente";
  if (score === 2) return "Morno";
  return "Frio";
}

function getInitials(nome: string): string {
  const words = nome.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// ─── Template de abordagem WhatsApp por segmento ──────────────────────────────

const WHATSAPP_TEMPLATES: Record<string, (nome: string) => string> = {
  "Barbearia": (n) => `Olá! Vi que a ${n} ainda não tem um perfil ativo no Instagram. A gente cuida de toda a presença digital da sua barbearia — fotos, posts, stories e Google Maps. Posso te mostrar como funciona?`,
  "Salão de Beleza": (n) => `Oi! Passei pelo perfil da ${n} e percebi que dá pra atrair muito mais clientes com uma presença digital organizada. A gente monta tudo pra você — Instagram, Google e mais. Quer saber como?`,
  "Clínica": (n) => `Olá! Notei que a ${n} ainda não tem um Google Meu Negócio completo. Isso faz muita diferença na hora de aparecer nas buscas locais. A gente cuida disso pra você. Posso explicar melhor?`,
  "Restaurante": (n) => `Oi! Vi que o ${n} ainda não tem um cardápio digital ou perfil ativo nas redes. A gente monta a presença completa do seu restaurante online. Que tal a gente conversar?`,
  "Lanchonete": (n) => `Olá! A ${n} ainda não tem Instagram ativo ou Google Meu Negócio configurado. Com isso, muita gente passa na sua frente sem te encontrar. Posso mostrar como mudar isso?`,
  "Padaria": (n) => `Oi! Percebi que a ${n} ainda não tem presença digital organizada. A gente cuida das suas redes e do seu perfil no Google. Posso te mostrar o que fazemos por outras padarias da região?`,
  "Pet Shop": (n) => `Olá! Vi que o ${n} ainda não usa as redes sociais pra atrair clientes. A gente monta tudo — fotos dos pets, promoções, Google Maps. Quer ver como funciona?`,
  "Academia": (n) => `Oi! A ${n} ainda não tem um Instagram ativo? Hoje em dia as pessoas escolhem academia pelas redes. A gente cuida de toda a presença digital pra você. Quer conversar?`,
  "Loja de Roupas": (n) => `Olá! Percebi que a ${n} ainda não vende pelo Instagram ou tem fotos profissionais dos produtos. A gente monta isso pra você. Posso te mostrar como funciona?`,
  "Mercado": (n) => `Oi! O ${n} ainda não tem um Google Meu Negócio completo. Com ele, moradores da região te encontram mais fácil. A gente configura e cuida disso. Quer saber mais?`,
  "Mecânica": (n) => `Olá! Notei que a ${n} ainda não aparece bem no Google Maps. Muita gente procura mecânica pelo celular. A gente cuida da sua presença digital completa. Posso te contar mais?`,
  "Farmácia": (n) => `Oi! Vi que a ${n} ainda não tem um perfil ativo no Google Meu Negócio. Isso ajuda muito quem tá procurando farmácia perto de casa. A gente configura e cuida disso. Quer ver?`,
};

function getWhatsAppTemplate(segmento: string, nome: string): string {
  const fn = WHATSAPP_TEMPLATES[segmento];
  if (fn) return fn(nome);
  return `Olá! Vi que o(a) ${nome} ainda não tem uma presença digital completa. A Conecta Leste SP cuida das suas redes sociais, Google Maps e muito mais. Posso te contar como funciona?`;
}

function shortSite(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function daysAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "hoje";
  if (diff === 1) return "há 1 dia";
  return `há ${diff} dias`;
}

function getOrigemColor(origem: LeadOrigem) {
  if (origem === "Indicação") return "warning" as const;
  if (origem === "Prospecção") return "orange" as const;
  if (origem === "Instagram") return "info" as const;
  if (origem === "Google Maps") return "success" as const;
  return "default" as const;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("prospeccao");

  // ─── Prospecção state ────────────────────────────────────────────────────────
  const [bairro, setBairro] = useState("");
  const [segmento, setSegmento] = useState(SEGMENTOS[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LeadResult[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ─── Pipeline state ──────────────────────────────────────────────────────────
  const [pipeline, setPipeline] = useState<PipelineLead[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [pipelineTab, setPipelineTab] = useState<PipelineTab>("Todos");

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data: unknown[]) => setPipeline((data as Record<string, unknown>[]).map(dbLeadToPipeline)))
      .catch(() => {/* silently ignore — empty state shown */})
      .finally(() => setPipelineLoading(false));
  }, []);

  // ─── Detail modal state ──────────────────────────────────────────────────────
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [editStatus, setEditStatus] = useState<LeadStatus>("Novo");
  const [editNotas, setEditNotas] = useState("");
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // ─── Add modal state ─────────────────────────────────────────────────────────
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    nome: "", segmento: SEGMENTOS[0], bairro: "", telefone: "",
    site: "", origem: ORIGEM_OPTIONS[0] as LeadOrigem, notas: "",
  });

  // ─── Search ──────────────────────────────────────────────────────────────────

  async function handleSearch() {
    if (!bairro.trim()) return;
    setIsSearching(true);
    setSearchResults(null);
    setSearchError(null);
    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bairro: bairro.trim(), segmento }),
      });
      const data = await res.json();
      if (!res.ok) { setSearchError(data.error ?? "Erro ao buscar leads."); return; }
      setSearchResults(data.leads);
    } catch {
      setSearchError("Falha na conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsSearching(false);
    }
  }

  // ─── Captar lead (salva no Supabase) ─────────────────────────────────────────

  const [captandoId, setCaptandoId] = useState<string | null>(null);

  async function captarLead(lead: LeadResult) {
    if (captandoId) return;
    setCaptandoId(lead.place_id);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         lead.nome,
          phone:        lead.telefone ?? null,
          segment:      segmento,
          neighborhood: bairro.trim(),
          source:       "google_maps",
          status:       "new",
          notes:        null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Erro ao captar lead."); return; }
      const novo = dbLeadToPipeline(data);
      setPipeline((prev) => {
        if (prev.some((l) => l.id === novo.id)) return prev;
        return [novo, ...prev];
      });
      setSearchResults((prev) => prev?.filter((l) => l.place_id !== lead.place_id) ?? null);
    } catch {
      alert("Falha ao salvar lead. Tente novamente.");
    } finally {
      setCaptandoId(null);
    }
  }

  // ─── Open detail ─────────────────────────────────────────────────────────────

  function openDetail(lead: PipelineLead) {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotas(lead.notas ?? "");
  }

  const [savingDetail, setSavingDetail] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<{
    nome?: string; telefone?: string; segmento?: string; bairro?: string;
  }>({});

  async function handleConverter() {
    if (!selectedLead) return;
    const prefill = {
      nome:      selectedLead.nome,
      telefone:  selectedLead.telefone ?? "",
      segmento:  selectedLead.segmento,
      bairro:    selectedLead.bairro,
    };
    await saveDetail();
    setWizardInitialData(prefill);
    setWizardOpen(true);
  }

  async function saveDetail() {
    if (!selectedLead) return;
    setSavingDetail(true);
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:     selectedLead.id,
          status: STATUS_TO_DB[editStatus],
          notes:  editNotas || null,
          last_contact_at: new Date().toISOString(),
        }),
      });
      setPipeline((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id
            ? { ...l, status: editStatus, notas: editNotas }
            : l
        )
      );
      setSelectedLead(null);
    } finally {
      setSavingDetail(false);
    }
  }

  // ─── Add lead manual ──────────────────────────────────────────────────────────

  const [addingSave, setAddingSave] = useState(false);

  async function handleAddLead() {
    if (!addForm.nome.trim()) return;
    setAddingSave(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         addForm.nome.trim(),
          phone:        addForm.telefone.trim() || null,
          segment:      addForm.segmento,
          neighborhood: addForm.bairro.trim() || null,
          source:       ORIGEM_TO_DB[addForm.origem],
          status:       "new",
          notes:        addForm.notas.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Erro ao salvar lead."); return; }
      setPipeline((prev) => [dbLeadToPipeline(data), ...prev]);
      setAddForm({ nome: "", segmento: SEGMENTOS[0], bairro: "", telefone: "", site: "", origem: ORIGEM_OPTIONS[0], notas: "" });
      setAddModalOpen(false);
    } finally {
      setAddingSave(false);
    }
  }

  // ─── Computed ────────────────────────────────────────────────────────────────

  const filteredPipeline = pipeline.filter(
    (l) => pipelineTab === "Todos" || l.status === pipelineTab
  );

  const pipelineCounts = PIPELINE_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "Todos" ? pipeline.length : pipeline.filter((l) => l.status === tab).length;
    return acc;
  }, {} as Record<PipelineTab, number>);

  const capturedIds = new Set(pipeline.map((l) => l.id));

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <PageTitle>Leads</PageTitle>
          <PageSubtitle>
            {mainTab === "prospeccao"
              ? "Busque comércios por bairro e segmento"
              : `${pipeline.length} leads no funil de prospecção`}
          </PageSubtitle>
        </div>
        {mainTab === "pipeline" && (
          <Button
            variant="primary"
            icon={<Plus size={16} weight="bold" />}
            onClick={() => setAddModalOpen(true)}
          >
            Adicionar Lead
          </Button>
        )}
      </PageHeader>

      {/* Main tabs */}
      <MainTabsRow>
        <MainTabBtn $active={mainTab === "prospeccao"} onClick={() => setMainTab("prospeccao")}>
          <MagnifyingGlass size={15} weight={mainTab === "prospeccao" ? "fill" : "regular"} />
          Prospecção
        </MainTabBtn>
        <MainTabBtn $active={mainTab === "pipeline"} onClick={() => setMainTab("pipeline")}>
          <FunnelSimple size={15} weight={mainTab === "pipeline" ? "fill" : "regular"} />
          Pipeline
          {pipeline.length > 0 && <CountPill>{pipeline.length}</CountPill>}
        </MainTabBtn>
      </MainTabsRow>

      {/* ═══ ABA: PROSPECÇÃO ═══════════════════════════════════════════════════ */}
      {mainTab === "prospeccao" && (
        <>
          <SearchPanel>
            <SearchPanelTitle>Buscar comércios no Google Maps</SearchPanelTitle>
            <SearchRow>
              <Input
                label="Bairro"
                placeholder="Ex: Cidade Tiradentes, Itaquera..."
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                fullWidth
              />
              <SelectWrapper>
                <SelectLabel>Segmento</SelectLabel>
                <StyledSelect value={segmento} onChange={(e) => setSegmento(e.target.value)}>
                  {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </StyledSelect>
              </SelectWrapper>
              <Button
                variant="primary"
                size="md"
                loading={isSearching}
                onClick={handleSearch}
                icon={<MagnifyingGlass size={16} weight="bold" />}
                disabled={!bairro.trim()}
              >
                Buscar
              </Button>
            </SearchRow>
          </SearchPanel>

          {isSearching && (
            <LoadingRow>
              <SpinnerEl />
              Buscando {segmento.toLowerCase()}s em {bairro}...
            </LoadingRow>
          )}

          {searchError && (
            <ErrorBox>
              <Warning size={18} weight="fill" />
              {searchError}
            </ErrorBox>
          )}

          {searchResults !== null && !isSearching && (
            <>
              {searchResults.length === 0 ? (
                <EmptyBox>
                  <EmptyTitle>Nenhum resultado encontrado</EmptyTitle>
                  <EmptyDesc>Tente outro bairro ou segmento.</EmptyDesc>
                </EmptyBox>
              ) : (
                <>
                  <ResultsHeader>
                    <ResultsCount>
                      <span>{searchResults.length}</span> negócios encontrados em {bairro} — ordenados por oportunidade
                    </ResultsCount>
                    <Button variant="ghost" size="sm" icon={<ArrowsClockwise size={14} />} onClick={handleSearch}>
                      Refazer busca
                    </Button>
                  </ResultsHeader>

                  <Table>
                    <TableHead>
                      <TH>Negócio</TH>
                      <TH>Telefone</TH>
                      <TH>Site</TH>
                      <TH>Avaliação</TH>
                      <TH>Score</TH>
                      <TH></TH>
                    </TableHead>
                    {searchResults.map((lead, i) => {
                      const jaAdicionado = capturedIds.has(lead.place_id);
                      return (
                        <TableRow key={lead.place_id} $index={i}>
                          <CellNome>
                            <NomeText title={lead.nome}>{lead.nome}</NomeText>
                            <EnderecoText title={lead.endereco}>{lead.endereco}</EnderecoText>
                            {lead.score_motivos.length > 0 && (
                              <MotivosBox>
                                {lead.score_motivos.map((m) => <MotivoBadge key={m}>{m}</MotivoBadge>)}
                              </MotivosBox>
                            )}
                          </CellNome>
                          <CellWithIcon>
                            {lead.telefone ? (
                              <><IconOk><CheckCircle size={14} weight="fill" /></IconOk><span style={{ fontSize: "12px" }}>{lead.telefone}</span></>
                            ) : (
                              <><IconNo><Phone size={14} /></IconNo><span style={{ fontSize: "12px", color: "var(--color-text-muted)", opacity: 0.5 }}>Não informado</span></>
                            )}
                          </CellWithIcon>
                          <CellWithIcon>
                            {lead.site ? (
                              <><IconOk><Globe size={14} weight="fill" /></IconOk><SiteLink href={lead.site} target="_blank" rel="noopener noreferrer">{shortSite(lead.site)}</SiteLink></>
                            ) : (
                              <><IconNo><XCircle size={14} weight="fill" /></IconNo><span style={{ fontSize: "12px", color: "var(--color-text-muted)", opacity: 0.5 }}>Sem site</span></>
                            )}
                          </CellWithIcon>
                          <CellWithIcon>
                            <Star size={13} weight="fill" style={{ color: lead.rating && lead.rating >= 4 ? "#EAB308" : "#52525B" }} />
                            {lead.rating ? (
                              <RatingText $low={lead.rating < 4.0}>
                                {lead.rating.toFixed(1)}
                                {lead.total_avaliacoes !== null && <span style={{ fontSize: "11px", opacity: 0.6 }}> ({lead.total_avaliacoes})</span>}
                              </RatingText>
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", opacity: 0.5 }}>Sem nota</span>
                            )}
                          </CellWithIcon>
                          <div>
                            <ScoreBadge $score={lead.score}>{lead.score}/3</ScoreBadge>
                            <ScoreLabel $score={lead.score}>{scoreLabel(lead.score)}</ScoreLabel>
                          </div>
                          <div>
                            {jaAdicionado ? (
                              <Badge variant="success" size="sm" dot>Captado</Badge>
                            ) : (
                              <Button
                                variant="primary" size="sm"
                                icon={<UserPlus size={13} weight="bold" />}
                                loading={captandoId === lead.place_id}
                                disabled={!!captandoId}
                                onClick={() => captarLead(lead)}
                              >
                                Captar
                              </Button>
                            )}
                          </div>
                        </TableRow>
                      );
                    })}
                  </Table>
                </>
              )}
            </>
          )}

          {searchResults === null && !isSearching && !searchError && (
            <EmptyBox>
              <MagnifyingGlass size={32} style={{ color: "var(--color-border)", marginBottom: 12 }} />
              <EmptyTitle>Digite um bairro e clique em Buscar</EmptyTitle>
              <EmptyDesc>Os negócios serão listados ordenados por oportunidade — quem tem mais deficiências aparece primeiro.</EmptyDesc>
            </EmptyBox>
          )}
        </>
      )}

      {/* ═══ ABA: PIPELINE ═══════════════════════════════════════════════════ */}
      {mainTab === "pipeline" && (
        <>
          <Toolbar>
            <TabsRow>
              {PIPELINE_TABS.map((tab) => (
                <Tab key={tab} $active={pipelineTab === tab} onClick={() => setPipelineTab(tab)}>
                  {tab}
                  {pipelineCounts[tab] > 0 && <CountPill>{pipelineCounts[tab]}</CountPill>}
                </Tab>
              ))}
            </TabsRow>
          </Toolbar>

          {pipelineLoading ? (
            <LoadingRow><SpinnerEl />Carregando leads...</LoadingRow>
          ) : filteredPipeline.length === 0 ? (
            <EmptyBox>
              <FunnelSimple size={34} style={{ color: "var(--color-border)", marginBottom: 12 }} />
              <EmptyTitle>
                {pipelineTab === "Todos" ? "Nenhum lead captado ainda." : `Nenhum lead com status "${pipelineTab}".`}
              </EmptyTitle>
              <EmptyDesc style={{ marginBottom: 16 }}>
                Capture negócios na aba Prospecção para começar o funil.
              </EmptyDesc>
              <button
                onClick={() => setMainTab("prospeccao")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: "var(--radius-sm)",
                  fontSize: 13, fontWeight: 600,
                  color: "var(--color-primary)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  background: "rgba(249,115,22,0.08)",
                  transition: "all 0.15s",
                }}
              >
                <MagnifyingGlass size={14} />
                Ir para Prospecção
              </button>
            </EmptyBox>
          ) : (
            <CardsGrid>
              {filteredPipeline.map((lead, i) => {
                const color = STATUS_COLORS[lead.status];
                const initials = getInitials(lead.nome);
                return (
                  <CardWrap key={lead.id} $index={i} onClick={() => openDetail(lead)}>
                    <CardColorBar $color={color} />
                    <CardBody>
                      <CardAvatarRow>
                        <CardAvatar $color={color}>{initials}</CardAvatar>
                        <CardName>{lead.nome}</CardName>
                      </CardAvatarRow>

                      <CardMeta>
                        <Tag size={11} />
                        {lead.segmento}
                        <CardMetaDot />
                        <MapPin size={11} />
                        {lead.bairro}
                      </CardMeta>

                      <CardPhone>
                        {lead.telefone ? (
                          <><Phone size={12} />{lead.telefone}</>
                        ) : (
                          <span style={{ opacity: 0.35 }}>Sem telefone</span>
                        )}
                      </CardPhone>

                      <CardDaysAgo>
                        <CalendarBlank size={11} />
                        {daysAgo(lead.created_at)}
                      </CardDaysAgo>

                      <CardFooter>
                        <CardStatusText $color={color}>
                          <StatusDot $color={color} />
                          {lead.status}
                        </CardStatusText>
                        <OrigemChip>{lead.origem}</OrigemChip>
                      </CardFooter>
                    </CardBody>
                  </CardWrap>
                );
              })}
            </CardsGrid>
          )}
        </>
      )}

      {/* ═══ MODAL: Detalhes do Lead ══════════════════════════════════════════ */}
      <Modal
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title=""
        size="md"
        footer={
          <>
            {selectedLead?.status !== "Ganho" && (
              <Button
                variant="ghost"
                icon={<UserCirclePlus size={16} />}
                onClick={handleConverter}
                style={{ marginRight: "auto" }}
              >
                Converter em Cliente
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedLead(null)}>Cancelar</Button>
            <Button variant="primary" loading={savingDetail} onClick={saveDetail}>Salvar</Button>
          </>
        }
      >
        {selectedLead && (
          <>
            <DetailHeader>
              <DetailAvatar $color={STATUS_COLORS[selectedLead.status]}>
                {getInitials(selectedLead.nome)}
              </DetailAvatar>
              <DetailHeaderInfo>
                <DetailName>{selectedLead.nome}</DetailName>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge variant={getOrigemColor(selectedLead.origem)} size="sm">{selectedLead.origem}</Badge>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                    color: STATUS_COLORS[selectedLead.status],
                    borderColor: STATUS_COLORS[selectedLead.status] + "44",
                    background: STATUS_COLORS[selectedLead.status] + "15",
                    border: `1px solid ${STATUS_COLORS[selectedLead.status]}44`,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[selectedLead.status], display: "inline-block" }} />
                    {selectedLead.status}
                  </span>
                </div>
              </DetailHeaderInfo>
            </DetailHeader>

            <DetailInfoGrid>
              <DetailRow>
                <DetailIcon><Tag size={15} /></DetailIcon>
                <DetailRowContent>
                  <DetailRowLabel>Segmento</DetailRowLabel>
                  <DetailRowValue>{selectedLead.segmento}</DetailRowValue>
                </DetailRowContent>
              </DetailRow>

              <DetailRow>
                <DetailIcon><MapPin size={15} /></DetailIcon>
                <DetailRowContent>
                  <DetailRowLabel>Bairro</DetailRowLabel>
                  <DetailRowValue>{selectedLead.bairro}</DetailRowValue>
                </DetailRowContent>
              </DetailRow>

              {selectedLead.telefone && (
                <DetailRow>
                  <DetailIcon><Phone size={15} /></DetailIcon>
                  <DetailRowContent>
                    <DetailRowLabel>Telefone / WhatsApp</DetailRowLabel>
                    <DetailLink href={`https://wa.me/55${selectedLead.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      {selectedLead.telefone}
                    </DetailLink>
                  </DetailRowContent>
                </DetailRow>
              )}

              {selectedLead.site && (
                <DetailRow>
                  <DetailIcon><Globe size={15} /></DetailIcon>
                  <DetailRowContent>
                    <DetailRowLabel>Site</DetailRowLabel>
                    <DetailLink href={selectedLead.site} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {shortSite(selectedLead.site)}
                      <ArrowSquareOut size={12} />
                    </DetailLink>
                  </DetailRowContent>
                </DetailRow>
              )}

              <DetailRow>
                <DetailIcon><CalendarBlank size={15} /></DetailIcon>
                <DetailRowContent>
                  <DetailRowLabel>Captado em</DetailRowLabel>
                  <DetailRowValue>{formatDate(selectedLead.created_at)}</DetailRowValue>
                </DetailRowContent>
              </DetailRow>
            </DetailInfoGrid>

            <DetailSeparator />

            {/* Template de abordagem WhatsApp */}
            {selectedLead && (
              <TemplateBox>
                <TemplateHeader>
                  <TemplateLabel>
                    <Phone size={13} weight="fill" />
                    Sugestão de abordagem WhatsApp
                  </TemplateLabel>
                  <TemplateCopyBtn
                    onClick={() => {
                      const msg = getWhatsAppTemplate(selectedLead.segmento, selectedLead.nome);
                      navigator.clipboard.writeText(msg);
                      setCopiedTemplate(true);
                      setTimeout(() => setCopiedTemplate(false), 2000);
                    }}
                  >
                    {copiedTemplate ? <><CheckCircle size={12} weight="fill" /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                  </TemplateCopyBtn>
                </TemplateHeader>
                <TemplateText>
                  {getWhatsAppTemplate(selectedLead.segmento, selectedLead.nome)}
                </TemplateText>
              </TemplateBox>
            )}

            <div style={{ marginBottom: 14 }}>
              <DetailLabel>Status</DetailLabel>
              <StatusSelect value={editStatus} onChange={(e) => setEditStatus(e.target.value as LeadStatus)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </StatusSelect>
            </div>

            <div>
              <DetailLabel style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <NotePencil size={13} />
                Observações
              </DetailLabel>
              <NotesArea
                placeholder="Anote informações sobre o contato, interesses, próximos passos..."
                value={editNotas}
                onChange={(e) => setEditNotas(e.target.value)}
              />
            </div>
          </>
        )}
      </Modal>

      {/* ═══ MODAL: Adicionar Lead Manual ════════════════════════════════════ */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Adicionar Lead"
        description="Registre um novo prospect no funil de vendas"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" disabled={!addForm.nome.trim()} loading={addingSave} onClick={handleAddLead}>
              Salvar Lead
            </Button>
          </>
        }
      >
        <ModalForm>
          <Input
            label="Nome do estabelecimento *"
            placeholder="Ex: Barbearia Corte & Cia"
            value={addForm.nome}
            onChange={(e) => setAddForm((f) => ({ ...f, nome: e.target.value }))}
            fullWidth
          />
          <FormRow>
            <SelectWrapper>
              <SelectLabel>Segmento</SelectLabel>
              <StyledSelect value={addForm.segmento} onChange={(e) => setAddForm((f) => ({ ...f, segmento: e.target.value }))}>
                {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </StyledSelect>
            </SelectWrapper>
            <Input
              label="Bairro"
              placeholder="Ex: São Mateus"
              value={addForm.bairro}
              onChange={(e) => setAddForm((f) => ({ ...f, bairro: e.target.value }))}
              fullWidth
            />
          </FormRow>
          <FormRow>
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 99999-9999"
              value={addForm.telefone}
              onChange={(e) => setAddForm((f) => ({ ...f, telefone: e.target.value }))}
              fullWidth
            />
            <Input
              label="Site"
              placeholder="www.exemplo.com.br"
              value={addForm.site}
              onChange={(e) => setAddForm((f) => ({ ...f, site: e.target.value }))}
              fullWidth
            />
          </FormRow>
          <SelectWrapper>
            <SelectLabel>Origem</SelectLabel>
            <StyledSelect value={addForm.origem} onChange={(e) => setAddForm((f) => ({ ...f, origem: e.target.value as LeadOrigem }))}>
              {ORIGEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </StyledSelect>
          </SelectWrapper>
          <div>
            <DetailLabel>Observações</DetailLabel>
            <NotesArea
              placeholder="Informações relevantes sobre o lead..."
              value={addForm.notas}
              onChange={(e) => setAddForm((f) => ({ ...f, notas: e.target.value }))}
            />
          </div>
        </ModalForm>
      </Modal>

      {wizardOpen && (
        <NovoClienteWizard
          initialData={wizardInitialData}
          onClose={() => setWizardOpen(false)}
          onSuccess={() => setWizardOpen(false)}
        />
      )}
    </PageWrapper>
  );
}
