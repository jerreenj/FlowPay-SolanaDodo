import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { PanelLeft } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#070707] relative">
      {/* Backdrop — click outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          style={{ background: "rgba(0,0,0,0.45)" }}
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

      {/* Main content — always full width */}
      <main className="flex-1 overflow-auto relative">
        {/* Toggle button — always visible top-left */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="fixed top-3.5 left-3.5 z-40 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: open ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
          title="Toggle navigation"
        >
          <PanelLeft className="w-4 h-4" style={{ color: "rgba(255,255,255,0.65)" }} />
        </button>

        {children}
      </main>
    </div>
  );
}
