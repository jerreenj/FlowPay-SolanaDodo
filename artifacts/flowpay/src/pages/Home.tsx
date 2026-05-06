import { Link } from "wouter";
import { Zap, ArrowRight, Users, ArrowRightLeft, ShieldCheck, Sparkles, Bot, TrendingUp, Globe } from "lucide-react";

const modules = [
  { name: "PayRails", icon: Users, fee: "0.5%", desc: "Stablecoin payroll for remote teams. Salary in USDG, settled on Solana in 2.3s." },
  { name: "RemitDirect", icon: ArrowRightLeft, fee: "0.75%", desc: "Dubai→Mumbai in 2 seconds. Best-in-class FX via USDG stablecoin rails." },
  { name: "EscrowX", icon: ShieldCheck, fee: "0.5%", desc: "Smart contract escrow on Solana. Trustless milestone releases for freelancers." },
  { name: "CreatorPay", icon: Sparkles, fee: "2%", desc: "Sell courses, ebooks, and templates globally. USDG payments, no chargebacks." },
  { name: "AgentBank", icon: Bot, fee: "1%", desc: "Autonomous wallets for AI agents. x402 protocol. Machine-to-machine micropayments." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070707] text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">FlowPay</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">Sign in</Link>
          <Link href="/register" className="text-sm bg-white hover:bg-white/90 text-black font-semibold px-4 py-2 rounded-lg transition-colors">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative px-8 py-24 text-center max-w-5xl mx-auto">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/50 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white/60" />
            </span>
            Built for Superteam India × Dodo Payments · Solana Frontier
          </div>

          <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
            India's Stablecoin
            <br />
            <span className="text-white/70">Payment Super-Layer</span>
          </h1>

          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            5 payment modules. 1 platform. USDG on Solana.
            Payroll, Remittance, Escrow, Creator Commerce, and AI Agent payments — all settled in &lt;3 seconds.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/register" className="flex items-center gap-2 bg-white hover:bg-white/90 text-black font-bold text-sm px-8 py-4 rounded-xl transition-colors">
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-colors">
              Demo login
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-4 mb-20">
            {[
              { label: "Settlement Time", value: "2.3s" },
              { label: "Solana TPS", value: "65,000" },
              { label: "Exchange Rate", value: "1 USDG = ₹83.52" },
              { label: "Fee Range", value: "0.5–2%" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white font-mono">{value}</p>
                <p className="text-xs text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="px-8 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">5 Modules. 1 Platform.</h2>
          <p className="text-white/40">Everything India's crypto economy needs, on Solana</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ name, icon: Icon, fee, desc }) => (
            <div key={name} className="bg-white/4 border border-white/10 rounded-xl p-6 hover:bg-white/6 hover:border-white/20 hover:scale-[1.02] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-white/8">
                  <Icon className="w-5 h-5 text-white/60" />
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/8 text-white/40 border border-white/10">{fee}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{name}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-white/4 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/6 transition-all">
            <Globe className="w-10 h-10 text-white/30 mb-3" />
            <h3 className="text-white font-bold mb-2">Built on Solana</h3>
            <p className="text-sm text-white/40 mb-4">USDG stablecoin · Dodo Payments rails · &lt;$0.001 tx cost</p>
            <Link href="/register" className="text-xs bg-white hover:bg-white/90 text-black font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              Start now <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Fee table */}
      <div className="px-8 pb-20 max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white/40" />
            <h3 className="text-white font-semibold">Revenue Model — Fee Structure</h3>
          </div>
          <div className="divide-y divide-white/5">
            {modules.map(({ name, fee, desc }) => (
              <div key={name} className="flex items-center gap-4 px-6 py-4">
                <div className="w-28 shrink-0">
                  <span className="text-sm font-semibold text-white">{name}</span>
                </div>
                <div className="flex-1 text-sm text-white/50">{desc.split(".")[0]}</div>
                <div className="shrink-0">
                  <span className="text-sm font-mono font-bold text-white">{fee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pb-12 text-xs text-white/20">
        FlowPay · Built for Superteam India × Dodo Payments Hackathon · Solana Frontier
      </div>
    </div>
  );
}
