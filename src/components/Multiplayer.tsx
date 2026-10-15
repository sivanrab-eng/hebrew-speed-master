import { useEffect, useRef, useState } from "react";
import { ArrowRight, Users, Crown, Copy, Play, Trophy, Timer, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VOCAB } from "@/lib/vocab";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

const QCOUNT = 10;
const QTIME = 10;
type Room = { id: string; code: string; host_client: string; status: string; questions: { w: number; opts: number[] }[]; current_q: number; last_winner: string | null; last_q: number };
type Player = { id: string; client_id: string; nickname: string; score: number; locked_q: number };

function clientId() {
  let id = localStorage.getItem("sv-client");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sv-client", id); }
  return id;
}
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };
function makeQuestions() {
  const idx = VOCAB.map((_, i) => i);
  return shuffle(idx).slice(0, QCOUNT).map((w) => ({ w, opts: shuffle([w, ...shuffle(idx.filter((i) => i !== w)).slice(0, 3)]) }));
}
const errMsg = (m: string) => m.includes("not found") ? "לא נמצא חדר עם הקוד הזה" : m.includes("full") ? "החדר מלא (4 שחקנים)" : m.includes("started") ? "המשחק בחדר הזה כבר התחיל" : m.includes("nickname") ? "כינוי לא תקין" : "משהו השתבש, נסו שוב";

