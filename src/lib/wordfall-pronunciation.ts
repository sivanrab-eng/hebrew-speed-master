import data from "./wordfall-pronunciation.json";

// Speech-only overlay: never replace canonical labels or visible example sentences.
// Drafted offline with Dicta, with curated readings for ambiguous source meanings.
type Pronunciation = { word: string; sentence: string };
const pronunciations: Record<string, Pronunciation> = data;

export const wordfallSpokenWord = (label: string): string => pronunciations[label]?.word ?? label;
export const wordfallSpokenSentence = (label: string, fallback: string): string =>
  pronunciations[label]?.sentence ?? fallback.replace(/[[\]]/g, "");