import { describe, expect, it } from "vitest";
import { collectedStars, streakCelebration } from "@/lib/wordfall-modes";

describe("Wordfall regular rewards", () => {
  it("collects a star for each three catches, capped at three", () => {
    expect([0, 2, 3, 6, 9, 10].map(collectedStars)).toEqual([0, 0, 1, 2, 3, 3]);
  });
  it("celebrates only streaks of three, five and eight", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(n => streakCelebration(n) !== null)).toEqual([3, 5, 8]);
  });
});