export function Multiplayer({ onExit, muted }: { onExit: () => void; muted: boolean }) {
  const [me, setMe] = useState("");
  const [nick, setNick] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const play = (k: keyof typeof sfx) => { if (!muted) sfx[k](); };

  useEffect(() => { setMe(clientId()); setNick(localStorage.getItem("sv-nick") || ""); }, []);

  const load = async (id: string) => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from("rooms").select("*").eq("id", id).single(),
      supabase.from("room_players").select("*").eq("room_id", id).order("joined_at"),
    ]);
    if (r) setRoom(r as unknown as Room);
    if (ps) setPlayers(ps as Player[]);
  };

  useEffect(() => {
    if (!roomId) return;
    load(roomId);
    const ch = supabase.channel(`room-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (p) => { if (p.new && "id" in p.new) setRoom(p.new as unknown as Room); })
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` }, () => load(roomId))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId]);

  const create = async () => {
    if (!nick.trim()) return setErr("כתבו כינוי");
    setBusy(true); setErr(""); sfx.unlock(); localStorage.setItem("sv-nick", nick.trim());
    const { data, error } = await supabase.rpc("mp_create_room", { p_client: me, p_nick: nick.trim() });
    if (error || !data) { setBusy(false); return setErr(errMsg(error?.message || "")); }
    const { data: r } = await supabase.from("rooms").select("id").eq("code", data).single();
    setBusy(false); if (r) setRoomId(r.id);
  };
  const join = async () => {
    if (!nick.trim()) return setErr("כתבו כינוי");
    if (code.trim().length !== 4) return setErr("קוד החדר הוא 4 ספרות");
    setBusy(true); setErr(""); sfx.unlock(); localStorage.setItem("sv-nick", nick.trim());
    const { data, error } = await supabase.rpc("mp_join_room", { p_code: code.trim(), p_client: me, p_nick: nick.trim() });
    setBusy(false);
    if (error || !data) return setErr(errMsg(error?.message || ""));
    setRoomId(data);
  };
  const leave = async () => {
    if (roomId) await supabase.rpc("mp_leave_room", { p_room: roomId, p_client: me });
    setRoomId(null); setRoom(null); setPlayers([]);
  };

  if (!roomId || !room) {
    return (
      <section className="flex flex-col gap-4">
        <button onClick={onExit} className="flex items-center gap-1 self-start text-sm font-bold text-muted-foreground hover:text-primary"><ArrowRight className="h-4 w-4" /> חזרה</button>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="flex items-center gap-2 font-display text-2xl font-black"><Users className="h-6 w-6 text-primary" /> משחק מרובה משתתפים</h2>
          <p className="mt-2 text-muted-foreground">עד 4 שחקנים. כולם רואים את אותה שאלה — מי שעונה נכון ראשון לוקח את הנקודה!</p>
          <label className="mt-5 block text-sm font-bold">הכינוי שלך</label>
          <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={20} placeholder="למשל: נועה"
            className="mt-1 w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary" />
          <button onClick={create} disabled={busy} className="mt-4 w-full rounded-2xl bg-primary py-4 text-lg font-black text-primary-foreground shadow-[var(--shadow-pop)] transition active:scale-95 disabled:opacity-60">יצירת חדר חדש</button>
          <div className="my-4 flex items-center gap-3 text-sm text-muted-foreground"><span className="h-px flex-1 bg-border" />או<span className="h-px flex-1 bg-border" /></div>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="קוד חדר"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-center font-display text-2xl tracking-[0.4em] outline-none focus:border-primary" dir="ltr" />
            <button onClick={join} disabled={busy} className="shrink-0 rounded-2xl border-2 border-secondary px-5 font-black text-secondary transition active:scale-95 disabled:opacity-60">הצטרפות</button>
          </div>
          {err && <p className="mt-3 text-center font-bold text-destructive">{err}</p>}
        </div>
      </section>
    );
  }

  const isHost = room.host_client === me;
  const sorted = [...players].sort((a, b) => b.score - a.score);

  if (room.status === "lobby") {
    return (
      <section className="flex flex-col gap-4">
        <button onClick={leave} className="flex items-center gap-1 self-start text-sm font-bold text-muted-foreground hover:text-primary"><ArrowRight className="h-4 w-4" /> יציאה מהחדר</button>
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-muted-foreground">קוד החדר — שתפו עם החברים</p>
          <button onClick={() => navigator.clipboard?.writeText(room.code)} className="mx-auto mt-2 flex items-center gap-3 rounded-2xl bg-muted px-6 py-3 font-display text-5xl font-black tracking-[0.3em] text-primary" dir="ltr">{room.code}<Copy className="h-5 w-5 text-muted-foreground" /></button>
          <h3 className="mt-6 text-right font-black">שחקנים בחדר ({players.length}/4)</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {players.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 font-bold">
                <span>{p.nickname}{p.client_id === me && <span className="text-muted-foreground"> (את/ה)</span>}</span>
                {p.client_id === room.host_client && <Crown className="h-5 w-5 text-primary" />}
              </li>
            ))}
            {Array.from({ length: 4 - players.length }).map((_, i) => <li key={i} className="rounded-2xl border-2 border-dashed border-border px-4 py-3 text-muted-foreground">ממתין לשחקן...</li>)}
          </ul>
          {isHost ? (
            <button onClick={() => supabase.rpc("mp_start_game", { p_room: room.id, p_client: me, p_questions: makeQuestions() })} disabled={players.length < 2}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-xl font-black text-primary-foreground shadow-[var(--shadow-pop)] transition active:scale-95 disabled:opacity-50"><Play className="h-6 w-6" /> {players.length < 2 ? "ממתינים לעוד שחקן..." : "התחל משחק"}</button>
          ) : <p className="mt-5 font-bold text-muted-foreground">ממתינים שיוצר החדר יתחיל את המשחק...</p>}
        </div>
      </section>
    );
  }

  if (room.status === "finished") {
    const top = sorted[0];
    return (
      <section className="flex flex-col gap-4">
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <Trophy className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-2 font-display text-3xl font-black">{top ? `${top.nickname} ניצח/ה!` : "סיום!"}</h2>
          <Board players={sorted} me={me} />
          {isHost && <button onClick={() => supabase.rpc("mp_start_game", { p_room: room.id, p_client: me, p_questions: makeQuestions() })} className="mt-5 w-full rounded-2xl bg-primary py-4 text-xl font-black text-primary-foreground shadow-[var(--shadow-pop)]">משחק נוסף</button>}
          {!isHost && <p className="mt-4 text-sm text-muted-foreground">יוצר החדר יכול להתחיל משחק נוסף</p>}
          <button onClick={() => { setRoomId(null); setRoom(null); onExit(); }} className="mt-3 w-full rounded-2xl border-2 border-secondary py-3 font-black text-secondary">חזרה למסך הראשי</button>
        </div>
      </section>
    );
  }

  return <PlayView room={room} players={sorted} me={me} play={play} />;
}

