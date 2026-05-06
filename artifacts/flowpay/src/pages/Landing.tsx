import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/auth";
import WalletConnect from "@/components/WalletConnect";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.14 + 0.25, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Landing() {
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
    <div className="bg-[#070707] text-white h-screen w-full overflow-hidden">
      <section className="relative h-full w-full flex flex-col">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Soft center vignette so text stays readable */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(7,7,7,0.72) 0%, rgba(7,7,7,0.25) 65%, transparent 100%)",
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-end px-8 py-6 gap-3">
          <div className="flex items-center gap-2 mr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
            </span>
            <span className="text-xs font-mono text-[#00ff88]/75 tracking-[0.2em]">MAINNET</span>
          </div>
          {token ? (
            <Link
              href="/select"
              className="flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e87a] text-black text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Open App <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Hero — centred, nothing else */}
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
            className="font-black mb-5 leading-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.04em",
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
            Five payment rails on Solana — payroll, remittance, escrow, creator commerce, and AI agents.
          </motion.p>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <WalletConnect variant="hero" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
