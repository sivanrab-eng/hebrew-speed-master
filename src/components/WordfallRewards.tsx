import { Sparkles, Star } from "lucide-react";
import { collectedStars, streakCelebration } from "@/lib/wordfall-modes";
import { cn } from "@/lib/utils";

export function WordfallRewards({ catches, streak }: { catches: number; streak: number }) {
  const celebration = streakCelebration(streak);
  const stars = collectedStars(catches);
  return <div className="wordfall-rewards flex h-14 items-center justify-between gap-3 border-b border-border/60 px-1">
    <div aria-label={`${stars} כוכבים נאספו`} className="flex shrink-0 gap-2">{[0, 1, 2].map(i => <Star key={i} className={cn("h-6 w-6 text-border", i < stars && "fill-accent-foreground text-accent-foreground wordfall-score-pop")} />)}</div>
    <div role="status" className="min-w-0 text-sm font-bold text-secondary">{celebration ? <span key={streak} className="wordfall-score-pop flex items-center gap-2"><Sparkles className="h-4 w-4 shrink-0" />{celebration}</span> : <span className="text-muted-foreground">{catches === 0 ? "✦" : `+${Math.max(0, 3 - catches % 3)} עד הכוכב הבא`}</span>}</div>
  </div>;
}