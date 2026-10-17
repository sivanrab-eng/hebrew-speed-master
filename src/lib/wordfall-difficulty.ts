import { VOCAB, type Word } from "./vocab";

const everyday = (pairs: string[][]): Word[] => pairs.map(([hebrew = "", english = ""]) => ({
  hebrew, english, root: "", exampleSentenceHebrew: "", exampleSentenceEnglish: "", synonyms: [], antonyms: [],
}));

const first = everyday([
  ["בית", "house"], ["כלב", "dog"], ["חתול", "cat"], ["מים", "water"], ["לחם", "bread"],
  ["שמש", "sun"], ["ירח", "moon"], ["ספר", "book"], ["דלת", "door"], ["חלון", "window"],
  ["ילד", "boy"], ["ילדה", "girl"], ["אמא", "mother"], ["אבא", "father"], ["חבר", "friend"],
  ["יום", "day"], ["לילה", "night"], ["יד", "hand"], ["רגל", "leg"], ["ראש", "head"],
  ["עץ", "tree"], ["פרח", "flower"], ["דג", "fish"], ["ציפור", "bird"], ["תפוח", "apple"],
  ["חלב", "milk"], ["כדור", "ball"], ["כיסא", "chair"], ["שולחן", "table"], ["מיטה", "bed"],
  ["אדום", "red"], ["כחול", "blue"], ["ירוק", "green"], ["צהוב", "yellow"], ["גדול", "big"],
  ["קטן", "small"], ["חם", "hot"], ["קר", "cold"], ["שמח", "happy"], ["חדש", "new"],
]);
const second = everyday([
  ["מטבח", "kitchen"], ["חולצה", "shirt"], ["נעליים", "shoes"], ["מפתח", "key"], ["תיק", "bag"],
  ["רחוב", "street"], ["חנות", "shop"], ["גשר", "bridge"], ["רכבת", "train"], ["אופניים", "bicycle"],
  ["ענן", "cloud"], ["גשם", "rain"], ["רוח", "wind"], ["שלג", "snow"], ["חוף", "beach"],
  ["ארוחה", "meal"], ["ירקות", "vegetables"], ["פירות", "fruit"], ["כפית", "teaspoon"], ["צלחת", "plate"],
  ["מתנה", "gift"], ["מסיבה", "party"], ["מוזיקה", "music"], ["תמונה", "picture"], ["שעון", "clock"],
  ["מהיר", "fast"], ["איטי", "slow"], ["מתוק", "sweet"], ["מלוח", "salty"], ["נקי", "clean"],
  ["לשחק", "to play"], ["לרוץ", "to run"], ["לשיר", "to sing"], ["לצחוק", "to laugh"], ["לישון", "to sleep"],
  ["לקפוץ", "to jump"], ["לפתוח", "to open"], ["לסגור", "to close"], ["למצוא", "to find"], ["לבחור", "to choose"],
]);
const third = everyday([
  ["הזדמנות", "opportunity"], ["הפתעה", "surprise"], ["הצלחה", "success"], ["החלטה", "decision"], ["רעיון", "idea"],
  ["זיכרון", "memory"], ["דמיון", "imagination"], ["תקווה", "hope"], ["סבלנות", "patience"], ["אומץ", "courage"],
  ["סקרנות", "curiosity"], ["אחריות", "responsibility"], ["הרפתקה", "adventure"], ["תחרות", "competition"], ["מטרה", "goal"],
  ["פתרון", "solution"], ["תעלומה", "mystery"], ["מסע", "journey"], ["סביבה", "environment"], ["מנהג", "custom"],
  ["להסביר", "to explain"], ["להציע", "to suggest"], ["להבטיח", "to promise"], ["להצליח", "to succeed"], ["להתאמץ", "to make an effort"],
  ["להתרגש", "to feel excited"], ["להתלבט", "to hesitate"], ["להתפלא", "to be surprised"], ["להקשיב", "to listen"], ["לוותר", "to give up"],
]);
const intermediateLabels = new Set([
  "אמתלה", "ביאור", "בן לוויה", "בעליל", "גהר", "גמר אומר", "דובב", "התרה", "השגה", "הדיף",
  "הוכיח", "הסלים", "הפציר", "הצטדק", "התאווה", "התאונן", "התחבט", "התחוור", "התחקה", "התפכח",
  "חלץ", "כמיהה", "לערך", "מן הנמנע", "מורת רוח",
]);
const intermediate = VOCAB.filter(word => intermediateLabels.has(word.hebrew));
export const WORDFALL_POOLS: readonly Word[][] = [first, second, third, intermediate, VOCAB.filter(word => !intermediateLabels.has(word.hebrew))];
export const WORDFALL_WORDS = WORDFALL_POOLS.flat();
export const DIFFICULTY_STORAGE_KEY = "wordfall-difficulty-v1";
export type DifficultyProgress = { level: number; wins: number };
export const initialDifficulty = (): DifficultyProgress => ({ level: 0, wins: 0 });

export function normalizeDifficulty(value: unknown): DifficultyProgress {
  if (!value || typeof value !== "object" || !("level" in value) || !("wins" in value)) return initialDifficulty();
  const { level, wins } = value;
  if (typeof level !== "number" || !Number.isInteger(level) || level < 0 || level >= WORDFALL_POOLS.length ||
    typeof wins !== "number" || !Number.isInteger(wins) || wins < 0 || wins > 1) return initialDifficulty();
  return { level, wins };
}

// Two strong completed games unlock one tier; mistakes never remove earned progress.
export function completeDifficulty(progress: DifficultyProgress, score: number): DifficultyProgress {
  if (score < 8 || progress.level >= WORDFALL_POOLS.length - 1) return progress;
  return progress.wins === 1 ? { level: progress.level + 1, wins: 0 } : { ...progress, wins: 1 };
}

export function difficultyPool(progress: DifficultyProgress): Word[] {
  return WORDFALL_POOLS[progress.level] ?? first;
}