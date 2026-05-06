import { useState, useEffect, useCallback } from "react";

interface Character {
  char: string;
  x: number;
  y: number;
  speed: number;
}

const ALL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$₹⚡#@!%^&*";

export default function RainingLetters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());

  const createCharacters = useCallback(() => {
    const count = 200;
    return Array.from({ length: count }, () => ({
      char: ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.06 + Math.random() * 0.18,
    }));
  }, []);

  useEffect(() => {
    setCharacters(createCharacters());
  }, [createCharacters]);

  useEffect(() => {
    const id = setInterval(() => {
      const next = new Set<number>();
      const n = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < n; i++) {
        next.add(Math.floor(Math.random() * 200));
      }
      setActiveIndices(next);
    }, 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setCharacters((prev) =>
        prev.map((c) => {
          if (c.y >= 105) {
            return {
              char: ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
              x: Math.random() * 100,
              y: -5,
              speed: 0.06 + Math.random() * 0.18,
            };
          }
          return { ...c, y: c.y + c.speed };
        })
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {characters.map((c, i) => {
        const active = activeIndices.has(i);
        return (
          <span
            key={i}
            className="absolute select-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              fontSize: "1.5rem",
              fontFamily: "monospace",
              fontWeight: active ? 700 : 300,
              color: active ? "#a78bfa" : "rgba(139,92,246,0.18)",
              textShadow: active
                ? "0 0 10px rgba(167,139,250,0.9), 0 0 20px rgba(139,92,246,0.5)"
                : "none",
              opacity: active ? 1 : 0.55,
              transform: `translate(-50%, -50%) ${active ? "scale(1.2)" : "scale(1)"}`,
              transition: "color 0.08s, text-shadow 0.08s, transform 0.08s",
              willChange: "top",
            }}
          >
            {c.char}
          </span>
        );
      })}
    </div>
  );
}
