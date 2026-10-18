export type CatchProgress = { points: number; streak: number; bestStreak: number; awarded: number };
// How long the Hebrew example sentence stays on screen after a new word is caught.
// It never holds the round: the rain keeps falling while it is shown and read.
export const SENTENCE_SHOW_MS = 4500;
export const initialCatchProgress = (): CatchProgress => ({ points: 0, streak: 0, bestStreak: 0, awarded: 0 });

export function advanceCatchProgress(progress: CatchProgress, caught: boolean): CatchProgress {
  if (!caught) return { ...progress, streak: 0, awarded: 0 };
  const streak = progress.streak + 1;
  const awarded = 100 + Math.min(streak - 1, 4) * 25;
  return { points: progress.points + awarded, streak, bestStreak: Math.max(progress.bestStreak, streak), awarded };
}
