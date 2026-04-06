"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Inter } from "next/font/google";
import styled, { keyframes } from "styled-components";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Users,
  CurrencyDollar,
  FunnelSimple,
  ChartBar,
  TrendUp,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";

const inter = Inter({ subsets: ["latin"] });

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatA = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
`;

const floatB = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(-1deg); }
`;

const floatC = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-7px) rotate(0.5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.05); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  background: var(--color-bg);
`;

// ─── Left Panel ───────────────────────────────────────────────────────────────

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: #ffffff;
  border-right: 1px solid #e4e4e7;
  animation: ${fadeIn} 0.4s ease both;

  @media (max-width: 900px) {
    border-right: none;
    padding: 40px 24px;
  }
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;

  --color-text: #09090b;
  --color-text-muted: #71717a;
  --color-border: #e4e4e7;
  --color-bg: #f4f4f5;
  --color-surface-2: #efefef;
  --color-danger: #ef4444;
  --color-primary: #f97316;
  --color-primary-dark: #ea6c0a;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
`;

const LogoBadge = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.3);
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LogoName = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: #F97316;
  letter-spacing: -0.5px;
  line-height: 1.1;
  font-family: ${inter.style.fontFamily};
`;

const LogoSub = styled.span`
  font-size: 12px;
  color: #71717a;
  line-height: 1.2;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.2px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  background: var(--color-bg);
  border: 1.5px solid ${({ $hasError }) => ($hasError ? "var(--color-danger)" : "var(--color-border)")};
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  width: 100%;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder { color: #a1a1aa; }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
`;

const PasswordInput = styled(Input)`
  padding-right: 44px;
`;

const EyeBtn = styled.button`
  position: absolute;
  right: 12px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;

  &:hover { color: var(--color-text); }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: var(--color-danger);
`;

const OptionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -2px;
`;

const RememberLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  cursor: pointer;
  user-select: none;
`;

const Checkbox = styled.input`
  width: 15px;
  height: 15px;
  accent-color: var(--color-primary);
  cursor: pointer;
`;

const ForgotLink = styled.a`
  font-size: 13px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: var(--color-primary); }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  background: var(--color-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 13px;
  border-radius: var(--radius-sm);
  margin-top: 6px;
  transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s;
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  pointer-events: ${({ $loading }) => ($loading ? "none" : "auto")};

  &:hover { background: var(--color-primary-dark); }
  &:active { transform: scale(0.98); }
`;

const AlertBox = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--color-danger);
  margin-bottom: 4px;
`;

const Footer = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 40px;
  text-align: center;
`;

// ─── Right Panel ──────────────────────────────────────────────────────────────

const RightPanel = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const RightOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 20%, rgba(249,115,22,0.08) 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(249,115,22,0.04) 0%, transparent 50%);
  pointer-events: none;
`;

const RightLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
`;

const RightLogoBadge = styled.div`
  width: 36px;
  height: 36px;
  background: rgba(249,115,22,0.15);
  border: 1px solid rgba(249,115,22,0.3);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #F97316;
`;

const RightLogoName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
`;

const RightContent = styled.div`
  position: absolute;
  bottom: 48px;
  left: 48px;
  right: 48px;
  z-index: 1;
`;

const Tagline = styled.h2`
  font-size: 34px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.15;
  letter-spacing: -1px;
  margin-bottom: 12px;
  max-width: 320px;
`;

const TaglineAccent = styled.span`
  color: var(--color-primary);
`;

const TaglineSub = styled.p`
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 300px;
  margin-bottom: 28px;
`;

// Floating metric cards
const FloatingScene = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
`;

const BgCircle = styled.div<{ $size: number; $top: string; $left: string; $delay?: number }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  border-radius: 50%;
  background: rgba(249,115,22,0.04);
  border: 1px solid rgba(249,115,22,0.1);
  animation: ${pulse} ${({ $delay }) => 3 + ($delay ?? 0)}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay ?? 0}s;
`;

const MetricFloat = styled.div<{
  $top: string;
  $left?: string;
  $right?: string;
  $variant?: "a" | "b" | "c";
  $delay: number;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  ${({ $left }) => $left && `left: ${$left};`}
  ${({ $right }) => $right && `right: ${$right};`}
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 14px 18px;
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${({ $variant }) => $variant === "b" ? floatB : $variant === "c" ? floatC : floatA} ease-in-out infinite;
  animation-duration: ${({ $delay }) => 3.5 + $delay * 0.4}s;
  animation-delay: ${({ $delay }) => $delay * 0.5}s;
  min-width: 170px;
`;

const MetricIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $color }) => `${$color}18`};
  border: 1px solid ${({ $color }) => `${$color}30`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const MetricInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetricLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
`;

const Dot = styled.div<{ $top: string; $left: string; $size: number; $delay: number }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: rgba(249,115,22,0.4);
  animation: ${pulse} ${({ $delay }) => 2 + $delay}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-width: 320px;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: var(--radius-md);
  padding: 14px;
  backdrop-filter: blur(8px);
`;

const StatCardIcon = styled.div`
  width: 28px;
  height: 28px;
  background: rgba(249,115,22,0.12);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: var(--color-primary);
`;

const StatCardLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
`;

const StatCardValue = styled.p`
  font-size: 11px;
  color: var(--color-text-muted);
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = "Informe seu e-mail";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "E-mail inválido";
    if (!password) errors.password = "Informe sua senha";
    else if (password.length < 6) errors.password = "Mínimo 6 caracteres";
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const { error: authError } = await getSupabaseClient().auth.signInWithPassword({ email, password });

    if (authError) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/overview");
  }

  return (
    <PageWrapper>
      <LeftPanel>
        <FormCard data-theme="light">
          <Logo>
            <LogoBadge>
              <Image src="/conecta-logo.jpeg" alt="Conecta Leste SP" width={52} height={52} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </LogoBadge>
            <LogoText>
              <LogoName>Conecta Leste SP</LogoName>
              <LogoSub>Painel Interno da Agência</LogoSub>
            </LogoText>
          </Logo>

          <Title>Acesse o painel</Title>
          <Subtitle>Entre com suas credenciais para continuar</Subtitle>

          {error && <AlertBox>{error}</AlertBox>}

          <Form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Label htmlFor="email">E-mail</Label>
              <InputWrapper>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  $hasError={!!fieldErrors.email}
                  autoComplete="email"
                />
              </InputWrapper>
              {fieldErrors.email && <ErrorText>{fieldErrors.email}</ErrorText>}
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="password">Senha</Label>
              <InputWrapper>
                <PasswordInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  $hasError={!!fieldErrors.password}
                  autoComplete="current-password"
                />
                <EyeBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </EyeBtn>
              </InputWrapper>
              {fieldErrors.password && <ErrorText>{fieldErrors.password}</ErrorText>}
            </FieldGroup>

            <OptionsRow>
              <RememberLabel>
                <Checkbox
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Lembrar de mim
              </RememberLabel>
              <ForgotLink href="#">Esqueci a senha</ForgotLink>
            </OptionsRow>

            <SubmitButton type="submit" $loading={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </SubmitButton>
          </Form>

          <Footer>Acesso restrito — Conecta Leste SP</Footer>
        </FormCard>
      </LeftPanel>

      <RightPanel>
        <RightOverlay />

        <FloatingScene>
          <BgCircle $size={320} $top="-80px" $left="50%" $delay={0} />
          <BgCircle $size={200} $top="40%" $left="-60px" $delay={1.5} />
          <BgCircle $size={140} $top="60%" $left="60%" $delay={0.8} />
          <BgCircle $size={90}  $top="20%" $left="40%" $delay={2} />
          <BgCircle $size={60}  $top="75%" $left="25%" $delay={1} />

          <Dot $top="20%" $left="15%" $size={8} $delay={0} />
          <Dot $top="35%" $left="78%" $size={6} $delay={1} />
          <Dot $top="70%" $left="30%" $size={7} $delay={0.5} />
          <Dot $top="55%" $left="62%" $size={5} $delay={2} />
          <Dot $top="15%" $left="55%" $size={6} $delay={1.2} />

          <MetricFloat $top="10%" $left="8%" $variant="a" $delay={0}>
            <MetricIcon $color="#22C55E">
              <Users size={18} weight="fill" />
            </MetricIcon>
            <MetricInfo>
              <MetricLabel>Clientes ativos</MetricLabel>
              <MetricValue>12</MetricValue>
            </MetricInfo>
          </MetricFloat>

          <MetricFloat $top="8%" $right="6%" $variant="b" $delay={1}>
            <MetricIcon $color="#F97316">
              <CurrencyDollar size={18} weight="fill" />
            </MetricIcon>
            <MetricInfo>
              <MetricLabel>MRR</MetricLabel>
              <MetricValue>R$ 1.580</MetricValue>
            </MetricInfo>
          </MetricFloat>

          <MetricFloat $top="35%" $left="5%" $variant="c" $delay={2}>
            <MetricIcon $color="#818CF8">
              <FunnelSimple size={18} weight="fill" />
            </MetricIcon>
            <MetricInfo>
              <MetricLabel>Em negociação</MetricLabel>
              <MetricValue>3 leads</MetricValue>
            </MetricInfo>
          </MetricFloat>

          <MetricFloat $top="32%" $right="5%" $variant="a" $delay={3}>
            <MetricIcon $color="#34D399">
              <TrendUp size={18} weight="fill" />
            </MetricIcon>
            <MetricInfo>
              <MetricLabel>Crescimento</MetricLabel>
              <MetricValue>+18%</MetricValue>
            </MetricInfo>
          </MetricFloat>
        </FloatingScene>

        <RightLogo>
          <RightLogoBadge>CL</RightLogoBadge>
          <RightLogoName>Conecta Leste SP</RightLogoName>
        </RightLogo>

        <RightContent>
          <Tagline>
            Sua agência,<br />
            <TaglineAccent>toda em um lugar.</TaglineAccent>
          </Tagline>
          <TaglineSub>
            Gerencie clientes, leads, financeiro e produtos contratados de forma centralizada.
          </TaglineSub>
          <StatsGrid>
            <StatCard>
              <StatCardIcon><Users size={15} weight="fill" /></StatCardIcon>
              <StatCardLabel>Clientes</StatCardLabel>
              <StatCardValue>Carteira completa</StatCardValue>
            </StatCard>
            <StatCard>
              <StatCardIcon><CurrencyDollar size={15} weight="fill" /></StatCardIcon>
              <StatCardLabel>Financeiro</StatCardLabel>
              <StatCardValue>MRR e pagamentos</StatCardValue>
            </StatCard>
            <StatCard>
              <StatCardIcon><FunnelSimple size={15} weight="fill" /></StatCardIcon>
              <StatCardLabel>Leads</StatCardLabel>
              <StatCardValue>Funil de prospecção</StatCardValue>
            </StatCard>
            <StatCard>
              <StatCardIcon><ChartBar size={15} weight="fill" /></StatCardIcon>
              <StatCardLabel>Overview</StatCardLabel>
              <StatCardValue>Visão geral</StatCardValue>
            </StatCard>
          </StatsGrid>
        </RightContent>
      </RightPanel>
    </PageWrapper>
  );
}
