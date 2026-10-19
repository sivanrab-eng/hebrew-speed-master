import { useEffect, useState } from "react";
import { Download, Share2, Volume2, VolumeX, X, Play, CloudRain, Infinity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WordRain } from "@/components/WordRain";
import { sfx } from "@/lib/sfx";
import { initWordfallAnalytics, trackWordfall } from "@/lib/wordfall-analytics";
import { WORDFALL_URL } from "@/lib/wordfall-config";
import icon from "@/assets/wordfall-icon.jpg";
import { type WordfallMode } from "@/lib/wordfall-modes";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function Wordfall() {
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<WordfallMode>("regular");
  const [muted, setMuted] = useState(false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [notice, setNotice] = useState("");
  const [ios, setIos] = useState(false);

  useEffect(() => {
    initWordfallAnalytics();
    setMuted(localStorage.getItem("wordfall-muted") === "1");
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    const beforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); setInstructions(false); trackWordfall("app_install"); };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", beforeInstall); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Wordfall", text: "גשם של מילים. כמה תצליחו לתפוס?", url: WORDFALL_URL });
        trackWordfall("share", { method: "native" });
      } else {
        await navigator.clipboard.writeText(WORDFALL_URL);
        setNotice("הקישור הועתק!");
        trackWordfall("share", { method: "copy" });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setNotice(`אפשר לשתף את הקישור: ${WORDFALL_URL}`);
    }
  };

  const install = async () => {
    trackWordfall("install_prompt", { method: prompt ? "native" : "instructions" });
    if (!prompt) { setInstructions(true); return; }
    try { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }
    catch { setInstructions(true); }
  };

  return (
    <main dir="rtl" className="wordfall mx-auto min-h-svh max-w-xl px-4 py-3 font-sans text-foreground">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><img src={icon} width={48} height={48} alt="" className="h-12 w-12 rounded-lg" /><h1 dir="ltr" className="font-display text-3xl text-secondary">Wordfall</h1></div>
        <Button variant="ghost" size="icon" title={muted ? "הפעלת צלילים" : "השתקת צלילים"} aria-label={muted ? "הפעלת צלילים" : "השתקת צלילים"} onClick={() => setMuted(value => { localStorage.setItem("wordfall-muted", value ? "0" : "1"); return !value; })}>{muted ? <VolumeX /> : <Volume2 />}</Button>
      </header>
      {playing ? <WordRain standalone mode={mode} muted={muted} onExit={() => setPlaying(false)} onGameStart={() => trackWordfall("game_start", { mode })} onGameComplete={score => trackWordfall("game_complete", { score, rounds: 10, mode })} /> : (
        <section className="flex flex-col items-center gap-3 py-2 text-center">
          <img src={icon} alt="טיפת Wordfall זוהרת" width={192} height={192} className="h-28 w-28 rounded-lg" />
          
          <p className="font-display text-2xl">לתפוס את הגשם</p>
          <div role="group" aria-label="מצב משחק" className="grid w-full grid-cols-2 gap-3">
            <Button variant={mode === "regular" ? "default" : "outline"} aria-pressed={mode === "regular"} onClick={() => setMode("regular")} className="h-12 gap-2 text-lg"><Zap /> רגיל</Button>
            <Button variant={mode === "practice" ? "default" : "outline"} aria-pressed={mode === "practice"} onClick={() => setMode("practice")} className="h-12 gap-2 text-lg"><Infinity /> תרגול</Button>
          </div>
          <Button size="lg" className="h-14 w-full text-xl font-bold shadow-[var(--shadow-pop)]" onClick={() => { sfx.unlock(); setPlaying(true); }}><Play />{mode === "regular" ? "מתחילים" : "מתחילים לתרגל"}</Button>
        </section>
      )}
      {!playing && <footer className="mt-3 flex justify-center gap-3 border-t border-border pt-3">
        <Button variant="outline" size="sm" onClick={() => void share()}><Share2 /> שיתוף</Button>
        <Button variant="outline" size="sm" disabled={installed} onClick={() => void install()}><Download />{installed ? "מותקן" : "התקנה"}</Button>
      </footer>}
      {notice && <p role="status" className="mt-4 break-words text-center text-sm text-secondary">{notice}</p>}
      {instructions && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-5" role="dialog" aria-modal="true" aria-labelledby="install-title">
        <div className="relative w-full max-w-sm rounded-lg border border-border bg-card p-6">
          <Button variant="ghost" size="icon" className="absolute left-2 top-2" aria-label="סגירה" onClick={() => setInstructions(false)}><X /></Button>
          <h2 id="install-title" className="mb-4 text-2xl text-secondary">Wordfall במסך הבית</h2>
          <p className="leading-8">{ios ? "פתחי את המשחק ב־Safari, לחצי על סמל השיתוף ובחרי ״הוספה למסך הבית״." : "פתחי את המשחק ב־Chrome או Edge, פתחי את תפריט הדפדפן ובחרי ״התקנת אפליקציה״ או ״הוספה למסך הבית״, אם האפשרות זמינה."}</p>
          <p className="mt-3 text-sm text-muted-foreground">המשחק דורש חיבור לאינטרנט.</p>
          <Button className="mt-5 w-full" onClick={() => setInstructions(false)}>הבנתי</Button>
        </div>
      </div>}
    </main>
  );
}