import { describe, expect, it } from "vitest";
import { advanceCatchProgress, initialCatchProgress, SENTENCE_SHOW_MS } from "@/lib/wordfall-score";
describe("Wordfall no-pressure scoring", () => {
  it("awards 100 for the first catch with no speed dependency", () => {
    expect(advanceCatchProgress(initialCatchProgress(), true)).toEqual({ points: 100, awarded: 100, streak: 1, bestStreak: 1 });
  });
  it("adds 25 per streak step with a maximum 100 bonus", () => {
    let progress = initialCatchProgress();
    for (let i = 0; i < 6; i++) progress = advanceCatchProgress(progress, true);
    expect(progress).toEqual({ points: 950, awarded: 200, streak: 6, bestStreak: 6 });
  });
  it("resets streak on a miss without removing points or best streak", () => {
    expect(advanceCatchProgress({ points: 225, streak: 2, bestStreak: 2, awarded: 125 }, false)).toEqual({ points: 225, streak: 0, bestStreak: 2, awarded: 0 });
  });
  it("shows a caught sentence for 4.5 seconds without holding the round", () => { expect(SENTENCE_SHOW_MS).toBe(4500); });
});
import vocabulary from "@/lib/wordfall-vocabulary.json";
import { EVERYDAY_WORDS } from "@/lib/wordfall-difficulty";
import { getWordfallSentence, splitHighlightedSentence } from "@/lib/wordfall-sentences";
describe("Wordfall sentence examples", () => {
  it("has one highlighted sentence and translation for every standalone word", () => {
    for (const label of [...Object.keys(vocabulary), ...EVERYDAY_WORDS.map(word => word.hebrew)]) {
      const sentence = getWordfallSentence(label);
      expect(sentence?.english, label).toBeTruthy();
      expect(splitHighlightedSentence(sentence?.hebrew ?? "").target, label).not.toBe("");
    }
  });
  it("uses the requested house example", () => {
    expect(getWordfallSentence("בית")).toEqual({ hebrew: "אני גר ב[בית] גדול.", english: "I live in a big house." });
  });
});
