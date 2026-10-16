import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WordRain } from "@/components/WordRain";
import { VOCAB } from "@/lib/vocab";

vi.mock("@/lib/sfx", () => ({ sfx: { correct: vi.fn(), tick: vi.fn(), end: vi.fn() } }));
vi.mock("@/components/Confetti", () => ({ Confetti: () => null }));

afterEach(() => vi.useRealTimers());

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
    const target = VOCAB.find(word => screen.queryByText(word.english));
    if (!target) throw new Error("No target rendered");
    const wrong = screen.getAllByRole("button").find(button => VOCAB.some(word => word.hebrew === button.getAttribute("aria-label") && word !== target));
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
});