import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WordRain } from "@/components/WordRain";
import { VOCAB } from "@/lib/vocab";
import { DIFFICULTY_STORAGE_KEY, EVERYDAY_WORDS, WORDFALL_WORDS, INTRODUCTION_MS } from "@/lib/wordfall-difficulty";
import { STANDALONE_PACE } from "@/lib/word-rain-speed";
import { SENTENCE_SPEAK_BUFFER_MS } from "@/lib/wordfall-score";
import { getWordfallSentence } from "@/lib/wordfall-sentences";

vi.mock("@/lib/sfx", () => ({ sfx: { correct: vi.fn(), tick: vi.fn(), end: vi.fn(), speedUp: vi.fn() } }));
vi.mock("@/components/Confetti", () => ({ Confetti: () => null }));

const ROUND_MS = STANDALONE_PACE.roundMs;
const arcadeTarget = () => VOCAB.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
const wordfallTarget = () => WORDFALL_WORDS.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
const fallingWords = () => screen.getAllByRole("button").filter(button => button.classList.contains("animate-word-fall"));
const finishIntroduction = () => {
  if (screen.queryByText("טיפה חדשה!")) act(() => vi.advanceTimersByTime(INTRODUCTION_MS));
};
const currentRound = () => Number(screen.getByText(/סיבוב \d+\/10/).textContent?.match(/סיבוב (\d+)/)?.[1] ?? "0");
const sentenceCard = () => screen.queryByLabelText("משפט אחרי תפיסה");
// Advances just past a catch: the next round opens either with falling words or with a
// new-word card, and only then does its own timer start.
const settleNextRound = () => {
  const round = currentRound();
  for (let i = 0; i < 120; i++) {
    act(() => vi.advanceTimersByTime(50));
    if (currentRound() !== round || screen.queryByText(/כל הכבוד/)) return;
  }
  throw new Error("The next round never opened");
};
// Plays on until the player meets a word that gets its own introduction card.
const playToIntroduction = () => {
  for (let i = 0; i < 10; i++) {
    if (screen.queryByText("טיפה חדשה!")) return currentRound();
    const target = wordfallTarget();
    if (!target) throw new Error("Missing target before an introduction");
    fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
    settleNextRound();
  }
  throw new Error("No new word was introduced in ten rounds");
};

afterEach(() => { vi.useRealTimers(); localStorage.removeItem(DIFFICULTY_STORAGE_KEY); });

