import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import WalletConnect from "@/components/WalletConnect";

const MODULES = [
  { name: "PayRails", color: "#a78bfa" },
  { name: "RemitDirect", color: "#60a5fa" },
  { name: "EscrowX", color: "#34d399" },
  { name: "CreatorPay", color: "#f472b6" },
  { name: "AgentBank", color: "#fb923c" },
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
    if (token) setLocation("/select");
  }, [token]);

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
        ctx.fillStyle = "rgba(191, 128, 255, 0.8)";
        ctx.fill();
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
        const size = Math.random() * 2 + 1;
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
            const op = 1 - dist / 20000;
            const dxM = particles[a].x - (mouse.x ?? -9999);
            const dyM = particles[a].y - (mouse.y ?? -9999);
            const distM = Math.sqrt(dxM * dxM + dyM * dyM);
            ctx.strokeStyle = mouse.x !== null && distM < mouse.radius
              ? `rgba(255, 255, 255, ${op})`
              : `rgba(200, 150, 255, ${op})`;
            ctx.lineWidth = 1;
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
      ctx.fillStyle = "black";
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
    <div className="bg-black text-white overflow-x-hidden">
      <section className="relative h-screen w-full flex flex-col overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-end px-8 py-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
            </span>
            <span className="text-xs font-mono text-white/75 tracking-[0.2em]">MAINNET</span>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">

          {/* Title */}
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-7xl md:text-9xl font-black tracking-tighter mb-5 leading-[0.88]"
            style={{
              backgroundImage: "linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FlowPay
          </motion.h1>

          {/* Primary tagline */}
          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-xl md:text-2xl font-semibold text-white/85 max-w-lg mx-auto mb-3 leading-snug"
          >
            India's stablecoin payment super-layer.
          </motion.p>

          {/* Secondary tagline */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-sm md:text-base text-white/50 max-w-sm mx-auto mb-11 leading-relaxed"
          >
            Five payment rails on one Solana platform — payroll, remittance,
            escrow, creator commerce, and AI agent payments.
          </motion.p>

          {/* Module pills */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-2.5 mb-12"
          >
            {MODULES.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}
                />
                <span className="text-[13px] font-semibold text-white/85 tracking-wide">
                  {m.name}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <WalletConnect variant="hero" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
