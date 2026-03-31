import type { NextConfig } from "next";

// ─── Content Security Policy ────────────────────────────────────────────────
// Ajustado para:
//   • Supabase (*.supabase.co para API e wss para Realtime)
//   • Vercel (vercel.live para preview toolbar, va.vercel-scripts.com para analytics)
//   • Styled Components (unsafe-inline necessário para CSS-in-JS)
// IMPORTANTE: Em produção, substitua *.supabase.co pelo URL exato do seu projeto.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : "*.supabase.co";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in;
  font-src 'self' data:;
  connect-src 'self'
    https://${supabaseHost}
    wss://${supabaseHost}
    https://*.supabase.co
    wss://*.supabase.co
    https://va.vercel-scripts.com
    https://vitals.vercel-insights.com;
  frame-src 'none';
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

// ─── Security Headers ────────────────────────────────────────────────────────
const securityHeaders = [
  // Impede MIME type sniffing (ex: servir JS como HTML)
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Bloqueia carregamento em iframe — painel interno não deve ser embeddável
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Filtro XSS para browsers legados (IE 11, Chrome antigo)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Força HTTPS por 1 ano, incluindo subdomínios, com preload
  // ATENÇÃO: Só habilitar quando o domínio estiver 100% em HTTPS
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Controla informações enviadas no cabeçalho Referer
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Desabilita acesso a APIs de hardware não necessárias
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()",
  },
  // CSP principal — ver construção acima
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  // Remove header X-Powered-By para não revelar Next.js
  // (Next.js já faz isso por padrão, mas garantimos aqui)
];

const nextConfig: NextConfig = {
  // ─── Styled Components SSR ──────────────────────────────────────────────
  compiler: {
    styledComponents: true,
  },

  // ─── Remove header X-Powered-By ────────────────────────────────────────
  poweredByHeader: false,

  // ─── Security Headers em todas as rotas ────────────────────────────────
  async headers() {
    return [
      {
        // Aplica em todas as rotas da aplicação
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // ─── Redirecionamento de raiz para /overview ────────────────────────────
  // Usuário autenticado que acessa "/" vai direto para o painel
  async redirects() {
    return [
      {
        source: "/",
        destination: "/overview",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
