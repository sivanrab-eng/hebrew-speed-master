import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Github,
  Smartphone,
  Monitor,
  Check,
  ChevronLeft,
  CircleAlert,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "חיבור הפרויקט ל-GitHub | Speed Vocab" },
      {
        name: "description",
        content:
          "מדריך שלב-אחר-שלב בעברית לחיבור פרויקט Lovable ל-GitHub ולהפעלת GitHub Pages עם Source מסוג GitHub Actions.",
      },
      { property: "og:title", content: "חיבור הפרויקט ל-GitHub" },
      {
        property: "og:description",
        content:
          "שלבים לחיבור הסנכרון הדו-כיווני עם GitHub והפעלת פריסה אוטומטית ב-GitHub Pages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GithubGuide,
});

type Platform = "mobile" | "desktop";

const mobileSteps = [
  {
    title: "פתחי את תפריט ה־'...'",
    desc: "בפינה הימנית-תחתונה של המסך, במצב Chat.",
  },
  {
    title: "בחרי Connectors",
    desc: "פריט ברשימה הראשית — אל תחפשי 'GitHub' בשורת החיפוש, הוא לא יופיע שם.",
  },
  {
    title: "בחרי GitHub → Connect project",
    desc: "גללי ברשימה עד שתמצאי את הפריט GitHub.",
  },
  {
    title: "אשרי את אפליקציית Lovable",
    desc: "תועברי ל-GitHub כדי לאשר הרשאות ולבחור חשבון או ארגון.",
  },
  {
    title: "Create Repository",
    desc: "חזרי ל-Lovable והקישי על Create Repository כדי ליצור ריפו חדש.",
  },
];

const desktopSteps = [
  {
    title: "פתחי את Connectors",
    desc: "ברמה העליונה בסרגל הצד השמאלי.",
  },
  {
    title: "GitHub → Connect project",
    desc: "מצאי את GitHub ברשימת האינטגרציות.",
  },
  {
    title: "אשרי את אפליקציית Lovable",
    desc: "בחרי חשבון או ארגון ב-GitHub שאליו ייווצר ה-repo.",
  },
  {
    title: "Create Repository",
    desc: "Lovable יצור ריפו חדש ויסנכרן אליו את הקוד.",
  },
];

const checks = [
  <>
    ב-Lovable: פתחי <span className="font-semibold">Connectors → GitHub</span> —
    צריך להופיע סטטוס <span className="font-semibold">Connected</span> ושם הריפו.
  </>,
  <>
    ב-GitHub: היכנסי לחשבון/ארגון שבחרת — הריפו החדש אמור להופיע עם קבצי הפרויקט.
  </>,
  <>
    בדיקת סנכרון: בצעי שינוי קטן ב-Lovable (למשל טקסט) ורענני את הריפו ב-GitHub —
    הקומיט החדש אמור להופיע תוך שניות.
  </>,
];

function GithubGuide() {
  const [platform, setPlatform] = useState<Platform>("mobile");
  const [completed, setCompleted] = useState<number[]>([]);
  const steps = platform === "mobile" ? mobileSteps : desktopSteps;
  const allDone = completed.length === steps.length;

  const toggle = (i: number) =>
    setCompleted((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  const reset = () => setCompleted([]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-background bg-[image:var(--gradient-bg)] px-4 py-6 font-sans text-foreground"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold transition hover:border-primary"
          >
            <ArrowRight className="h-4 w-4" /> חזרה למשחק
          </Link>
          <div className="flex items-center gap-2 font-display text-lg font-black">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
              <Github className="h-4 w-4" />
            </span>
            Speed Vocab
          </div>
        </header>

        <section className="rounded-3xl border border-border bg-card p-7 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
            <Github className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-black sm:text-4xl">
            חיבור הפרויקט ל-GitHub
          </h1>
          <p className="mt-2 text-muted-foreground">
            מדריך שלב-אחר-שלב לחיבור הסנכרון הדו-כיווני — ולבדוק שהפריסה אוטומטית.
          </p>
        </section>

        <div className="flex gap-1 rounded-2xl border border-border bg-muted/60 p-1">
          {(
            [
              ["mobile", "נייד", <Smartphone key="m" className="h-4 w-4" />],
              ["desktop", "מחשב", <Monitor key="d" className="h-4 w-4" />],
            ] as const
          ).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => {
                setPlatform(key);
                reset();
              }}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                platform === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-muted-foreground">
              התקדמות: {completed.length} מתוך {steps.length}
            </span>
            {completed.length > 0 && (
              <button
                onClick={reset}
                className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
              >
                איפוס
              </button>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completed.length / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const done = completed.includes(i);
            return (
              <li key={step.title}>
                <button
                  onClick={() => toggle(i)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-3xl border border-border bg-card p-5 text-right shadow-[var(--shadow-card)] transition-all hover:border-primary/60",
                    done && "border-primary/50 bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-black",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block font-display text-lg font-black leading-tight",
                        done && "text-primary",
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {step.desc}
                    </span>
                  </span>
                  <ChevronLeft className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            );
          })}
        </ol>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 font-display text-xl font-black">
            איך לוודא שהחיבור הושלם?
          </h2>
          <ul className="flex flex-col gap-3">
            {checks.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <p className="text-sm leading-relaxed">{c}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-start gap-3 rounded-3xl border border-dashed border-border bg-muted/40 p-5">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-black text-foreground">שימי לב:</span> GitHub
            אינו קונקטור רגיל ולא יופיע בחיפוש בתוך Connectors — מצאי אותו ברשימה
            עצמה.
          </p>
        </section>

        {allDone && (
          <section className="flex items-start gap-3 rounded-3xl border border-primary/50 bg-primary/10 p-6 shadow-[var(--shadow-card)]">
            <Sparkles className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-display text-lg font-black">
                מעולה — סיימת את כל השלבים!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                הסנכרון הדו-כיווני עם GitHub פעיל. שינויים יסתנכרנו אוטומטית בשני
                הכיוונים, והפריסה ל-GitHub Pages תרוץ לבד בכל Push ל־main.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
