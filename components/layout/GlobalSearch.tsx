"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Users, FunnelSimple, X, ArrowBendDownLeft } from "@phosphor-icons/react";
import type { SearchResult } from "@/app/api/search/route";

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.15s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: clamp(60px, 15vh, 140px);
`;

const Panel = styled.div`
  width: 100%;
  max-width: 560px;
  margin: 0 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  animation: ${slideUp} 0.2s cubic-bezier(0.16,1,0.3,1);
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
`;

const SearchIcon = styled.div`
  color: var(--color-text-muted);
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;

  &::placeholder { color: var(--color-text-muted); }
`;

const ClearBtn = styled.button`
  width: 24px; height: 24px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: all 0.15s;
  &:hover { background: var(--color-surface-2); color: var(--color-text); }
`;

const ResultsList = styled.div`
  max-height: 360px;
  overflow-y: auto;
  padding: 6px;
`;

const ResultItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: ${({ $active }) => ($active ? "var(--color-surface-2)" : "transparent")};
  transition: background 0.1s;
  text-align: left;

  &:hover { background: var(--color-surface-2); }
`;

const ResultIcon = styled.div<{ $type: "client" | "lead" }>`
  width: 34px; height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${({ $type }) => $type === "client"
    ? "rgba(34,197,94,0.1)"
    : "rgba(129,140,248,0.1)"};
  color: ${({ $type }) => $type === "client"
    ? "var(--color-success)"
    : "#818CF8"};
`;

const ResultText = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.p`
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSub = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 1px;
`;

const ResultEnter = styled.div`
  color: var(--color-text-muted);
  opacity: 0.4;
  flex-shrink: 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 10px 16px;
  border-top: 1px solid var(--color-border);
`;

const FooterHint = styled.span`
  font-size: 11px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Kbd = styled.kbd`
  font-family: inherit;
  font-size: 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--color-text-muted);
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13.5px;
`;

const TypeBadge = styled.span<{ $type: "client" | "lead" }>`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ $type }) => $type === "client"
    ? "rgba(34,197,94,0.1)"
    : "rgba(129,140,248,0.1)"};
  color: ${({ $type }) => $type === "client"
    ? "var(--color-success)"
    : "#818CF8"};
  margin-left: 6px;
  text-transform: capitalize;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export default function GlobalSearch({ onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 280);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => { setActiveIdx(0); }, [results]);

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) navigate(results[activeIdx].href);
  }

  return (
    <Backdrop onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <SearchRow>
          <SearchIcon>
            <MagnifyingGlass size={18} weight={loading ? "regular" : "bold"} style={{ opacity: loading ? 0.5 : 1 }} />
          </SearchIcon>
          <SearchInput
            ref={inputRef}
            placeholder="Buscar clientes, leads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          {query && (
            <ClearBtn onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}>
              <X size={14} weight="bold" />
            </ClearBtn>
          )}
        </SearchRow>

        {results.length > 0 ? (
          <ResultsList>
            {results.map((r, i) => (
              <ResultItem key={r.id + r.type} $active={i === activeIdx} onClick={() => navigate(r.href)} onMouseEnter={() => setActiveIdx(i)}>
                <ResultIcon $type={r.type}>
                  {r.type === "client" ? <Users size={16} weight="fill" /> : <FunnelSimple size={16} weight="fill" />}
                </ResultIcon>
                <ResultText>
                  <ResultTitle>
                    {r.title}
                    <TypeBadge $type={r.type}>{r.type === "client" ? "cliente" : "lead"}</TypeBadge>
                  </ResultTitle>
                  <ResultSub>{r.sub}</ResultSub>
                </ResultText>
                {i === activeIdx && (
                  <ResultEnter><ArrowBendDownLeft size={15} /></ResultEnter>
                )}
              </ResultItem>
            ))}
          </ResultsList>
        ) : query.length >= 2 && !loading ? (
          <EmptyState>Nenhum resultado encontrado para "{query}"</EmptyState>
        ) : query.length < 2 && query.length > 0 ? (
          <EmptyState>Continue digitando para buscar...</EmptyState>
        ) : null}

        <Footer>
          <FooterHint><Kbd>↑↓</Kbd> navegar</FooterHint>
          <FooterHint><Kbd>Enter</Kbd> abrir</FooterHint>
          <FooterHint><Kbd>Esc</Kbd> fechar</FooterHint>
        </Footer>
      </Panel>
    </Backdrop>
  );
}
