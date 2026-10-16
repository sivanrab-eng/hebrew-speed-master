import { useState } from "react";
import { ArrowRight, Brain, CloudRain, Gamepad2 } from "lucide-react";
import { MemoryMatch } from "./MemoryMatch";
import { WordRain } from "./WordRain";

type Mini = "hub" | "memory" | "rain";

export function Arcade({ onExit, muted }: { onExit: () => void; muted: boolean }) {
  const [mini, setMini] = useState<Mini>("hub");

  if (mini === "memory") return <MemoryMatch muted={muted} onExit={() => setMini("hub")} />;
  if (mini === "rain") return <WordRain muted={muted} onExit={() => setMini("hub")} />;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowRight className="h-4 w-4" /> חזרה</button>
        <p className="flex items-center gap-1 text-sm font-bold text-muted-foreground"><Gamepad2 className="h-4 w-4 text-primary" /> ארקייד</p>
      </div>
      <div className="animate-in fade-in zoom-in-95 rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
        <p className="text-5xl">🎮</p>
        <h2 className="mt-2 font-display text-3xl font-black">ארקייד המילים</h2>
        <p className="mt-1 text-muted-foreground">משחקים קטנים ומהנים — בלי לחץ, בלי עונשים</p>
      </div>
      <button onClick={() => setMini("memory")} className="group flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 text-right shadow-[var(--shadow-card)] transition hover:scale-[1.02] hover:border-primary active:scale-95">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Brain className="h-7 w-7" /></span>
        <span>
          <span className="block font-display text-xl font-black">ממורי מילים</span>
          <span className="block text-sm text-muted-foreground">הפכי קלפים ומצאי זוגות: אנגלית ↔ עברית</span>
        </span>
      </button>
      <button onClick={() => setMini("rain")} className="group flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 text-right shadow-[var(--shadow-card)] transition hover:scale-[1.02] hover:border-primary active:scale-95">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><CloudRain className="h-7 w-7" /></span>
        <span>
          <span className="block font-display text-xl font-black">גשם מילים</span>
          <span className="block text-sm text-muted-foreground">מילים נופלות מהשמיים — תפסי את הנכונה!</span>
        </span>
      </button>
    </section>
  );
}
