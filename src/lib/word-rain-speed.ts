export type RainProgress = { streak: number; speed: number };
export const initialRainProgress = (): RainProgress => ({ streak: 0, speed: 1 });

/** How long a word takes to fall, the gap between lanes, and how long a round may last. */
export type RainPace = { fallSeconds: number; delaySeconds: number; roundMs: number };
export const ARCADE_PACE: RainPace = { fallSeconds: 5, delaySeconds: 0.9, roundMs: 6000 };
export const STANDALONE_PACE: RainPace = { fallSeconds: 7, delaySeconds: 1.2, roundMs: 10000 };

/** Consecutive catches needed to raise the speed. null keeps the speed fixed for the whole game. */
export type RainRules = { speedUpEvery: number | null };
export const ARCADE_RULES: RainRules = { speedUpEvery: 3 };
export const STANDALONE_RULES: RainRules = { speedUpEvery: null };

export function advanceRainProgress(
  progress: RainProgress,
  correct: boolean,
  rules: RainRules = ARCADE_RULES,
): RainProgress {
  if (!correct) return { ...progress, streak: 0 };
  const streak = progress.streak + 1;
  const jumped = rules.speedUpEvery !== null && streak % rules.speedUpEvery === 0;
  return { streak, speed: jumped ? progress.speed * 1.1 : progress.speed };
}

export function rainTiming(speed: number, pace: RainPace = ARCADE_PACE) {
  return {
    fallSeconds: pace.fallSeconds / speed,
    delaySeconds: pace.delaySeconds / speed,
    roundMs: pace.roundMs / speed,
  };
}
