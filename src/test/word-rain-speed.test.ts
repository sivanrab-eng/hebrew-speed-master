import { describe, expect, it } from "vitest";
import { advanceRainProgress, initialRainProgress, rainTiming } from "@/lib/word-rain-speed";

describe("Word rain speed", () => {
  it("increases speed by 10% only at each three consecutive catches", () => {
    let progress = initialRainProgress();
    for (let i = 0; i < 2; i++) progress = advanceRainProgress(progress, true);
    expect(progress.speed).toBe(1);
    progress = advanceRainProgress(progress, true);
    expect(progress.speed).toBeCloseTo(1.1);
    for (let i = 0; i < 3; i++) progress = advanceRainProgress(progress, true);
    expect(progress.speed).toBeCloseTo(1.21);
    expect(rainTiming(1.1).fallSeconds).toBeCloseTo(5 / 1.1);
    expect(rainTiming(1.1).roundMs).toBeCloseTo(6000 / 1.1);
  });
  it("a wrong or missed word resets the streak without reducing earned speed", () => {
    const broken = advanceRainProgress({ streak: 7, speed: 1.1 }, false);
    expect(broken).toEqual({ streak: 0, speed: 1.1 });
    let progress = broken;
    for (let i = 0; i < 2; i++) progress = advanceRainProgress(progress, true);
    expect(progress.speed).toBe(1.1);
    expect(advanceRainProgress(progress, true).speed).toBeCloseTo(1.21);
  });
  it("a new game starts at normal speed with no streak", () => {
    expect(initialRainProgress()).toEqual({ streak: 0, speed: 1 });
  });
});