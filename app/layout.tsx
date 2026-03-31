import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledComponentsRegistry from "./lib/registry";
import GlobalStyle from "./styles/global";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hub | Conecta Leste SP",
  description: "Painel interno da agência Conecta Leste SP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <GlobalStyle />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
