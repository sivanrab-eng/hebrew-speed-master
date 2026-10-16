import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Zap, Timer, Trophy, Volume2, VolumeX, Flame, RotateCcw, Target, BookOpen, Check, X, Lightbulb, Layers, Github, Users, Gamepad2 } from "lucide-react";
import { VOCAB, sentenceBlank, type Word } from "@/lib/vocab";
import { WordDetails } from "@/components/WordDetails";
import { StudyMode } from "@/components/StudyMode";
import { GithubGuide } from "@/components/GithubGuide";
import { Multiplayer } from "@/components/Multiplayer";
import { Arcade } from "@/components/Arcade";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Speed Vocab – מחוננים ז' | משחק אוצר מילים" },
      { name: "description", content: "משחק מהירות של 60 שניות לתרגול אוצר מילים עברי מנוקד למבחני מחוננים כיתה ז'." },
      { property: "og:title", content: "Speed Vocab – מחוננים ז'" },
      { property: "og:description", content: "60 שניות, 4 אפשרויות, רצפים ומכפילים – תרגול אוצר מילים למחוננים." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

const DURATION = 60;
const BASE = 10;
type Phase = "start" | "play" | "end" | "study" | "guide" | "multi" | "arcade";
type Q = { word: Word; options: Word[] };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };
const multFor = (s: number) => (s >= 10 ? 4 : s >= 6 ? 3 : s >= 3 ? 2 : 1);

function makeQ(prev?: Word): Q {
  const pool = VOCAB.filter((w) => w !== prev);
  const word = pool[Math.floor(Math.random() * pool.length)]!;
  const distractors = shuffle(VOCAB.filter((w) => w !== word)).slice(0, 3);
  return { word, options: shuffle([word, ...distractors]) };
}

