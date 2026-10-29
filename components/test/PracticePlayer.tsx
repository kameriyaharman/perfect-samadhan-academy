"use client";
// Practice test: ek-ek sawal, option chunte hi turant sahi/galat (rang + awaaz), vyakhya, aakhir me result.
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, Home, Languages, RotateCcw, Trophy, Volume2, VolumeX, XCircle } from "lucide-react";
import { playCorrect, playFinish, playWrong } from "@/lib/answerSound";

export type PQ = { id: number; section: string; text_hi: string; text_en: string | null; opts: { hi: string; en: string | null }[]; answer: string; explanation: string | null };
type Lang = "both" | "hi" | "en";
const L = "ABCDE";
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function PracticePlayer({ test, questions, prev, next, back, backLabel }: {
  test: { id: number; title: string; duration: number; marks_per_q: number; negative: number; folder: string | null };
  questions: PQ[]; prev: { id: number; title: string } | null; next: { id: number; title: string } | null; back: string; backLabel: string;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [lang, setLang] = useState<Lang>("both");
  const [sound, setSound] = useState(true);
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [review, setReview] = useState(false);
  const q = questions[idx];
  const total = questions.length;

  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem("psa_practice_prefs") || "{}"); if (p.lang) setLang(p.lang); if (typeof p.sound === "boolean") setSound(p.sound); } catch {}
  }, []);
  const savePrefs = (l: Lang, s: boolean) => { try { localStorage.setItem("psa_practice_prefs", JSON.stringify({ lang: l, sound: s })); } catch {} };
  useEffect(() => { if (done) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [done]);

  const secs = (now - start) / 1000;
  const limit = (test.duration || 0) * 60;
  const left = limit ? Math.max(0, limit - secs) : 0;
  const stats = useMemo(() => {
    let c = 0, w = 0;
    for (const x of questions) { const p = picked[x.id]; if (!p) continue; if (p === x.answer) c++; else w++; }
    return { c, w, s: total - c - w };
  }, [picked, questions, total]);

  const finish = useCallback(() => { if (done) return; setDone(true); setReview(false); if (sound) playFinish(); window.scrollTo({ top: 0, behavior: "smooth" }); }, [done, sound]);
  useEffect(() => { if (limit && left <= 0 && !done) finish(); }, [left, limit, done, finish]);

  const choose = (letter: string) => {
    if (!q || picked[q.id] || done) return;
    setPicked((p) => ({ ...p, [q.id]: letter }));
    if (sound) (letter === q.answer ? playCorrect : playWrong)();
  };
  const go = (i: number) => setIdx(Math.max(0, Math.min(total - 1, i)));

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (done && !review) return;
      const t = e.target as HTMLElement; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      const key = e.key.toUpperCase();
      const n = "1234".indexOf(e.key) >= 0 ? "ABCD"[Number(e.key) - 1] : L.includes(key) && key.length === 1 ? key : "";
      if (n && q && q.opts[L.indexOf(n)]) { e.preventDefault(); choose(n); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); if (idx < total - 1) go(idx + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  const txt = (hi: string, en: string | null) => {
    const e = en && en.trim() && en.trim() !== hi.trim() ? en : null;
    if (lang === "en") return <span>{e || hi}</span>;
    if (lang === "hi" || !e) return <span className="hi">{hi}</span>;
    return <><span className="hi">{hi}</span><span className="text-white/60"> / </span><span>{e}</span></>;
  };

  if (!total) return <div className="mx-auto max-w-xl p-10 text-center"><p className="text-muted">Is test me abhi sawal nahi hain.</p><Link href={back} className="btn-primary mt-4">{backLabel}</Link></div>;

  const score = Math.round((stats.c * (test.marks_per_q || 1) - stats.w * (test.negative || 0)) * 100) / 100;
  const acc = stats.c + stats.w ? Math.round((stats.c / (stats.c + stats.w)) * 100) : 0;
  const reset = () => { setPicked({}); setIdx(0); setDone(false); setReview(false); };

  const NavBtns = (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {next && <Link href={`/test/practice/${next.id}`} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow hover:bg-green-700"><ArrowRight className="h-4 w-4" /><span className="hi">अगला टेस्ट</span></Link>}
      {prev && <Link href={`/test/practice/${prev.id}`} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow hover:opacity-90"><ArrowLeft className="h-4 w-4" /><span className="hi">पिछला टेस्ट</span></Link>}
      <Link href={back} className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-3 font-semibold text-white shadow hover:bg-slate-700"><Home className="h-4 w-4" />{backLabel}</Link>
    </div>
  );

  if (done && !review) return (
    <div className="mx-auto max-w-3xl px-3 py-8 md:px-6">
      <div className="overflow-hidden rounded-3xl bg-navy p-6 text-center text-white shadow-lift md:p-10" data-dark>
        <Trophy className="mx-auto h-14 w-14 text-gold" />
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">Test poora hua!</h1>
        <p className="hi mt-1 text-white/70">{test.title}</p>
        <div className="mt-6 text-5xl font-extrabold text-gold">{score}<span className="text-2xl text-white/60"> / {total * (test.marks_per_q || 1)}</span></div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Sahi", stats.c, "text-green-400"], ["Galat", stats.w, "text-red-400"], ["Chhode", stats.s, "text-white/80"], ["Accuracy", `${acc}%`, "text-gold"]].map(([l, v, c]) => (
            <div key={l as string} className="rounded-2xl bg-white/10 p-4"><div className="text-sm text-white/60">{l}</div><div className={`text-3xl font-bold ${c}`}>{v}</div></div>
          ))}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-white/60"><Clock className="h-4 w-4" />Samay: {mmss(Math.min(secs, limit || secs))}{test.negative ? ` · Negative ${test.negative} / galat` : ""}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => { setReview(true); setIdx(0); }} className="btn bg-white px-5 py-3 font-semibold text-navy"><CheckCircle2 className="h-4 w-4" />Answers dekhein</button>
          <button onClick={reset} className="btn border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10"><RotateCcw className="h-4 w-4" />Dobara dein</button>
        </div>
      </div>
      {NavBtns}
    </div>
  );

  const my = picked[q.id];
  const answered = Object.keys(picked).length;
  return (
    <div className="mx-auto max-w-4xl px-3 py-6 md:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="hi truncate text-lg font-bold text-navy md:text-xl">{test.title}</h1>
          {test.folder && <p className="hi text-sm text-muted">{test.folder}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="seg !p-1 text-sm">
            {([["both", "दोनों"], ["hi", "हिंदी"], ["en", "English"]] as [Lang, string][]).map(([k, l]) => <button key={k} className={`${lang === k ? "on" : ""} ${k !== "en" ? "hi" : ""} !px-3 !py-1.5`} onClick={() => { setLang(k); savePrefs(k, sound); }}>{l}</button>)}
          </div>
          <button onClick={() => { setSound(!sound); savePrefs(lang, !sound); }} title={sound ? "Awaaz band karein" : "Awaaz chalu karein"} className={`grid h-9 w-9 place-items-center rounded-xl border ${sound ? "border-brand bg-brand-50 text-brand" : "border-line text-muted"}`}>{sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
          {!review && <span className={`chip py-1.5 font-mono ${limit && left < 60 ? "bg-red-50 text-red-600" : "bg-navy text-white"}`}><Clock className="h-3.5 w-3.5" />{limit ? mmss(left) : mmss(secs)}</span>}
        </div>
      </div>

      <div className="rounded-3xl bg-navy p-5 text-white shadow-lift md:p-8" data-dark>
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>#{q.id} · {q.section}</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-white">{idx + 1} / {total}</span>
        </div>
        <h2 className="mt-4 whitespace-pre-line text-lg font-semibold leading-relaxed md:text-xl">{idx + 1}) {txt(q.text_hi, q.text_en)}</h2>
        <div className="mt-5 space-y-2.5">
          {q.opts.map((o, i) => {
            const letter = L[i];
            const isAns = letter === q.answer, isMine = letter === my;
            const cls = !my ? "border-white/20 hover:border-gold hover:bg-white/5 cursor-pointer" : isAns ? "border-green-400 bg-green-500/20" : isMine ? "border-red-400 bg-red-500/20" : "border-white/10 opacity-60";
            return (
              <button key={i} disabled={!!my || review} onClick={() => choose(letter)} className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${cls}`}>
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${my && isAns ? "border-green-400 bg-green-500 text-white" : my && isMine ? "border-red-400 bg-red-500 text-white" : "border-white/40"}`}>{my && isAns ? "✓" : my && isMine ? "✕" : letter}</span>
                <span className="flex-1 text-[15.5px]">{txt(o.hi, o.en)}</span>
              </button>
            );
          })}
        </div>
        {my && (
          <div className={`mt-4 rounded-xl p-4 text-[15px] ${my === q.answer ? "bg-green-500/15 text-green-100" : "bg-red-500/15 text-red-100"}`}>
            <b className="flex items-center gap-1.5">{my === q.answer ? <><CheckCircle2 className="h-4 w-4" />Sahi jawab!</> : <><XCircle className="h-4 w-4" />Galat — sahi uttar {q.answer}</>}</b>
            {q.explanation && <p className="hi mt-2 whitespace-pre-line text-white/85">{q.explanation}</p>}
          </div>
        )}
        {review && !my && <div className="mt-4 rounded-xl bg-white/10 p-4 text-[15px]"><b>Chhoda gaya — sahi uttar {q.answer}</b>{q.explanation && <p className="hi mt-2 whitespace-pre-line text-white/85">{q.explanation}</p>}</div>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => go(idx - 1)} disabled={idx === 0} className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-4 py-2.5 font-semibold disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
          {review ? <button onClick={() => setReview(false)} className="inline-flex items-center gap-1 rounded-xl bg-gold px-5 py-2.5 font-semibold text-navy"><Trophy className="h-4 w-4" />Result</button>
            : <button onClick={() => { if (stats.s && !confirm(`${stats.s} sawal baaki hain. Test khatam karein?`)) return; finish(); }} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold"><Flag className="h-4 w-4" />Finish</button>}
          <button onClick={() => idx < total - 1 ? go(idx + 1) : !review && finish()} className="inline-flex items-center gap-1 rounded-xl bg-blue-500 px-5 py-2.5 font-semibold">{idx < total - 1 ? <>Next<ChevronRight className="h-4 w-4" /></> : review ? "—" : "Result"}</button>
        </div>
      </div>

      <div className="card mt-4 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <b>Sawal ({answered}/{total} kiye)</b>
          <span className="flex gap-3 text-xs text-muted"><span className="text-green-600">● Sahi {stats.c}</span><span className="text-red-600">● Galat {stats.w}</span><span>● Baaki {stats.s}</span></span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((x, i) => { const p = picked[x.id]; const c = !p ? "bg-canvas text-muted" : p === x.answer ? "bg-green-600 text-white" : "bg-red-600 text-white"; return <button key={x.id} onClick={() => go(i)} className={`h-8 w-8 rounded-lg text-xs font-semibold ${c} ${i === idx ? "ring-2 ring-brand ring-offset-1" : ""}`}>{i + 1}</button>; })}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Languages className="h-3.5 w-3.5" />Keyboard: 1–4 ya A–D se option, ← → se sawal badlein.</p>
      </div>
      {NavBtns}
    </div>
  );
}