describe("Wordfall", () => {
  it("keeps a caught sentence for three seconds before the next round", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    const round = playToIntroduction();
    finishIntroduction();
    const target = wordfallTarget();
    if (!target) throw new Error("Missing target");
    fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
    act(() => vi.advanceTimersByTime(450));
    expect(sentenceCard()).not.toBeNull();
    act(() => vi.advanceTimersByTime(2999));
    expect(currentRound()).toBe(round);
    expect(fallingWords()).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(currentRound()).toBe(round + 1);
    view.unmount();
  });
  it("holds the sentence card until its Hebrew reading ends", () => {
    vi.useFakeTimers();
    class Utterance {
      lang = ""; rate = 1; onend: (() => void) | null = null; onerror: (() => void) | null = null;
      constructor(public text: string) {}
    }
    const engine = { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] };
    vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
    vi.stubGlobal("speechSynthesis", engine);
    const view = render(<WordRain standalone muted={false} onExit={() => {}} />);
    const round = playToIntroduction();
    finishIntroduction();
    const target = wordfallTarget();
    if (!target) throw new Error("Missing target");
    const caughtSentence = getWordfallSentence(target.hebrew);
    if (!caughtSentence) throw new Error("Missing sentence");
    fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
    act(() => vi.advanceTimersByTime(450));
    expect(engine.speak.mock.calls.at(-1)?.[0]).toMatchObject({ text: caughtSentence.hebrew.replace(/[[\]]/g, ""), lang: "he-IL" });
    // The reading keeps the card open well past the silent auto-advance time.
    act(() => vi.advanceTimersByTime(6000));
    expect(currentRound()).toBe(round);
    expect(fallingWords()).toHaveLength(0);
    engine.speak.mock.calls.at(-1)?.[0].onend?.();
    act(() => vi.advanceTimersByTime(SENTENCE_SPEAK_BUFFER_MS));
    expect(currentRound()).toBe(round + 1);
    view.unmount();
    vi.unstubAllGlobals();
  });
  it("pauses falling for a sentence and lets the reader hold and continue", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    const round = playToIntroduction();
    finishIntroduction();
    const target = wordfallTarget();
    if (!target) throw new Error("Missing target");
    fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
    act(() => vi.advanceTimersByTime(450));
    expect(sentenceCard()).not.toBeNull();
    expect(fallingWords()).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "זמן לקרוא" }));
    act(() => vi.advanceTimersByTime(15000));
    expect(currentRound()).toBe(round);
    fireEvent.click(screen.getByRole("button", { name: /ממשיכים/ }));
    expect(currentRound()).toBe(round + 1);
    view.unmount();
  });

  it("sends a familiar word straight back to the rain without a sentence card", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    for (let i = 0; i < 10; i++) {
      if (screen.queryByText("טיפה חדשה!")) finishIntroduction();
      const target = wordfallTarget();
      if (!target) throw new Error("Missing target");
      const round = currentRound();
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(450));
      if (EVERYDAY_WORDS.some(word => word.hebrew === target.hebrew)) {
        expect(sentenceCard()).toBeNull();
        expect(fallingWords()).not.toHaveLength(0);
        act(() => vi.advanceTimersByTime(200));
        expect(currentRound()).toBe(round + 1);
        view.unmount();
        return;
      }
      expect(sentenceCard()).not.toBeNull();
      act(() => vi.advanceTimersByTime(3001));
    }
    throw new Error("No familiar word appeared as a target");
  });

  it("offers a next tier at eight catches but repeats the current tier unless chosen", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    for (let i = 0; i < 10; i++) {
      finishIntroduction();
      if (i < 8) {
        const target = wordfallTarget();
        if (!target) throw new Error("No target rendered");
        fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
        act(() => vi.advanceTimersByTime(3450));
      } else act(() => vi.advanceTimersByTime(ROUND_MS + 100));
    }
    expect(complete).toHaveBeenCalledExactlyOnceWith(8);
    expect(screen.queryByRole("status")?.textContent).toBe("שלב 2 זמין!");
    fireEvent.click(screen.getByRole("button", { name: /עוד פעם/ }));
    expect(screen.queryByText(/שלב 1 · סיבוב 1\/10/)).not.toBeNull();
    view.unmount();
    const restored = render(<WordRain standalone muted onExit={() => {}} />);
    expect(screen.queryByText(/שלב 1 · סיבוב 1\/10/)).not.toBeNull();
    restored.unmount();
  });
  it("advances only when the player chooses the available next tier", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    for (let i = 0; i < 10; i++) {
      finishIntroduction();
      const target = wordfallTarget();
      if (!target) throw new Error("Missing target");
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(3450));
    }
    fireEvent.click(screen.getByRole("button", { name: "לשלב 2" }));
    expect(screen.queryByText(/שלב 2 · סיבוב 1\/10/)).not.toBeNull();
    view.unmount();
  });
  it("gives a new rich word its introduction and then a full falling window", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    const round = playToIntroduction();
    expect(screen.queryByText("טיפה חדשה!")).not.toBeNull();
    expect(fallingWords()).toHaveLength(0);
    act(() => vi.advanceTimersByTime(INTRODUCTION_MS - 1));
    expect(fallingWords()).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(fallingWords()).toHaveLength(3);
    expect(currentRound()).toBe(round);
    act(() => vi.advanceTimersByTime(ROUND_MS - 1));
    expect(currentRound()).toBe(round);
    act(() => vi.advanceTimersByTime(1));
    expect(currentRound()).toBe(round + 1);
    view.unmount();
  });

  it("repeats the same ten words on replay without introducing them again", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    const targets: string[] = [];
    for (let i = 0; i < 10; i++) {
      if (screen.queryByText("טיפה חדשה!")) finishIntroduction();
      const target = wordfallTarget();
      if (!target) throw new Error("Missing target");
      targets.push(target.hebrew);
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      settleNextRound();
    }
    expect(screen.queryByText(/כל הכבוד/)).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /עוד פעם/ }));
    const repeated: string[] = [];
    for (let i = 0; i < 10; i++) {
      expect(screen.queryByText("טיפה חדשה!")).toBeNull();
      const target = wordfallTarget();
      if (!target) throw new Error("Missing repeated target");
      repeated.push(target.hebrew);
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      settleNextRound();
    }
    expect(repeated.sort()).toEqual(targets.sort());
    view.unmount();
  });
  it("offers a repeat-audio button on the new-word introduction card and keeps the game running", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    let seen = false;
    for (let i = 0; i < 10 && !seen; i++) {
      if (screen.queryByText("טיפה חדשה!")) {
        seen = true;
        expect(() => fireEvent.click(screen.getByRole("button", { name: /שמיעה חוזרת/ }))).not.toThrow();
        act(() => vi.advanceTimersByTime(INTRODUCTION_MS));
        expect(screen.queryByText("טיפה חדשה!")).toBeNull();
        expect(fallingWords()).not.toHaveLength(0);
      } else {
        finishIntroduction();
        const target = wordfallTarget();
        if (!target) throw new Error("Missing target before introduction");
        fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
        act(() => vi.advanceTimersByTime(3450));
      }
    }
    expect(seen).toBe(true);
    view.unmount();
  });
  it("starts at level one even when an earlier visit saved level five", () => {
    vi.useFakeTimers();
    localStorage.setItem(DIFFICULTY_STORAGE_KEY, JSON.stringify({ level: 4, wins: 0 }));
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    expect(screen.queryByText(/שלב 1 · סיבוב 1\/10/)).not.toBeNull();
    expect(screen.queryByText(/שלב 5 ·/)).toBeNull();
    view.unmount();
  });
  it("finishes after ten rounds, including missed drops", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    for (let i = 0; i < 10; i++) { finishIntroduction(); act(() => vi.advanceTimersByTime(ROUND_MS + 100)); }
    expect(complete).toHaveBeenCalledExactlyOnceWith(0);
    view.unmount();
  });
  it("does not deduct points for a wrong word and counts a catch only once", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    finishIntroduction();
    const target = wordfallTarget();
    if (!target) throw new Error("No target rendered");
    const wrong = screen.getAllByRole("button").find(button => WORDFALL_WORDS.some(word => word.hebrew === button.getAttribute("aria-label") && word !== target));
    if (!wrong) throw new Error("No distractor rendered");
    fireEvent.click(wrong);
    const correct = screen.getByRole("button", { name: target.hebrew });
    fireEvent.click(correct);
    fireEvent.click(correct);
    act(() => vi.advanceTimersByTime(3450));
    for (let i = 0; i < 9; i++) { finishIntroduction(); act(() => vi.advanceTimersByTime(ROUND_MS + 100)); }
    expect(complete).toHaveBeenCalledExactlyOnceWith(1);
    view.unmount();
  });

  it("keeps one slow fall speed in Wordfall and never shows the speed-up banner", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    for (let i = 0; i < 3; i++) {
      finishIntroduction();
      const target = wordfallTarget();
      if (!target) throw new Error("No target rendered");
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(3450));
    }
    expect(screen.queryByText("מגבירים קצב!")).toBeNull();
    expect(screen.queryByText(/סיבוב 4\/10/)).not.toBeNull();
    finishIntroduction();
    expect(fallingWords().every(word => word.style.animationDuration === "7s")).toBe(true);
    act(() => vi.advanceTimersByTime(ROUND_MS + 100));
    expect(screen.queryByText(/סיבוב 5\/10/)).not.toBeNull();
    expect(fallingWords().every(word => word.style.animationDuration === "7s")).toBe(true);
    view.unmount();
  });

  it("flashes a speed-up banner after three catches in the arcade game", () => {
    vi.useFakeTimers();
    const view = render(<WordRain muted onExit={() => {}} />);
    for (let i = 0; i < 3; i++) {
      const target = arcadeTarget();
      if (!target) throw new Error("No arcade target rendered");
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(650));
    }
    expect(screen.queryByText("מגבירים קצב!")).not.toBeNull();
    expect(screen.queryByText(/סיבוב 4\/10/)).not.toBeNull();
    act(() => vi.advanceTimersByTime(1400));
    expect(screen.queryByText("מגבירים קצב!")).toBeNull();
    act(() => vi.advanceTimersByTime(5460));
    expect(screen.queryByText(/סיבוב 5\/10/)).not.toBeNull();
    view.unmount();
  });

  it("keeps arcade word rain on its original vocabulary", () => {
    vi.useFakeTimers();
    const view = render(<WordRain muted onExit={() => {}} />);
    const answers = screen.getAllByRole("button").map(button => button.getAttribute("aria-label")).filter(Boolean);
    expect(answers).toHaveLength(3);
    expect(answers.every(answer => VOCAB.some(word => word.hebrew === answer))).toBe(true);
    view.unmount();
  });
});
