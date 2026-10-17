import { describe, expect, it } from "vitest";
import { completeDifficulty, difficultyPool, initialDifficulty, normalizeDifficulty, WORDFALL_POOLS } from "@/lib/wordfall-difficulty";

describe("Wordfall vocabulary difficulty", () => {
  it("starts with everyday words and no advanced source words", () => {
    const pool = difficultyPool(initialDifficulty());
    expect(pool.find(word => word.hebrew === "בית")?.english).toBe("house");
    expect(pool.find(word => word.hebrew === "כלב")?.english).toBe("dog");
    expect(pool.some(word => word.hebrew === "אמתלה")).toBe(false);
  });
  it("unlocks only one tier after two games with at least eight catches", () => {
    const first = completeDifficulty(initialDifficulty(), 8);
    expect(first).toEqual({ level: 0, wins: 1 });
    expect(completeDifficulty(first, 8)).toEqual({ level: 1, wins: 0 });
    expect(difficultyPool({ level: 1, wins: 0 }).find(word => word.hebrew === "מטבח")?.english).toBe("kitchen");
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
});