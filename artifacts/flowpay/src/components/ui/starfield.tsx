import { useEffect, useRef } from "react";

interface StarfieldProps {
  starColor?: string;
  bgColor?: string;
  speed?: number;
  quantity?: number;
  opacity?: number;
}

export function Starfield({
  starColor = "rgba(255,255,255,0.9)",
  bgColor = "rgba(7,7,7,1)",
  speed = 0.6,
  quantity = 320,
  opacity = 1,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  const sd = useRef({
    w: 0, h: 0,
    ctx: null as CanvasRenderingContext2D | null,
    cw: 0, ch: 0,
    x: 0, y: 0, z: 0,
    colorRatio: 0,
    arr: [] as number[][],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const measure = () => {
      const s = sd.current;
      s.w = parent.clientWidth;
      s.h = parent.clientHeight;
      s.x = Math.round(s.w / 2);
      s.y = Math.round(s.h / 2);
      s.z = (s.w + s.h) / 2;
      s.colorRatio = 1 / s.z;
    };

    const setup = () => {
      measure();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      sd.current.ctx = ctx;
      canvas.width = sd.current.w;
      canvas.height = sd.current.h;
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = starColor;
    };

    const bigBang = () => {
      const s = sd.current;
      s.arr = Array.from({ length: quantity }, () => [
        Math.random() * s.w * 2 - s.x * 2,
        Math.random() * s.h * 2 - s.y * 2,
        Math.round(Math.random() * s.z),
        0, 0, 0, 0,
        1,
      ]);
    };

    const frame = () => {
      const s = sd.current;
      const ctx = s.ctx;
      if (!ctx) return;

      const ratio = quantity / 2;

      if (canvas.width !== s.w || canvas.height !== s.h) {
        const rw = s.w / (canvas.width || 1);
        const rh = s.h / (canvas.height || 1);
        canvas.width = s.w;
        canvas.height = s.h;
        s.arr = s.arr.map(star => {
          const n = [...star];
          n[0] = star[0] * rw;
          n[1] = star[1] * rh;
          n[3] = s.x + (n[0] / n[2]) * ratio;
          n[4] = s.y + (n[1] / n[2]) * ratio;
          return n;
        });
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = starColor;
      }

      s.arr = s.arr.map(star => {
        const n = [...star];
        n[7] = 1;
        n[5] = n[3];
        n[6] = n[4];
        n[2] -= speed;
        if (n[2] < 0) { n[2] += s.z; n[7] = 0; }
        if (n[2] > s.z) { n[2] -= s.z; n[7] = 0; }
        n[3] = s.x + (n[0] / n[2]) * ratio;
        n[4] = s.y + (n[1] / n[2]) * ratio;
        return n;
      });

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, s.w, s.h);
      ctx.strokeStyle = starColor;

      s.arr.forEach(star => {
        if (star[5] > 0 && star[5] < s.w && star[6] > 0 && star[6] < s.h && star[7]) {
          ctx.lineWidth = (1 - s.colorRatio * star[2]) * 2;
          ctx.beginPath();
          ctx.moveTo(star[5], star[6]);
          ctx.lineTo(star[3], star[4]);
          ctx.stroke();
          ctx.closePath();
        }
      });

      measure();
      animRef.current = requestAnimationFrame(frame);
    };

    setup();
    bigBang();
    animRef.current = requestAnimationFrame(frame);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [starColor, bgColor, speed, quantity, opacity]);

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
