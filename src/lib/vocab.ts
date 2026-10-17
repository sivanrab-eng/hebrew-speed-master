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

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "he-IL";
  u.rate = 0.85;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("he"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}
