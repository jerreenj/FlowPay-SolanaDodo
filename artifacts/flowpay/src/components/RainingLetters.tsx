import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01₹$#%ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FONT_SIZE = 15;
const SPEED_MS = 75; // ms between steps — controls fall pace

export default function RainingLetters() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let cols = Math.floor(W / FONT_SIZE);
    // Start each column at a random negative row so they stagger in
    let drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * 40));

    let animId: number;
    let last = 0;

    function draw(ts: number) {
      animId = requestAnimationFrame(draw);
      if (ts - last < SPEED_MS) return;
      last = ts;

      // Fade trail: paint a semi-transparent dark layer every frame
      ctx.fillStyle = "rgba(8, 8, 8, 0.18)";
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FONT_SIZE;
        if (y < 0) { drops[i]++; continue; }

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        // Head glyph — bright white
        ctx.fillStyle = "rgba(230, 230, 255, 0.85)";
        ctx.fillText(char, i * FONT_SIZE, y);

        // Randomly reset column after it passes bottom
        if (y > H && Math.random() > 0.977) {
          drops[i] = -Math.floor(Math.random() * 20);
        }
        drops[i]++;
      }
    }

    animId = requestAnimationFrame(draw);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W;
      canvas!.height = H;
      cols = Math.floor(W / FONT_SIZE);
      drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * 40));
    }

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.28 }}
    />
  );
}
