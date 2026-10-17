# Roadmap

## Wordfall easy start
- [x] Add 110 everyday words across three starter tiers and success-based difficulty between games (two games with 8+ catches unlock one tier), preserving other games. Fourteen tests pass; two complete games, unlock, saved progress and mobile fit verified locally and live at the separate Wordfall site; GitHub deployment succeeded.

## Separate Wordfall repository
- [x] Upload only the standalone falling-word game to sivanrab-eng/Wordfall, retaining the original application; GitHub deployment succeeded and the live game completed with 10/10 catches, speed banner and restart, with no browser errors.

## Vocabulary replacement
- [x] Replace the shared vocabulary in all games with all 388 source records, without nikud; merge the repeated label נבצר into one of 387 unique answers while preserving both meanings.
- [x] Adapt details and hints to source definitions without inventing enrichment; nine tests pass and cards, memory, speed challenge, and a full Wordfall game verified in the browser. Multiplayer shares the same vocabulary; a live multiplayer session was not tested.

## Wordfall
- [x] Gradual word-rain speed: +10% per three consecutive catches; streak reset only; retain ten rounds; tests and full browser game verified.
- [x] Short "מגבירים קצב!" banner on every speed increase — non-blocking, never covers a falling word; verified in tests and browser.
- [x] Remove learning/exam references from ניאונית opening; replace with short playful copy.
- [x] Standalone GitHub entry; preserve ניאונית.
- [x] Sharing and home-screen install support.
- [x] Google Analytics event code and GitHub measurement-ID variable.
- [ ] Activate Google Analytics — blocked: user declined the connection; measurement ID not configured.
- [x] Tests and local end-to-end verification.
- [x] Verify latest Wordfall on GitHub — commit 1548964 reached main, deploy run #14 green, banner confirmed live in a real browser.

- [x] GitHub Actions workflow ל-GitHub Pages (.github/workflows/deploy.yml)
- [x] Prerender סטטי של עמוד המשחק (vite.config.ts)
- [x] SPA fallback — 404.html + .nojekyll בשלב הבנייה של ה-Workflow
- [x] base path דינמי (VITE_BASE_PATH) ב-vite.config וב-router
- [x] עדכון base path ל-/hebrew-speed-master/ (ריפו: sivanrab-eng/hebrew-speed-master)
- [x] בניית בדיקה עם ה-base path — עברה, build OK
- [x] חיבור הפרויקט לריפו hebrew-speed-master ב-GitHub
- [x] הגדרת Settings → Pages → Source: GitHub Actions בריפו
- [x] הפיכת הריפו לציבורי
- [x] וידוא שריצת ה-Actions הקודמת ירוקה
- [x] תיקון כשל CI: workflow מאתר לבד את תיקיית הפלט (dist/client או .output/public)

- [x] מדריך חיבור ל-GitHub בתוך האפליקציה (מסך במשחק, נפתח ממסך הפתיחה) — נבדק בדפדפן, כולל בנייה סטטית ל-GitHub Pages
