"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Delete, Info, ListChecks, RotateCcw, Timer, Trophy, PartyPopper, Keyboard } from "lucide-react";
import KeyboardView from "./KeyboardView";
import { playKey, type SoundKind } from "@/lib/keySound";
import { engineBackspace, engineKey, findKey, guideNextChar, isTypingPrefix, normalizeWord, FINGER, FINGER_NAME, LEFT_HAND, type EngineState, type Layout } from "@/lib/keyboard";

const STEPS = ["Akshar pehchaan", "Ek-ek key", "Akshar jodi", "Shabd", "Mini test"];
const TIMES = [0, 1, 2, 5, 10, 15];
const mmss = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0")}`;
export default function LessonPlayer({ lesson, nextId }: { lesson: { id: number; number: number; title: string; subtitle: string | null; content: string; layout: string }; nextId: number | null }) {
  const layout = lesson.layout as Layout;
  const tokens = useMemo(() => lesson.content.split(/\s+/).filter(Boolean), [lesson.content]);
  const [idx, setIdx] = useState(0);
  const [st, setSt] = useState<EngineState>({ text: "", pendingI: false });
  const [errors, setErrors] = useState(0);
  const [keys, setKeys] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState("");
  // student ki marzi: practice ka samay (0 = bina timer, lesson ek baar poora) aur backspace on/off
  const [mins, setMins] = useState(0);
  const [custom, setCustom] = useState("");
  const [bs, setBs] = useState(true);
  const [doneChars, setDoneChars] = useState(0);
  const [, setTick] = useState(0);
  const [flash, setFlash] = useState("");
  const flashT = useRef<any>(null);
  const say = (m: string) => { setFlash(m); clearTimeout(flashT.current); flashT.current = setTimeout(() => setFlash(""), 900); };
  const ref = useRef<HTMLDivElement>(null);
  const sound = useRef<{ k: SoundKind; v: number }>({ k: "mechanical", v: 0.6 });
  useEffect(() => {
    ref.current?.focus();
    try { const s = JSON.parse(localStorage.getItem("psa_typing_prefs") || "{}"); if (s.keySound) sound.current = { k: s.keySound === "custom" ? "mechanical" : s.keySound, v: (s.vol ?? 60) / 100 }; } catch {}
    try { const p = JSON.parse(localStorage.getItem("psa_lesson_prefs") || "{}"); if (typeof p.mins === "number") setMins(p.mins); if (typeof p.bs === "boolean") setBs(p.bs); } catch {}
  }, []);
  const savePrefs = (m: number, b: boolean) => { try { localStorage.setItem("psa_lesson_prefs", JSON.stringify({ mins: m, bs: b })); } catch {} };
  // timer: har second refresh, samay khatam → lesson khatam
  useEffect(() => {
    if (!start || done) return;
    const t = setInterval(() => {
      setTick((x) => x + 1);
      if (mins > 0 && Date.now() - start >= mins * 60000) finishRef.current();
    }, 500);
    return () => clearInterval(t);
  }, [start, done, mins]);
  const cur = tokens[idx] || "";
  const wrong = st.text && !isTypingPrefix(cur, st.text, layout);

  const finish = async (errs: number, k: number, chars: number) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const secs = start ? Math.min((Date.now() - start) / 1000, mins > 0 ? mins * 60 : Infinity) : 60;
    const accuracy = Math.max(0, Math.round(((k - errs) / Math.max(1, k)) * 100));
    const wpm = Math.round((chars / 5) / (Math.max(1, secs) / 60));
    const r = await fetch("/api/lesson-progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: lesson.id, accuracy, wpm }) });
    setSaved(r.ok ? "Progress save ho gaya" : "Login karke progress save karein");
  };

  const doneRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});
  finishRef.current = () => finish(errors, keys, doneChars);
  const apply = (text: string, k: number) => {
    if (normalizeWord(text) === normalizeWord(cur)) {
      const ni = idx + 1;
      const chars = doneChars + cur.length + 1;
      setDoneChars(chars);
      setSt({ text: "", pendingI: false });
      // timer laga hai to lesson dobara shuru se chalta rahega jab tak samay khatam na ho
      if (ni >= tokens.length) { if (mins > 0) setIdx(0); else { setIdx(ni); finish(errors, k, chars); } } else setIdx(ni);
      return;
    }
    if (text && !isTypingPrefix(cur, text, layout)) setErrors((e) => e + 1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (done) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!start) setStart(Date.now());
    if (e.code === "Space") { e.preventDefault(); return; }
    if (e.code === "Backspace" && !bs) { e.preventDefault(); say("Backspace band hai"); return; }
    if (e.code === "Backspace") { e.preventDefault(); playKey(sound.current.k, "back", sound.current.v); setSt((s) => (layout === "english" ? { text: s.text.slice(0, -1), pendingI: false } : engineBackspace(s))); return; }
    let next: EngineState | null = null;
    if (layout === "english") { if (e.key.length === 1) next = { text: st.text + e.key, pendingI: false }; }
    else next = engineKey(layout, st, e.code, e.shiftKey);
    if (!next) return;
    e.preventDefault();
    playKey(sound.current.k, "key", sound.current.v);
    const k = keys + 1;
    setKeys(k);
    const shown = next.pendingI && cur.startsWith(next.text + "ि") ? next.text + "ि" : next.text;
    // backspace band: galat key likhi hi nahi jayegi (error gina jayega), sahi key dabane par aage
    if (!bs && shown && !isTypingPrefix(cur, shown, layout)) { setErrors((x) => x + 1); say("Galat key — sahi key dabayein"); return; }
    setSt(next);
    apply(shown, k);
  };

  const nextCh = wrong || layout === "english" ? (wrong ? null : Array.from(cur.slice(st.text.length))[0]) : guideNextChar(layout, cur, st.text, st.pendingI);
  const target = wrong ? { code: "Backspace", shift: false } : nextCh ? findKey(layout, nextCh) : null;
  const finger = target ? FINGER[target.code] : null;
  const hand = target ? (LEFT_HAND.has(target.code) ? "bayaan haath" : "dayaan haath") : "";
  const step = Math.min(4, Math.floor((idx / Math.max(1, tokens.length)) * 5));
  const secs = start ? Math.min((Date.now() - start) / 1000, mins > 0 ? mins * 60 : Infinity) : 0;
  const left = mins > 0 ? mins * 60 - secs : 0;
  const accuracy = keys ? Math.max(0, Math.round(((keys - errors) / keys) * 100)) : 100;
  const wpm = secs > 3 ? Math.round((doneChars / 5) / (secs / 60)) : 0;

  const reset = () => { doneRef.current = false; setIdx(0); setSt({ text: "", pendingI: false }); setErrors(0); setKeys(0); setDoneChars(0); setStart(null); setDone(false); setSaved(""); ref.current?.focus(); };
  const pickMins = (m: number) => { const v = Math.min(60, Math.max(0, Math.round(m) || 0)); setMins(v); savePrefs(v, bs); reset(); };
  const pickBs = (b: boolean) => { setBs(b); savePrefs(mins, b); ref.current?.focus(); };

  return (
    <div className="mx-auto grid max-w-[1500px] gap-5 px-3 md:px-10 py-6 lg:grid-cols-[1fr_360px]">
      <div ref={ref} tabIndex={0} onKeyDown={onKey} className="card p-5 md:p-7 outline-none focus:ring-4 focus:ring-brand/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="hi text-2xl md:text-3xl font-bold text-navy">Lesson {lesson.number} — {lesson.title}</h1>
            <p className="hi mt-1 text-muted">{lesson.subtitle || "Ungli home row par rakhein, type karke wapas laayein."}</p>
          </div>
          <span className="flex flex-wrap items-center gap-2">
            <span className={`chip py-1.5 font-mono text-base ${mins > 0 && start && left < 30 ? "bg-red-50 text-red-600" : "bg-navy text-white"}`}><Timer className="h-4 w-4" />{mins > 0 ? mmss(start ? left : mins * 60) : mmss(secs)}</span>
            {mins === 0 && <span className="chip bg-orange-50 text-orange-600 py-1.5">Step {step + 1} / 5</span>}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl bg-canvas px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
          <span className="flex flex-wrap items-center gap-1.5">
            <Timer className="h-4 w-4 text-brand" /><b className="mr-1">Practice samay</b>
            {TIMES.map((m) => <button key={m} type="button" disabled={!!start && !done} onClick={() => pickMins(m)} className={`rounded-lg border px-2.5 py-1 text-[13px] font-semibold transition disabled:opacity-50 ${mins === m ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`}>{m === 0 ? "Off" : `${m} min`}</button>)}
            <span className="flex items-center gap-1">
              <input value={custom} disabled={!!start && !done} onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 2))} onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter" && custom) pickMins(Number(custom)); }} placeholder="min" inputMode="numeric" className="w-14 rounded-lg border border-line bg-white px-2 py-1 text-[13px]" />
              <button type="button" disabled={!custom || (!!start && !done)} onClick={() => pickMins(Number(custom))} className="rounded-lg border border-line bg-white px-2 py-1 text-[13px] font-semibold disabled:opacity-50">Set</button>
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Delete className="h-4 w-4 text-brand" /><b className="mr-1">Backspace</b>
            <button type="button" onClick={() => pickBs(true)} className={`rounded-lg border px-2.5 py-1 text-[13px] font-semibold ${bs ? "border-green-600 bg-green-600 text-white" : "border-line bg-white"}`}>On</button>
            <button type="button" onClick={() => pickBs(false)} className={`rounded-lg border px-2.5 py-1 text-[13px] font-semibold ${!bs ? "border-red-600 bg-red-600 text-white" : "border-line bg-white"}`}>Off</button>
          </span>
          <span className="w-full text-xs text-muted">{mins > 0 ? `Timer pehli key dabate hi chalega · ${mins} min tak lesson baar-baar chalega, samay khatam hone par result.` : "Timer Off: lesson ek baar poora hone par result (upar stopwatch chalegi)."} {bs ? "" : "Backspace Off: galat key likhi nahi jayegi, error gina jayega."}</span>
        </div>
        {done ? (
          <div className="my-10 text-center">
            <Trophy className="mx-auto h-14 w-14 text-gold" />
            <div className="mt-3 text-2xl font-bold text-navy"><span className="inline-flex items-center gap-2">Lesson poora hua! <PartyPopper className="h-6 w-6 text-saffron" /></span></div>
            <div className="mt-1 text-muted">Accuracy {accuracy}% · Speed {wpm} WPM · Samay {mmss(secs)} · {saved}</div>
            <div className="mt-5 flex justify-center gap-3">
              <button onClick={reset} className="btn-ghost"><RotateCcw className="h-4 w-4" />Dobara</button>
              {nextId ? <Link href={`/typing-test/learn/${nextId}`} className="btn-primary">Agla Lesson <ArrowRight className="h-4 w-4" /></Link> : <Link href="/typing-test/setup" className="btn-primary"><Keyboard className="h-4 w-4" />Typing Test Dein <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </div>
        ) : (
          <>
            <div className="my-7 flex flex-wrap justify-center gap-2.5">
              {tokens.map((t, i) => {
                if (Math.abs(i - idx) > 6 && i > 7) return null;
                const cls = i < idx ? "bg-green-50 text-green-600 border-green-100" : i === idx ? (wrong ? "border-red-400 bg-red-50 text-red-600" : "border-saffron bg-orange-50 ring-2 ring-saffron/30") : "bg-canvas text-slate-400 border-transparent";
                return <span key={i} className={`hi grid min-h-[64px] min-w-[64px] place-items-center rounded-2xl border-2 px-3 text-2xl md:text-3xl font-medium ${cls}`}>{t}</span>;
              })}
            </div>
            <div className="mb-4 text-center text-[15px]">
              {flash && <div className="mb-2 font-semibold text-red-600">{flash}</div>}
              <span className="hi">Type kiya: <b className={wrong ? "text-red-600" : "text-ink"}>{st.text || "—"}</b>{st.pendingI ? " (ि …)" : ""}</span>
              {target && <> · Agli key: <b>{target.shift ? "Shift + " : ""}{target.code.replace("Key", "").replace("Digit", "")}</b>{finger && <span className="font-semibold text-green-600"> — {FINGER_NAME[finger]} ({hand})</span>}</>}
            </div>
            <KeyboardView layout={layout} target={target?.code} shift={target?.shift} fingerColors />
            <p className="mt-3 text-center text-xs text-muted">Is box par click karke type karein. {layout !== "english" && "System keyboard English (US) par rakhein."}</p>
          </>
        )}
      </div>
      <aside className="space-y-4">
        <div className="card p-6">
          <div className="mb-3 flex items-center gap-2 text-lg font-bold"><ListChecks className="h-5 w-5" />Is lesson ke steps</div>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${i < step || done ? "bg-green-50 text-green-700" : i === step ? "bg-orange-50 text-orange-600" : "bg-brand-50 text-brand"}`}>{i + 1}</span>{s}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5"><div className="text-sm text-muted">Accuracy</div><div className="text-3xl font-bold text-green-600">{accuracy}%</div></div>
          <div className="card p-5"><div className="text-sm text-muted">Speed</div><div className="text-3xl font-bold">{wpm} <span className="text-sm text-muted">WPM</span></div></div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm">
          <div className="mb-1 flex items-center gap-2 font-bold"><Info className="h-4 w-4" />Tip</div>
          Keyboard ki taraf mat dekhiye — screen par guide dekhiye. Shuru me speed nahi, accuracy par dhyan dein.
        </div>
      </aside>
    </div>
  );
}
