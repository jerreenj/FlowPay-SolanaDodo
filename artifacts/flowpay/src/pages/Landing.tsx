import React from "react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Zap, ChevronDown, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import WalletConnect from "@/components/WalletConnect";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.18 + 0.4,
      duration: 0.9,
      ease: "easeInOut",
    },
  }),
};

const modules = [
  { name: "PayRails", color: "#3b82f6", desc: "Stablecoin payroll · UPI delivery · <3s on Solana" },
  { name: "RemitDirect", color: "#a855f7", desc: "Dubai → Mumbai in 2 seconds · USDG rails" },
  { name: "EscrowX", color: "#eab308", desc: "Trustless smart contract escrow · milestone release" },
  { name: "CreatorPay", color: "#ec4899", desc: "Sell globally · USDG payments · zero chargebacks" },
  { name: "AgentBank", color: "#00ff88", desc: "AI agent wallets · x402 protocol · <500ms" },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const token = useAuthStore((s) => s.token);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redirect if already connected
  useEffect(() => {
    if (token) setLocation("/select");
  }, [token]);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 180 };

    class Particle {
      x: number; y: number;
      dx: number; dy: number;
      size: number; color: string;

      constructor(x: number, y: number, dx: number, dy: number, size: number, color: string) {
        this.x = x; this.y = y;
        this.dx = dx; this.dy = dy;
        this.size = size; this.color = color;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        if (this.x > canvas!.width || this.x < 0) this.dx = -this.dx;
        if (this.y > canvas!.height || this.y < 0) this.dy = -this.dy;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius + this.size) {
            const fx = dx / dist;
            const fy = dy / dist;
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
        const size = Math.random() * 1.8 + 0.8;
        const x = Math.random() * (canvas!.width - size * 4) + size * 2;
        const y = Math.random() * (canvas!.height - size * 4) + size * 2;
        const dx = (Math.random() * 0.4) - 0.2;
        const dy = (Math.random() * 0.4) - 0.2;
        // Alternate between green and a subtle blue-green
        const color = Math.random() > 0.5 ? "rgba(0, 255, 136, 0.75)" : "rgba(0, 210, 200, 0.5)";
        particles.push(new Particle(x, y, dx, dy, size, color));
      }
    }

    function connect() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dist =
            (particles[a].x - particles[b].x) ** 2 +
            (particles[a].y - particles[b].y) ** 2;
          const threshold = (canvas!.width / 7) * (canvas!.height / 7);

          if (dist < threshold) {
            const opacity = 1 - dist / 20000;
            const dxM = particles[a].x - (mouse.x ?? -9999);
            const dyM = particles[a].y - (mouse.y ?? -9999);
            const distM = Math.sqrt(dxM * dxM + dyM * dyM);
            ctx.strokeStyle =
              mouse.x !== null && distM < mouse.radius
                ? `rgba(0, 255, 136, ${opacity})`
                : `rgba(0, 200, 140, ${opacity * 0.5})`;
            ctx.lineWidth = 0.8;
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
      ctx.fillStyle = "rgba(7, 7, 7, 0.92)";
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
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Fixed nav on top of canvas */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00ff88]/15 border border-[#00ff88]/30 flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-4 h-4 text-[#00ff88]" />
            </div>
            <span className="font-bold text-lg tracking-tight drop-shadow-md">FlowPay</span>
          </div>
          <WalletConnect />
        </nav>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/25 mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00ff88]" />
            </span>
            <span className="text-sm font-mono text-[#00ff88]">
              Solana Mainnet · USDG · &lt;3s settlement
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.92]"
            style={{
              backgroundImage: "linear-gradient(180deg, #ffffff 40%, rgba(255,255,255,0.35) 100%)",
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
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-3 leading-relaxed font-light"
          >
            India's stablecoin payment super-layer.
          </motion.p>

          <motion.p
            custom={2.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-base text-white/30 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Five payment rails — payroll, remittance, escrow, creator commerce, and AI agent payments — unified on one Solana-powered platform.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <WalletConnect variant="hero" />
            <button
              onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors"
            >
              Explore the rails <ChevronDown className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white/15" />
        </div>
      </section>

      {/* ─── 5 MODULES ────────────────────────────────────── */}
      <section id="modules" className="px-6 sm:px-10 py-28 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-[#00ff88]/40 tracking-[0.3em] uppercase mb-4">Five rails. One platform.</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Pick your payment module.
          </h2>
          <p className="text-white/30 mt-4 max-w-lg mx-auto text-base">
            Each module is purpose-built. Connect your wallet to get started — no email, no form, no friction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ name, color, desc }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-6 border overflow-hidden cursor-default group"
              style={{
                background: `radial-gradient(ellipse at top left, ${color}10 0%, rgba(255,255,255,0.02) 60%)`,
                borderColor: `${color}25`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${color}18 0%, transparent 60%)` }}
              />
              <div
                className="w-2 h-2 rounded-full mb-5"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
              <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </motion.div>
          ))}

          {/* Connect CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            className="rounded-2xl p-6 border border-[#00ff88]/15 bg-[#00ff88]/4 flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00ff88]/15 border border-[#00ff88]/25 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-[#00ff88]" />
            </div>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Connect any Solana wallet.<br />No sign-up. No email required.
            </p>
            <WalletConnect variant="card" />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────── */}
      <section className="border-t border-white/5 px-8 py-14">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "< 3s", label: "Settlement", sub: "on Solana" },
            { value: "< $0.001", label: "Per transaction", sub: "network fee" },
            { value: "USDG", label: "Stablecoin", sub: "via Dodo Payments" },
          ].map(({ value, label, sub }) => (
            <div key={label}>
              <p className="text-3xl font-bold font-mono"
                style={{
                  backgroundImage: "linear-gradient(135deg, #00ff88, #00d4ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {value}
              </p>
              <p className="text-xs uppercase tracking-widest text-white/30 mt-1">{label}</p>
              <p className="text-xs text-white/15 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between text-xs text-white/15">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-[#00ff88]/30" />
          <span>FlowPay</span>
        </div>
        <span>Powered by Solana · USDG · Dodo Payments</span>
      </footer>
    </div>
  );
}
