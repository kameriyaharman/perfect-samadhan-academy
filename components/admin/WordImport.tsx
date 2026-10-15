"use client";
// Admin: Word (.docx) se Mock Test + sawal upload (Perfect Samadhan question format)
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Eye, FileText, FileUp, Loader2, X } from "lucide-react";

const SECTIONS = ["Computer", "Reading Comprehension", "Maths", "Reasoning", "General Awareness", "Hindi", "English", "GK"];
const KINDS = [["full", "Full Mock"], ["subject", "Subject-wise"], ["topic", "Topic-wise"], ["pyq", "PYQ (Previous Year)"], ["quiz", "Quiz"]];

type PQ = { no: number; text_hi: string; text_en: string | null; opts: { hi: string; en: string | null }[]; answer: string; explanation: string | null };

export default function WordImport({ testId: tid, defaultNew, onClose, onDone }: { testId: string; defaultNew: boolean; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState<"new" | "old">(defaultNew && !tid ? "new" : "old");
  const [testId, setTestId] = useState(tid);
  const [t, setT] = useState({ title: "", exam_slug: "cpct", kind: "full", session: "", year: "", duration: "", marks_per_q: "1", negative: "0", is_free: true });
  const [section, setSection] = useState("GK");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState<"" | "preview" | "import">("");
  const [prev, setPrev] = useState<{ count: number; questions: PQ[]; warnings: string[] } | null>(null);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState("");

  const pick = (f?: File) => { if (!f) return; setFile(f); setPrev(null); setRes(null); setErr(""); };
  const send = async (m: "preview" | "import") => {
    if (!file) return;
    setBusy(m); setErr(""); if (m === "import") setRes(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("mode", m); fd.append("section", section); fd.append("topic", topic); fd.append("source", source);
    if (mode === "new") fd.append("newTest", JSON.stringify({ ...t, duration: t.duration || prev?.count || "" }));
    else fd.append("testId", testId);
    const x = await fetch("/api/admin/questions/import-docx", { method: "POST", body: fd });
    const j = await x.json().catch(() => ({ error: "Server error" }));
    setBusy("");
    if (!x.ok) { setErr(j.error || "Error"); return; }
    if (m === "preview") setPrev(j);
    else { setRes(j); onDone(); }
  };
  const canImport = file && prev && prev.count > 0 && (mode === "old" ? !!testId : !!t.title.trim());

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3 md:p-6">
      <div className="absolute inset-0 bg-navy/40" onClick={busy ? undefined : onClose} />
      <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl reveal">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="flex items-center gap-2 text-xl font-bold"><FileText className="h-5 w-5 text-brand" />Word se Mock Test / Questions upload</h2>
          <button onClick={onClose} disabled={!!busy} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-canvas"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm">
          {res ? (
            <div className="rounded-xl bg-green-50 p-5 text-green-800">
              <p className="flex items-center gap-2 text-lg font-bold"><CheckCircle2 className="h-5 w-5" />{res.created} sawal Mock Test #{res.testId} me jud gaye</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`/admin/r/questions?test_id=${res.testId}`} className="btn-primary btn-sm">Questions dekhein</a>
                <a href={`/test/${res.testId}`} target="_blank" className="btn-ghost btn-sm">Website par test dekhein</a>
              </div>
              {res.warnings?.length > 0 && <Warn list={res.warnings} />}
            </div>
          ) : (
            <ol className="space-y-6">
              <li>
                <Step n={1} t="Word file ka format" />
                <div className="mt-2 rounded-xl bg-canvas p-4 font-mono text-[12.5px] leading-6 text-ink">
                  1. What is the capital of Bihar?<br /><span className="hi">बिहार की राजधानी क्या है?</span><br />A. Patna<br />B. Gaya<br />C. Bhagalpur<br />D. Muzaffarpur<br />Answer A<br />Solution.<br /><span className="hi">• पटना बिहार की राजधानी है…</span>
                </div>
                <p className="mt-2 text-xs text-muted">Har sawal number (1. 2. 3.) se shuru · pehle English phir Hindi line · options A. se D. (E. bhi chalega) — option me "English / हिंदी" likh sakte hain · phir <b>Answer A</b> · phir <b>Solution.</b> ke neeche vyakhya.</p>
                <a href="/question-format.docx" download className="btn-ghost btn-sm mt-2"><Download className="h-4 w-4" />Sample Word file (question-format.docx)</a>
              </li>

              <li>
                <Step n={2} t="Word (.docx) file chunein" />
                <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
                  className={`mt-2 flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${drag ? "border-brand bg-brand-50" : "border-line hover:border-brand"}`}>
                  <FileText className="h-7 w-7 text-brand" />
                  {file ? <><b className="break-all">{file.name}</b><span className="text-xs text-muted">badalne ke liye click karein</span></> : <><b>.docx file yahan chhodein ya click karein</b><span className="text-xs text-muted">Purani .doc ho to Word me "Save As → .docx" karein</span></>}
                  <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              </li>

              <li>
                <Step n={3} t="Kis Mock Test me daalna hai?" />
                <div className="seg mt-2 max-w-md">
                  <button className={mode === "new" ? "on" : ""} onClick={() => setMode("new")}>Naya Mock Test banayein</button>
                  <button className={mode === "old" ? "on" : ""} onClick={() => setMode("old")}>Pehle se bane test me</button>
                </div>
                {mode === "old" ? (
                  <div className="mt-3 max-w-xs"><label className="label">Mock Test ID</label><input value={testId} onChange={(e) => setTestId(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 12 (Mock Tests list me ID)" className="input" inputMode="numeric" /></div>
                ) : (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2"><label className="label">Test ka naam *</label><input value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} placeholder="e.g. Bihar GK Mock Test 01" className="input" /></div>
                    <div><label className="label">Exam slug</label><input value={t.exam_slug} onChange={(e) => setT({ ...t, exam_slug: e.target.value })} placeholder="cpct, ssc-chsl, bihar-police…" className="input" /></div>
                    <div><label className="label">Type</label><select value={t.kind} onChange={(e) => setT({ ...t, kind: e.target.value })} className="input">{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                    {t.kind === "pyq" && <>
                      <div><label className="label">Session (PYQ)</label><input value={t.session} onChange={(e) => setT({ ...t, session: e.target.value })} placeholder="Sep 2025 · Shift 2" className="input" /></div>
                      <div><label className="label">Year</label><input value={t.year} onChange={(e) => setT({ ...t, year: e.target.value.replace(/\D/g, "") })} placeholder="2025" className="input" inputMode="numeric" /></div>
                    </>}
                    <div><label className="label">Samay (minute)</label><input value={t.duration} onChange={(e) => setT({ ...t, duration: e.target.value.replace(/\D/g, "") })} placeholder={prev ? `${prev.count} (1 min / sawal)` : "e.g. 75"} className="input" inputMode="numeric" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Marks / sawal</label><input value={t.marks_per_q} onChange={(e) => setT({ ...t, marks_per_q: e.target.value })} className="input" inputMode="decimal" /></div>
                      <div><label className="label">Negative</label><input value={t.negative} onChange={(e) => setT({ ...t, negative: e.target.value })} className="input" inputMode="decimal" /></div>
                    </div>
                    <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={t.is_free} onChange={(e) => setT({ ...t, is_free: e.target.checked })} className="h-4 w-4 accent-[#1f35b8]" />Free test (bina premium)</label>
                  </div>
                )}
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div><label className="label">Section (sab sawalon ka)</label><select value={section} onChange={(e) => setSection(e.target.value)} className="input">{SECTIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div><label className="label">Topic (optional)</label><input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Bihar GK, MS Excel" className="input" /></div>
                  <div><label className="label">Source (optional)</label><input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. CPCT 2025 · Shift 1" className="input" /></div>
                </div>
              </li>

              {prev && (
                <li>
                  <Step n={4} t={`Preview — ${prev.count} sawal mile`} />
                  {prev.warnings.length > 0 && <Warn list={prev.warnings} />}
                  <div className="mt-3 max-h-[380px] space-y-3 overflow-y-auto rounded-xl border border-line p-3">
                    {prev.questions.map((q) => (
                      <div key={q.no} className="rounded-lg bg-canvas p-3">
                        <div className="font-semibold">{q.no}. {q.text_en || ""}</div>
                        <div className="hi">{q.text_hi !== q.text_en ? q.text_hi : ""}</div>
                        <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
                          {q.opts.map((o, i) => <div key={i} className={`rounded px-2 py-1 text-[13px] ${"ABCDE"[i] === q.answer ? "bg-green-100 font-semibold text-green-800" : "bg-white"}`}>{"ABCDE"[i]}. {o.en ? `${o.en} / ` : ""}<span className="hi">{o.hi}</span></div>)}
                        </div>
                        {q.explanation && <div className="mt-1.5 line-clamp-2 whitespace-pre-line text-xs text-muted">Solution: {q.explanation}</div>}
                      </div>
                    ))}
                  </div>
                </li>
              )}
            </ol>
          )}
          {err && <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{err}</div>}
        </div>

        {!res && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">
            <button onClick={onClose} disabled={!!busy} className="btn-ghost">Cancel</button>
            <button onClick={() => send("preview")} disabled={!file || !!busy} className="btn-soft">{busy === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}Preview</button>
            <button onClick={() => send("import")} disabled={!canImport || !!busy} className="btn-primary">{busy === "import" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}{prev ? `${prev.count} sawal upload karein` : "Pehle Preview karein"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ n, t }: { n: number; t: string }) {
  return <div className="flex items-center gap-2 font-bold"><span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-xs text-white">{n}</span>{t}</div>;
}
function Warn({ list }: { list: string[] }) {
  return <ul className="mt-3 max-h-32 list-disc overflow-y-auto rounded-xl bg-amber-50 py-2 pl-8 pr-3 text-xs text-amber-800">{list.map((w, i) => <li key={i}>{w}</li>)}</ul>;
}
