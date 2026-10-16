import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Star } from "lucide-react";
import { VOCAB, speak, type Word } from "@/lib/vocab";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { Confetti } from "./Confetti";

type Card = { id: string; word: Word; kind: "en" | "he" };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };

export function MemoryMatch({ onExit, muted }: { onExit: () => void; muted: boolean }) {
  const [round, setRound] = useState(0);
  const words = useMemo(() => shuffle(VOCAB).slice(0, 6), [round]);
  const cards = useMemo<Card[]>(
    () => shuffle(words.flatMap((w) => [{ id: w.hebrew + "-en", word: w, kind: "en" as const }, { id: w.hebrew + "-he", word: w, kind: "he" as const }])),
    [words],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [justMatched, setJustMatched] = useState<string | null>(null);
  const play = (k: keyof typeof sfx) => { if (!muted) sfx[k](); };

  const done = matched.size === words.length;
  useEffect(() => { if (done) play("end"); }, [done]);

  const flip = (c: Card) => {
    if (open.includes(c.id) || matched.has(c.word.hebrew) || open.length === 2) return;
    const next = [...open, c.id];
    setOpen(next);
    if (c.kind === "he") speak(c.word.hebrew);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => cards.find((x) => x.id === id)!);
      if (a.word === b.word) {
        play("correct");
        setJustMatched(a.word.hebrew);
        setTimeout(() => { setMatched((s) => new Set(s).add(a.word.hebrew)); setOpen([]); setJustMatched(null); }, 500);
      } else {
        play("tick");
        setTimeout(() => setOpen([]), 750);
      }
    }
  };

  const restart = () => { setRound((r) => r + 1); setOpen([]); setMatched(new Set()); setMoves(0); };

  return (
    <section className="flex flex-col gap-4">
      {done && <Confetti />}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowRight className="h-4 w-4" /> חזרה</button>
        <p className="text-sm font-semibold text-muted-foreground">זוגות: {matched.size}/{words.length} · מהלכים: {moves}</p>
      </div>

      {!done ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {cards.map((c) => {
            const isOpen = open.includes(c.id) || matched.has(c.word.hebrew);
            const isNew = justMatched === c.word.hebrew;
            return (
              <button key={c.id} onClick={() => flip(c)}
                className={cn("grid min-h-24 place-items-center rounded-2xl border-2 p-2 text-center transition-all duration-200 active:scale-95",
                  isOpen ? "border-primary bg-card shadow-[var(--shadow-card)]" : "border-border bg-primary text-primary-foreground shadow-[var(--shadow-pop)] hover:scale-[1.03]",
                  matched.has(c.word.hebrew) && "border-success bg-success/10",
                  isNew && "scale-110")}>
                {isOpen ? (
                  c.kind === "he"
                    ? <span className="font-hebrew text-xl font-bold leading-snug">{c.word.hebrew}</span>
                    : <span dir="ltr" className="text-sm font-bold">{c.word.english}</span>
                ) : (
                  <Star className="h-6 w-6 opacity-70" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-6xl">🎉</p>
          <h2 className="mt-2 font-display text-3xl font-black">כל הזוגות נמצאו!</h2>
          <p className="mt-1 text-muted-foreground">סיימת ב-{moves} מהלכים</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {words.map((w) => <span key={w.hebrew} className="rounded-full bg-success/15 px-3 py-1 font-hebrew text-lg font-bold text-success">{w.hebrew}</span>)}
          </div>
          <button onClick={restart} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-xl font-black text-primary-foreground shadow-[var(--shadow-pop)] transition hover:scale-[1.02] active:scale-95"><RotateCcw className="h-5 w-5" /> עוד סיבוב</button>
        </div>
      )}
    </section>
  );
}
