import { Volume2 } from "lucide-react";
import { sentenceParts, speak, type Word } from "@/lib/vocab";

export function WordDetails({ w, showHeader = true }: { w: Word; showHeader?: boolean }) {
  const s = sentenceParts(w);
  return (
    <div className="flex flex-col gap-3 text-right">
      {showHeader && (
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-hebrew text-3xl font-bold">{w.hebrew}</p>
            <p dir="ltr" className="text-right text-sm font-semibold text-muted-foreground">{w.english}</p>
          </div>
          <SpeakBtn text={w.hebrew} />
        </div>
      )}
      {w.definition && <p className="font-hebrew text-xl leading-relaxed">{w.definition}</p>}
      {w.exampleSentenceHebrew && <div className="rounded-2xl bg-background/60 p-3">
        <p className="font-hebrew text-xl leading-relaxed">{s.before}<mark className="rounded bg-primary/20 px-1 font-bold text-foreground">{s.word}</mark>{s.after}</p>
        <p dir="ltr" className="mt-1 text-left text-sm italic text-muted-foreground">{w.exampleSentenceEnglish}</p>
      </div>}
      {w.root && <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-secondary/15 px-3 py-1 font-bold text-secondary">שורש: {w.root}</span>
      </div>}
      <Chips label="נרדפות" items={w.synonyms} cls="bg-success/15 text-success" />
      <Chips label="הפכים" items={w.antonyms} cls="bg-destructive/10 text-destructive" />
    </div>
  );
}

function Chips({ label, items, cls }: { label: string; items: string[]; cls: string }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-muted-foreground">{label}:</span>
      {items.map((x) => <span key={x} className={`rounded-full px-3 py-0.5 font-hebrew text-lg ${cls}`}>{x}</span>)}
    </div>
  );
}

export function SpeakBtn({ text }: { text: string }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); speak(text); }} aria-label="השמע הגייה"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card transition hover:border-primary">
      <Volume2 className="h-5 w-5 text-secondary" />
    </button>
  );
}
