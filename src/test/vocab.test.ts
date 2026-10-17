import { describe, expect, it } from "vitest";
import sourceVocabulary from "@/lib/vocabulary-data.json";
import { VOCAB } from "@/lib/vocab";

describe("replacement vocabulary", () => {
  it("uses all 388 source records, merging repeated visible answers", () => {
    expect(sourceVocabulary).toHaveLength(388);
    expect(VOCAB).toHaveLength(387);
    expect(new Set(VOCAB.map(word => word.hebrew)).size).toBe(387);
    for (const row of sourceVocabulary) {
      const word = VOCAB.find(candidate => candidate.hebrew === row.hebrew);
      expect(word?.english).toContain(row.english);
      expect(word?.definition).toContain(row.definition);
    }
  });

  it("displays the supplied Hebrew without nikud and replaces old entries", () => {
    expect(VOCAB.some(word => /[\u0591-\u05C7]/u.test(word.hebrew))).toBe(false);
    expect(VOCAB.find(word => word.hebrew === "אדווה")?.english).toBe("ripple");
    expect(VOCAB.find(word => word.hebrew === "תתרן")?.english).toBe("person without a sense of smell; anosmic person");
    expect(VOCAB.some(word => word.hebrew === "לְאַלְתֵּר")).toBe(false);
  });
});