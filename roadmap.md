# Roadmap

## Wordfall
- [ ] Remove learning/exam references from ניאונית opening; replace with short playful copy.
- [ ] Standalone GitHub entry; preserve ניאונית.
- [ ] Sharing and home-screen install support.
- [ ] Google Analytics connection and game events.
- [ ] Tests and end-to-end verification.

- [x] GitHub Actions workflow ל-GitHub Pages (.github/workflows/deploy.yml)
- [x] Prerender סטטי של עמוד המשחק (vite.config.ts)
- [x] SPA fallback — 404.html + .nojekyll בשלב הבנייה של ה-Workflow
- [x] base path דינמי (VITE_BASE_PATH) ב-vite.config וב-router
- [x] עדכון base path ל-/hebrew-speed-master/ (ריפו: sivanrab-eng/hebrew-speed-master)
- [x] בניית בדיקה עם ה-base path — עברה, build OK
- [x] חיבור הפרויקט לריפו hebrew-speed-master ב-GitHub
- [ ] הגדרת Settings → Pages → Source: GitHub Actions בריפו (פעולת משתמש)
- [ ] הפיכת הריפו לציבורי (נדרש ל-Pages בחשבון חינמי) (פעולת משתמש)
- [ ] וידוא שריצת ה-Actions "Deploy to GitHub Pages" ירוקה והאתר נפתח
- [x] תיקון כשל CI: workflow מאתר לבד את תיקיית הפלט (dist/client או .output/public)

- [x] מדריך חיבור ל-GitHub בתוך האפליקציה (מסך במשחק, נפתח ממסך הפתיחה) — נבדק בדפדפן, כולל בנייה סטטית ל-GitHub Pages
