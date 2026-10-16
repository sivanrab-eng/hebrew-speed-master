# Roadmap

## Wordfall
- [x] Gradual word-rain speed: +10% per three consecutive catches; streak reset only; retain ten rounds; tests and full browser game verified.
- [x] Short "מגבירים קצב!" banner on every speed increase — non-blocking, never covers a falling word; verified in tests and browser.
- [x] Remove learning/exam references from ניאונית opening; replace with short playful copy.
- [x] Standalone GitHub entry; preserve ניאונית.
- [x] Sharing and home-screen install support.
- [x] Google Analytics event code and GitHub measurement-ID variable.
- [ ] Activate Google Analytics — blocked: user declined the connection; measurement ID not configured.
- [x] Tests and local end-to-end verification.
- [ ] Verify latest Wordfall on GitHub — waiting for managed Git sync and automatic deployment.

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
