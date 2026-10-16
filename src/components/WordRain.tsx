import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Heart, RotateCcw } from "lucide-react";
import { VOCAB, speak, type Word } from "@/lib/vocab";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { Confetti } from "./Confetti";

const ROUNDS = 10;
const LANES = 3;

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };

type Drop = { word: Word; lane: number; key: string };

export function WordRain({ onExit, muted }: { onExit: () => void; muted: boolean }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<Word | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [hits, setHits] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const play = (k: keyof typeof sfx) => { if (!muted) sfx[k](); };

  const nextRound = (r: number) => {
    if (r >= ROUNDS) { setDone(true); play("end"); return; }
    const word = VOCAB[Math.floor(Math.random() * VOCAB.length)]!;
    const others = shuffle(VOCAB.filter((w) => w !== word)).slice(0, LANES - 1);
    const lanes = shuffle([word, ...others]);
    setTarget(word);
    setHits(new Set()); setMisses(new Set());
    setDrops(lanes.map((w, i) => ({ word: w, lane: i, key: `${r}-${w.hebrew}` })));
    if (timerRef.current) clearTimeout(timerRef.current);
    // no penalty: if time runs out, just move on
    timerRef.current = setTimeout(() => nextRound(r + 1), 6000);
  };

  useEffect(() => { nextRound(0); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const pick = (d: Drop) => {
    if (!target || hits.size) return;
    if (d.word === target) {
      play("correct");
      speak(d.word.hebrew);
      setScore((s) => s + 1);
      setHits(new Set([d.key]));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { setRound((r) => { nextRound(r + 1); return r + 1; }); }, 650);
    } else {
      play("tick"); // gentle sound only, no penalty
      setMisses((m) => new Set(m).add(d.key));
    }
  };

  const restart = () => { setScore(0); setRound(0); setDone(false); nextRound(0); };

  return (
    <section className="flex flex-col gap-4">
      {done && <Confetti pieces={120} />}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowRight className="h-4 w-4" /> חזרה</button>
        <p className="text-sm font-semibold text-muted-foreground">סיבוב {Math.min(round + 1, ROUNDS)}/{ROUNDS} · תפסת {score}</p>
      </div>

      {!done && target ? (
        <>
          <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-muted-foreground">תפסי את המילה בעברית שמתאימה ל־</p>
            <p dir="ltr" className="mt-1 font-display text-3xl font-black text-primary">{target.english}</p>
          </div>
          <div className="relative h-80 overflow-hidden rounded-3xl border border-border bg-muted/50">
            {drops.map((d, i) => (
              <button
                key={d.key}
                onClick={() => pick(d)}
                className={cn("absolute top-0 w-[31%] animate-word-fall rounded-2xl border-2 border-border bg-card py-3 font-hebrew text-2xl font-bold shadow-sm transition active:scale-90",
                  hits.has(d.key) && "border-success bg-success text-success-foreground",
                  misses.has(d.key) && "animate-shake border-destructive/50 opacity-60")}
                style={{ right: `${d.lane * 34 + 1.5}%`, animationDelay: `${i * 0.9}s`, animationDuration: "5s" }}
              >
                {d.word.hebrew}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">אין עונש על טעות — פשוט ממשיכים 😊</p>
        </>
      ) : done ? (
        <div className="animate-in fade-in zoom-in-95 rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-6xl">🌧️✨</p>
          <h2 className="mt-2 font-display text-3xl font-black">כל הכבוד!</h2>
          <p className="mt-1 text-muted-foreground">תפסת {score} מתוך {ROUNDS} מילים</p>
          <div className="mt-3 flex justify-center gap-1">
            {Array.from({ length: ROUNDS }, (_, i) => (
              <Heart key={i} className={cn("h-6 w-6", i < score ? "fill-primary text-primary" : "text-border")} />
            ))}
          </div>
          <button onClick={restart} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-xl font-black text-primary-foreground shadow-[var(--shadow-pop)] transition hover:scale-[1.02] active:scale-95"><RotateCcw className="h-5 w-5" /> עוד פעם</button>
        </div>
      ) : null}
    </section>
  );
}
