"use client";

import styled, { keyframes } from "styled-components";
import { useState } from "react";
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
  cursor: default;

  &:disabled {
    opacity: 0.7;
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [testando, setTestando] = useState(false);
  const [testResult, setTestResult] = useState<null | "ok" | "err">(null);

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

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Configurações</PageTitle>
        <PageSubtitle>Dados da agência, integrações e conta</PageSubtitle>
      </PageHeader>

      {/* Dados da Agência */}
      <Section>
        <SectionTitle>
          <Buildings size={15} weight="fill" />
          Dados da Agência
        </SectionTitle>
        <Card>
          <FieldRow>
            <FieldLabel>Nome da agência</FieldLabel>
            <FieldInput value="Conecta Leste SP" disabled readOnly />
          </FieldRow>
          <FieldRow>
            <FieldLabel>Responsável</FieldLabel>
            <FieldInput value="Dono da Agência" disabled readOnly />
          </FieldRow>
          <FieldRow>
            <FieldLabel>E-mail de contato</FieldLabel>
            <FieldInput value="contato@conectaleste.com.br" disabled readOnly />
          </FieldRow>
          <FieldRow>
            <FieldLabel>Telefone</FieldLabel>
            <FieldInput value="(11) 99999-9999" disabled readOnly />
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
              <AccountSub>admin@conectaleste.com.br</AccountSub>
            </AccountLeft>
          </AccountRow>

          <AccountRow>
            <AccountLeft>
              <AccountLabel>Alterar senha</AccountLabel>
              <AccountSub>Enviar link de redefinição por e-mail</AccountSub>
            </AccountLeft>
            <Button variant="secondary" size="sm" icon={<Lock size={14} />}>
              Alterar senha
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
