import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Users, ArrowRightLeft, ShieldCheck, Sparkles, Bot, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import WalletConnect from "@/components/WalletConnect";

const modules = [
  {
    id: "payrails",
    name: "PayRails",
    tag: "Payroll Infrastructure",
    icon: Users,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.2)",
    headline: "Pay your team in USDG.",
    sub: "Send stablecoin salaries to contractors across India. Settled on Solana in under 3 seconds. UPI delivery.",
    route: "/payroll",
  },
  {
    id: "remitdirect",
    name: "RemitDirect",
    tag: "Cross-Border Remittance",
    icon: ArrowRightLeft,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
    border: "rgba(168,85,247,0.2)",
    headline: "Dubai to Mumbai in 2 seconds.",
    sub: "Cross-border transfers via USDG rails. 60× cheaper than SWIFT. UAE, US, UK, Singapore to India.",
    route: "/remittance",
  },
  {
    id: "escrowx",
    name: "EscrowX",
    tag: "Smart Contract Escrow",
    icon: ShieldCheck,
    color: "#eab308",
    glow: "rgba(234,179,8,0.15)",
    border: "rgba(234,179,8,0.2)",
    headline: "Trustless deals on Solana.",
    sub: "On-chain escrow for freelancers and clients. Milestone-based releases. No intermediary, no delays.",
    route: "/escrow",
  },
  {
    id: "creatorpay",
    name: "CreatorPay",
    tag: "Creator Commerce",
    icon: Sparkles,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.15)",
    border: "rgba(236,72,153,0.2)",
    headline: "Sell globally. Get paid instantly.",
    sub: "List courses, ebooks, and templates. Accept USDG from anyone, anywhere. No chargebacks ever.",
    route: "/creator",
  },
  {
    id: "agentbank",
    name: "AgentBank",
    tag: "AI Agent Payments",
    icon: Bot,
    color: "#00ff88",
    glow: "rgba(0,255,136,0.15)",
    border: "rgba(0,255,136,0.2)",
    headline: "Wallets for your AI agents.",
    sub: "Deploy autonomous payment wallets for AI agents. x402 protocol. Machine-to-machine in <500ms.",
    route: "/agents",
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const token = useAuthStore((s) => s.token);
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (token) setLocation("/select");
  }, [token]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#070707]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00ff88]/15 border border-[#00ff88]/25 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#00ff88]" />
          </div>
          <span className="font-bold text-lg tracking-tight">FlowPay</span>
        </div>
        <WalletConnect />
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20"
      >
        {/* Background orbs */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(0,255,136,0.04) 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
        </div>

        {/* Solana badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff88]/15 bg-[#00ff88]/5 text-[#00ff88] text-xs font-mono mb-8">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00ff88]" />
          </span>
          Solana Mainnet · USDG · &lt;3s settlement
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8">
            The payment stack
            <br />
            <span style={{
              background: "linear-gradient(135deg, #00ff88 0%, #00d4ff 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              India was waiting for.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
            Five payment rails — payroll, remittance, escrow, creator commerce, and AI agent payments — unified on one Solana-powered platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WalletConnect variant="hero" />
            <button
              onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Explore modules <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white/20" />
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="px-6 sm:px-8 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-4">Five rails. One platform.</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Pick your payment module.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(({ id, name, tag, icon: Icon, color, glow, border, headline, sub }) => (
            <div
              key={id}
              className="relative group rounded-2xl p-6 border transition-all duration-300 cursor-default overflow-hidden"
              style={{
                background: `radial-gradient(ellipse at top left, ${glow} 0%, transparent 60%), rgba(255,255,255,0.02)`,
                borderColor: border,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at top left, ${glow} 0%, transparent 60%)` }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                  >
                    {tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <p className="text-base font-medium mb-3" style={{ color }}>{headline}</p>
                <p className="text-sm text-white/40 leading-relaxed">{sub}</p>
              </div>
            </div>
          ))}

          {/* Connect CTA card */}
          <div className="relative rounded-2xl p-6 border border-[#00ff88]/15 bg-[#00ff88]/4 flex flex-col items-center justify-center text-center group hover:border-[#00ff88]/30 transition-all duration-300">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)" }}
            >
              <Zap className="w-6 h-6 text-[#00ff88]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Ready to start?</h3>
            <p className="text-sm text-white/40 mb-5 leading-relaxed">
              Connect any Solana wallet. No sign-up form. No email required.
            </p>
            <WalletConnect variant="card" />
          </div>
        </div>
      </section>

      {/* Built on Solana */}
      <section className="border-t border-white/5 px-8 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { label: "Settlement", value: "< 3s", sub: "on Solana Mainnet" },
            { label: "Transaction cost", value: "< $0.001", sub: "per payment" },
            { label: "Stablecoin", value: "USDG", sub: "via Dodo Payments" },
          ].map(({ label, value, sub }) => (
            <div key={label}>
              <p className="text-3xl font-bold font-mono text-white mb-1">{value}</p>
              <p className="text-xs text-white/30 uppercase tracking-widest">{label}</p>
              <p className="text-xs text-white/20 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-8 flex items-center justify-between text-xs text-white/20">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#00ff88]/40" />
          <span>FlowPay</span>
        </div>
        <span>Powered by Solana · USDG · Dodo Payments</span>
      </footer>
    </div>
  );
}
