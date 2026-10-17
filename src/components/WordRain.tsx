import { useEffect, useRef, useState } from "react";
import { ArrowRight, CloudRain, Heart, RotateCcw, Zap } from "lucide-react";
import { VOCAB, speak, type Word } from "@/lib/vocab";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { Confetti } from "./Confetti";
import { Button } from "@/components/ui/button";
import { advanceRainProgress, ARCADE_PACE, ARCADE_RULES, initialRainProgress, rainTiming, STANDALONE_PACE, STANDALONE_RULES } from "@/lib/word-rain-speed";
import { completeDifficulty, DIFFICULTY_STORAGE_KEY, difficultyPool, initialDifficulty, mixedGameWords, normalizeDifficulty } from "@/lib/wordfall-difficulty";

const ROUNDS = 10;
const LANES = 3;

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const left = b[i]; const right = b[j]; if (left !== undefined && right !== undefined) { b[i] = right; b[j] = left; } } return b; };

type Drop = { word: Word; lane: number; key: string };

export function WordRain({ onExit, muted, standalone = false, onGameStart, onGameComplete }: { onExit: () => void; muted: boolean; standalone?: boolean; onGameStart?: () => void; onGameComplete?: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<Word | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [hits, setHits] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);
  const lockedRef = useRef(false);
  const progressRef = useRef(initialRainProgress());
  const difficultyRef = useRef(initialDifficulty());
  const gameWordsRef = useRef<Word[]>([]);
  const poolRef = useRef(VOCAB);
  const [level, setLevel] = useState(0);
  const [levelUnlocked, setLevelUnlocked] = useState(false);
  const [roundSpeed, setRoundSpeed] = useState(1);
  const [speedFlash, setSpeedFlash] = useState(0);
  const speedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startCallback = useRef(onGameStart);
  const completeCallback = useRef(onGameComplete);
  startCallback.current = onGameStart;
  completeCallback.current = onGameComplete;
  const play = (k: keyof typeof sfx) => { if (!muted) sfx[k](); };
  // Wordfall falls slower and keeps one steady pace; the arcade game keeps its own
  const pace = standalone ? STANDALONE_PACE : ARCADE_PACE;
  const rules = standalone ? STANDALONE_RULES : ARCADE_RULES;

  // short banner on a speed jump — never blocks the round or the falling words
  const flashSpeedUp = () => {
    setSpeedFlash((k) => k + 1);
    play("speedUp");
    if (speedTimerRef.current) clearTimeout(speedTimerRef.current);
    speedTimerRef.current = setTimeout(() => setSpeedFlash(0), 1300);
  };

  const nextRound = (r: number) => {
    setRound(r);
    lockedRef.current = false;
    if (r >= ROUNDS) {
      if (standalone) {
        const next = completeDifficulty(difficultyRef.current, scoreRef.current);
        setLevelUnlocked(next.level > difficultyRef.current.level);
        difficultyRef.current = next;
        try { localStorage.setItem(DIFFICULTY_STORAGE_KEY, JSON.stringify(next)); } catch { /* optional device storage */ }
      }
      setDone(true); play("end"); completeCallback.current?.(scoreRef.current); return;
    }
    const speed = progressRef.current.speed;
    setRoundSpeed(speed);
    const word = standalone ? gameWordsRef.current[r] : VOCAB[Math.floor(Math.random() * VOCAB.length)];
    if (!word) return;
    const others = shuffle(poolRef.current.filter((w) => w !== word && (!standalone || w.english !== word.english))).slice(0, LANES - 1);
    const lanes = shuffle([word, ...others]);
    setTarget(word);
    setHits(new Set()); setMisses(new Set());
    setDrops(lanes.map((w, i) => ({ word: w, lane: i, key: `${r}-${w.hebrew}` })));
    if (timerRef.current) clearTimeout(timerRef.current);
    // no penalty: if time runs out, just move on
    timerRef.current = setTimeout(() => {
      progressRef.current = advanceRainProgress(progressRef.current, false, rules);
      nextRound(r + 1);
    }, rainTiming(speed, pace).roundMs);
  };

  const startGame = () => {
    if (standalone) {
      gameWordsRef.current = shuffle(mixedGameWords(difficultyRef.current, ROUNDS, shuffle));
      poolRef.current = [...new Set([...difficultyPool(difficultyRef.current), ...gameWordsRef.current])];
    } else {
      poolRef.current = VOCAB;
      gameWordsRef.current = shuffle(VOCAB).slice(0, ROUNDS);
    }
    setLevel(difficultyRef.current.level);
    setLevelUnlocked(false);
    startCallback.current?.(); nextRound(0);
  };

  useEffect(() => {
    if (standalone) {
      try { difficultyRef.current = normalizeDifficulty(JSON.parse(localStorage.getItem(DIFFICULTY_STORAGE_KEY) ?? "null")); } catch { difficultyRef.current = initialDifficulty(); }
    }
    startGame();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); if (speedTimerRef.current) clearTimeout(speedTimerRef.current); };
  }, []);

  const pick = (d: Drop) => {
    if (!target || lockedRef.current || done) return;
    if (d.word === target) {
      lockedRef.current = true;
      const speedBefore = progressRef.current.speed;
      progressRef.current = advanceRainProgress(progressRef.current, true, rules);
      play("correct");
      if (progressRef.current.speed > speedBefore) flashSpeedUp();
      if (!muted) speak(d.word.hebrew);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setHits(new Set([d.key]));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => nextRound(round + 1), 650);
    } else {
      progressRef.current = advanceRainProgress(progressRef.current, false, rules);
      play("tick"); // gentle sound only, no penalty
      setMisses((m) => new Set(m).add(d.key));
    }
  };

  const restart = () => { progressRef.current = initialRainProgress(); scoreRef.current = 0; setScore(0); setRound(0); setDone(false); if (speedTimerRef.current) clearTimeout(speedTimerRef.current); setSpeedFlash(0); startGame(); };

  return (
    <section className={cn("flex flex-col gap-4", standalone && "wordfall-game")}>
      {done && <Confetti pieces={120} />}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="text-muted-foreground"><ArrowRight className="h-4 w-4" /> חזרה</Button>
        <p className="text-sm font-semibold text-muted-foreground">{standalone && `שלב ${level + 1} · `}סיבוב {Math.min(round + 1, ROUNDS)}/{ROUNDS} · תפסת {score}</p>
      </div>

      {!done && target ? (
        <>
          <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-muted-foreground">{standalone ? "לתפוס את" : "תפסי את המילה בעברית שמתאימה ל־"}</p>
            <p dir="ltr" className="mt-1 font-display text-3xl font-black text-primary">{target.english}</p>
          </div>
          {/* reserved strip so the speed-up banner never covers a falling word */}
          <div className="relative flex h-12 items-center justify-center">
            {speedFlash > 0 && (
              <span key={speedFlash} aria-live="polite" className="animate-speed-up pointer-events-none inline-flex items-center gap-2 rounded-full border-2 border-accent-foreground bg-card px-4 py-1.5 font-display text-lg font-black text-accent-foreground shadow-[var(--shadow-pop)]">
                <Zap className="h-5 w-5 fill-accent-foreground" /> מגבירים קצב!
              </span>
            )}
          </div>
          <div className="relative h-80 overflow-hidden rounded-3xl border border-border bg-muted/50">
            {drops.map((d, i) => (
              <Button
                key={d.key}
                onClick={() => pick(d)}
                aria-label={d.word.hebrew}
                className={cn("absolute top-0 h-auto min-h-16 w-[31%] animate-word-fall whitespace-normal break-words rounded-2xl border-2 border-border bg-card px-1 py-3 font-hebrew text-2xl font-bold text-foreground shadow-sm transition active:scale-90",
                  hits.has(d.key) && "border-success bg-success text-success-foreground",
                  misses.has(d.key) && (standalone ? "border-secondary opacity-70" : "animate-shake border-destructive/50 opacity-60"))}
                style={{ right: `${d.lane * 34 + 1.5}%`, animationDelay: `${i * rainTiming(roundSpeed, pace).delaySeconds}s`, animationDuration: `${rainTiming(roundSpeed, pace).fallSeconds}s` }}
              >
                {d.word.hebrew}
              </Button>
            ))}
          </div>
          {!standalone && <p className="text-center text-xs text-muted-foreground">אין עונש על טעות — פשוט ממשיכים 😊</p>}
        </>
      ) : done ? (
        <div className="animate-in fade-in zoom-in-95 rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          {standalone ? <CloudRain className="mx-auto h-16 w-16 text-secondary" /> : <p className="text-6xl">🌧️✨</p>}
          <h2 className="mt-2 font-display text-3xl font-black">כל הכבוד!</h2>
          <p className="mt-1 text-muted-foreground">תפסת {score} מתוך {ROUNDS} מילים</p>
          {standalone && levelUnlocked && <p role="status" className="mt-3 font-display text-lg text-secondary">שלב {difficultyRef.current.level + 1} נפתח!</p>}
          <div className="mt-3 flex justify-center gap-1">
            {Array.from({ length: ROUNDS }, (_, i) => (
              <Heart key={i} className={cn("h-6 w-6", i < score ? "fill-primary text-primary" : "text-border")} />
            ))}
          </div>
          <Button onClick={restart} className="mt-6 h-14 w-full text-xl font-black shadow-[var(--shadow-pop)]"><RotateCcw className="h-5 w-5" /> עוד פעם</Button>
        </div>
      ) : null}
    </section>
  );
}
