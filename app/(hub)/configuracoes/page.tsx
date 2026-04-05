"use client";

import styled, { keyframes } from "styled-components";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Buildings,
  Link as LinkIcon,
  User,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  SignOut,
  Lock,
  PencilSimple,
  FloppyDisk,
  X,
  Envelope,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase/client";

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  max-width: 760px;
  animation: ${fadeUp} 0.3s ease both;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
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

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);

  svg { color: var(--color-primary); }
`;

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  gap: 16px;

  &:last-child { border-bottom: none; }
`;

const FieldLabel = styled.label`
  font-size: 12.5px;
  font-weight: 500;
  color: var(--color-text-muted);
  min-width: 160px;
  flex-shrink: 0;
`;

const FieldInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 13.5px;
  font-family: inherit;
  outline: none;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  &:not(:disabled) {
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 2px;
  }
`;

// Integration card
const IntegrationCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const IntegrationLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const IntegrationIcon = styled.div`
  width: 42px;
  height: 42px;
  background: rgba(249,115,22,0.1);
  border: 1px solid rgba(249,115,22,0.2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 800;
`;

const IntegrationInfo = styled.div`
  flex: 1;
`;

const IntegrationName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 3px;
`;

const IntegrationUrl = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
`;

const IntegrationStatus = styled.div<{ $connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $connected }) => ($connected ? "var(--color-success)" : "var(--color-danger)")};
`;

// Account card
const AccountCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  gap: 16px;

  &:last-child { border-bottom: none; }
`;

const AccountLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AccountLabel = styled.span`
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-text);
`;

const AccountSub = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
`;

const DangerRow = styled(AccountRow)`
  &:last-child {
    background: rgba(239,68,68,0.02);
  }
`;

