import { useEffect, useMemo, useState } from "react";

const COLORS = ["#f97316", "#14b8a6", "#eab308", "#ec4899", "#8b5cf6", "#22c55e"];

type Piece = { id: number; x: number; delay: number; dur: number; color: string; size: number; rot: number; drift: number };

export function Confetti({ pieces = 80, duration = 2600 }: { pieces?: number; duration?: number }) {
  const [on, setOn] = useState(true);
  const items = useMemo<Piece[]>(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        dur: 1.6 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length]!,
        size: 6 + Math.random() * 8,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
      })),
    [pieces],
  );
  useEffect(() => {
    const t = setTimeout(() => setOn(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  if (!on) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ["--drift" as string]: `${p.drift}px`,
            ["--rot" as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}
