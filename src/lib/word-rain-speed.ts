export type RainProgress = { streak: number; speed: number };
export const initialRainProgress = (): RainProgress => ({ streak: 0, speed: 1 });

export function advanceRainProgress(progress: RainProgress, correct: boolean): RainProgress {
  if (!correct) return { ...progress, streak: 0 };
  const streak = progress.streak + 1;
  return { streak, speed: streak % 5 === 0 ? progress.speed * 1.1 : progress.speed };
}

export function rainTiming(speed: number) {
  return { fallSeconds: 5 / speed, delaySeconds: 0.9 / speed, roundMs: 6000 / speed };
}