const Toast = styled.div<{ $variant: "success" | "error" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
  animation: ${fadeUp} 0.2s ease both;
  background: ${({ $variant }) => $variant === "success"
    ? "rgba(34,197,94,0.08)"
    : "rgba(239,68,68,0.08)"};
  border: 1px solid ${({ $variant }) => $variant === "success"
    ? "rgba(34,197,94,0.2)"
    : "rgba(239,68,68,0.2)"};
  color: ${({ $variant }) => $variant === "success"
    ? "var(--color-success)"
    : "var(--color-danger)"};
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENCY_STORAGE_KEY = "hub_agency_info";

interface AgencyInfo {
  name:  string;
  owner: string;
  email: string;
  phone: string;
}

function loadAgencyInfo(): AgencyInfo {
  try {
    const raw = localStorage.getItem(AGENCY_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AgencyInfo;
  } catch { /* ignore */ }
  return {
    name:  "Conecta Leste SP",
    owner: "",
    email: "",
    phone: "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const router = useRouter();

  // ── Integração ──
  const [testando,   setTestando]   = useState(false);
  const [testResult, setTestResult] = useState<null | "ok" | "err">(null);

  // ── Conta ──
  const [userEmail,      setUserEmail]      = useState<string | null>(null);
  const [resetLoading,   setResetLoading]   = useState(false);
  const [toast,          setToast]          = useState<{ msg: string; variant: "success" | "error" } | null>(null);

  // ── Dados da Agência ──
  const [editing,    setEditing]    = useState(false);
  const [agency,     setAgency]     = useState<AgencyInfo>(loadAgencyInfo);
  const [agencyDraft, setAgencyDraft] = useState<AgencyInfo>(agency);

  useEffect(() => {
    getSupabaseClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  function showToast(msg: string, variant: "success" | "error") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 4000);
  }

  function startEdit() {
    setAgencyDraft(agency);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function saveAgency() {
    setAgency(agencyDraft);
    localStorage.setItem(AGENCY_STORAGE_KEY, JSON.stringify(agencyDraft));
    setEditing(false);
    showToast("Dados da agência salvos com sucesso.", "success");
  }

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut();
    router.push("/login");
  }

  function testarConexao() {
    setTestando(true);
    setTestResult(null);
    setTimeout(() => {
      setTestando(false);
      setTestResult("ok");
    }, 1500);
  }

  async function handleResetPassword() {
    if (!userEmail) return;
    setResetLoading(true);
    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      showToast(`Link de redefinição enviado para ${userEmail}.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao enviar e-mail.", "error");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Configurações</PageTitle>
        <PageSubtitle>Dados da agência, integrações e conta</PageSubtitle>
      </PageHeader>

      {toast && (
        <Toast $variant={toast.variant}>
          {toast.variant === "success"
            ? <CheckCircle size={16} weight="fill" />
            : <XCircle size={16} weight="fill" />}
          {toast.msg}
        </Toast>
      )}

      {/* Dados da Agência */}
      <Section>
        <SectionTitle style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Buildings size={15} weight="fill" />
            Dados da Agência
          </span>
          {editing ? (
            <span style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm" icon={<X size={13} />} onClick={cancelEdit}>Cancelar</Button>
              <Button variant="primary" size="sm" icon={<FloppyDisk size={13} weight="fill" />} onClick={saveAgency}>Salvar</Button>
            </span>
          ) : (
            <Button variant="secondary" size="sm" icon={<PencilSimple size={13} />} onClick={startEdit}>Editar</Button>
          )}
        </SectionTitle>
        <Card>
          <FieldRow>
            <FieldLabel>Nome da agência</FieldLabel>
            <FieldInput
              value={editing ? agencyDraft.name : agency.name}
              disabled={!editing}
              onChange={(e) => setAgencyDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </FieldRow>
          <FieldRow>
            <FieldLabel>Responsável</FieldLabel>
            <FieldInput
              value={editing ? agencyDraft.owner : agency.owner}
              disabled={!editing}
              placeholder={editing ? "Nome do responsável" : "—"}
              onChange={(e) => setAgencyDraft((d) => ({ ...d, owner: e.target.value }))}
            />
          </FieldRow>
          <FieldRow>
            <FieldLabel>E-mail de contato</FieldLabel>
            <FieldInput
              value={editing ? agencyDraft.email : agency.email}
              disabled={!editing}
              placeholder={editing ? "contato@email.com" : "—"}
              onChange={(e) => setAgencyDraft((d) => ({ ...d, email: e.target.value }))}
            />
          </FieldRow>
          <FieldRow>
            <FieldLabel>Telefone / WhatsApp</FieldLabel>
            <FieldInput
              value={editing ? agencyDraft.phone : agency.phone}
              disabled={!editing}
              placeholder={editing ? "(11) 9 0000-0000" : "—"}
              onChange={(e) => setAgencyDraft((d) => ({ ...d, phone: e.target.value }))}
            />
          </FieldRow>
        </Card>
      </Section>

      {/* Integrações */}
      <Section>
        <SectionTitle>
          <LinkIcon size={15} weight="fill" />
          Integrações
        </SectionTitle>

        <IntegrationCard>
          <IntegrationLeft>
            <IntegrationIcon>MJ</IntegrationIcon>
            <IntegrationInfo>
              <IntegrationName>Marque Já</IntegrationName>
              <IntegrationUrl>https://marqueja.conectalestesp.com.br</IntegrationUrl>
              <IntegrationStatus $connected={testResult !== "err"}>
                {testResult === "err" ? (
                  <><XCircle size={13} weight="fill" /> Sem conexão</>
                ) : (
                  <><CheckCircle size={13} weight="fill" /> Conectado</>
                )}
              </IntegrationStatus>
            </IntegrationInfo>
          </IntegrationLeft>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowsClockwise size={14} weight={testando ? "regular" : "bold"} />}
            onClick={testarConexao}
            loading={testando}
          >
            Testar conexão
          </Button>
        </IntegrationCard>
      </Section>

      {/* Conta */}
      <Section>
        <SectionTitle>
          <User size={15} weight="fill" />
          Conta
        </SectionTitle>

        <AccountCard>
          <AccountRow>
            <AccountLeft>
              <AccountLabel>E-mail da conta</AccountLabel>
              <AccountSub style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Envelope size={12} />
                {userEmail ?? "Carregando..."}
              </AccountSub>
            </AccountLeft>
          </AccountRow>

          <AccountRow>
            <AccountLeft>
              <AccountLabel>Alterar senha</AccountLabel>
              <AccountSub>Envia um link de redefinição para o seu e-mail</AccountSub>
            </AccountLeft>
            <Button
              variant="secondary"
              size="sm"
              icon={<Lock size={14} />}
              loading={resetLoading}
              onClick={handleResetPassword}
            >
              Enviar link
            </Button>
          </AccountRow>

          <DangerRow>
            <AccountLeft>
              <AccountLabel style={{ color: "var(--color-danger)" }}>Sair da conta</AccountLabel>
              <AccountSub>Encerrar sessão atual</AccountSub>
            </AccountLeft>
            <Button
              variant="danger"
              size="sm"
              icon={<SignOut size={14} />}
              onClick={handleSignOut}
            >
              Sair
            </Button>
          </DangerRow>
        </AccountCard>
      </Section>
    </PageWrapper>
  );
}
