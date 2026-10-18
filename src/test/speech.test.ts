import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cancelSpeech, speak, speakHebrew, speakPair } from "@/lib/vocab";

class MockUtterance {
  lang = "";
  rate = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

describe("Wordfall speech sequencing", () => {
  const engine = { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] };
  const firstUtterance = () => engine.speak.mock.calls[0]?.[0] as MockUtterance;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    vi.stubGlobal("speechSynthesis", engine);
    cancelSpeech();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cancelSpeech();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each(["onend", "onerror"] as const)("starts Hebrew exactly 150ms after English %s", (event) => {
    speakPair("בית", "house");
    expect(engine.speak).toHaveBeenCalledTimes(1);
    expect(firstUtterance()).toMatchObject({ text: "house", lang: "en-US", rate: 0.9 });
    firstUtterance()[event]?.();
    vi.advanceTimersByTime(149);
    expect(engine.speak).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(engine.speak.mock.calls[1]?.[0]).toMatchObject({ text: "בית", lang: "he-IL", rate: 0.85 });
    vi.advanceTimersByTime(3000);
    expect(engine.speak).toHaveBeenCalledTimes(2);
  });

  it("starts Hebrew at the two-second fallback and ignores late English events", () => {
    speakPair("בית", "house");
    const lateEnd = firstUtterance().onend;
    vi.advanceTimersByTime(1999);
    expect(engine.speak).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(engine.cancel).toHaveBeenCalledTimes(2);
    expect(engine.speak.mock.calls[1]?.[0].text).toBe("בית");
    lateEnd?.();
    vi.advanceTimersByTime(3000);
    expect(engine.speak).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])("repeat clears stale timers (transition pending: %s)", (pendingTransition) => {
    speakPair("בית", "house");
    const staleEnd = firstUtterance().onend;
    if (pendingTransition) staleEnd?.();
    speakPair("כלב", "dog");
    staleEnd?.();
    vi.advanceTimersByTime(2000);
    expect(engine.speak.mock.calls.map(([utterance]) => utterance.text)).toEqual(["house", "dog", "כלב"]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([false, true])("explicit cancellation clears all timers (transition pending: %s)", (pendingTransition) => {
    speakPair("בית", "house");
    const staleError = firstUtterance().onerror;
    if (pendingTransition) firstUtterance().onend?.();
    cancelSpeech();
    staleError?.();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(3000);
    expect(engine.speak).toHaveBeenCalledTimes(1);
  });

  it("a single Hebrew reading cancels a pending pair", () => {
    speakPair("בית", "house");
    firstUtterance().onend?.();
    speak("כלב");
    vi.advanceTimersByTime(3000);
    expect(engine.speak.mock.calls.map(([utterance]) => utterance.text)).toEqual(["house", "כלב"]);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("Wordfall Hebrew sentence reading", () => {
  const engine = { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    vi.stubGlobal("speechSynthesis", engine);
    cancelSpeech();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cancelSpeech();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("reads Hebrew text and reports completion on end", () => {
    const done = vi.fn();
    speakHebrew("הבית גדול", done);
    expect(engine.speak).toHaveBeenCalledTimes(1);
    expect(engine.speak.mock.calls[0]?.[0]).toMatchObject({ text: "הבית גדול", lang: "he-IL", rate: 0.85 });
    engine.speak.mock.calls[0]?.[0].onend?.();
    expect(done).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports completion on a Hebrew error", () => {
    const done = vi.fn();
    speakHebrew("הבית גדול", done);
    engine.speak.mock.calls[0]?.[0].onerror?.();
    expect(done).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports completion at the fallback when the engine never fires", () => {
    const done = vi.fn();
    speakHebrew("הבית גדול", done, 12000);
    vi.advanceTimersByTime(11999);
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("cancellation prevents a stale completion", () => {
    const done = vi.fn();
    speakHebrew("הבית גדול", done);
    cancelSpeech();
    engine.speak.mock.calls[0]?.[0].onend?.();
    expect(done).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
