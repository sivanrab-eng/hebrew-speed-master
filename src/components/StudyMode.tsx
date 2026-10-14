import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, RotateCw, Check, RefreshCw, Shuffle } from "lucide-react";
import { VOCAB } from "@/lib/vocab";
import { cn } from "@/lib/utils";
import { WordDetails, SpeakBtn } from "./WordDetails";

type Status = "know" | "review";
type Filter = "all" | "review" | "new";
const KEY = "sv-study";

export function StudyMode({ onExit }: { onExit: () => void }) {
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [order, setOrder] = useState(() => VOCAB.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { try { setMarks(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { /* ignore */ } }, []);
  const save = (m: Record<string, Status>) => { setMarks(m); localStorage.setItem(KEY, JSON.stringify(m)); };

  const deck = useMemo(() => order.map((i) => VOCAB[i]!).filter((w) =>
    filter === "all" ? true : filter === "review" ? marks[w.hebrew] === "review" : !marks[w.hebrew]), [order, filter, marks]);
  const cur = deck[Math.min(idx, deck.length - 1)];
  const known = Object.values(marks).filter((v) => v === "know").length;
  const review = Object.values(marks).filter((v) => v === "review").length;

  const go = (d: number) => { if (!deck.length) return; setFlipped(false); setIdx((i) => (i + d + deck.length) % deck.length); };
  const mark = (s: Status) => { if (!cur) return; save({ ...marks, [cur.hebrew]: s }); setFlipped(false); if (filter === "all") go(1); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(1);
      else if (e.key === "ArrowRight") go(-1);
      else if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowRight className="h-4 w-4" /> חזרה</button>
        <p className="text-sm font-semibold text-muted-foreground"><span className="text-success">✓ {known}</span> · <span className="text-destructive">↻ {review}</span> · {VOCAB.length}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {([["all", "הכול"], ["review", "דורש חזרה"], ["new", "לא סומנו"]] as const).map(([f, l]) => (
          <button key={f} onClick={() => { setFilter(f); setIdx(0); setFlipped(false); }}
            className={cn("rounded-xl border-2 py-2 text-sm font-bold transition", filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}>{l}</button>
        ))}
      </div>

      {!cur ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground shadow-[var(--shadow-card)]">אין כרטיסיות בסינון הזה 🎉</div>
      ) : (
        <>
          <div onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0}
            className={cn("relative min-h-80 cursor-pointer rounded-3xl border-2 bg-card p-6 shadow-[var(--shadow-card)] transition animate-in fade-in",
              marks[cur.hebrew] === "know" ? "border-success" : marks[cur.hebrew] === "review" ? "border-destructive" : "border-border")} key={cur.hebrew + flipped}>
            <p className="absolute left-4 top-3 text-xs font-semibold text-muted-foreground">{Math.min(idx, deck.length - 1) + 1} / {deck.length}</p>
            {!flipped ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <p className="font-hebrew text-5xl font-bold sm:text-6xl">{cur.hebrew}</p>
                <SpeakBtn text={cur.hebrew} />
                <p className="flex items-center gap-1 text-sm text-muted-foreground"><RotateCw className="h-4 w-4" /> לחצו להיפוך</p>
              </div>
            ) : (
              <div className="pt-4">
                <WordDetails w={cur} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => mark("review")} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-destructive bg-card py-3 font-black text-destructive transition hover:bg-destructive hover:text-destructive-foreground"><RefreshCw className="h-5 w-5" /> דורש חזרה</button>
            <button onClick={() => mark("know")} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-success bg-card py-3 font-black text-success transition hover:bg-success hover:text-success-foreground"><Check className="h-5 w-5" /> יודע</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Nav onClick={() => go(-1)}><ArrowRight className="h-5 w-5" /> קודם</Nav>
            <Nav onClick={() => setFlipped((f) => !f)}><RotateCw className="h-5 w-5" /> הפוך</Nav>
            <Nav onClick={() => { setOrder((o) => [...o].sort(() => Math.random() - 0.5)); setIdx(0); setFlipped(false); }}><Shuffle className="h-5 w-5" /> ערבב</Nav>
            <Nav onClick={() => go(1)}>הבא <ArrowLeft className="h-5 w-5" /></Nav>
          </div>
          <p className="hidden text-center text-xs text-muted-foreground sm:block">מקלדת: חיצים למעבר · רווח להיפוך</p>
        </>
      )}
    </section>
  );
}

function Nav({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className="flex items-center justify-center gap-1 rounded-2xl border border-border bg-card py-3 text-sm font-bold transition hover:border-primary">{children}</button>;
}
