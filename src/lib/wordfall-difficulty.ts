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
// Standalone confidence words only; never modify the shared arcade vocabulary.
export const EVERYDAY_WORDS: Word[] = [
  ["בית", "a house"], ["כלב", "a dog"], ["חתול", "a cat"],
  ["מים", "water"], ["לחם", "bread"], ["שמש", "the sun"],
  ["ירח", "the moon"], ["ים", "the sea"], ["עץ", "a tree"],
  ["פרח", "a flower"], ["ספר", "a book"], ["כדור", "a ball"],
  ["שמח", "happy"], ["גדול", "big"], ["קטן", "small"],
  ["לשחק", "to play"], ["לרוץ", "to run"], ["לישון", "to sleep"],
  ["לאכול", "to eat"], ["לשתות", "to drink"],
].map(([hebrew = "", english = ""]) => ({
  hebrew, english, root: "", exampleSentenceHebrew: "", exampleSentenceEnglish: "", synonyms: [], antonyms: [],
}));
export const WORDFALL_WORDS = [...WORDFALL_POOLS.flat(), ...EVERYDAY_WORDS];
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
export const HARD_MIX = [0, 3, 4, 6, 0] as const;

export function mixedGameWords(progress: DifficultyProgress, rounds: number, shuffle: <T>(items: T[]) => T[]): Word[] {
  const easy = shuffle([...EVERYDAY_WORDS]).slice(0, Math.min(progress.level === 0 ? 7 : 3, rounds));
  const richRounds = rounds - easy.length;
  const easyLabels = new Set(EVERYDAY_WORDS.map(word => word.hebrew));
  const hardCount = Math.min(HARD_MIX[progress.level] ?? 0, richRounds);
  const later = WORDFALL_POOLS.slice(progress.level + 1).flat().filter(word => !easyLabels.has(word.hebrew));
  const hard = shuffle([...later]).slice(0, hardCount);
  const base = shuffle(difficultyPool(progress).filter(word => !easyLabels.has(word.hebrew))).slice(0, richRounds - hard.length);
  return [...easy, ...base, ...hard];
}

export function repeatedGameWords(progress: DifficultyProgress, previous: Word[], completedGames: number, rounds: number, shuffle: <T>(items: T[]) => T[]): Word[] {
  return previous.length === rounds && completedGames % 3 !== 0
    ? [...previous]
    : mixedGameWords(progress, rounds, shuffle);
}

// Randomize each category, then scatter the smaller category between the larger
// one. Replays retain the same batch, not the same order or a rich-word cluster.
export function interleavedGameWords(words: Word[], shuffle: <T>(items: T[]) => T[]): Word[] {
  const everyday = new Set(EVERYDAY_WORDS.map(word => word.hebrew));
  const easy = shuffle(words.filter(word => everyday.has(word.hebrew)));
  const rich = shuffle(words.filter(word => !everyday.has(word.hebrew)));
  const minority = easy.length < rich.length ? easy : rich;
  const majority = easy.length < rich.length ? rich : easy;
  if (!minority.length) return majority;
  const gaps: number[] = Array.from({ length: minority.length + 1 }, (_, i) => i > 0 && i < minority.length ? 1 : 0);
  const remaining = majority.length - minority.length + 1;
  const gapOrder = shuffle(gaps.map((_, i) => i));
  for (let i = 0; i < remaining; i++) {
    const gap = gapOrder[i % gapOrder.length];
    if (gap !== undefined) gaps[gap] = (gaps[gap] ?? 0) + 1;
  }
  let cursor = 0;
  return gaps.flatMap((size, i) => {
    const group = majority.slice(cursor, cursor + size);
    cursor += size;
    const word = minority[i];
    return word ? [...group, word] : group;
  });
}

export const needsIntroduction = (word: Word, introduced: Set<string>) =>
  !EVERYDAY_WORDS.some(easy => easy.hebrew === word.hebrew) && !introduced.has(word.hebrew);

export const INTRODUCTION_MS = 6000;