function Game() {
  const [phase, setPhase] = useState<Phase>("start");
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [mistakes, setMistakes] = useState<{ word: Word; picked: Word }[]>([]);
  const [q, setQ] = useState<Q | null>(null);
  const [picked, setPicked] = useState<Word | null>(null);
  const [pop, setPop] = useState<string | null>(null);
  const [high, setHigh] = useState(0);
  const [newHigh, setNewHigh] = useState(false);
  const [hint, setHint] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const play = (k: keyof typeof sfx) => { if (!mutedRef.current) sfx[k](); };

  useEffect(() => { setHigh(Number(localStorage.getItem("sv-high") || 0)); setMuted(localStorage.getItem("sv-muted") === "1"); }, []);
  useEffect(() => { localStorage.setItem("sv-muted", muted ? "1" : "0"); }, [muted]);

  const start = () => {
    sfx.unlock();
    setScore(0); setStreak(0); setBestStreak(0); setCorrect(0); setAnswered(0); setMistakes([]);
    setTime(DURATION); setPicked(null); setHint(false); setNewHigh(false); setQ(makeQ()); setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    if (time <= 0) { setPhase("end"); play("end"); return; }
    if (time <= 10) play("tick");
  }, [time, phase]);

  useEffect(() => {
    if (phase !== "end") return;
    if (score > high) { setHigh(score); setNewHigh(true); localStorage.setItem("sv-high", String(score)); }
  }, [phase]);

  const answer = useCallback((opt: Word) => {
    if (!q || picked || phase !== "play") return;
    setPicked(opt);
    setAnswered((a) => a + 1);
    if (opt === q.word) {
      const ns = streak + 1; const m = multFor(ns); const pts = BASE * m;
      setStreak(ns); setBestStreak((b) => Math.max(b, ns)); setScore((s) => s + pts); setCorrect((c) => c + 1);
      setPop(`+${pts}${m > 1 ? ` ×${m}` : ""}`); play("correct");
    } else {
      setStreak(0); setMistakes((ms) => [...ms, { word: q.word, picked: opt }]); setPop(null); play("wrong");
    }
    setTimeout(() => { setPicked(null); setHint(false); setQ((cur) => makeQ(cur?.word)); }, opt === q.word ? 350 : 750);
  }, [q, picked, phase, streak]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (phase !== "play") return; if (e.key === "h" || e.key === "ח") { setHint(true); return; } const n = Number(e.key); if (q && n >= 1 && n <= 4) answer(q.options[n - 1]!); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [q, answer, phase]);

  const mult = multFor(streak);
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;

  return (
    <main dir="rtl" className="min-h-screen bg-background bg-[image:var(--gradient-bg)] px-4 py-6 font-sans text-foreground">
      <div className="mx-auto flex max-w-xl flex-col gap-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-xl font-black">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"><Zap className="h-5 w-5" /></span>
            Speed Vocab
          </div>
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "הפעל סאונד" : "השתק סאונד"} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:border-primary">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-secondary" />}
          </button>
        </header>

        {phase === "start" && (
          <section className="animate-in fade-in zoom-in-95 rounded-3xl border border-border bg-card p-7 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"><Zap className="h-10 w-10" /></div>
            <h1 className="font-display text-4xl font-black sm:text-5xl">מחוננים ז'</h1>
            <p className="mt-3 text-lg text-muted-foreground">מופיעה הגדרה באנגלית — בחרו את המילה העברית המתאימה. כמה שיותר, תוך 60 שניות!</p>
            <ul className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <li className="rounded-2xl bg-muted p-3"><Timer className="mx-auto mb-1 h-5 w-5 text-primary" />60 שניות</li>
              <li className="rounded-2xl bg-muted p-3"><Flame className="mx-auto mb-1 h-5 w-5 text-primary" />רצף = מכפיל עד ×4</li>
              <li className="rounded-2xl bg-muted p-3"><BookOpen className="mx-auto mb-1 h-5 w-5 text-primary" />{VOCAB.length} מילים</li>
            </ul>
            {high > 0 && <p className="mt-5 flex items-center justify-center gap-2 font-bold text-secondary"><Trophy className="h-5 w-5" /> השיא שלך: {high}</p>}
            <button onClick={start} className="mt-6 w-full rounded-2xl bg-primary py-4 text-xl font-black text-primary-foreground shadow-[var(--shadow-pop)] transition hover:scale-[1.02] active:scale-95"><span className="flex items-center justify-center gap-2"><Timer className="h-6 w-6" />אתגר 60 שניות</span></button>
            <button onClick={() => setPhase("study")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-secondary bg-card py-4 text-xl font-black text-secondary transition hover:scale-[1.02] active:scale-95"><Layers className="h-6 w-6" />מצב לימוד / כרטיסיות</button>
            <button onClick={() => setPhase("multi")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-card py-4 text-xl font-black text-primary transition hover:scale-[1.02] active:scale-95"><Users className="h-6 w-6" />משחק עם חברים (עד 4)</button>
            <button onClick={() => setPhase("guide")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-2 text-sm font-bold text-muted-foreground transition hover:text-primary"><Github className="h-4 w-4" /> איך מחברים את הפרויקט ל-GitHub?</button>
          </section>
        )}

        {phase === "play" && q && (
          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat icon={<Timer className="h-4 w-4" />} label="זמן" value={`${time}`} hot={time <= 10} />
              <Stat icon={<Target className="h-4 w-4" />} label="ניקוד" value={`${score}`} />
              <Stat icon={<Flame className="h-4 w-4" />} label={`רצף ${streak}`} value={`×${mult}`} hot={mult > 1} />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all duration-1000 ease-linear", time <= 10 ? "bg-destructive" : "bg-secondary")} style={{ width: `${(time / DURATION) * 100}%` }} />
            </div>
            <div key={q.word.hebrew + answered} className="relative animate-in fade-in slide-in-from-bottom-2 rounded-3xl border border-border bg-card px-5 py-8 text-center shadow-[var(--shadow-card)]">
              <p className="text-sm font-semibold text-muted-foreground">איזו מילה בעברית מתאימה ל־</p>
              <p dir="ltr" className="mt-3 font-display text-3xl font-black text-primary sm:text-4xl">{q.word.english}</p>
              {hint ? (
                <div className="mt-4 rounded-2xl bg-muted p-3 text-right">
                  <p className="font-hebrew text-xl leading-relaxed">{sentenceBlank(q.word)}</p>
                  <p dir="ltr" className="mt-1 text-left text-sm italic text-muted-foreground">{q.word.exampleSentenceEnglish}</p>
                </div>
              ) : (
                <button onClick={() => setHint(true)} disabled={!!picked} className="mx-auto mt-4 flex items-center gap-1 rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-bold transition hover:border-primary"><Lightbulb className="h-4 w-4 text-primary" /> רמז <span className="hidden text-xs text-muted-foreground sm:inline">(H)</span></button>
              )}
              {pop && picked && <span className="absolute left-4 top-3 animate-in fade-in slide-in-from-bottom-3 rounded-full bg-success px-3 py-1 text-sm font-black text-success-foreground">{pop}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o, i) => {
                const isRight = picked && o === q.word;
                const isWrong = picked === o && o !== q.word;
                return (
                  <button key={o.hebrew} onClick={() => answer(o)} disabled={!!picked}
                    className={cn("relative min-h-24 rounded-2xl border-2 border-border bg-card px-3 py-5 font-hebrew text-3xl font-bold leading-relaxed shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary active:scale-95 sm:text-4xl",
                      isRight && "scale-[1.03] border-success bg-success text-success-foreground",
                      isWrong && "animate-shake border-destructive bg-destructive text-destructive-foreground",
                      picked && !isRight && !isWrong && "opacity-50")}>
                    <span className="absolute right-2 top-1.5 hidden text-xs font-sans text-muted-foreground sm:block">{i + 1}</span>
                    {o.hebrew}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {phase === "study" && <StudyMode onExit={() => setPhase("start")} />}

        {phase === "multi" && <Multiplayer muted={muted} onExit={() => setPhase("start")} />}

        {phase === "guide" && <GithubGuide onExit={() => setPhase("start")} />}

        {phase === "end" && (
          <section className="animate-in fade-in zoom-in-95 flex flex-col gap-4">
            <div className="rounded-3xl border border-border bg-card p-7 text-center shadow-[var(--shadow-card)]">
              <Trophy className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-2 font-display text-3xl font-black">סיום המשחק!</h2>
              {newHigh && <p className="mt-2 inline-block rounded-full bg-primary px-4 py-1 text-sm font-black text-primary-foreground">🎉 שיא חדש!</p>}
              <p className="mt-4 font-display text-6xl font-black text-primary">{score}</p>
              <p className="text-muted-foreground">נקודות</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Mini label="נכונות" value={`${correct}`} />
                <Mini label="דיוק" value={`${accuracy}%`} />
                <Mini label="רצף שיא" value={`${bestStreak}`} />
                <Mini label="שיא אישי" value={`${high}`} />
              </div>
              <button onClick={start} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-xl font-black text-primary-foreground shadow-[var(--shadow-pop)] transition hover:scale-[1.02] active:scale-95"><RotateCcw className="h-5 w-5" /> שחק שוב</button>
              <button onClick={() => setPhase("study")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-secondary py-3 font-black text-secondary"><Layers className="h-5 w-5" /> למצב לימוד</button>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><BookOpen className="h-5 w-5 text-secondary" /> סקירת טעויות ({mistakes.length})</h3>
              {mistakes.length === 0 ? <p className="text-muted-foreground">אין טעויות — מושלם! 🌟</p> : (
                <ul className="flex flex-col gap-3">
                  {mistakes.map((m, i) => (
                    <li key={i} className="rounded-2xl bg-muted p-4">
                      <WordDetails w={m.word} />
                      <p className="mt-2 flex items-center gap-1 font-hebrew text-lg text-destructive"><X className="h-4 w-4" /><span className="line-through">{m.picked.hebrew}</span><span className="font-sans text-xs text-muted-foreground">(הבחירה שלך)</span></p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ icon, label, value, hot }: { icon: React.ReactNode; label: string; value: string; hot?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-3 text-center transition", hot && "border-primary bg-primary/10")}>
      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground">{icon}{label}</div>
      <div className={cn("font-display text-2xl font-black tabular-nums", hot && "text-primary")}>{value}</div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-muted p-3"><div className="font-display text-2xl font-black">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>;
}
