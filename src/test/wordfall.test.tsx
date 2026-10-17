import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WordRain } from "@/components/WordRain";
import { VOCAB } from "@/lib/vocab";
import { DIFFICULTY_STORAGE_KEY, WORDFALL_WORDS, INTRODUCTION_MS } from "@/lib/wordfall-difficulty";
import { STANDALONE_PACE } from "@/lib/word-rain-speed";

vi.mock("@/lib/sfx", () => ({ sfx: { correct: vi.fn(), tick: vi.fn(), end: vi.fn(), speedUp: vi.fn() } }));
vi.mock("@/components/Confetti", () => ({ Confetti: () => null }));

const ROUND_MS = STANDALONE_PACE.roundMs;
const arcadeTarget = () => VOCAB.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
const wordfallTarget = () => WORDFALL_WORDS.find(word => screen.queryByText(word.english) && screen.queryByRole("button", { name: word.hebrew }));
const fallingWords = () => screen.getAllByRole("button").filter(button => button.getAttribute("aria-label"));
const finishIntroduction = () => {
  if (screen.queryByText("טיפה חדשה!")) act(() => vi.advanceTimersByTime(INTRODUCTION_MS));
};

afterEach(() => { vi.useRealTimers(); localStorage.removeItem(DIFFICULTY_STORAGE_KEY); });

describe("Wordfall", () => {
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
        act(() => vi.advanceTimersByTime(650));
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
      act(() => vi.advanceTimersByTime(650));
    }
    fireEvent.click(screen.getByRole("button", { name: "לשלב 2" }));
    expect(screen.queryByText(/שלב 2 · סיבוב 1\/10/)).not.toBeNull();
    view.unmount();
  });
  it("gives a full falling window after a new rich pair, and does not introduce it again on replay", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone muted onExit={() => {}} />);
    const targets: string[] = [];
    let rich = "";
    for (let i = 0; i < 10; i++) {
      const introduction = screen.queryByText("טיפה חדשה!");
      if (introduction && !rich) {
        rich = screen.getByRole("status").querySelector(".font-hebrew")?.textContent ?? "";
        expect(fallingWords()).toHaveLength(0);
        act(() => vi.advanceTimersByTime(INTRODUCTION_MS - 1));
        expect(fallingWords()).toHaveLength(0);
        act(() => vi.advanceTimersByTime(1));
        expect(screen.queryByText(/סיבוב/)).not.toBeNull();
        act(() => vi.advanceTimersByTime(ROUND_MS - 1));
      } else finishIntroduction();
      const target = wordfallTarget();
      if (!target) throw new Error("Missing target after introduction");
      targets.push(target.hebrew);
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(650));
    }
    expect(rich).not.toBe("");
    fireEvent.click(screen.getByRole("button", { name: /עוד פעם/ }));
    const repeated: string[] = [];
    for (let i = 0; i < 10; i++) {
      expect(screen.queryByText("טיפה חדשה!")).toBeNull();
      const target = wordfallTarget();
      if (!target) throw new Error("Missing repeated target");
      repeated.push(target.hebrew);
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      act(() => vi.advanceTimersByTime(650));
    }
    expect(repeated.sort()).toEqual(targets.sort());
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
    act(() => vi.advanceTimersByTime(650));
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
      act(() => vi.advanceTimersByTime(650));
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