function PlayView({ room, players, me, play }: { room: Room; players: Player[]; me: string; play: (k: keyof typeof sfx) => void }) {
  const q = room.questions[room.current_q];
  const [phase, setPhase] = useState<"wait" | "go">("wait");
  const [left, setLeft] = useState(QTIME);
  const [picked, setPicked] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const startRef = useRef(0);
  const myLocked = players.find((p) => p.client_id === me)?.locked_q === room.current_q;

  useEffect(() => {
    const gap = room.current_q === 0 && room.last_q === -1 ? 3000 : 2000;
    if (room.last_q >= 0) setFlash(room.last_winner ? `${room.last_winner} ענה/תה נכון! ⚡` : "אף אחד לא ענה נכון");
    if (room.last_q >= 0) play(room.last_winner === players.find((p) => p.client_id === me)?.nickname ? "correct" : "tick");
    setPicked(null); setPhase("wait"); setLeft(QTIME);
    startRef.current = Date.now() + gap;
    const t = setTimeout(() => { setPhase("go"); setFlash(null); }, gap);
    return () => clearTimeout(t);
  }, [room.current_q]);

  useEffect(() => {
    if (phase !== "go") return;
    const id = setInterval(() => {
      const l = Math.max(0, QTIME - Math.floor((Date.now() - startRef.current) / 1000));
      setLeft(l);
      if (l <= 3 && l > 0) play("tick");
      if (Date.now() - startRef.current > QTIME * 1000 + 500) supabase.rpc("mp_timeout", { p_room: room.id, p_q: room.current_q });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, room.current_q]);

  if (!q) return null;
  const word = VOCAB[q.w]!;
  const choose = async (opt: number) => {
    if (picked !== null || myLocked || phase !== "go") return;
    setPicked(opt);
    const { data } = await supabase.rpc("mp_answer", { p_room: room.id, p_client: me, p_q: room.current_q, p_choice: opt });
    if (!data) play("wrong");
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 text-center"><div className="text-xs font-semibold text-muted-foreground">שאלה</div><div className="font-display text-2xl font-black">{room.current_q + 1}/{room.questions.length}</div></div>
        <div className={cn("rounded-2xl border border-border bg-card p-3 text-center", left <= 3 && phase === "go" && "border-destructive")}><div className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground"><Timer className="h-4 w-4" />זמן</div><div className="font-display text-2xl font-black tabular-nums">{phase === "go" ? left : "…"}</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <span key={p.id} className={cn("rounded-full border px-3 py-1 text-sm font-bold", p.client_id === me ? "border-primary bg-primary/10" : "border-border bg-card", p.locked_q === room.current_q && "opacity-50")}>{p.nickname} · {p.score}</span>
        ))}
      </div>
      {phase === "wait" ? (
        <div className="grid min-h-64 place-items-center rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <div>
            {flash && <p className="mb-3 text-xl font-black text-success">{flash}</p>}
            <p className="font-display text-2xl font-black text-muted-foreground">{room.current_q === 0 && room.last_q === -1 ? "מתכוננים..." : "השאלה הבאה מגיעה..."}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-border bg-card px-5 py-8 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-muted-foreground">איזו מילה בעברית מתאימה ל־</p>
            <p dir="ltr" className="mt-3 font-display text-3xl font-black text-primary sm:text-4xl">{word.english}</p>
            {myLocked && <p className="mt-3 font-bold text-destructive">טעית — מחכים לשאר השחקנים</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.opts.map((o) => (
              <button key={o} onClick={() => choose(o)} disabled={picked !== null || myLocked}
                className={cn("min-h-24 rounded-2xl border-2 border-border bg-card px-3 py-5 font-hebrew text-3xl font-bold leading-relaxed transition active:scale-95 sm:text-4xl",
                  picked === o && myLocked && "animate-shake border-destructive bg-destructive text-destructive-foreground",
                  picked === o && !myLocked && "border-primary")}>
                {VOCAB[o]!.hebrew}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Board({ players, me }: { players: Player[]; me: string }) {
  return (
    <ol className="mt-5 flex flex-col gap-2 text-right">
      {players.map((p, i) => (
        <li key={p.id} className={cn("flex items-center justify-between rounded-2xl px-4 py-3 font-bold", i === 0 ? "bg-primary text-primary-foreground" : "bg-muted")}>
          <span>{i + 1}. {p.nickname}{p.client_id === me && " (את/ה)"}</span>
          <span className="flex items-center gap-1 font-display text-xl">{p.score}<Check className="h-4 w-4" /></span>
        </li>
      ))}
    </ol>
  );
}
