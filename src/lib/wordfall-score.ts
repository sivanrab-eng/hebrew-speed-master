export type CatchProgress = { points: number; streak: number; bestStreak: number; awarded: number };
// Release a sentence freeze when audio fails; healthy speech waits for its end.
export const SENTENCE_FALLBACK_MS = 4000;
export const initialCatchProgress = (): CatchProgress => ({ points: 0, streak: 0, bestStreak: 0, awarded: 0 });

export function advanceCatchProgress(progress: CatchProgress, caught: boolean): CatchProgress {
  if (!caught) return { ...progress, streak: 0, awarded: 0 };
  const streak = progress.streak + 1;
  const awarded = 100 + Math.min(streak - 1, 4) * 25;
  return { points: progress.points + awarded, streak, bestStreak: Math.max(progress.bestStreak, streak), awarded };
}
