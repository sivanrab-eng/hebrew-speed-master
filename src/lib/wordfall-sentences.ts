import data from "./wordfall-sentences.json";
export type WordfallSentence = { hebrew: string; english: string };
const sentences: Record<string, WordfallSentence> = data;
export const getWordfallSentence = (label: string): WordfallSentence | undefined => sentences[label];
export function splitHighlightedSentence(sentence: string) {
  const match = sentence.match(/^(.*)\[([^\]]+)\](.*)$/);
  return match ? { before: match[1] ?? "", target: match[2] ?? "", after: match[3] ?? "" } : { before: sentence, target: "", after: "" };
}