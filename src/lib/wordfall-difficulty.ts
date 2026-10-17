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

// Two strong completed games unlock one tier; mistakes never remove earned progress.
export function completeDifficulty(progress: DifficultyProgress, score: number): DifficultyProgress {
  if (score < 8 || progress.level >= WORDFALL_POOLS.length - 1) return progress;
  return progress.wins === 1 ? { level: progress.level + 1, wins: 0 } : { ...progress, wins: 1 };
}

export function difficultyPool(progress: DifficultyProgress): Word[] {
  return WORDFALL_POOLS[progress.level] ?? WORDFALL_POOLS[0] ?? [];
}