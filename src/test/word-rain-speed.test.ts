import { describe, expect, it } from "vitest";
import {
  advanceRainProgress,
  ARCADE_PACE,
  ARCADE_RULES,
  initialRainProgress,
  rainTiming,
  STANDALONE_PACE,
  STANDALONE_RULES,
} from "@/lib/word-rain-speed";

describe("Word rain speed", () => {
  it("increases speed by 10% only at each three consecutive catches", () => {
    let progress = initialRainProgress();
    for (let i = 0; i < 2; i++) progress = advanceRainProgress(progress, true, ARCADE_RULES);
    expect(progress.speed).toBe(1);
    progress = advanceRainProgress(progress, true, ARCADE_RULES);
    expect(progress.speed).toBeCloseTo(1.1);
    for (let i = 0; i < 3; i++) progress = advanceRainProgress(progress, true, ARCADE_RULES);
    expect(progress.speed).toBeCloseTo(1.21);
    expect(rainTiming(1.1, ARCADE_PACE).fallSeconds).toBeCloseTo(5 / 1.1);
    expect(rainTiming(1.1, ARCADE_PACE).roundMs).toBeCloseTo(6000 / 1.1);
  });
  it("a wrong or missed word resets the streak without reducing earned speed", () => {
    const broken = advanceRainProgress({ streak: 7, speed: 1.1 }, false, ARCADE_RULES);
    expect(broken).toEqual({ streak: 0, speed: 1.1 });
    let progress = broken;
    for (let i = 0; i < 2; i++) progress = advanceRainProgress(progress, true, ARCADE_RULES);
    expect(progress.speed).toBe(1.1);
    expect(advanceRainProgress(progress, true, ARCADE_RULES).speed).toBeCloseTo(1.21);
  });
  it("a new game starts at normal speed with no streak", () => {
    expect(initialRainProgress()).toEqual({ streak: 0, speed: 1 });
  });
  it("Wordfall falls slower and never raises its speed, however long the streak", () => {
    expect(rainTiming(1, STANDALONE_PACE)).toEqual({ fallSeconds: 7, delaySeconds: 1.2, roundMs: 10000 });
    let progress = initialRainProgress();
    for (let i = 0; i < 9; i++) progress = advanceRainProgress(progress, true, STANDALONE_RULES);
    expect(progress.streak).toBe(9);
    expect(progress.speed).toBe(1);
    expect(rainTiming(progress.speed, STANDALONE_PACE).fallSeconds).toBe(7);
    expect(rainTiming(1, ARCADE_PACE).fallSeconds).toBe(5);
  });
});
