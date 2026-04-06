"use client";

import { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  ChartBar,
  Users,
  FunnelSimple,
  CurrencyDollar,
  Gear,
  SignOut,
  List,
  X,
  Sun,
  Moon,
} from "@phosphor-icons/react";

// ─── Nav items (same as Sidebar) ─────────────────────────────────────────────

const NAV_MAIN = [
  { label: "Overview",     href: "/overview",     icon: ChartBar },
  { label: "Clientes",     href: "/clientes",     icon: Users },
  { label: "Leads",        href: "/leads",        icon: FunnelSimple },
  { label: "Financeiro",   href: "/financeiro",   icon: CurrencyDollar },
];

const NAV_SYSTEM = [
  { label: "Configurações", href: "/configuracoes", icon: Gear },
];

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const Header = styled.header`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 56px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 200;
    flex-shrink: 0;
  }
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const LogoTitle = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
  line-height: 1.2;
`;

const LogoSub = styled.span`
  font-size: 10px;
  color: var(--color-text-muted);
  line-height: 1.2;
`;

const HamburgerBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--color-text-muted);
  transition: background 0.15s, color 0.15s;
  &:hover { background: var(--color-surface-2); color: var(--color-text); }
`;

const Backdrop = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 300;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: ${fadeIn} 0.18s ease;
  }
`;

const Drawer = styled.nav<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    z-index: 400;
    overflow-y: auto;
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    transform: ${({ $open }) => ($open ? "translateX(0)" : "translateX(-100%)")};
    &::-webkit-scrollbar { display: none; }
  }
`;

const DrawerHeader = styled.div`
  padding: 16px 16px 14px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const DrawerLogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DrawerLogoBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.3);
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--color-text-muted);
  transition: background 0.15s;
  &:hover { background: var(--color-surface-2); }
`;

const DrawerBody = styled.div`
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const GroupLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-muted);
  opacity: 0.5;
  padding: 8px 10px 5px;
  display: block;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 6px 4px 10px;
  opacity: 0.6;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-muted)")};
  background: ${({ $active }) => ($active ? "rgba(249, 115, 22, 0.1)" : "transparent")};
  transition: background 0.15s, color 0.15s;
  svg {
    flex-shrink: 0;
    color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-muted)")};
  }
  &:hover {
    background: ${({ $active }) => ($active ? "rgba(249,115,22,0.12)" : "var(--color-surface-2)")};
    color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text)")};
    svg { color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text)")}; }
  }
`;

const DrawerFooter = styled.div`
  padding: 8px 10px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FooterBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-text-muted);
  width: 100%;
  transition: background 0.15s, color 0.15s;
  svg { flex-shrink: 0; }
  &:hover { background: var(--color-surface-2); color: var(--color-text); }
`;

const SignOutBtn = styled(FooterBtn)`
  &:hover {
    background: rgba(239, 68, 68, 0.08);
    color: var(--color-danger);
    svg { color: var(--color-danger); }
  }
`;

const AlertBadge = styled.span`
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [alerts, setAlerts] = useState({ overdue: 0, newLeads: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("hub_theme");
    if (saved === "light") setIsDark(false);
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) setAlerts(await res.json());
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  // Fecha o drawer ao navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  // Bloqueia scroll do body quando drawer está aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
    <>
      <Header>
        <LogoArea>
          <LogoBadge>
            <Image src="/conecta-logo.jpeg" alt="Conecta Leste SP" width={32} height={32} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </LogoBadge>
          <LogoText>
            <LogoTitle>Conecta Leste SP</LogoTitle>
            <LogoSub>Painel da Agência</LogoSub>
          </LogoText>
        </LogoArea>
        <HamburgerBtn onClick={() => setOpen(true)} aria-label="Abrir menu">
          <List size={22} />
        </HamburgerBtn>
      </Header>

      <Backdrop $open={open} onClick={() => setOpen(false)} />

      <Drawer $open={open}>
        <DrawerHeader>
          <DrawerLogoArea>
            <DrawerLogoBadge>
              <Image src="/conecta-logo.jpeg" alt="Conecta Leste SP" width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </DrawerLogoBadge>
            <div>
              <LogoTitle style={{ fontSize: 14 }}>Conecta Leste SP</LogoTitle>
              <LogoSub>Painel da Agência</LogoSub>
            </div>
          </DrawerLogoArea>
          <CloseBtn onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X size={16} weight="bold" />
          </CloseBtn>
        </DrawerHeader>

        <DrawerBody>
          <GroupLabel>Menu</GroupLabel>
          {NAV_MAIN.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const badge =
              item.href === "/financeiro" && alerts.overdue > 0 ? alerts.overdue :
              item.href === "/leads"      && alerts.newLeads > 0 ? alerts.newLeads :
              null;
            return (
              <NavItem key={item.href} href={item.href} $active={isActive}>
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                {item.label}
                {badge !== null && <AlertBadge>{badge > 99 ? "99+" : badge}</AlertBadge>}
              </NavItem>
            );
          })}

          <Divider />

          <GroupLabel>Sistema</GroupLabel>
          {NAV_SYSTEM.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <NavItem key={item.href} href={item.href} $active={isActive}>
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                {item.label}
              </NavItem>
            );
          })}
        </DrawerBody>

        <DrawerFooter>
          <FooterBtn onClick={toggleTheme}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            {isDark ? "Modo Claro" : "Modo Escuro"}
          </FooterBtn>
          <SignOutBtn onClick={handleSignOut}>
            <SignOut size={17} />
            Sair da conta
          </SignOutBtn>
        </DrawerFooter>
      </Drawer>
    </>
  );
}
