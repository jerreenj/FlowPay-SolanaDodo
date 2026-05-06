import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";
import { Users, ArrowRightLeft, ShieldCheck, Sparkles, Bot, Zap, LogOut, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import RainingLetters from "@/components/RainingLetters";

const modules = [
  {
    id: "payrails",
    name: "PayRails",
    tag: "Payroll",
    icon: Users,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.2)",
    headline: "Pay your team in USDG",
    bullets: [
      "Stablecoin salaries to Indian contractors",
      "UPI delivery in INR at live rates",
      "Solana on-chain confirmation per payment",
    ],
    route: "/payroll",
  },
  {
    id: "remitdirect",
    name: "RemitDirect",
    tag: "Remittance",
    icon: ArrowRightLeft,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.2)",
    headline: "Cross-border transfers via USDG",
    bullets: [
      "UAE, US, UK, Singapore → India corridors",
      "60× cheaper than SWIFT or Western Union",
      "Recipient gets INR to their UPI in seconds",
    ],
    route: "/remittance",
  },
  {
    id: "escrowx",
    name: "EscrowX",
    tag: "Escrow",
    icon: ShieldCheck,
    color: "#eab308",
    glow: "rgba(234,179,8,0.12)",
    border: "rgba(234,179,8,0.2)",
    headline: "On-chain smart contract escrow",
    bullets: [
      "Trustless escrow with milestone releases",
      "Freelancers and clients on equal footing",
      "Raise disputes — funds held until resolved",
    ],
    route: "/escrow",
  },
  {
    id: "creatorpay",
    name: "CreatorPay",
    tag: "Creator Commerce",
    icon: Sparkles,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.12)",
    border: "rgba(236,72,153,0.2)",
    headline: "Sell digital products globally",
    bullets: [
      "Courses, ebooks, templates, newsletters",
      "USDG payments — no chargebacks possible",
      "Instant settlement, keep 98% of revenue",
    ],
    route: "/creator",
  },
  {
    id: "agentbank",
    name: "AgentBank",
    tag: "AI Payments",
    icon: Bot,
    color: "#00ff88",
    glow: "rgba(0,255,136,0.12)",
    border: "rgba(0,255,136,0.2)",
    headline: "Wallets for autonomous AI agents",
    bullets: [
      "Deploy Solana wallets for AI agents",
      "x402 protocol for HTTP-gated payments",
      "Machine-to-machine payments in <500ms",
    ],
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
    <div className="relative min-h-screen bg-[#070707] text-white overflow-hidden">
      <RainingLetters />
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00ff88]/15 border border-[#00ff88]/25 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#00ff88]" />
          </div>
          <span className="font-bold text-lg tracking-tight">FlowPay</span>
        </div>

        <div className="flex items-center gap-3">
          {user?.walletAddress && (
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all"
            >
              {copied ? <CheckCheck className="w-3 h-3 text-[#00ff88]" /> : <Copy className="w-3 h-3" />}
              {truncateAddress(user.walletAddress)}
            </button>
          )}
          <button
            onClick={() => { logout(); setLocation("/"); }}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors px-2 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="px-8 pt-16 pb-10 text-center">
        <p className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3">
          {user?.name ? `Welcome, ${user.name}` : "Connected"}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Which rail are you using today?
        </h1>
        <p className="text-white/35 text-base">
          Each module is purpose-built. Pick one and get started.
        </p>
      </div>

      {/* Module grid */}
      <div className="px-6 sm:px-8 pb-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map(({ id, name, tag, icon: Icon, color, glow, border, headline, bullets, route }) => {
          const isHovered = hovered === id;
          return (
            <button
              key={id}
              onClick={() => setLocation(route)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              className="relative text-left rounded-2xl p-6 border transition-all duration-300 overflow-hidden group"
              style={{
                background: isHovered
                  ? `radial-gradient(ellipse at top left, ${glow} 0%, rgba(255,255,255,0.03) 60%)`
                  : "rgba(255,255,255,0.02)",
                borderColor: isHovered ? color : border,
                transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: isHovered ? `0 20px 60px ${glow}` : "none",
              }}
            >
              {/* Icon + tag */}
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}35`,
                    boxShadow: isHovered ? `0 0 20px ${color}20` : "none",
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                  style={{
                    background: `${color}12`,
                    color,
                    border: `1px solid ${color}25`,
                  }}
                >
                  {tag}
                </span>
              </div>

              {/* Name + headline */}
              <h2 className="text-lg font-bold text-white mb-1">{name}</h2>
              <p className="text-sm font-medium mb-4" style={{ color }}>{headline}</p>

              {/* Bullets */}
              <ul className="space-y-2 mb-6">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-white/40">
                    <span className="mt-0.5 w-1 h-1 rounded-full shrink-0" style={{ background: color, marginTop: "5px" }} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Enter button */}
              <div
                className="flex items-center gap-2 text-sm font-semibold transition-all"
                style={{ color: isHovered ? color : "rgba(255,255,255,0.3)" }}
              >
                Open {name}
                <span
                  className="transition-transform duration-200"
                  style={{ transform: isHovered ? "translateX(4px)" : "translateX(0)" }}
                >
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
