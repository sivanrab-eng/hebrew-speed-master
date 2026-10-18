import { describe, expect, it } from "vitest";
import { completeDifficulty, difficultyPool, EVERYDAY_WORDS, initialDifficulty, INTRODUCTION_MS, normalizeDifficulty, WORDFALL_POOLS, repeatedGameWords, interleavedGameWords, needsIntroduction } from "@/lib/wordfall-difficulty";
import { VOCAB } from "@/lib/vocab";

describe("Wordfall vocabulary difficulty", () => {
  it("starts with rich source Hebrew and simple English", () => {
    const pool = difficultyPool(initialDifficulty());
    expect(pool.find(word => word.hebrew === "אמתלה")?.english).toBe("an excuse");
    expect(pool.some(word => word.hebrew === "בית")).toBe(false);
    expect(pool.some(word => word.hebrew === "כלב")).toBe(false);
  });
  it("unlocks the next tier after a single game with at least eight catches", () => {
    const first = completeDifficulty(initialDifficulty(), 8);
    expect(first).toEqual({ level: 1, wins: 0 });
    expect(completeDifficulty(first, 8)).toEqual({ level: 2, wins: 0 });
    expect(difficultyPool({ level: 1, wins: 0 })).not.toEqual(difficultyPool(initialDifficulty()));
  });
  it("holds a new word on screen long enough to read calmly", () => {
    expect(INTRODUCTION_MS).toBe(6000);
  });
  it("does not remove progress or promote on a lower score", () => {
    expect(completeDifficulty({ level: 2, wins: 1 }, 7)).toEqual({ level: 2, wins: 1 });
  });
  it("caps the final tier and rejects invalid saved progress", () => {
    expect(completeDifficulty({ level: 4, wins: 0 }, 10)).toEqual({ level: 4, wins: 0 });
    expect(normalizeDifficulty({ level: 99, wins: 1 })).toEqual(initialDifficulty());
    expect(normalizeDifficulty({ level: 1, wins: 1 })).toEqual({ level: 1, wins: 1 });
  });
  it("provides ten unique targets and unique unvocalized answers in each tier", () => {
    for (const pool of WORDFALL_POOLS) {
      expect(pool.length).toBeGreaterThanOrEqual(10);
      expect(new Set(pool.map(word => word.hebrew)).size).toBe(pool.length);
      expect(pool.every(word => !/[\u0591-\u05c7]/.test(word.hebrew))).toBe(true);
    }
  });
  it("preserves every rich source Hebrew label and simplifies meanings without altering other games", () => {
    const words = WORDFALL_POOLS.flat();
    expect(words.map(word => word.hebrew).sort()).toEqual(VOCAB.map(word => word.hebrew).sort());
    expect(words.find(word => word.hebrew === "כמיהה")?.english).toBe("a strong wish");
    expect(words.find(word => word.hebrew === "אמודאי")?.english).toBe("a diver");
    expect(words.every(word => word.english.trim().split(/\s+/).length <= 12)).toBe(true);
    expect(VOCAB.find(word => word.hebrew === "אמתלה")?.english).toBe("excuse; pretext");
  });
});
import { mixedGameWords as mix, WORDFALL_POOLS as P } from "@/lib/wordfall-difficulty";
describe("hard word mix", () => {
  const id = <T,>(a: T[]) => a;
  it.each([0, 1, 2, 3, 4])("interleaves rich and familiar targets without changing the batch at tier %i", level => {
    const batch = mix({ level, wins: 0 }, 10, id);
    const ordered = interleavedGameWords(batch, id);
    expect(ordered.map(word => word.hebrew).sort()).toEqual(batch.map(word => word.hebrew).sort());
    const minority = ordered.map((word, i) => ({ word, i })).filter(({ word }) => !EVERYDAY_WORDS.includes(word));
    expect(minority).toHaveLength(3);
    for (let i = 1; i < minority.length; i++) expect((minority[i]?.i ?? 0) - (minority[i - 1]?.i ?? 0)).toBeGreaterThan(1);
    expect(minority[2]?.i).toBeGreaterThanOrEqual(6);
  });
  it.each([0, 1, 2, 3, 4])("keeps a confidence mix at level %i", level => {
    const words = mix({ level, wins: 0 }, 10, id);
    expect(words).toHaveLength(10);
    expect(words.filter(word => EVERYDAY_WORDS.includes(word))).toHaveLength(7);
    expect(words.filter(word => P.flat().includes(word))).toHaveLength(3);
    expect(new Set(words.map(word => word.hebrew)).size).toBe(10);
    expect(words.every(word => word.english.trim().split(/\s+/).length <= 12)).toBe(true);
  });
  it.each([[0, 0], [1, 3], [2, 3], [3, 3]])("level %i has %i harder words in 10", (level, hard) => {
    const words = mix({ level, wins: 0 }, 10, id);
    const later = new Set(P.slice(level + 1).flat());
    expect(words).toHaveLength(10);
    expect(words.filter(w => later.has(w))).toHaveLength(hard);
  });
  it.each([0, 1, 2, 3, 4])("refreshes exactly five balanced targets on every replay at tier %i", level => {
    const progress = { level, wins: 0 };
    let previous = mix(progress, 10, id);
    for (let game = 1; game <= 6; game++) {
      const next = repeatedGameWords(progress, previous, game, 10, id);
      const oldLabels = new Set(previous.map(word => word.hebrew));
      const changed = next.filter(word => !oldLabels.has(word.hebrew));
      expect(changed).toHaveLength(5);
      expect(changed.filter(word => EVERYDAY_WORDS.includes(word))).toHaveLength(level === 0 ? 4 : 3);
      expect(changed.filter(word => !EVERYDAY_WORDS.includes(word))).toHaveLength(level === 0 ? 1 : 2);
       expect(next.filter(word => EVERYDAY_WORDS.includes(word))).toHaveLength(7);
      expect(new Set(next.map(word => word.hebrew)).size).toBe(10);
      const later = new Set(P.slice(level + 1).flat());
       expect(next.filter(word => later.has(word))).toHaveLength([0, 3, 3, 3, 0][level] ?? 0);
      previous = next;
    }
  });
  it("introduces rich words only on first encounter, never everyday targets", () => {
    const rich = P[0]?.[0];
    const easy = EVERYDAY_WORDS[0];
    if (!rich || !easy) throw new Error("Missing vocabulary");
    expect(needsIntroduction(rich, new Set())).toBe(true);
    expect(needsIntroduction(rich, new Set([rich.hebrew]))).toBe(false);
    expect(needsIntroduction(easy, new Set())).toBe(false);
  });
});
