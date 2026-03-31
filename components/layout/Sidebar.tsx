"use client";

import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  ChartBar,
  Users,
  FunnelSimple,
  CurrencyDollar,
  Gear,
  SignOut,
  Sun,
  Moon,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_MAIN: NavItem[] = [
  { label: "Overview",       href: "/overview",       icon: ChartBar },
  { label: "Clientes",       href: "/clientes",       icon: Users },
  { label: "Leads",          href: "/leads",          icon: FunnelSimple },
  { label: "Financeiro",     href: "/financeiro",     icon: CurrencyDollar },
];

const NAV_SYSTEM: NavItem[] = [
  { label: "Configurações",  href: "/configuracoes",  icon: Gear },
];

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const SidebarRoot = styled.aside`
  width: 252px;
  min-width: 252px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  animation: ${fadeIn} 0.25s ease both;

  &::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  padding: 20px 16px 18px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 11px;
  position: relative;
`;

const LogoBadge = styled.div`
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: -0.5px;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const LogoTitle = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
  line-height: 1.2;
`;

const LogoSub = styled.span`
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.2;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 14px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 4px;
`;

const NavGroupLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-muted);
  opacity: 0.5;
  padding: 8px 10px 5px;
  display: block;
`;

const NavDivider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 6px 4px 10px;
  opacity: 0.6;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-muted)")};
  background: ${({ $active }) => ($active ? "rgba(249, 115, 22, 0.1)" : "transparent")};
  transition: background 0.15s, color 0.15s;
  position: relative;

  svg {
    flex-shrink: 0;
    color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-muted)")};
    transition: color 0.15s;
  }

  &:hover {
    background: ${({ $active }) => ($active ? "rgba(249, 115, 22, 0.12)" : "var(--color-surface-2)")};
    color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text)")};

    svg { color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text)")}; }
  }
`;

const SidebarFooter = styled.div`
  padding: 8px 10px 14px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const FooterUserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px 12px;
`;

const FooterAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
`;

const FooterUserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FooterUserName = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FooterUserSub = styled.span`
  font-size: 11px;
  color: var(--color-text-muted);
  display: block;
`;

const FooterBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 10px;
  font-size: 13.5px;
  color: var(--color-text-muted);
  width: 100%;
  transition: background 0.15s, color 0.15s;

  svg { flex-shrink: 0; }

  &:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }
`;

const SignOutButton = styled(FooterBtn)`
  &:hover {
    background: rgba(239, 68, 68, 0.08);
    color: var(--color-danger);
    svg { color: var(--color-danger); }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("hub_theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("hub_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("hub_theme", "light");
    }
  }

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut();
    router.push("/login");
  }

  return (
    <SidebarRoot>
      <SidebarHeader>
        <LogoBadge>CL</LogoBadge>
        <LogoText>
          <LogoTitle>Conecta Leste</LogoTitle>
          <LogoSub>Painel da Agência</LogoSub>
        </LogoText>
      </SidebarHeader>

      <Nav>
        <NavGroup>
          <NavGroupLabel>Menu</NavGroupLabel>
          {NAV_MAIN.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <NavLink key={item.href} href={item.href} $active={isActive}>
                <Icon size={17} weight={isActive ? "fill" : "regular"} />
                {item.label}
              </NavLink>
            );
          })}
        </NavGroup>

        <NavDivider />

        <NavGroup>
          <NavGroupLabel>Sistema</NavGroupLabel>
          {NAV_SYSTEM.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <NavLink key={item.href} href={item.href} $active={isActive}>
                <Icon size={17} weight={isActive ? "fill" : "regular"} />
                {item.label}
              </NavLink>
            );
          })}
        </NavGroup>
      </Nav>

      <SidebarFooter>
        <FooterUserCard>
          <FooterAvatar>CL</FooterAvatar>
          <FooterUserInfo>
            <FooterUserName>Conecta Leste SP</FooterUserName>
            <FooterUserSub>Agência</FooterUserSub>
          </FooterUserInfo>
        </FooterUserCard>

        <FooterBtn onClick={toggleTheme}>
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
          {isDark ? "Modo Claro" : "Modo Escuro"}
        </FooterBtn>
        <SignOutButton onClick={handleSignOut}>
          <SignOut size={17} />
          Sair da conta
        </SignOutButton>
      </SidebarFooter>
    </SidebarRoot>
  );
}
