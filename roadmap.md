# Roadmap

## Wordfall consistent gentle mix and pronunciation (preview only)
- [x] Guarantee seven everyday and three rich targets at every tier, including replays; preserve the approved five-target replacement split. All five tiers and six replays per tier pass the concrete mix assertions.
- [x] Add standalone-only vocalized speech text for all 407 words and sentences, drafted offline with Dicta and curated ambiguous word readings; visible vocabulary and arcade audio are unchanged. No runtime service or extra app dependency.
- [x] 73 tests passed, build OK; three full preview games verified 7+3 at levels 1 and 2, five balanced replacements on the level-2 replay, vocalized engine input and healthy sentence freezes beyond four seconds. Original arcade opening preserved, no runtime errors. Audible pronunciation quality still needs real-device listening; no GitHub upload.

## Wordfall sentence freeze (preview only)
- [x] Freeze new-word catches until Hebrew sentence completion; use a four-second audio-failure watchdog without cutting healthy longer speech. Familiar catches and arcade unchanged.
- [x] 68 tests passed; two full preview games verified six frozen sentence readings beyond four seconds, continuation on speech end, 10/10 results and no runtime errors. Browser speech was instrumented, not audibly verified. Build OK; no upload.

## Wordfall replay variety (preview only)
- [x] Replace four everyday and one rich target on every tier-1 replay; replace three everyday and two rich targets on higher-tier replays, preserving mix and difficulty.
- [x] Tests verify six consecutive refreshes in all five tiers; two full preview games confirmed exactly four new everyday targets and one rich target on Play Again. No publication or arcade changes.

## Wordfall mixed rounds and reliable Hebrew audio (preview only)
- [x] Interleave rich/new targets naturally with everyday targets while preserving the repeated ten-word batch and arcade behavior.
- [x] Give caught Hebrew sentences priority over SFX, later word readings and introduction speech without pausing rounds.
- [x] Verify tests and a complete preview game: 63 tests passed; ten catches completed with rich targets at rounds 2, 5 and 9; mocked engine calls confirmed no next-round cancellation. Actual audible playback remains device-dependent. No GitHub upload.
- [x] User reports no current mispronunciations; leave pronunciation data unchanged.

## Wordfall sentence strip
- [x] The new-word card reads English first, then the Hebrew word 150ms after English ends or errors, with the two-second fallback and stale-timer cancellation kept. 12 speech tests pass; a live recording showed en-US at 783ms then he-IL at 967ms, and en-US at 16785ms then he-IL at 16944ms.
- [x] Every standalone word already has a simple Hebrew example sentence (407 label-keyed entries in wordfall-sentences.json, coverage asserted by a test).
- [x] Catching a word the player was introduced to shows a simple Hebrew-only example sentence in a strip under the falling field and reads it in Hebrew only, immediately, without stopping the rain or the round; it stays 4.5 seconds and always shows the latest catch, and a familiar everyday word shows no strip at all. 57 tests pass; a live game confirmed hebrew-only strips for 'התבדה', 'הפציר' and 'קצר רוח' with the round advancing, and zero strip sightings for four everyday catches. Preview only — ניאונית untouched, nothing uploaded.

## Wordfall new-word only sentence
- [x] Show the sentence card only for words the player met on the "טיפה חדשה!" introduction; familiar words are heard once and the rain keeps falling. 58 tests pass; a live game confirmed the strip for 'רהוט' and no strip for five everyday catches. Preview only, not uploaded.


## Wordfall sentence reading
- [x] Read the caught word's sentence aloud in Hebrew when the review card opens, and keep the card on screen until the reading ends (with a fallback cap); arcade catches unchanged, preview only until asked. 56 tests pass; browser run confirmed the automatic he-IL sentence utterance, the card held past the old 3s window and continuation into round 2.

## Wordfall neon catch trial
- [x] Add standalone neon catch particles/flash/trails and layered sound, no-pressure points and streaks, three-second sentence pauses with hold/continue/audio, and end review prioritizing rich caught words; preserve arcade behavior and fixed pace.
- [x] Add 407 label-keyed Hebrew sentence/English translation examples without nikud. All 51 tests passed; full browser game confirmed 10/10, 1750 points, held reading without falling words, optional tier advancement, fresh-visit reset, mobile no overflow and no runtime errors. Build OK. Preview only; not published. Actual audible output remains device-dependent.

