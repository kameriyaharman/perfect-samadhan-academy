"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Info, ListChecks, RotateCcw, Trophy } from "lucide-react";
import KeyboardView from "./KeyboardView";
import { engineBackspace, engineKey, findKey, FINGER, FINGER_NAME, LEFT_HAND, type EngineState, type Layout } from "@/lib/keyboard";

const STEPS = ["Akshar pehchaan", "Ek-ek key", "Akshar jodi", "Shabd", "Mini test"];
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
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const cur = tokens[idx] || "";
  const wrong = st.text && !cur.startsWith(st.text);

  const finish = async (errs: number, k: number) => {
    setDone(true);
    const secs = start ? (Date.now() - start) / 1000 : 60;
    const accuracy = Math.max(0, Math.round(((k - errs) / Math.max(1, k)) * 100));
    const wpm = Math.round((tokens.join(" ").length / 5) / (secs / 60));
    const r = await fetch("/api/lesson-progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: lesson.id, accuracy, wpm }) });
    setSaved(r.ok ? "Progress save ho gaya ✓" : "Login karke progress save karein");
  };

  const apply = (text: string, k: number) => {
    if (text === cur) {
      const ni = idx + 1;
      setSt({ text: "", pendingI: false });
      if (ni >= tokens.length) { setIdx(ni); finish(errors, k); } else setIdx(ni);
      return;
    }
    if (text && !cur.startsWith(text)) setErrors((e) => e + 1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (done) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!start) setStart(Date.now());
    if (e.code === "Space") { e.preventDefault(); return; }
    if (e.code === "Backspace") { e.preventDefault(); setSt((s) => (layout === "english" ? { text: s.text.slice(0, -1), pendingI: false } : engineBackspace(s))); return; }
    let next: EngineState | null = null;
    if (layout === "english") { if (e.key.length === 1) next = { text: st.text + e.key, pendingI: false }; }
    else next = engineKey(layout, st, e.code, e.shiftKey);
    if (!next) return;
    e.preventDefault();
    const k = keys + 1;
    setKeys(k);
    setSt(next);
    const shown = next.pendingI && cur.startsWith(next.text + "ि") ? next.text + "ि" : next.text;
    apply(shown, k);
  };

  const nextCh = wrong ? null : (() => {
    const rest = Array.from(cur.slice(st.text.length));
    if (layout === "remington" && !st.pendingI && rest[1] === "ि") return "ि";
    return rest[0];
  })();
  const target = wrong ? { code: "Backspace", shift: false } : nextCh ? findKey(layout, nextCh) : null;
  const finger = target ? FINGER[target.code] : null;
  const hand = target ? (LEFT_HAND.has(target.code) ? "bayaan haath" : "dayaan haath") : "";
  const step = Math.min(4, Math.floor((idx / Math.max(1, tokens.length)) * 5));
  const secs = start ? (Date.now() - start) / 1000 : 0;
  const accuracy = keys ? Math.max(0, Math.round(((keys - errors) / keys) * 100)) : 100;
  const wpm = secs > 3 ? Math.round((tokens.slice(0, idx).join(" ").length / 5) / (secs / 60)) : 0;

  const reset = () => { setIdx(0); setSt({ text: "", pendingI: false }); setErrors(0); setKeys(0); setStart(null); setDone(false); setSaved(""); ref.current?.focus(); };

  return (
    <div className="mx-auto grid max-w-[1500px] gap-5 px-3 md:px-10 py-6 lg:grid-cols-[1fr_360px]">
      <div ref={ref} tabIndex={0} onKeyDown={onKey} className="card p-5 md:p-7 outline-none focus:ring-4 focus:ring-brand/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="hi text-2xl md:text-3xl font-bold text-navy">Lesson {lesson.number} — {lesson.title}</h1>
            <p className="hi mt-1 text-muted">{lesson.subtitle || "Ungli home row par rakhein, type karke wapas laayein."}</p>
          </div>
          <span className="chip bg-orange-50 text-orange-600 py-1.5">Step {step + 1} / 5</span>
        </div>
        {done ? (
          <div className="my-10 text-center">
            <Trophy className="mx-auto h-14 w-14 text-gold" />
            <div className="mt-3 text-2xl font-bold text-navy">Lesson poora hua! 🎉</div>
            <div className="mt-1 text-muted">Accuracy {accuracy}% · {saved}</div>
            <div className="mt-5 flex justify-center gap-3">
              <button onClick={reset} className="btn-ghost"><RotateCcw className="h-4 w-4" />Dobara</button>
              {nextId ? <Link href={`/typing-test/learn/${nextId}`} className="btn-primary">Agla Lesson <ArrowRight className="h-4 w-4" /></Link> : <Link href="/typing-test/setup" className="btn-primary">Typing Test Dein <ArrowRight className="h-4 w-4" /></Link>}
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
