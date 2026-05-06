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

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(139,92,246,0.12) 0%, rgba(109,40,217,0.05) 40%, transparent 70%)",
        }}
      />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          {user?.walletAddress && (
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
            >
              {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {truncateAddress(user.walletAddress)}
            </button>
          )}
          <button
            onClick={() => { logout(); setLocation("/"); }}
            className="flex items-center gap-1.5 text-xs px-2 py-1.5 transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-8 pt-14 pb-10 text-center">
        <p className="text-[11px] font-mono tracking-[0.35em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
          Welcome back
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3 leading-tight">
          Which rail today?
        </h1>
        <p className="text-base max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
          Five purpose-built payment modules on Solana. Pick one.
        </p>
      </div>

      <div className="relative z-10 px-6 sm:px-8 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {modules.slice(0, 3).map(({ id, name, tag, icon: Icon, accent, fee, headline, sub, route }) => (
            <ModuleCard
              key={id}
              id={id} name={name} tag={tag} Icon={Icon} accent={accent}
              fee={fee} headline={headline} sub={sub} route={route}
              isHovered={hovered === id}
              onEnter={() => setHovered(id)}
              onLeave={() => setHovered(null)}
              onClick={() => setLocation(route)}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.slice(3).map(({ id, name, tag, icon: Icon, accent, fee, headline, sub, route }) => (
            <ModuleCard
              key={id}
              id={id} name={name} tag={tag} Icon={Icon} accent={accent}
              fee={fee} headline={headline} sub={sub} route={route}
              isHovered={hovered === id}
              onEnter={() => setHovered(id)}
              onLeave={() => setHovered(null)}
              onClick={() => setLocation(route)}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center pb-8 pt-4">
        <p className="text-[11px] font-mono tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
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
      className="group relative text-left rounded-2xl p-6 overflow-hidden transition-all duration-300 w-full"
      style={{
        background: isHovered
          ? `linear-gradient(135deg, ${accent}14 0%, rgba(255,255,255,0.02) 100%)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${isHovered ? accent + "50" : "rgba(255,255,255,0.08)"}`,
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}18, inset 0 1px 0 ${accent}12`
          : "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-opacity duration-500"
        style={{ background: accent, opacity: isHovered ? 0.12 : 0 }}
      />

      <div className="flex items-start justify-between mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{
            background: `${accent}15`,
            border: `1px solid ${accent}28`,
            boxShadow: isHovered ? `0 0 18px ${accent}22` : "none",
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
            style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}22` }}
          >
            {tag}
          </span>
          <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.28)" }}>{fee} fee</p>
        </div>
      </div>

      <h2 className="text-[15px] font-bold text-white mb-1.5 leading-snug">{name}</h2>
      <p
        className="text-sm font-semibold mb-2.5 leading-snug transition-colors duration-300"
        style={{ color: isHovered ? accent : "rgba(255,255,255,0.6)" }}
      >
        {headline}
      </p>
      <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>{sub}</p>

      <div
        className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-300"
        style={{ color: isHovered ? accent : "rgba(255,255,255,0.22)" }}
      >
        Enter
        <ArrowRight
          className="w-3.5 h-3.5 transition-transform duration-300"
          style={{ transform: isHovered ? "translateX(4px)" : "translateX(0)" }}
        />
      </div>

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
