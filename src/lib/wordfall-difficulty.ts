import { VOCAB, type Word } from "./vocab";
import simpleVocabulary from "./wordfall-vocabulary.json";

const meanings: Record<string, { english: string; level: number }> = simpleVocabulary;
// Only standalone meanings change; keep original Hebrew and source details intact.
export const WORDFALL_POOLS: readonly Word[][] = Array.from({ length: 5 }, (_, level) =>
  VOCAB.flatMap(word => {
    const entry = meanings[word.hebrew];
    return entry?.level === level ? [{ ...word, english: entry.english }] : [];
  }),
);
export const WORDFALL_WORDS = WORDFALL_POOLS.flat();
export const DIFFICULTY_STORAGE_KEY = "wordfall-difficulty-v1";
export type DifficultyProgress = { level: number; wins: number };
export const initialDifficulty = (): DifficultyProgress => ({ level: 0, wins: 0 });

export function normalizeDifficulty(value: unknown): DifficultyProgress {
  if (!value || typeof value !== "object" || !("level" in value) || !("wins" in value)) return initialDifficulty();
  const { level, wins } = value;
  if (typeof level !== "number" || !Number.isInteger(level) || level < 0 || level >= WORDFALL_POOLS.length ||
    typeof wins !== "number" || !Number.isInteger(wins) || wins < 0 || wins > 1) return initialDifficulty();
  return { level, wins };
}

// One strong completed game (8+ catches) unlocks the next tier; mistakes never remove earned progress.
export function completeDifficulty(progress: DifficultyProgress, score: number): DifficultyProgress {
  if (score < 8 || progress.level >= WORDFALL_POOLS.length - 1) return progress;
  return { level: progress.level + 1, wins: 0 };
}

export function difficultyPool(progress: DifficultyProgress): Word[] {
  return WORDFALL_POOLS[progress.level] ?? WORDFALL_POOLS[0] ?? [];
}

// Harder words borrowed from later tiers per game, growing by tier (2 → 3 → 4 → 6; last tier is all hard).
export const HARD_MIX = [2, 3, 4, 6, 0] as const;

export function mixedGameWords(progress: DifficultyProgress, rounds: number, shuffle: <T>(items: T[]) => T[]): Word[] {
  const hardCount = Math.min(HARD_MIX[progress.level] ?? 0, rounds);
  const later = WORDFALL_POOLS.slice(progress.level + 1).flat();
  const hard = shuffle([...later]).slice(0, hardCount);
  const base = shuffle([...difficultyPool(progress)]).slice(0, rounds - hard.length);
  return [...base, ...hard];
}