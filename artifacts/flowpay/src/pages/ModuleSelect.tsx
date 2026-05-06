import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { Users, ArrowRightLeft, ShieldCheck, Sparkles, Bot, LogOut, Copy, CheckCheck, ArrowRight, ArrowLeft } from "lucide-react";
import RainingLetters from "@/components/RainingLetters";

const modules = [
  {
    id: "payrails",
    name: "PayRails",
    tag: "Payroll",
    icon: Users,
    accent: "#00ff88",
    fee: "0.5%",
    headline: "Pay your team in USDG",
    sub: "Stablecoin salaries · UPI delivery in INR · Solana in 2.3s",
    route: "/payroll",
  },
  {
    id: "remitdirect",
    name: "RemitDirect",
    tag: "Remittance",
    icon: ArrowRightLeft,
    accent: "#38bdf8",
    fee: "0.75%",
    headline: "Cross-border in 2 seconds",
    sub: "UAE · US · UK → India · 60× cheaper than SWIFT",
    route: "/remittance",
  },
  {
    id: "escrowx",
    name: "EscrowX",
    tag: "Escrow",
    icon: ShieldCheck,
    accent: "#a78bfa",
    fee: "0.5%",
    headline: "On-chain smart contract escrow",
    sub: "Trustless milestone releases · dispute protection",
    route: "/escrow",
  },
  {
    id: "creatorpay",
    name: "CreatorPay",
    tag: "Creator Commerce",
    icon: Sparkles,
    accent: "#f472b6",
    fee: "2%",
    headline: "Sell digital products globally",
    sub: "Courses · ebooks · templates · zero chargebacks",
    route: "/creator",
  },
  {
    id: "agentbank",
    name: "AgentBank",
    tag: "AI Payments",
    icon: Bot,
    accent: "#fb923c",
    fee: "1%",
    headline: "Wallets for autonomous AI agents",
    sub: "x402 protocol · machine-to-machine · <500ms",
    route: "/agents",
  },
];

function truncateAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ModuleSelect() {
  const [, setLocation] = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setLocation("/");
  }, [token]);

  function copyAddress() {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#080808] text-white overflow-hidden">
      <RainingLetters />

      {/* Purple ambient glow — top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(139,92,246,0.12) 0%, rgba(109,40,217,0.05) 40%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-xs text-white/35 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          {user?.walletAddress && (
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-xs text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
            >
              {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {truncateAddress(user.walletAddress)}
            </button>
          )}
          <button
            onClick={() => { logout(); setLocation("/"); }}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/55 transition-colors px-2 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 px-8 pt-14 pb-10 text-center">
        <p className="text-[11px] font-mono text-white/60 tracking-[0.35em] uppercase mb-4">
          Welcome back
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3 leading-tight">
          Which rail today?
        </h1>
        <p className="text-white/55 text-base max-w-sm mx-auto">
          Five purpose-built payment modules on Solana. Pick one.
        </p>
      </div>

      {/* Module grid — 3 top, 2 centered bottom */}
      <div className="relative z-10 px-6 sm:px-8 pb-24 max-w-5xl mx-auto">
        {/* First row — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {modules.slice(0, 3).map(({ id, name, tag, icon: Icon, accent, fee, headline, sub, route }) => {
            const isHovered = hovered === id;
            return (
              <ModuleCard
                key={id}
                id={id} name={name} tag={tag} Icon={Icon} accent={accent}
                fee={fee} headline={headline} sub={sub} route={route}
                isHovered={isHovered}
                onEnter={() => setHovered(id)}
                onLeave={() => setHovered(null)}
                onClick={() => setLocation(route)}
              />
            );
          })}
        </div>
        {/* Second row — 2 cards, centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[calc(66.666%+0.5rem)] mx-auto">
          {modules.slice(3).map(({ id, name, tag, icon: Icon, accent, fee, headline, sub, route }) => {
            const isHovered = hovered === id;
            return (
              <ModuleCard
                key={id}
                id={id} name={name} tag={tag} Icon={Icon} accent={accent}
                fee={fee} headline={headline} sub={sub} route={route}
                isHovered={isHovered}
                onEnter={() => setHovered(id)}
                onLeave={() => setHovered(null)}
                onClick={() => setLocation(route)}
              />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-8 pt-4">
        <p className="text-[11px] font-mono text-white/45 tracking-[0.25em] uppercase">
          Solana · USDG · Dodo Payments
        </p>
      </div>

    </div>
  );
}

interface CardProps {
  id: string; name: string; tag: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string; fee: string; headline: string; sub: string; route: string;
  isHovered: boolean;
  onEnter: () => void; onLeave: () => void; onClick: () => void;
}

function ModuleCard({ name, tag, Icon, accent, fee, headline, sub, isHovered, onEnter, onLeave, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative text-left rounded-2xl p-6 border overflow-hidden transition-all duration-300 w-full"
      style={{
        background: isHovered
          ? `linear-gradient(135deg, ${accent}12 0%, rgba(255,255,255,0.02) 100%)`
          : "rgba(255,255,255,0.03)",
        borderColor: isHovered ? `${accent}55` : "rgba(255,255,255,0.08)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px ${accent}20, inset 0 1px 0 ${accent}15`
          : "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-8 -right-8 w-36 h-36 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none"
        style={{ background: accent, opacity: isHovered ? 0.1 : 0 }}
      />

      {/* Icon + tag row */}
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{
            background: `${accent}15`,
            border: `1px solid ${accent}30`,
            boxShadow: isHovered ? `0 0 20px ${accent}25` : "none",
          }}
        >
          <Icon
            className="w-5 h-5 transition-transform duration-300"
            style={{ color: accent, transform: isHovered ? "scale(1.1)" : "scale(1)" } as React.CSSProperties}
          />
        </div>
        <div className="text-right">
          <span
            className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full mb-1"
            style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}
          >
            {tag}
          </span>
          <p className="text-[10px] text-white/30 font-mono">{fee} fee</p>
        </div>
      </div>

      {/* Text */}
      <h2 className="text-base font-bold text-white mb-1.5 leading-snug">{name}</h2>
      <p
        className="text-sm font-semibold mb-2.5 leading-snug transition-colors duration-300"
        style={{ color: isHovered ? accent : "rgba(255,255,255,0.6)" }}
      >
        {headline}
      </p>
      <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.42)" }}>{sub}</p>

      {/* CTA */}
      <div
        className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-300"
        style={{ color: isHovered ? accent : "rgba(255,255,255,0.25)" }}
      >
        Enter
        <ArrowRight
          className="w-3.5 h-3.5 transition-transform duration-300"
          style={{ transform: isHovered ? "translateX(4px)" : "translateX(0)" }}
        />
      </div>

      {/* Bottom fill line */}
      <div
        className="absolute bottom-0 left-0 h-[1px] transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          width: isHovered ? "100%" : "0%",
        }}
      />
    </button>
  );
}
