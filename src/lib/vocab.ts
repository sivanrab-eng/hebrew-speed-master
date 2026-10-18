import sourceVocabulary from "./vocabulary-data.json";

export type Word = {
  hebrew: string;
  english: string;
  definition?: string;
  root: string;
  exampleSentenceHebrew: string; // target word wrapped in [ ]
  exampleSentenceEnglish: string;
  synonyms: string[];
  antonyms: string[];
};

// Repeated unvocalized labels are merged so every visible answer is unique.
// Preserve all source meanings without inventing roots or example sentences.
const wordsByHebrew = new Map<string, Word>();
for (const row of sourceVocabulary) {
  const existing = wordsByHebrew.get(row.hebrew);
  if (existing) {
    existing.english += `; ${row.english}`;
    existing.definition += `; ${row.definition}`;
    continue;
  }
  wordsByHebrew.set(row.hebrew, {
    ...row,
    root: "",
    exampleSentenceHebrew: "",
    exampleSentenceEnglish: "",
    synonyms: [],
    antonyms: [],
  });
}
export const VOCAB: Word[] = Array.from(wordsByHebrew.values());

export const sentenceFull = (w: Word) => w.exampleSentenceHebrew.replace(/[[\]]/g, "");
export const sentenceBlank = (w: Word) => w.exampleSentenceHebrew.replace(/\[[^\]]*\]/g, "_____");
export const sentenceParts = (w: Word) => {
  const m = w.exampleSentenceHebrew.match(/^(.*)\[([^\]]*)\](.*)$/);
  return m ? { before: m[1] ?? "", word: m[2] ?? "", after: m[3] ?? "" } : { before: w.exampleSentenceHebrew, word: "", after: "" };
};

let speechGeneration = 0;
let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
let transitionTimer: ReturnType<typeof setTimeout> | undefined;

// Invalidate callbacks before cancel(), which may itself emit an error event.
export function cancelSpeech() {
  speechGeneration += 1;
  clearTimeout(fallbackTimer);
  clearTimeout(transitionTimer);
  fallbackTimer = undefined;
  transitionTimer = undefined;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  cancelSpeech();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "he-IL";
  u.rate = 0.85;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("he"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// Reads a word aloud in Hebrew and then its everyday English meaning,
// used on the Wordfall "new word" introduction card.
export function speakPair(hebrew: string, english: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  cancelSpeech();
  const generation = speechGeneration;
  const h = new SpeechSynthesisUtterance(hebrew);
  h.lang = "he-IL";
  h.rate = 0.85;
  const hv = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("he"));
  if (hv) h.voice = hv;
  const e = new SpeechSynthesisUtterance(english);
  e.lang = "en-US";
  e.rate = 0.9;
  const ev = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("en"));
  if (ev) e.voice = ev;
  let transitioned = false;
  const playEnglish = (fallback = false) => {
    if (generation !== speechGeneration) return;
    h.onend = null;
    h.onerror = null;
    // A stuck Hebrew utterance must not keep English trapped in its queue.
    if (fallback) window.speechSynthesis.cancel();
    window.speechSynthesis.speak(e);
  };
  const afterHebrew = () => {
    if (generation !== speechGeneration || transitioned) return;
    transitioned = true;
    clearTimeout(fallbackTimer);
    fallbackTimer = undefined;
    transitionTimer = setTimeout(() => {
      transitionTimer = undefined;
      playEnglish();
    }, 150);
  };
  h.onend = afterHebrew;
  h.onerror = afterHebrew;
  fallbackTimer = setTimeout(() => {
    fallbackTimer = undefined;
    if (generation !== speechGeneration || transitioned) return;
    transitioned = true;
    playEnglish(true);
  }, 2000);
  window.speechSynthesis.speak(h);
}

// Reads Hebrew text aloud (used for Wordfall sentence readings) and reports
// when playback is truly finished — on end, on error, or after a fallback
// timeout for engines that never fire onend.
export function speakHebrew(text: string, onDone?: () => void, fallbackMs = 12000) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone?.();
    return;
  }
  cancelSpeech();
  const generation = speechGeneration;
  let done = false;
  const finish = () => {
    if (generation !== speechGeneration || done) return;
    done = true;
    clearTimeout(fallbackTimer);
    fallbackTimer = undefined;
    onDone?.();
  };
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "he-IL";
  u.rate = 0.85;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("he"));
  if (v) u.voice = v;
  u.onend = finish;
  u.onerror = finish;
  fallbackTimer = setTimeout(finish, fallbackMs);
  window.speechSynthesis.speak(u);
}