## Publish complete approved Wordfall trial
- [x] Uploaded the standalone dependency subset to sivanrab-eng/Wordfall (1d93a211); configured WORDFALL_GA_MEASUREMENT_ID = G-8W3MVMWVQW. GitHub tests, build and Pages deployment run 39057344984 succeeded. Three full live games confirmed seven everyday targets, three six-second introductions, identical targets across three games, optional tier advancement and fresh-visit reset; speech engine calls confirmed 150ms sequencing, analytics script loaded, manifest scope resolves to /Wordfall/, no runtime errors. No arcade application code changed.

## Wordfall speech timing
- [x] Sequence English 150ms after Hebrew end/error, with a two-second fallback and cancellation of stale timers. All 43 tests pass; browser instrumentation confirmed automatic sequencing, no stale English on repeat, and resumed falling after the introduction. Headless speech was checked through engine calls, not audible playback. Build OK; preview only, not uploaded.

## Wordfall calm reading
- [x] Hold the new-word card (Hebrew word with its simple English meaning) on screen for six seconds before the words start falling, with nothing falling during the pause; 31 tests pass and the live preview measured 6.0s twice. Preview only, not uploaded.

## Wordfall gentle trial
- [x] Level 1: seven everyday targets, three rich targets, no harder-tier mixing; repeat targets across three games, introduce new rich pairs before falling, and offer optional tier advancement after eight catches. All 33 tests pass; two complete browser games confirmed 7/3 mix, three first-time introductions, identical replay targets with no repeat introductions, staying at level 1 on replay, and level 2 only on choice. Build OK, no browser errors; preview only, not uploaded.

## Wordfall fresh start
- [x] Start every fresh standalone opening at level 1, ignoring previously saved device progress; preserve advancement between completed games during the current visit. All 26 targeted tests pass; full browser game with 8/10 unlocked level 2, next game used level 2, and refresh returned to level 1 even with old level-5 storage. Build OK, no browser errors. Not uploaded to the separate Wordfall repository.

## Publish approved Wordfall update
- [x] Uploaded the approved confidence mix, one-game tier unlock, and slower fixed pace to the separate Wordfall repository (commit 6a8f21c); deployment succeeded. Complete live game verified: exactly three everyday words, 8/10 catches unlock tier 2 with refresh persistence, fixed 7s falls, no speed banner or runtime errors. ניאונית unchanged.

## Wordfall confidence mix
- [x] Include exactly three everyday Hebrew targets in every ten-round standalone game at all five tiers; preserve seven rich words and simple English, leaving other games unchanged. All 25 targeted tests pass.
- [x] Verify a complete game with exactly eight catches unlocks the next tier after one game and survives refresh; browser confirmed three everyday targets, 8/10 catches, tier 2 unlock and persistence without runtime errors. Not uploaded to the separate Wordfall repository.

## Wordfall rich Hebrew, simple English
- [x] Restore all 387 rich source Hebrew labels across five graded tiers, simplifying every English meaning to everyday words or short phrases; other games retain original vocabulary. Fifteen tests pass, local build OK, separate Wordfall deployment succeeded; two full games, tier unlock, persistence and mobile verified live without browser errors.

## Wordfall easy start
- [x] Success-based difficulty between games (one game with 8+ catches unlocks one tier), preserving other games. Each standalone game now mixes three everyday Hebrew words with seven rich Hebrew words and simple English.

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
- [x] Configure Google Analytics for standalone Wordfall through the supplied repository measurement ID; confirmed the matching analytics script loads on the live site. Analytics reporting dashboard receipt was not checked.
- [x] Tests and local end-to-end verification.
- [x] Verify latest Wordfall on GitHub — commit 1548964 reached main, deploy run #14 green, banner confirmed live in a real browser.
- [x] Wordfall falls slower (7s instead of 5s, ten-second rounds) and keeps one steady pace — the speed jump and its banner are off there for now; the arcade word rain keeps 5s falls, the +10% jump and the banner. Twenty-seven tests pass; full games verified in the browser for both games. Not uploaded to the separate Wordfall repository.

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

- [x] Wordfall reads the new-word card aloud (Hebrew word, then its simple English meaning) when the introduction opens, with an in-card "שמיעה חוזרת" repeat button; catches keep speaking only the Hebrew word. Verified by a unit test (button present, game continues) and a live browser check capturing the queued he-IL + en-US utterances.
