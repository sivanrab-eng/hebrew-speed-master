import { Sparkles } from "lucide-react";
import { splitHighlightedSentence, type WordfallSentence as Sentence } from "@/lib/wordfall-sentences";

// Hebrew only: the caught word is highlighted inside a short everyday sentence.
export function SentenceText({ sentence }: { sentence: Sentence }) {
  const parts = splitHighlightedSentence(sentence.hebrew);
  return <p dir="rtl" className="text-xl font-medium leading-relaxed sm:text-2xl">{parts.before}<mark className="rounded-sm bg-secondary/15 px-1 font-bold text-secondary">{parts.target}</mark>{parts.after}</p>;
}

// A strip under the falling field — it never covers a word and never stops the round.
export function WordfallSentence({ label, sentence, points, streak }: { label: string; sentence: Sentence; points: number; streak: number }) {
  return <div dir="rtl" aria-label="משפט אחרי תפיסה" className="wordfall-sentence rounded-2xl border border-secondary/40 bg-card/95 px-4 py-3 text-center shadow-[var(--shadow-card)]">
    <div className="mb-1 flex items-center justify-center gap-2 text-xs font-bold text-accent-foreground"><Sparkles className="h-3.5 w-3.5" /><span>+{points}</span>{streak >= 3 && <span>· רצף {streak}!</span>}</div>
    <p className="mb-1 break-words font-display text-2xl text-secondary">{label}</p>
    <div className="mx-auto max-w-sm"><SentenceText sentence={sentence} /></div>
  </div>;
}
