import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <MobileHeader />
        <main style={{ flex: 1, overflow: "auto", padding: "32px" }}
          className="hub-main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
