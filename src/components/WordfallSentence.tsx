import { Pause, Play, ArrowLeft, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakPair } from "@/lib/vocab";
import { splitHighlightedSentence, type WordfallSentence as Sentence } from "@/lib/wordfall-sentences";

export function SentenceText({ sentence }: { sentence: Sentence }) {
  const parts = splitHighlightedSentence(sentence.hebrew);
  return <><p dir="rtl" className="text-xl font-medium leading-relaxed sm:text-2xl">{parts.before}<mark className="rounded-sm bg-secondary/15 px-1 font-bold text-secondary">{parts.target}</mark>{parts.after}</p><p dir="ltr" className="mt-3 text-base leading-relaxed text-muted-foreground">{sentence.english}</p></>;
}

export function WordfallSentence({ label, sentence, points, streak, held, muted, onHold, onNext }: { label: string; sentence: Sentence; points: number; streak: number; held: boolean; muted: boolean; onHold: () => void; onNext: () => void }) {
  return <div className="wordfall-sentence absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 px-5 text-center" aria-label="משפט אחרי תפיסה">
    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-accent-foreground"><Sparkles className="h-4 w-4" /><span>+{points}</span>{streak >= 3 && <span> · רצף {streak}!</span>}</div>
    <p className="mb-4 break-words font-display text-3xl text-secondary">{label}</p>
    <div className="w-full max-w-sm"><SentenceText sentence={sentence} /></div>
    <div className="mt-5 flex items-center gap-3">
      <Button variant="ghost" size="icon" title="שמיעת המשפט" aria-label="שמיעת המשפט" disabled={muted} onClick={() => { if (!held) onHold(); speakPair(sentence.hebrew.replace(/[\[\]]/g, ""), sentence.english); }}><Volume2 className="h-5 w-5" /></Button>
      <Button variant="ghost" size="icon" title={held ? "המשך אוטומטי" : "זמן לקרוא"} aria-label={held ? "המשך אוטומטי" : "זמן לקרוא"} onClick={onHold}>{held ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}</Button>
      <Button variant="outline" onClick={onNext}>ממשיכים <ArrowLeft className="h-4 w-4" /></Button>
    </div>
    {!held && <div className="absolute inset-x-0 bottom-0 h-1 bg-secondary/15"><div className="wordfall-reading-progress h-full bg-secondary" /></div>}
  </div>;
}