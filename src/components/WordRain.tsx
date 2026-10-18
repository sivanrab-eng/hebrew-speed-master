import { useEffect, useRef, useState } from "react";
import { ArrowRight, CloudRain, Flame, Heart, RotateCcw, Trophy, Volume2, Zap } from "lucide-react";
import { VOCAB, cancelSpeech, speak, speakHebrew, speakPair, type Word } from "@/lib/vocab";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";
import { Confetti } from "./Confetti";
import { Button } from "@/components/ui/button";
import { advanceRainProgress, ARCADE_PACE, ARCADE_RULES, initialRainProgress, rainTiming, STANDALONE_PACE, STANDALONE_RULES } from "@/lib/word-rain-speed";
import { completeDifficulty, initialDifficulty, repeatedGameWords, needsIntroduction, INTRODUCTION_MS } from "@/lib/wordfall-difficulty";
import { advanceCatchProgress, initialCatchProgress, SENTENCE_MS, SENTENCE_SPEAK_BUFFER_MS, SENTENCE_SPEAK_FALLBACK_MS } from "@/lib/wordfall-score";
import { getWordfallSentence, type WordfallSentence as Sentence } from "@/lib/wordfall-sentences";
import { WordfallSentence, SentenceText } from "./WordfallSentence";
import { WordfallCatch } from "./WordfallCatch";

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
  const catchRef = useRef(initialCatchProgress());
  const [catchProgress, setCatchProgress] = useState(initialCatchProgress);
  const [sentence, setSentence] = useState<Sentence | null>(null);
  const [readingHeld, setReadingHeld] = useState(false);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  const [review, setReview] = useState<Word[]>([]);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);
  const lockedRef = useRef(false);
  const progressRef = useRef(initialRainProgress());
  const difficultyRef = useRef(initialDifficulty());
  const gameWordsRef = useRef<Word[]>([]);
  const batchRef = useRef<Word[]>([]);
  const completedGamesRef = useRef(0);
  const introducedRef = useRef(new Set<string>());
  const [introducing, setIntroducing] = useState(false);
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
    if (standalone) cancelSpeech();
    setSentence(null); setReadingHeld(false); setBurst(null);
    setRound(r);
    lockedRef.current = false;
    setIntroducing(false);
    if (r >= ROUNDS) {
      if (standalone) {
        const next = completeDifficulty(difficultyRef.current, scoreRef.current);
        setLevelUnlocked(next.level > difficultyRef.current.level);
        completedGamesRef.current += 1;
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
    if (timerRef.current) clearTimeout(timerRef.current);
    const beginFall = () => {
      setIntroducing(false);
      lockedRef.current = false;
      setDrops(lanes.map((w, i) => ({ word: w, lane: i, key: `${r}-${w.hebrew}` })));
      // The full catch window starts only after the new-word introduction.
      timerRef.current = setTimeout(() => {
        if (standalone) {
          catchRef.current = advanceCatchProgress(catchRef.current, false);
          setCatchProgress(catchRef.current);
        }
        progressRef.current = advanceRainProgress(progressRef.current, false, rules);
        nextRound(r + 1);
      }, rainTiming(speed, pace).roundMs);
    };
    if (standalone && needsIntroduction(word, introducedRef.current)) {
      introducedRef.current.add(word.hebrew);
      lockedRef.current = true;
      setIntroducing(true);
      setDrops([]);
      // Read the new word aloud: Hebrew first, then the simple English meaning.
      if (!muted) speakPair(word.hebrew, word.english);
      timerRef.current = setTimeout(beginFall, INTRODUCTION_MS);
    } else beginFall();
  };

  const startGame = () => {
    if (standalone) {
      batchRef.current = repeatedGameWords(difficultyRef.current, batchRef.current, completedGamesRef.current, ROUNDS, shuffle);
      gameWordsRef.current = shuffle(batchRef.current);
      // Keep distractors familiar too, rather than importing the entire rich tier.
      poolRef.current = gameWordsRef.current;
    } else {
      poolRef.current = VOCAB;
      gameWordsRef.current = shuffle(VOCAB).slice(0, ROUNDS);
    }
    setLevel(difficultyRef.current.level);
    setLevelUnlocked(false);
    startCallback.current?.(); nextRound(0);
  };

  useEffect(() => {
    difficultyRef.current = initialDifficulty();
    startGame();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); if (speedTimerRef.current) clearTimeout(speedTimerRef.current); if (standalone) cancelSpeech(); };
  }, []);

  const pick = (d: Drop, element: HTMLButtonElement) => {
    if (!target || lockedRef.current || done) return;
    if (d.word === target) {
      lockedRef.current = true;
      const speedBefore = progressRef.current.speed;
      progressRef.current = advanceRainProgress(progressRef.current, true, rules);
      if (standalone) {
        catchRef.current = advanceCatchProgress(catchRef.current, true);
        setCatchProgress(catchRef.current);
        if (!muted) sfx.catchNeon?.(catchRef.current.streak);
        const field = fieldRef.current?.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        if (field && field.width > 0 && field.height > 0) setBurst({ x: (rect.left + rect.width / 2 - field.left) / field.width * 100, y: (rect.top + rect.height / 2 - field.top) / field.height * 100 });
      } else play("correct");
      if (progressRef.current.speed > speedBefore) flashSpeedUp();
      // Only a word the player met on the "טיפה חדשה!" card gets the sentence stop;
      // a familiar word is simply heard once and the rain keeps falling.
      const isNew = standalone && introducedRef.current.has(d.word.hebrew);
      const example = isNew ? getWordfallSentence(d.word.hebrew) : undefined;
      if (!muted && !example) speak(d.word.hebrew);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setHits(new Set([d.key]));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (example) {
        setReview(words => [...words.filter(word => word.hebrew !== d.word.hebrew), d.word]);
        timerRef.current = setTimeout(() => {
          setDrops([]); setSentence(example); setReadingHeld(false);
          holdSentenceReading(example, () => nextRound(round + 1));
        }, 450);
      } else timerRef.current = setTimeout(() => nextRound(round + 1), 650);
    } else {
      if (standalone) {
        catchRef.current = advanceCatchProgress(catchRef.current, false);
        setCatchProgress(catchRef.current);
      }
      progressRef.current = advanceRainProgress(progressRef.current, false, rules);
      play("tick"); // gentle sound only, no penalty
      setMisses((m) => new Set(m).add(d.key));
    }
  };

  // Holds the sentence card until its Hebrew reading ends (or a fallback cap),
  // so the auto-advance never cuts the reading mid-way.
  const holdSentenceReading = (example: Sentence, goNext: () => void) => {
    if (muted) {
      timerRef.current = setTimeout(goNext, SENTENCE_MS);
      return;
    }
    speakHebrew(example.hebrew.replace(/[[\]]/g, ""), () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(goNext, SENTENCE_SPEAK_BUFFER_MS);
    }, SENTENCE_SPEAK_FALLBACK_MS);
  };

  const continueReading = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    nextRound(round + 1);
  };
  const toggleReadingHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (readingHeld) timerRef.current = setTimeout(() => nextRound(round + 1), SENTENCE_MS);
    else cancelSpeech();
    setReadingHeld(!readingHeld);
  };

  const restart = (advance = false) => {
    if (advance && standalone && levelUnlocked) {
      difficultyRef.current = completeDifficulty(difficultyRef.current, scoreRef.current);
      batchRef.current = [];
      completedGamesRef.current = 0;
    }
    progressRef.current = initialRainProgress(); scoreRef.current = 0; setScore(0); setRound(0); setDone(false);
    catchRef.current = initialCatchProgress(); setCatchProgress(catchRef.current); setReview([]);
    if (speedTimerRef.current) clearTimeout(speedTimerRef.current);
    setSpeedFlash(0); startGame();
  };

  return (
    <section className={cn("flex flex-col gap-4", standalone && "wordfall-game")}>
      {done && <Confetti pieces={120} />}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="text-muted-foreground"><ArrowRight className="h-4 w-4" /> חזרה</Button>
        <p className="text-sm font-semibold text-muted-foreground">{standalone && `שלב ${level + 1} · `}סיבוב {Math.min(round + 1, ROUNDS)}/{ROUNDS} · תפסת {score}</p>
      </div>
      {standalone && !done && <>
        <div className="flex items-center justify-between border-y border-border/60 py-3">
          <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent-foreground" /><span key={catchProgress.points} className="wordfall-score-pop font-display text-2xl tabular-nums text-accent-foreground">{catchProgress.points}</span><span className="text-xs text-muted-foreground">נקודות</span></div>
          <div className={cn("flex items-center gap-2 text-muted-foreground", catchProgress.streak >= 3 && "text-secondary")}><Flame className="h-5 w-5" /><span className="text-sm font-bold">רצף {catchProgress.streak}</span></div>
        </div>
        <div className="flex h-1.5 gap-1" aria-hidden="true">{Array.from({ length: ROUNDS }, (_, i) => <span key={i} className={cn("flex-1 rounded-sm bg-muted", i < round && "bg-secondary", i === round && "bg-primary")} />)}</div>
      </>}

      {!done && target ? (
        <>
          <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-muted-foreground">{standalone ? "לתפוס את" : "תפסי את המילה בעברית שמתאימה ל־"}</p>
            <p dir="ltr" className="mt-1 font-display text-3xl font-black text-primary">{target.english}</p>
          </div>
          {/* arcade only: the reserved strip keeps the banner off the falling words */}
          {!standalone && (
            <div className="relative flex h-12 items-center justify-center">
              {speedFlash > 0 && (
                <span key={speedFlash} aria-live="polite" className="animate-speed-up pointer-events-none inline-flex items-center gap-2 rounded-full border-2 border-accent-foreground bg-card px-4 py-1.5 font-display text-lg font-black text-accent-foreground shadow-[var(--shadow-pop)]">
                  <Zap className="h-5 w-5 fill-accent-foreground" /> מגבירים קצב!
                </span>
              )}
            </div>
          )}
          <div ref={fieldRef} className={cn("relative h-80 overflow-hidden rounded-3xl border border-border bg-muted/50", standalone && "wordfall-field", standalone && burst && "wordfall-field-caught")}>
            {standalone && burst && <WordfallCatch x={burst.x} y={burst.y} />}
            {standalone && sentence && target && <WordfallSentence label={target.hebrew} sentence={sentence} points={catchProgress.awarded} streak={catchProgress.streak} held={readingHeld} muted={muted} onHold={toggleReadingHold} onNext={continueReading} />}
            {introducing && target && (
              <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <CloudRain className="h-9 w-9 text-secondary" />
                <p className="font-display text-lg text-secondary">טיפה חדשה!</p>
                <p className="break-words font-hebrew text-4xl font-bold text-foreground">{target.hebrew}</p>
                <p dir="ltr" className="text-xl text-primary">{target.english}</p>
                <Button variant="ghost" onClick={() => !muted && speakPair(target.hebrew, target.english)} className="gap-2 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4" /> שמיעה חוזרת
                </Button>
              </div>
            )}
            {drops.map((d, i) => (
              <Button
                key={d.key}
                onClick={(event) => pick(d, event.currentTarget)}
                aria-label={d.word.hebrew}
                className={cn("absolute top-0 h-auto min-h-16 w-[31%] animate-word-fall whitespace-normal break-words rounded-2xl border-2 border-border bg-card px-1 py-3 font-hebrew text-2xl font-bold text-foreground shadow-sm transition active:scale-90",
                  standalone && "wordfall-drop",
                  standalone && burst && "wordfall-drop-paused",
                  hits.has(d.key) && "border-success bg-success text-success-foreground",
                  standalone && hits.has(d.key) && "wordfall-drop-caught",
                  misses.has(d.key) && (standalone ? "border-secondary opacity-70" : "animate-shake border-destructive/50 opacity-60"))}
                style={{ right: `${d.lane * 34 + 1.5}%`, animationDelay: `${i * rainTiming(roundSpeed, pace).delaySeconds}s`, animationDuration: `${rainTiming(roundSpeed, pace).fallSeconds}s` }}
              >
                <span className={standalone ? "wordfall-word-label" : undefined}>{d.word.hebrew}</span>
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
          {standalone && <div className="my-5 grid grid-cols-2 divide-x divide-x-reverse divide-border"><div><p className="font-display text-3xl tabular-nums text-accent-foreground">{catchProgress.points}</p><p className="text-xs text-muted-foreground">נקודות</p></div><div><p className="font-display text-3xl tabular-nums text-secondary">{catchProgress.bestStreak}</p><p className="text-xs text-muted-foreground">הרצף הכי טוב</p></div></div>}
          {standalone && levelUnlocked && <p role="status" className="wordfall-score-pop mt-3 font-display text-lg text-secondary">שלב {level + 2} זמין!</p>}
          <div className="mt-3 flex justify-center gap-1">
            {Array.from({ length: ROUNDS }, (_, i) => (
              <Heart key={i} className={cn("h-6 w-6", i < score ? "fill-primary text-primary" : "text-border")} />
            ))}
          </div>
          <Button onClick={() => restart()} className="mt-6 h-14 w-full text-xl font-black shadow-[var(--shadow-pop)]"><RotateCcw className="h-5 w-5" /> עוד פעם</Button>
          {standalone && levelUnlocked && <Button variant="outline" onClick={() => restart(true)} className="mt-3 h-12 w-full text-lg"><Zap className="h-5 w-5" /> לשלב {level + 2}</Button>}
        </div>
      ) : null}
      {standalone && done && review.length > 0 && <div className="space-y-5 border-t border-border pt-5"><h3 className="font-display text-lg text-secondary">טיפות שאספת</h3>{review.slice(0, 3).map(word => {
        const example = getWordfallSentence(word.hebrew);
        return example ? <div key={word.hebrew} className="border-b border-border/50 pb-5"><p className="mb-2 font-bold text-primary">{word.hebrew}</p><SentenceText sentence={example} /></div> : null;
      })}</div>}
    </section>
  );
}
