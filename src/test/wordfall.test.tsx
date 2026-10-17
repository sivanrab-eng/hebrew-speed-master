import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WordRain } from "@/components/WordRain";
import { VOCAB } from "@/lib/vocab";
import { DIFFICULTY_STORAGE_KEY, WORDFALL_WORDS } from "@/lib/wordfall-difficulty";

vi.mock("@/lib/sfx", () => ({ sfx: { correct: vi.fn(), tick: vi.fn(), end: vi.fn(), speedUp: vi.fn() } }));
vi.mock("@/components/Confetti", () => ({ Confetti: () => null }));

afterEach(() => { vi.useRealTimers(); localStorage.removeItem(DIFFICULTY_STORAGE_KEY); });

describe("Wordfall", () => {
  it("finishes after ten rounds, including missed drops", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    for (let i = 0; i < 10; i++) act(() => vi.advanceTimersByTime(6000));
    expect(complete).toHaveBeenCalledExactlyOnceWith(0);
    view.unmount();
  });
  it("does not deduct points for a wrong word and counts a catch only once", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const view = render(<WordRain standalone muted onExit={() => {}} onGameComplete={complete} />);
    const target = WORDFALL_WORDS.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
    if (!target) throw new Error("No target rendered");
    const wrong = screen.getAllByRole("button").find(button => WORDFALL_WORDS.some(word => word.hebrew === button.getAttribute("aria-label") && word !== target));
    if (!wrong) throw new Error("No distractor rendered");
    fireEvent.click(wrong);
    const correct = screen.getByRole("button", { name: target.hebrew });
    fireEvent.click(correct);
    fireEvent.click(correct);
    act(() => vi.advanceTimersByTime(650));
    for (let i = 0; i < 9; i++) act(() => vi.advanceTimersByTime(6000));
    expect(complete).toHaveBeenCalledExactlyOnceWith(1);
    view.unmount();
  });

  it("flashes a speed-up banner after three catches without pausing the round", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    for (let i = 0; i < 3; i++) {
      const target = WORDFALL_WORDS.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
      if (!target) throw new Error("No target rendered");
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(650));
    }
    expect(screen.queryByText("מגבירים קצב!")).not.toBeNull();
    expect(screen.queryByText(/סיבוב 4\/10/)).not.toBeNull();
    act(() => vi.advanceTimersByTime(1400));
    expect(screen.queryByText("מגבירים קצב!")).toBeNull();
    // the round itself ran shorter than the initial 6s: the game never stopped
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