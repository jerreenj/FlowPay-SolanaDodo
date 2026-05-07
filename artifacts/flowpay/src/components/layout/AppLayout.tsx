import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Starfield } from "@/components/ui/starfield";
import { PanelLeft } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative" style={{ background: "#070707" }}>
      {/* Starfield background — fixed, behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Starfield
          bgColor="rgba(7,7,7,1)"
          starColor="rgba(255,255,255,1)"
          speed={0.6}
          quantity={480}
        />
      </div>

      {/* Backdrop — click outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — slides in from left */}
      <div
        className="fixed top-0 left-0 h-full z-30 transition-transform duration-300"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Toggle button — moves right when sidebar opens */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-40 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          top: "14px",
          left: open ? "calc(240px + 14px)" : "14px",
          background: open ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        title="Toggle navigation"
      >
        <PanelLeft className="w-4 h-4" style={{ color: "rgba(255,255,255,0.70)" }} />
      </button>

      {/* Main content — shifts right when sidebar is open */}
      <main
        className="flex-1 overflow-auto relative z-10 transition-all duration-300"
        style={{ marginLeft: open ? "240px" : "0" }}
      >
        {children}
      </main>
    </div>
  );
}
