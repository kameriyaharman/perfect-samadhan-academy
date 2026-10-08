"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Grid3x3, Loader2, Star, Timer, X, ArrowLeft, Send, Eraser, CheckCircle2 } from "lucide-react";
import { initials } from "@/lib/utils";

type Q = { id: number; section: string; topic: string | null; hi: string; en: string | null; oh: string[]; oe: (string | null)[] };
type A = { id: number; title: string; duration: number; endAt: number; language: string; answers: Record<string, string>; marked: number[]; visited: number[]; negative: number; mpq: number };

export default function CBT({ attempt, questions, user }: { attempt: A; questions: Q[]; user: { name: string; roll: string } }) {
  const r = useRouter();
  const sections = useMemo(() => Array.from(new Set(questions.map((q) => q.section))), [questions]);
  const [lang, setLang] = useState<"hi" | "en">(attempt.language === "en" ? "en" : "hi");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(attempt.answers || {});
  const [sel, setSel] = useState<string | null>(attempt.answers?.[questions[0]?.id] || null);
  const [marked, setMarked] = useState<Set<number>>(new Set(attempt.marked || []));
  const [visited, setVisited] = useState<Set<number>>(new Set([...(attempt.visited || []), questions[0]?.id]));
  const [left, setLeft] = useState(Math.max(0, Math.floor((attempt.endAt - Date.now()) / 1000)));
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [palette, setPalette] = useState(false);
  const submitted = useRef(false);
  const q = questions[idx];
  const sec = q?.section;
  const secQs = questions.map((x, i) => ({ x, i })).filter((o) => o.x.section === sec);
  const posInSec = secQs.findIndex((o) => o.i === idx) + 1;

  const save = useCallback((ans = answers, mk = marked, vis = visited, lg = lang) => {
    fetch("/api/test/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: attempt.id, answers: ans, marked: Array.from(mk), visited: Array.from(vis), language: lg }) }).catch(() => {});
  }, [answers, marked, visited, lang, attempt.id]);

  const submit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true; setBusy(true);
    await fetch("/api/test/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: attempt.id, answers, marked: Array.from(marked) }) });
    r.push(`/test/result/${attempt.id}`);
  }, [answers, marked, attempt.id, r]);

  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, Math.floor((attempt.endAt - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, [attempt.endAt]);
  useEffect(() => { if (left <= 0) submit(); }, [left, submit]);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (!submitted.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  const go = (i: number) => {
    if (i < 0 || i >= questions.length) return;
    const nv = new Set(visited); nv.add(questions[i].id);
    setVisited(nv); setIdx(i); setSel(answers[questions[i].id] || null); setPalette(false);
  };
  const saveNext = () => {
    const na = { ...answers };
    if (sel) na[q.id] = sel; else delete na[q.id];
    setAnswers(na);
    const nv = new Set(visited); if (questions[idx + 1]) nv.add(questions[idx + 1].id);
    save(na, marked, nv);
    if (idx < questions.length - 1) { setVisited(nv); setIdx(idx + 1); setSel(na[questions[idx + 1].id] || null); }
  };
  const toggleMark = () => {
    const m = new Set(marked); m.has(q.id) ? m.delete(q.id) : m.add(q.id); setMarked(m);
    const na = { ...answers }; if (sel) na[q.id] = sel; setAnswers(na);
    save(na, m);
    if (idx < questions.length - 1) go(idx + 1);
  };
  const clear = () => { setSel(null); const na = { ...answers }; delete na[q.id]; setAnswers(na); save(na); };

  const status = (id: number) => (marked.has(id) ? "marked" : answers[id] ? "answered" : visited.has(id) ? "skipped" : "new");
  const counts = { answered: 0, skipped: 0, marked: 0, new: 0 } as Record<string, number>;
  questions.forEach((x) => counts[status(x.id)]++);
  const style: Record<string, string> = { answered: "bg-green-600 text-white border-green-600", skipped: "bg-red-500 text-white border-red-500", marked: "bg-violet-600 text-white border-violet-600", new: "bg-white border-line text-ink" };
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const text = lang === "hi" ? q?.hi : q?.en || q?.hi;
  const alt = lang === "hi" ? q?.en : q?.hi;
  const opts = (lang === "hi" ? q?.oh : q?.oe.map((o, i) => o || q.oh[i])) || [];

  const Palette = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand font-bold text-white ring-2 ring-saffron ring-offset-2">{initials(user.name)}</span>
        <span><b className="block">{user.name}</b><span className="text-xs text-muted">Roll: {user.roll}</span></span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[["answered", "Answered", "bg-green-50 text-green-700"], ["skipped", "Skipped", "bg-red-50 text-red-600"], ["marked", "Review", "bg-violet-50 text-violet-700"], ["new", "Baaki", "bg-canvas text-ink"]].map(([k, l, c]) => (
          <div key={k} className={`rounded-xl py-2 ${c}`}><div className="text-xl font-bold">{counts[k]}</div><div className="text-[11px]">{l}</div></div>
        ))}
      </div>
      <div className="mt-4 text-sm font-bold">{sec} — Question Palette</div>
      <div className="mt-2 grid max-h-[40vh] grid-cols-5 gap-2 overflow-y-auto p-1">
        {secQs.map(({ x, i }, k) => (
          <button key={x.id} onClick={() => go(i)} className={`h-10 rounded-lg border text-sm font-semibold transition ${style[status(x.id)]} ${i === idx ? "ring-2 ring-saffron ring-offset-1" : ""}`}>{k + 1}</button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-green-600" />Answered</span><span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-red-500" />Not answered</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-violet-600" />Marked</span><span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full border border-line" />Not visited</span>
      </div>
      <button onClick={() => setConfirm(true)} className="btn-orange mt-auto w-full !py-3"><Send className="h-4 w-4" />Submit Test</button>
    </div>
  );

  if (!q) return <div className="p-10 text-center">Is test me questions nahi hain.</div>;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-navy text-white" data-dark>
        <div className="flex items-center gap-3 px-3 md:px-8 py-3">
          <img src="/logo.png" alt="" className="h-10 w-10 rounded-full bg-white" />
          <div className="min-w-0 flex-1"><div className="truncate font-bold md:text-lg">{attempt.title}</div><div className="hidden sm:block text-xs text-white/70">{questions.length} Questions · {attempt.duration} Minutes · {attempt.negative ? `Negative ${attempt.negative}` : "No negative marking"}</div></div>
          <div className="hidden sm:flex rounded-xl bg-white/10 p-1">
            <button onClick={() => { setLang("hi"); save(answers, marked, visited, "hi"); }} className={`hi rounded-lg px-4 py-1.5 text-sm font-semibold ${lang === "hi" ? "bg-white text-navy" : "text-white/80"}`}>हिंदी</button>
            <button onClick={() => { setLang("en"); save(answers, marked, visited, "en"); }} className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${lang === "en" ? "bg-white text-navy" : "text-white/80"}`}>English</button>
          </div>
          <div className={`flex items-center gap-2 rounded-xl px-3 md:px-4 py-2 text-lg font-bold ${left < 300 ? "bg-red-500/90" : "bg-white/10 text-gold"}`}><Timer className="h-5 w-5" />{mm}:{ss}</div>
        </div>
      </header>
      <div className="flex gap-2 overflow-x-auto border-b border-line px-3 md:px-8 py-2.5 scrollbar-none">
        {sections.map((s) => {
          const first = questions.findIndex((x) => x.section === s);
          const n = questions.filter((x) => x.section === s).length;
          return <button key={s} onClick={() => go(first)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${s === sec ? "bg-brand text-white" : "bg-canvas text-muted hover:text-brand"}`}>{s} ({n})</button>;
        })}
        <button onClick={() => setLang(lang === "hi" ? "en" : "hi")} className="sm:hidden whitespace-nowrap rounded-lg bg-canvas px-3 py-2 text-sm font-semibold">{lang === "hi" ? "English" : "हिंदी"}</button>
      </div>
      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-lg font-bold">Question {posInSec} <span className="font-normal text-muted">/ {secQs.length}</span></div>
            <div className="flex gap-2"><span className="chip bg-brand-50 text-brand">+{attempt.mpq} Mark</span>{q.topic && <span className="chip bg-orange-50 text-orange-600">{q.topic}</span>}</div>
          </div>
          <h2 className={`mt-4 text-lg md:text-xl font-bold leading-relaxed ${lang === "hi" ? "hi" : ""}`}>{text}</h2>
          {alt && alt !== text && <p className={`mt-2 text-muted ${lang === "en" ? "hi" : ""}`}>{alt}</p>}
          <div className="mt-6 space-y-3">
            {opts.map((o, i) => {
              const L = "ABCD"[i];
              const on = sel === L;
              return (
                <button key={i} onClick={() => setSel(L)} className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition ${on ? "border-brand bg-brand-50 ring-2 ring-brand/15" : "border-line hover:border-brand/40"}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${on ? "bg-brand text-white" : "bg-canvas"}`}>{L}</span>
                  <span className={lang === "hi" ? "hi text-[16px]" : ""}>{o}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-5">
            <button onClick={clear} className="btn-ghost"><Eraser className="h-4 w-4" />Clear Response</button>
            <button onClick={toggleMark} className="btn border border-violet-200 bg-white px-4 py-2.5 text-violet-700 hover:bg-violet-50"><Star className={`h-4 w-4 ${marked.has(q.id) ? "fill-violet-600" : ""}`} />{marked.has(q.id) ? "Unmark" : "Mark for Review"}</button>
            <div className="ml-auto flex gap-2">
              <button onClick={() => go(idx - 1)} disabled={idx === 0} className="btn-ghost"><ArrowLeft className="h-4 w-4" />Previous</button>
              <button onClick={saveNext} className="btn-primary">Save & Next <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </main>
        <aside className="hidden w-[330px] shrink-0 border-l border-line p-6 lg:block">{Palette}</aside>
      </div>
      <button onClick={() => setPalette(true)} className="fixed bottom-5 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lift lg:hidden"><Grid3x3 className="h-6 w-6" /></button>
      {palette && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setPalette(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 reveal">
            <button onClick={() => setPalette(false)} className="absolute right-4 top-4"><X className="h-5 w-5" /></button>
            {Palette}
          </div>
        </div>
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 reveal">
            <h3 className="text-xl font-bold">Test submit karein?</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-green-50 p-3 text-green-700"><b className="block text-2xl">{Object.keys(answers).length}</b><span className="text-xs">Answered</span></div>
              <div className="rounded-xl bg-violet-50 p-3 text-violet-700"><b className="block text-2xl">{marked.size}</b><span className="text-xs">Marked</span></div>
              <div className="rounded-xl bg-canvas p-3"><b className="block text-2xl">{questions.length - Object.keys(answers).length}</b><span className="text-xs">Unanswered</span></div>
            </div>
            <p className="mt-3 text-sm text-muted">Submit ke baad uttar badle nahi ja sakte.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirm(false)} className="btn-ghost"><ArrowLeft className="h-4 w-4" />Wapas Jaayein</button>
              <button onClick={submit} disabled={busy} className="btn-orange">{busy && <Loader2 className="h-4 w-4 animate-spin" />}<CheckCircle2 className="h-4 w-4" />Haan, Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
