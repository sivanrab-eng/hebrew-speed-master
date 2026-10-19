export type WordfallMode = "regular" | "practice";

// Celebration rewards are visual only: existing points and tier rules stay intact.
export function streakCelebration(streak: number): string | null {
  if (streak === 3) return "שלוש ברצף!";
  if (streak === 5) return "רצף מחשמל!";
  if (streak === 8) return "גשם של כוכבים!";
  return null;
}

export const collectedStars = (catches: number): number => Math.min(3, Math.floor(catches / 3));