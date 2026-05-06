import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import WalletConnect from "@/components/WalletConnect";
import { Link } from "wouter";
import {
  Users, ArrowRightLeft, ShieldCheck, Sparkles, Bot,
  ArrowRight, Zap, Globe, TrendingUp, Shield, Clock
} from "lucide-react";

const MODULES = [
  {
    name: "PayRails",
    tag: "Payroll",
    icon: Users,
    fee: "0.5%",
    color: "#00ff88",
    desc: "Stablecoin salaries for remote teams. Settled on Solana in under 3 seconds.",
  },
  {
    name: "RemitDirect",
    tag: "Remittance",
    icon: ArrowRightLeft,
    fee: "0.75%",
    color: "#00c9ff",
    desc: "Dubai→Mumbai in 2s. 60× cheaper than SWIFT. USDG → INR via UPI.",
  },
  {
    name: "EscrowX",
    tag: "Escrow",
    icon: ShieldCheck,
    fee: "0.5%",
    color: "#a78bfa",
    desc: "Trustless smart contract escrow. Milestone-based releases for freelancers.",
  },
  {
    name: "CreatorPay",
    tag: "Creator Commerce",
    icon: Sparkles,
    fee: "2%",
    color: "#f472b6",
    desc: "Sell courses, ebooks, and templates globally. USDG payments, no chargebacks.",
  },
  {
    name: "AgentBank",
    tag: "AI Payments",
    icon: Bot,
    fee: "1%",
    color: "#fb923c",
    desc: "Autonomous wallets for AI agents. x402 protocol. Machine-to-machine micropayments.",
  },
];

