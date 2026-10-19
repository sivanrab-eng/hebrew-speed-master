import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WordRain } from "@/components/WordRain";
import { VOCAB } from "@/lib/vocab";
import { DIFFICULTY_STORAGE_KEY, EVERYDAY_WORDS, WORDFALL_WORDS, INTRODUCTION_MS } from "@/lib/wordfall-difficulty";
import { STANDALONE_PACE } from "@/lib/word-rain-speed";
import { wordfallSpokenSentence, wordfallSpokenWord } from "@/lib/wordfall-pronunciation";

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

afterEach(() => { vi.useRealTimers(); localStorage.removeItem(DIFFICULTY_STORAGE_KEY); });

describe("Wordfall", () => {
  it("plays ten rich-only regular rounds without introductions or sentence pauses", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone mode="regular" muted onExit={() => {}} />);
    const everyday = new Set(EVERYDAY_WORDS.map(word => word.hebrew));
    const targets: string[] = [];
    for (let i = 0; i < 10; i++) {
      const target = wordfallTarget();
      if (!target) throw new Error("Missing regular target");
      targets.push(target.hebrew);
      expect(everyday.has(target.hebrew)).toBe(false);
      expect(fallingWords()).toHaveLength(3);
      expect(fallingWords().every(button => !everyday.has(button.getAttribute("aria-label") ?? ""))).toBe(true);
      expect(screen.queryByText("טיפה חדשה!")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      expect(sentenceCard()).toBeNull();
      act(() => vi.advanceTimersByTime(650));
      if (i < 9) expect(currentRound()).toBe(i + 2);
    }
    expect(new Set(targets).size).toBe(10);
    expect(screen.getByText("תפסת 10 מתוך 10 מילים")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /עוד פעם/ }));
    const replay: string[] = [];
    for (let i = 0; i < 10; i++) {
      const target = wordfallTarget();
      if (!target) throw new Error("Missing replay target");
      replay.push(target.hebrew);
      expect(everyday.has(target.hebrew)).toBe(false);
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      expect(sentenceCard()).toBeNull();
      act(() => vi.advanceTimersByTime(650));
    }
    expect(replay.filter(label => !targets.includes(label))).toHaveLength(5);
    view.unmount();
  });

  it("preserves practice introductions, examples, seven everyday targets and balanced replay", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone mode="practice" muted onExit={() => {}} />);
    const batches: string[][] = [];
    for (let game = 0; game < 2; game++) {
      const batch: string[] = [];
      let introductions = 0;
      for (let i = 0; i < 10; i++) {
        if (screen.queryByText("טיפה חדשה!")) {
          introductions++;
          act(() => vi.advanceTimersByTime(60000));
          expect(currentRound()).toBe(i + 1);
          fireEvent.click(screen.getByRole("button", { name: "מוכנים" }));
        }
        const target = wordfallTarget();
        if (!target) throw new Error("Missing practice target");
        batch.push(target.hebrew);
        fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
        expect(sentenceCard()).not.toBeNull();
        act(() => vi.advanceTimersByTime(60000));
        expect(currentRound()).toBe(i + 1);
        fireEvent.click(screen.getByRole("button", { name: i === 9 ? "סיום" : "המילה הבאה" }));
      }
      expect(introductions).toBe(game === 0 ? 3 : 1);
      expect(batch.filter(label => EVERYDAY_WORDS.some(word => word.hebrew === label))).toHaveLength(7);
      batches.push(batch);
      if (game === 0) fireEvent.click(screen.getByRole("button", { name: /עוד פעם/ }));
    }
    const first = batches[0] ?? [];
    const changed = (batches[1] ?? []).filter(label => !first.includes(label));
    expect(changed).toHaveLength(5);
    expect(changed.filter(label => EVERYDAY_WORDS.some(word => word.hebrew === label))).toHaveLength(4);
    view.unmount();
  });

  it("keeps practice choices still without a round deadline and waits for explicit next", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone mode="practice" muted onExit={() => {}} />);
    if (screen.queryByText("טיפה חדשה!")) {
      act(() => vi.advanceTimersByTime(60000));
      expect(currentRound()).toBe(1);
      fireEvent.click(screen.getByRole("button", { name: "מוכנים" }));
    }
    const target = wordfallTarget();
    if (!target) throw new Error("Missing practice target");
    expect(fallingWords()).toHaveLength(0);
    act(() => vi.advanceTimersByTime(60000));
    expect(currentRound()).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
    act(() => vi.advanceTimersByTime(60000));
    expect(currentRound()).toBe(1);
    expect(sentenceCard()).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "המילה הבאה" }));
    expect(currentRound()).toBe(2);
    view.unmount();
  });

  it("does not remove practice streak or points after a wrong choice", () => {
    vi.useFakeTimers();
    const view = render(<WordRain standalone mode="practice" muted onExit={() => {}} />);
    if (screen.queryByText("טיפה חדשה!")) fireEvent.click(screen.getByRole("button", { name: "מוכנים" }));
    const first = wordfallTarget();
    if (!first) throw new Error("Missing practice target");
    fireEvent.click(screen.getByRole("button", { name: first.hebrew }));
    fireEvent.click(screen.getByRole("button", { name: "המילה הבאה" }));
    if (screen.queryByText("טיפה חדשה!")) fireEvent.click(screen.getByRole("button", { name: "מוכנים" }));
    const target = wordfallTarget();
    if (!target) throw new Error("Missing second target");
    const wrong = screen.getAllByRole("button").find(button => WORDFALL_WORDS.some(word => word.hebrew === button.getAttribute("aria-label") && word !== target));
    if (!wrong) throw new Error("Missing distractor");
    fireEvent.click(wrong);
    expect(screen.getByText("רצף 1")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(currentRound()).toBe(2);
    view.unmount();
  });

  it("repeats vocalized practice sentences and holds next until speech ends", () => {
    vi.useFakeTimers();
    class Utterance { lang = ""; rate = 1; onend: (() => void) | null = null; constructor(public text: string) {} }
    const engine = { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] };
    vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
    vi.stubGlobal("speechSynthesis", engine);
    const view = render(<WordRain standalone mode="practice" muted={false} onExit={() => {}} />);
    try {
      if (screen.queryByText("טיפה חדשה!")) fireEvent.click(screen.getByRole("button", { name: "מוכנים" }));
      const target = wordfallTarget();
      if (!target) throw new Error("Missing practice target");
      fireEvent.click(screen.getByRole("button", { name: "שמיעת המילה" }));
      expect(engine.speak.mock.calls.at(-1)?.[0]).toMatchObject({ text: target.english, lang: "en-US" });
      fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
      const next = screen.getByRole("button", { name: "המילה הבאה" });
      expect(next).toBeDisabled();
      act(() => engine.speak.mock.calls.at(-1)?.[0].onend?.());
      expect(next).not.toBeDisabled();
      engine.speak.mockClear();
      fireEvent.click(screen.getByRole("button", { name: "שמיעת המשפט" }));
      expect(engine.speak).toHaveBeenCalledOnce();
      expect(engine.speak.mock.calls[0]?.[0]).toMatchObject({ text: wordfallSpokenSentence(target.hebrew, ""), lang: "he-IL" });
      expect(next).toBeDisabled();
      act(() => engine.speak.mock.calls.at(-1)?.[0].onend?.());
      expect(currentRound()).toBe(1);
      expect(next).not.toBeDisabled();
    } finally { view.unmount(); vi.unstubAllGlobals(); }
  });

  it.each([true, false])("vocalizes standalone catches only (standalone: %s)", standalone => {
    vi.useFakeTimers();
    class Utterance {
      lang = ""; rate = 1;
      constructor(public text: string) {}
    }
    const engine = { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] };
    vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
    vi.stubGlobal("speechSynthesis", engine);
    const view = render(<WordRain standalone={standalone} muted={false} onExit={() => {}} />);
    try {
      for (let i = 0; i < 10; i++) {
        finishIntroduction();
        const target = standalone ? wordfallTarget() : arcadeTarget();
        if (!target) throw new Error("Missing target");
        const familiar = true;
        engine.speak.mockClear();
        fireEvent.click(screen.getByRole("button", { name: target.hebrew }));
        if (familiar) {
          expect(engine.speak.mock.calls.at(-1)?.[0]).toMatchObject({ text: standalone ? wordfallSpokenWord(target.hebrew) : target.hebrew, lang: "he-IL" });
          return;
        }
        settleNextRound();
      }
      throw new Error("No familiar target found");
    } finally { view.unmount(); vi.unstubAllGlobals(); }
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
        act(() => vi.advanceTimersByTime(4050));
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
      act(() => vi.advanceTimersByTime(4050));
    }
    fireEvent.click(screen.getByRole("button", { name: "לשלב 2" }));
    expect(screen.queryByText(/שלב 2 · סיבוב 1\/10/)).not.toBeNull();
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
    act(() => vi.advanceTimersByTime(4050));
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
      act(() => vi.advanceTimersByTime(4050));
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
