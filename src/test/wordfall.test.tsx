import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WordRain } from "@/components/WordRain";
import { VOCAB } from "@/lib/vocab";
import { DIFFICULTY_STORAGE_KEY, WORDFALL_WORDS } from "@/lib/wordfall-difficulty";
import { STANDALONE_PACE } from "@/lib/word-rain-speed";

vi.mock("@/lib/sfx", () => ({ sfx: { correct: vi.fn(), tick: vi.fn(), end: vi.fn(), speedUp: vi.fn() } }));
vi.mock("@/components/Confetti", () => ({ Confetti: () => null }));

const ROUND_MS = STANDALONE_PACE.roundMs;
const arcadeTarget = () => VOCAB.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
const wordfallTarget = () => WORDFALL_WORDS.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
const fallingWords = () => screen.getAllByRole("button").filter(button => button.getAttribute("aria-label"));

afterEach(() => { vi.useRealTimers(); localStorage.removeItem(DIFFICULTY_STORAGE_KEY); });

describe("Wordfall", () => {
  it("unlocks and saves the next tier after one full game with exactly eight catches", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    for (let i = 0; i < 10; i++) {
      if (i < 8) {
        const target = wordfallTarget();
        if (!target) throw new Error("No target rendered");
        fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
        act(() => vi.advanceTimersByTime(650));
      } else act(() => vi.advanceTimersByTime(ROUND_MS + 100));
    }
    expect(complete).toHaveBeenCalledExactlyOnceWith(8);
    expect(JSON.parse(localStorage.getItem(DIFFICULTY_STORAGE_KEY) ?? "null")).toEqual({ level: 1, wins: 0 });
    view.unmount();
    const restored = render(<WordRain standalone muted onExit={() => {}} />);
    expect(screen.queryByText(/שלב 2 · סיבוב 1\/10/)).not.toBeNull();
    restored.unmount();
  });
  it("finishes after ten rounds, including missed drops", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    for (let i = 0; i < 10; i++) act(() => vi.advanceTimersByTime(ROUND_MS + 100));
    expect(complete).toHaveBeenCalledExactlyOnceWith(0);
    view.unmount();
  });
  it("does not deduct points for a wrong word and counts a catch only once", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    const target = wordfallTarget();
    if (!target) throw new Error("No target rendered");
    const wrong = screen.getAllByRole("button").find(button => WORDFALL_WORDS.some(word => word.hebrew === button.getAttribute("aria-label") && word !== target));
    if (!wrong) throw new Error("No distractor rendered");
    fireEvent.click(wrong);
    const correct = screen.getByRole("button", { name: target.hebrew });
    fireEvent.click(correct);
    fireEvent.click(correct);
    act(() => vi.advanceTimersByTime(650));
    for (let i = 0; i < 9; i++) act(() => vi.advanceTimersByTime(ROUND_MS + 100));
    expect(complete).toHaveBeenCalledExactlyOnceWith(1);
    view.unmount();
  });

  it("keeps one slow fall speed in Wordfall and never shows the speed-up banner", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    for (let i = 0; i < 3; i++) {
      const target = wordfallTarget();
      if (!target) throw new Error("No target rendered");
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(650));
    }
    expect(screen.queryByText("מגבירים קצב!")).toBeNull();
    expect(screen.queryByText(/סיבוב 4\/10/)).not.toBeNull();
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