const STATS = [
  { value: "<3s", label: "Settlement time", icon: Clock },
  { value: "65K", label: "Solana TPS", icon: Zap },
  { value: "₹83.52", label: "USDG → INR rate", icon: TrendingUp },
  { value: "0.5%", label: "Starting fee", icon: Shield },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.14 + 0.25, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Landing() {
  const [, setLocation] = useLocation();
  const token = useAuthStore((s) => s.token);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };

    class Particle {
      x: number; y: number; dx: number; dy: number; size: number;
      constructor(x: number, y: number, dx: number, dy: number, size: number) {
        this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 100, 255, 1.0)";
        ctx.shadowColor = "rgba(160, 80, 255, 0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      update() {
        if (this.x > canvas!.width || this.x < 0) this.dx = -this.dx;
        if (this.y > canvas!.height || this.y < 0) this.dy = -this.dy;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x, dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius + this.size) {
            const fx = dx / dist, fy = dy / dist;
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= fx * force * 5;
            this.y -= fy * force * 5;
          }
        }
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
      }
    }

    function init() {
      particles = [];
      const count = (canvas!.height * canvas!.width) / 9000;
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 2.5 + 1.5;
        const x = Math.random() * (canvas!.width - size * 4) + size * 2;
        const y = Math.random() * (canvas!.height - size * 4) + size * 2;
        const dx = (Math.random() * 0.4) - 0.2;
        const dy = (Math.random() * 0.4) - 0.2;
        particles.push(new Particle(x, y, dx, dy, size));
      }
    }

    function connect() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dist =
            (particles[a].x - particles[b].x) ** 2 +
            (particles[a].y - particles[b].y) ** 2;
          if (dist < (canvas!.width / 7) * (canvas!.height / 7)) {
            const op = Math.min((1 - dist / 20000) * 1.4, 0.9);
            ctx.strokeStyle = `rgba(180, 100, 255, ${op})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      ctx.fillStyle = "#070707";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => p.update());
      connect();
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      init();
    }

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onOut = () => { mouse.x = null; mouse.y = null; };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onOut);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="bg-[#070707] text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative h-screen w-full flex flex-col overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 65% at 50% 50%, rgba(7,7,7,0.78) 0%, rgba(7,7,7,0.3) 65%, transparent 100%)",
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-end px-8 py-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
            </span>
            <span className="text-xs font-mono text-[#00ff88]/75 tracking-[0.2em]">MAINNET</span>
          </div>
          {token && (
            <Link
              href="/select"
              className="flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e87a] text-black text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Open App <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-[#00ff88]/8 border border-[#00ff88]/20 rounded-full px-4 py-1.5 text-xs font-mono text-[#00ff88]/80 tracking-widest uppercase mb-7"
          >
            Superteam India × Dodo Payments · Solana Frontier
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-black tracking-[-0.04em] mb-5 leading-none"
            style={{
              fontSize: "clamp(4.5rem, 13vw, 9.5rem)",
              backgroundImage: "linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FlowPay
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-xl md:text-2xl font-semibold text-white max-w-lg mx-auto mb-3 leading-snug"
            style={{ textShadow: "0 0 40px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.8)" }}
          >
            India's stablecoin payment super-layer.
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-sm md:text-base text-white/45 max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ textShadow: "0 0 28px rgba(0,0,0,0.85)" }}
          >
            Five payment rails on one Solana platform — payroll, remittance, escrow, creator commerce, and AI agent payments.
          </motion.p>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-2 mb-10"
          >
            {MODULES.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.color }} />
                <span className="text-[12px] font-semibold text-white/70 tracking-wide">{m.name}</span>
              </div>
            ))}
          </motion.div>

          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <WalletConnect variant="hero" />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="relative z-10 flex justify-center pb-8">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 text-white/20 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          >
            <span className="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/8 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div
              key={label}
              className={`flex items-center gap-4 px-8 py-7 ${i < STATS.length - 1 ? "border-r border-white/8" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#00ff88]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-white">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MODULES GRID ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-[#00ff88]/60 tracking-widest uppercase mb-3">Payment Rails</p>
          <h2 className="text-4xl font-bold text-white mb-4">5 Modules. One Platform.</h2>
          <p className="text-white/40 max-w-lg mx-auto">Everything India's crypto economy needs — built on Solana, powered by USDG.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map(({ name, tag, icon: Icon, fee, color, desc }) => (
            <motion.div
              key={name}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 overflow-hidden cursor-pointer"
              style={{ boxShadow: `0 0 0 0 ${color}00` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px ${color}15`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Glow blob */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-3xl"
                style={{ background: `${color}20`, transform: "translate(40%, -40%)" }}
              />

              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-right">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
                  >
                    {tag}
                  </span>
                  <p className="text-[11px] text-white/30 mt-1">{fee} fee</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{desc}</p>

              <div
                className="flex items-center gap-1.5 mt-5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color }}
              >
                Open module <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}

          {/* CTA card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-[#00ff88]/15 bg-[#00ff88]/[0.04] p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00ff88]/15 border border-[#00ff88]/25 flex items-center justify-center mb-4">
              <Globe className="w-7 h-7 text-[#00ff88]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Built on Solana</h3>
            <p className="text-sm text-white/40 mb-5 leading-relaxed">USDG stablecoin · Dodo Payments rails · &lt;$0.001 per tx</p>
            <WalletConnect variant="card" />
          </motion.div>
        </div>
      </section>

      {/* ── FEE TABLE ── */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-5 border-b border-white/8 flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-[#00ff88]" />
            <h3 className="text-white font-semibold">Revenue Model — Fee Structure</h3>
          </div>
          <div className="divide-y divide-white/5">
            {MODULES.map(({ name, icon: Icon, fee, color, desc }) => (
              <div key={name} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}12` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white">{name}</span>
                  <p className="text-xs text-white/35 mt-0.5 truncate">{desc.split(".")[0]}</p>
                </div>
                <span
                  className="text-base font-mono font-bold shrink-0"
                  style={{ color }}
                >
                  {fee}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 px-6 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#00ff88]/10 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <p className="text-xs font-mono text-[#00ff88]/60 tracking-widest uppercase mb-4">Ready to build?</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              The future of Indian<br />crypto payments.
            </h2>
            <p className="text-white/40 mb-10 max-w-md mx-auto">
              Connect your Solana wallet and start transacting across all 5 rails in seconds.
            </p>
            <WalletConnect variant="hero" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between text-xs text-white/20">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#00ff88]/40" />
          <span>FlowPay</span>
        </div>
        <span>Built for Superteam India × Dodo Payments Hackathon · Solana Frontier</span>
        <span className="font-mono">USDG · SOL</span>
      </footer>
    </div>
  );
}
