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

        {/* Dark radial vignette — makes center text pop without whitening everything */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">

          {/* Title */}
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-black tracking-[-0.04em] mb-6 pb-3 leading-none overflow-visible"
            style={{
              fontSize: "clamp(5rem, 14vw, 10rem)",
              backgroundImage: "linear-gradient(160deg, #ffffff 20%, rgba(200,185,255,0.75) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.03em",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontVariationSettings: "'wght' 900",
            }}
          >
            FlowPay
          </motion.h1>

          {/* Primary tagline — with subtle backdrop so it reads over canvas */}
          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-xl md:text-2xl font-semibold text-white max-w-lg mx-auto mb-11 leading-snug px-4 py-2 rounded-xl"
            style={{
              textShadow: "0 0 40px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.8)",
            }}
          >
            India's stablecoin payment super-layer.
          </motion.p>

          {/* Module pills */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-2.5 mb-12"
          >
            {MODULES.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/[0.08] backdrop-blur-sm"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
                />
                <span className="text-[13px] font-semibold text-white tracking-wide">
                  {m.name}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            custom={3}
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
