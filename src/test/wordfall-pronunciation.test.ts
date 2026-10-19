import { describe, expect, it } from "vitest";
import { WORDFALL_WORDS } from "@/lib/wordfall-difficulty";
import { getWordfallSentence } from "@/lib/wordfall-sentences";
import { wordfallSpokenSentence, wordfallSpokenWord } from "@/lib/wordfall-pronunciation";

const withoutNikud = (text: string) => text.replace(/[\u0591-\u05c7]/g, "");

describe("Wordfall speech-only vocalization", () => {
  it("provides vocalized word and sentence readings for every standalone target", () => {
    for (const word of WORDFALL_WORDS) {
      const sentence = getWordfallSentence(word.hebrew);
      if (!sentence) throw new Error(`Missing sentence: ${word.hebrew}`);
      expect(wordfallSpokenWord(word.hebrew), word.hebrew).toMatch(/[\u05b0-\u05bc]/);
      const spoken = wordfallSpokenSentence(word.hebrew, sentence.hebrew);
      expect(spoken, word.hebrew).toMatch(/[\u05b0-\u05bc]/);
      expect(withoutNikud(spoken), word.hebrew).toBe(sentence.hebrew.replace(/[[\]]/g, ""));
      expect(word.hebrew).not.toMatch(/[\u0591-\u05c7]/);
    }
  });

  it("disambiguates Hebrew pronunciations using the source meaning", () => {
    expect(wordfallSpokenWord("ספר")).toBe("סֵפֶר");
    expect(wordfallSpokenWord("בור")).toBe("בּוּר");
    expect(wordfallSpokenWord("סבא")).toBe("סָבָא");
    expect(wordfallSpokenWord("הפציר")).toBe("הִפְצִיר");
    expect(wordfallSpokenWord("אמתלה")).toBe("אֲמַתְלָה");
    expect(wordfallSpokenSentence("אמתלה", "")).toBe("הוּא מָצָא אֲמַתְלָה לְהִישָּׁאֵר בַּבַּיִת.");
  });

  it("keeps unknown speech usable without inventing a pronunciation", () => {
    expect(wordfallSpokenWord("לא במאגר")).toBe("לא במאגר");
    expect(wordfallSpokenSentence("לא במאגר", "זה [משפט].")).toBe("זה משפט.");
  });
});