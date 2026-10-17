import { describe, expect, it } from "vitest";
import { completeDifficulty, difficultyPool, initialDifficulty, normalizeDifficulty, WORDFALL_POOLS } from "@/lib/wordfall-difficulty";
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
  it.each([[0, 2], [1, 3], [2, 4], [3, 6]])("level %i has %i harder words in 10", (level, hard) => {
    const words = mix({ level, wins: 0 }, 10, id);
    const later = new Set(P.slice(level + 1).flat());
    expect(words).toHaveLength(10);
    expect(words.filter(w => later.has(w))).toHaveLength(hard);
  });
});
