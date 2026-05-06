import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import {
  Users, ArrowRightLeft, ShieldCheck, Sparkles, Bot,
  Wallet, LogOut, Zap, Grid2x2, Copy, CheckCheck,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/select",     label: "All Modules",  icon: Grid2x2,        accent: null },
  { href: "/payroll",    label: "PayRails",      icon: Users,          accent: "#00ff88" },
  { href: "/remittance", label: "RemitDirect",   icon: ArrowRightLeft, accent: "#38bdf8" },
  { href: "/escrow",     label: "EscrowX",       icon: ShieldCheck,    accent: "#a78bfa" },
  { href: "/creator",    label: "CreatorPay",    icon: Sparkles,       accent: "#f472b6" },
  { href: "/agents",     label: "AgentBank",     icon: Bot,            accent: "#fb923c" },
  { href: "/wallet",     label: "Wallet",        icon: Wallet,         accent: "#94a3b8" },
];

function truncateAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Sidebar() {
  const [location] = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "FP";

  const activeItem = navItems.find(
    (item) => item.href !== "/select" && location.startsWith(item.href)
  );
  const activeAccent = activeItem?.accent ?? null;

  return (
    <aside
      className="flex flex-col w-60 min-h-screen shrink-0 relative"
      style={{ background: "#090909", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {activeAccent && (
        <div
          className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at top left, ${activeAccent}0e 0%, transparent 70%)`,
          }}
        />
      )}

      <div
        className="relative z-10 flex items-center gap-3 px-5 py-[18px]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-500"
          style={{
            background: activeAccent ? `${activeAccent}18` : "rgba(255,255,255,0.07)",
            border: `1px solid ${activeAccent ? activeAccent + "30" : "rgba(255,255,255,0.12)"}`,
            boxShadow: activeAccent ? `0 0 14px ${activeAccent}20` : "none",
          }}
        >
          <Zap className="w-4 h-4" style={{ color: activeAccent ?? "rgba(255,255,255,0.8)" }} />
        </div>
        <div>
          <div className="text-white font-bold text-[15px] tracking-tight leading-none">FlowPay</div>
          <div
            className="text-[9px] font-mono mt-1 tracking-widest transition-colors duration-500"
            style={{ color: activeAccent ? `${activeAccent}90` : "rgba(255,255,255,0.25)" }}
          >
            SOLANA · USDG
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, accent }) => {
          const isActive =
            location === href ||
            (href !== "/select" && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "text-white"
                  : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]"
              )}
              style={
                isActive
                  ? {
                      background: accent ? `${accent}10` : "rgba(255,255,255,0.07)",
                      border: `1px solid ${accent ? accent + "22" : "rgba(255,255,255,0.10)"}`,
                    }
                  : {}
              }
            >
              <Icon
                className="w-4 h-4 shrink-0 transition-colors duration-200"
                style={{ color: isActive ? (accent ?? "white") : undefined }}
              />
              <span className="flex-1">{label}</span>
              {isActive && accent && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: accent,
                    boxShadow: `0 0 5px ${accent}`,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="relative z-10 px-3 py-4 space-y-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {user && (
          <button
            onClick={copyAddress}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/[0.04]"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500"
              style={{
                background: activeAccent ? `${activeAccent}18` : "rgba(255,255,255,0.09)",
                border: `1px solid ${activeAccent ? activeAccent + "28" : "rgba(255,255,255,0.14)"}`,
              }}
            >
              <span
                className="text-[10px] font-bold transition-colors duration-500"
                style={{ color: activeAccent ?? "rgba(255,255,255,0.65)" }}
              >
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {user.name && (
                <div className="text-xs text-white font-medium truncate leading-tight">
                  {user.name}
                </div>
              )}
              <div className="text-[10px] text-white/30 font-mono truncate mt-0.5">
                {truncateAddress(user.walletAddress)}
              </div>
            </div>
            {copied ? (
              <CheckCheck className="w-3.5 h-3.5 text-white/50 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/15 shrink-0" />
            )}
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-white/25 hover:text-white/55 transition-colors rounded-xl hover:bg-white/[0.04]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
