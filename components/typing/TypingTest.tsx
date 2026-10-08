"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Gauge, Pause, Play, RotateCcw, Target, Volume2, VolumeX, Zap, AlertTriangle, Loader2 } from "lucide-react";
import KeyboardView from "./KeyboardView";
import { engineBackspace, engineKey, findKey, normalizeWord, type EngineState, type Layout } from "@/lib/keyboard";
import { scoreTyping, splitWords } from "@/lib/typingScore";

type Props = {
  passage: { id: number; title: string; text: string; session?: string | null; level?: string | null };
  lang: "hindi" | "english"; layout: Layout; layoutName: string; pattern: string; duration: number; mode: "practice" | "exam";
};

let audioCtx: AudioContext | null = null;
function click(freq = 520, dur = 0.025, vol = 0.04) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.frequency.value = freq; o.type = "square"; g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + dur);
  } catch {}
}

export default function TypingTest(p: Props) {
  const router = useRouter();
  const total = p.duration * 60;
  const [st, setSt] = useState<EngineState>({ text: "", pendingI: false });
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [keys, setKeys] = useState(0);
  const [guide, setGuide] = useState(p.mode === "practice");
  const [sound, setSound] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const perMin = useRef<number[]>([]);
  const acc = useRef(0); // accumulated ms before current run
  const runAt = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const highlight = p.pattern !== "highcourt";

  const pw = useMemo(() => splitWords(p.passage.text), [p.passage.text]);
  const typed = st.text;
  const tw = useMemo(() => splitWords(typed), [typed]);
  const endsSpace = /\s$/.test(typed) || typed === "";
  const doneCount = endsSpace ? tw.length : Math.max(0, tw.length - 1);
  const curIdx = endsSpace ? tw.length : tw.length - 1;
  const partial = endsSpace ? "" : tw[tw.length - 1] || "";
  const live = useMemo(() => scoreTyping(p.passage.text, typed, Math.max(elapsed, 15), p.lang, false), [typed, elapsed, p.passage.text, p.lang]);

  const timeLeft = Math.max(0, total - elapsed);

  // timer
  useEffect(() => {
    if (!started || paused) return;
    const t = setInterval(() => {
      const e = Math.floor((acc.current + (Date.now() - (runAt.current || Date.now()))) / 1000);
      setElapsed(e);
    }, 250);
    return () => clearInterval(t);
  }, [started, paused]);

  // per-minute snapshots (correct words completed by each minute)
  useEffect(() => {
    const m = Math.floor(elapsed / 60);
    while (perMin.current.length < m) perMin.current.push(live.correct);
  }, [elapsed, live.correct]);

  const submit = useCallback(async () => {
    if (finished.current) return;
    finished.current = true;
    setSubmitting(true);
    const secs = Math.max(1, Math.min(total, Math.floor((acc.current + (runAt.current && !paused ? Date.now() - runAt.current : 0)) / 1000)) || elapsed);
    const cum = [...perMin.current];
    const finalCorrect = scoreTyping(p.passage.text, st.text, secs, p.lang, true).correct;
    if (secs % 60 > 5 || !cum.length) cum.push(finalCorrect);
    const speeds = cum.map((c, i) => c - (i ? cum[i - 1] : 0));
    try {
      const r = await fetch("/api/typing/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passageId: p.passage.id, lang: p.lang, layout: p.layoutName, pattern: p.pattern, mode: p.mode, seconds: secs, typed: st.text, perMinute: speeds, keystrokes: keys }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Submit failed");
      router.push(`/typing-test/result/${j.certId}`);
    } catch (e: any) {
      setErr(e.message); setSubmitting(false); finished.current = false;
    }
  }, [elapsed, keys, p, paused, router, st.text, total]);

  useEffect(() => { if (started && elapsed >= total) submit(); }, [elapsed, started, submit, total]);

  // auto-submit when the full passage is typed
  useEffect(() => { if (started && doneCount >= pw.length && pw.length > 0) submit(); }, [doneCount, pw.length, started, submit]);

  // keep current word visible
  useEffect(() => {
    const el = passRef.current?.querySelector<HTMLElement>("[data-cur='1']");
    if (el && passRef.current) {
      const box = passRef.current;
      const top = el.offsetTop - box.offsetTop;
      if (top > box.scrollTop + box.clientHeight - 60 || top < box.scrollTop) box.scrollTo({ top: Math.max(0, top - 50), behavior: "smooth" });
    }
    const ta = inputRef.current;
    if (ta) ta.scrollTop = ta.scrollHeight;
  }, [typed]);

  const begin = () => {
    if (!started) { setStarted(true); runAt.current = Date.now(); }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (paused || submitting) { e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && ["v", "V", "a", "A", "z", "Z", "x", "X"].includes(e.key)) { e.preventDefault(); return; }
    if (e.key === "Tab") { e.preventDefault(); return; }
    setPressed(e.code); setTimeout(() => setPressed(null), 120);
    if (p.layout === "inscript" || p.layout === "remington") {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!e.code || e.key === "Unidentified" || e.key === "Process") return; // mobile IME: let onChange handle
      if (e.code === "Backspace") { e.preventDefault(); begin(); setSt((s) => engineBackspace(s)); setKeys((k) => k + 1); if (sound) click(300); return; }
      const next = engineKey(p.layout, st, e.code, e.shiftKey);
      if (next) {
        e.preventDefault(); begin(); setSt(next); setKeys((k) => k + 1); if (sound) click();
      } else if (e.key.length === 1) e.preventDefault();
      return;
    }
    if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") { begin(); setKeys((k) => k + 1); if (sound) click(); }
  };
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (paused || submitting) return;
    if (p.layout === "inscript" || p.layout === "remington") return;
    begin();
    setSt({ text: e.target.value.replace(/\n/g, " "), pendingI: false });
  };

  const restart = () => {
    finished.current = false; perMin.current = []; acc.current = 0; runAt.current = null;
    setSt({ text: "", pendingI: false }); setStarted(false); setPaused(false); setElapsed(0); setKeys(0); setErr("");
    inputRef.current?.focus();
  };
  const togglePause = () => {
    if (!started) return;
    if (paused) { runAt.current = Date.now(); setPaused(false); setTimeout(() => inputRef.current?.focus(), 30); }
    else { acc.current += Date.now() - (runAt.current || Date.now()); runAt.current = null; setPaused(true); }
  };

  // next key guidance
  const target = useMemo(() => {
    if (!guide) return null;
    const exp = pw[curIdx];
    if (exp === undefined) return null;
    let ch: string;
    if (partial && !exp.startsWith(partial)) return { code: "Backspace", shift: false };
    if (partial === exp) ch = " ";
    else {
      const rest = Array.from(exp.slice(partial.length));
      ch = rest[0];
      if (p.layout === "remington") {
        if (st.pendingI && rest[0]) ch = rest[0];
        else if (rest[1] === "ि" && /[क-ह]/.test(rest[0])) ch = "ि";
      }
    }
    return findKey(p.layout, ch);
  }, [guide, pw, curIdx, partial, p.layout, st.pendingI]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const ringPct = (timeLeft / total) * 100;

  return (
    <div className="mx-auto max-w-[1500px] px-3 md:px-10 py-4 md:py-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-[180px_1.4fr_1.2fr_1.2fr_1.2fr]">
        <div className="card col-span-2 md:col-span-1 flex items-center gap-3 p-3">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#eef0f7" strokeWidth="3.5" /><circle cx="18" cy="18" r="15.5" fill="none" stroke="#f28c0f" strokeWidth="3.5" strokeDasharray={`${ringPct * 0.974} 100`} strokeLinecap="round" /></svg>
            <span className="absolute inset-0 grid place-items-center text-sm font-bold">{mm}:{ss}</span>
          </div>
          <span className="text-sm text-muted leading-tight">Time<br />Left</span>
        </div>
        <div className="rounded-2xl bg-navy p-4 text-white" data-dark><div className="flex items-center gap-1.5 text-sm text-white/75"><Gauge className="h-4 w-4" />Net Speed</div><div className="mt-1 text-3xl font-bold text-gold">{Math.round(live.net)} <span className="text-sm font-medium text-white/60">WPM</span></div></div>
        <div className="card p-4"><div className="flex items-center gap-1.5 text-sm text-muted"><Zap className="h-4 w-4" />Gross Speed</div><div className="mt-1 text-3xl font-bold">{Math.round(live.gross)} <span className="text-sm font-medium text-muted">WPM</span></div></div>
        <div className="card p-4"><div className="flex items-center gap-1.5 text-sm text-muted"><Target className="h-4 w-4" />Accuracy</div><div className="mt-1 text-3xl font-bold text-green-600">{live.typedWords ? live.accuracy.toFixed(1) : "0.0"}<span className="text-sm">%</span></div></div>
        <div className="card p-4 col-span-2 md:col-span-1"><div className="flex items-center gap-1.5 text-sm text-muted"><RotateCcw className="h-4 w-4" />Errors</div><div className="mt-1 text-3xl font-bold text-red-500">{live.errors}</div></div>
      </div>

      <div className="card mt-4 p-4 md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-bold">{p.passage.title} · {p.lang === "hindi" ? `Hindi ${p.layoutName}` : "English"}</div>
          {highlight && <div className="flex gap-2"><span className="chip bg-green-50 text-green-700">✓ Sahi</span><span className="chip bg-red-50 text-red-600">✗ Galat</span><span className="chip bg-orange-50 text-orange-600">Current</span></div>}
        </div>
        <div ref={passRef} className={`relative max-h-[170px] md:max-h-[190px] overflow-y-auto rounded-2xl border border-line bg-[#f8f9fd] p-4 md:p-5 select-none ${p.lang === "hindi" ? "hi text-[19px] md:text-[22px] leading-[2.1]" : "text-[17px] md:text-[20px] leading-[2.1]"}`} onCopy={(e) => e.preventDefault()}>
          {pw.map((w, i) => {
            let cls = "text-slate-400";
            if (highlight) {
              if (i < doneCount) cls = normalizeWord(w) === normalizeWord(tw[i] || "") ? "text-green-600" : "text-red-500 wavy bg-red-50 rounded";
              else if (i === curIdx) cls = partial && !w.startsWith(partial) ? "bg-red-100 text-red-700 rounded px-0.5" : "bg-orange-100 text-ink rounded px-0.5";
            } else cls = "text-ink";
            return <span key={i} data-cur={i === curIdx ? "1" : "0"} className={cls}>{w}{" "}</span>;
          })}
        </div>

        <div className="relative mt-4">
          <textarea
            ref={inputRef} value={typed + (st.pendingI ? "" : "")} onKeyDown={onKeyDown} onChange={onChange}
            onPaste={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}
            autoFocus spellCheck={false} autoCorrect="off" autoCapitalize="off" autoComplete="off" disabled={submitting}
            placeholder={started ? "" : p.lang === "hindi" ? (p.layout === "system" ? "Yahan apne Hindi keyboard se type karna shuru karein…" : "Yahan click karke type karna shuru karein (English keyboard se — Hindi apne aap banegi)…") : "Click here and start typing…"}
            className={`h-[110px] w-full resize-none rounded-2xl border-2 border-brand/70 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 ${p.lang === "hindi" ? "hi text-[19px] leading-8" : "text-[17px] leading-8"}`}
          />
          {st.pendingI && <span className="hi absolute right-4 top-3 chip bg-orange-100 text-orange-700">ि pending — agla akshar type karein</span>}
          {paused && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/80 backdrop-blur-sm"><button onClick={togglePause} className="btn-primary"><Play className="h-4 w-4" />Resume</button></div>}
        </div>

        {guide && p.mode === "practice" && (
          <div className="mt-4 hidden sm:block"><KeyboardView layout={p.layout} target={target?.code} shift={target?.shift} pressed={pressed} /></div>
        )}

        {err && <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />{err}</div>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button onClick={restart} className="btn-ghost btn-sm !py-2.5"><RotateCcw className="h-4 w-4" />Restart</button>
          <button onClick={togglePause} disabled={!started} className="btn-ghost btn-sm !py-2.5">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}{paused ? "Resume" : "Pause"}</button>
          {p.mode === "practice" && <button onClick={() => setGuide(!guide)} className="btn-ghost btn-sm !py-2.5">{guide ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}Keyboard Guide: {guide ? "ON" : "OFF"}</button>}
          <button onClick={() => setSound(!sound)} className="btn-ghost btn-sm !py-2.5" aria-label="Sound">{sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
          <button onClick={submit} disabled={!started || submitting} className="btn-primary ml-auto !py-3">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Submit Test <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
