import { useState, useEffect, useCallback } from "react";

interface Character {
  char: string;
  x: number;
  y: number;
  speed: number;
  opacity: number;
}

const ALL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$₹⚡#@!%^&*";

export default function RainingLetters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());

  const createCharacters = useCallback(() => {
    const count = 80;
    return Array.from({ length: count }, (_, i) => ({
      char: ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
      x: (i / 80) * 100 + Math.random() * 1.2,
      y: Math.random() * 100,
      speed: 0.022 + Math.random() * 0.028,
      opacity: 0.22 + Math.random() * 0.22,
    }));
  }, []);

  useEffect(() => {
    setCharacters(createCharacters());
  }, [createCharacters]);

  // Light up a healthy batch of letters each tick
  useEffect(() => {
    const id = setInterval(() => {
      const next = new Set<number>();
      const n = Math.floor(Math.random() * 6) + 4; // 4–9 active at once
      for (let i = 0; i < n; i++) {
        next.add(Math.floor(Math.random() * 80));
      }
      setActiveIndices(next);
    }, 700);
    return () => clearInterval(id);
  }, []);

  // Slow, steady fall
  useEffect(() => {
    const id = setInterval(() => {
      setCharacters((prev) =>
        prev.map((c) => {
          if (c.y >= 105) {
            return {
              char: ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
              x: Math.random() * 100,
              y: -8,
              speed: 0.022 + Math.random() * 0.028,
              opacity: 0.22 + Math.random() * 0.22,
            };
          }
          return { ...c, y: c.y + c.speed };
        })
      );
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {characters.map((c, i) => {
        const active = activeIndices.has(i);
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${c.x}%`,
              top: `${c.y}%`,
              fontSize: "1.1rem",
              fontFamily: "monospace",
              fontWeight: active ? 700 : 400,
              color: active
                ? "rgba(255,255,255,0.92)"
                : `rgba(255,255,255,${c.opacity})`,
              textShadow: active
                ? "0 0 18px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.25)"
                : "none",
              transform: "translate(-50%, -50%)",
              transition: "color 0.9s ease, text-shadow 0.9s ease",
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
