let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}
function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.15) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
export const sfx = {
  unlock: () => ac(),
  correct: () => { tone(660, 0, 0.12, "triangle"); tone(990, 0.07, 0.18, "triangle"); },
  catchNeon: (streak: number) => {
    const lift = Math.min(Math.floor(streak / 3), 3) * 80;
    tone(580 + lift, 0, 0.09, "sine", 0.11);
    tone(870 + lift, 0.045, 0.14, "triangle", 0.09);
    tone(1160 + lift, 0.10, 0.19, "sine", 0.08);
    if ([3, 5, 8].includes(streak)) tone(1450, 0.18, 0.22, "triangle", 0.07);
  },
  speedUp: () => { tone(520, 0, 0.08, "triangle", 0.1); tone(780, 0.06, 0.09, "triangle", 0.1); tone(1040, 0.12, 0.14, "triangle", 0.1); },
  wrong: () => { tone(220, 0, 0.18, "square", 0.08); tone(160, 0.1, 0.22, "square", 0.08); },
  tick: () => tone(1400, 0, 0.04, "sine", 0.07),
  end: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle")),
};
