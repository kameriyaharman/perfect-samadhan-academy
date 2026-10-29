"use client";
// Admin: Word (.docx) se Mock Test + sawal upload (Perfect Samadhan question format)
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Eye, FileText, FileUp, Layers, Loader2, X } from "lucide-react";

const SECTIONS = ["Computer", "Reading Comprehension", "Maths", "Reasoning", "General Awareness", "Hindi", "English", "GK"];
const KINDS = [["full", "Mock Test (Full)"], ["subject", "Subject-wise"], ["topic", "Syllabus Wise (Topic)"], ["pyq", "Old Paper (PYQ)"], ["free", "Free Mock Test"], ["quiz", "Quiz"]];

type PQ = { no: number; text_hi: string; text_en: string | null; opts: { hi: string; en: string | null }[]; answer: string; explanation: string | null; section?: string | null };
type Rg = { name: string; from: string; to: string };

export default function WordImport({ testId: tid, defaultNew, onClose, onDone, kind, folders = [], folderId = "" }: { testId: string; defaultNew: boolean; onClose: () => void; onDone: () => void; kind?: string; folders?: { id: number; name: string; group: string }[]; folderId?: string; resKey?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState<"new" | "old">(defaultNew && !tid ? "new" : "old");
  const [testId, setTestId] = useState(tid);
  const [t, setT] = useState({ title: "", exam_slug: "cpct", kind: kind || "full", session: "", year: "", duration: "", marks_per_q: "1", negative: "0", is_free: true, series: "", folder_id: folderId, mode: kind === "free" ? "practice" : "both" });
  // ek ya kai sections — "All Subjects" = sabhi sections
  const [secs, setSecs] = useState<string[]>(["GK"]);
  const section = secs[0] || "GK";
  const multi = secs.length > 1;
  const [secMode, setSecMode] = useState<"ranges" | "doc">("ranges");
  const [ranges, setRanges] = useState<Rg[]>([]);
  const toggleSec = (s: string) => setSecs((cur) => cur.includes(s) ? (cur.length > 1 ? cur.filter((x) => x !== s) : cur) : SECTIONS.filter((x) => cur.includes(x) || x === s));
  const allOn = secs.length === SECTIONS.length;
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState<"" | "preview" | "import">("");
  const [prev, setPrev] = useState<{ count: number; questions: PQ[]; warnings: string[] } | null>(null);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState("");

  const docSecs = prev ? Array.from(new Set(prev.questions.map((q) => q.section).filter(Boolean))) as string[] : [];
  // ranges: chune hue sections me sawal barabar baant do (admin badal sakta hai); Word me headings mili to wahi se
  useEffect(() => {
    if (!multi) return;
    const n = prev?.count || 0;
    if (prev && docSecs.length > 1) {
      setSecMode("doc");
      const rs: Rg[] = []; prev.questions.forEach((q, i) => { const nm = q.section || secs[0]; const last = rs[rs.length - 1]; if (last && last.name === nm) last.to = String(i + 1); else rs.push({ name: nm, from: String(i + 1), to: String(i + 1) }); });
      setRanges(rs);
      return;
    }
    const per = n ? Math.ceil(n / secs.length) : 0;
    setRanges(secs.map((nm, i) => ({ name: nm, from: per ? String(i * per + 1) : "", to: per ? String(Math.min(n, (i + 1) * per)) : "" })));
  }, [secs.join("|"), prev]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (f?: File) => { if (!f) return; setFile(f); setPrev(null); setRes(null); setErr(""); };
  const send = async (m: "preview" | "import") => {
    if (!file) return;
    setBusy(m); setErr(""); if (m === "import") setRes(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("mode", m); fd.append("section", section); fd.append("topic", topic); fd.append("source", source);
    fd.append("secMode", multi ? secMode : "one"); if (multi && secMode === "ranges") fd.append("ranges", JSON.stringify(ranges));
    if (mode === "new") fd.append("newTest", JSON.stringify({ ...t, duration: t.duration || prev?.count || "" }));
    else fd.append("testId", testId);
    const x = await fetch("/api/admin/questions/import-docx", { method: "POST", body: fd });
    const j = await x.json().catch(() => ({ error: "Server error" }));
    setBusy("");
    if (!x.ok) { setErr(j.error || "Error"); return; }
    if (m === "preview") setPrev(j);
    else { setRes(j); onDone(); }
  };
  const rangeErr = multi && secMode === "ranges" && prev ? checkRanges(ranges, prev.count) : "";
  const canImport = file && prev && prev.count > 0 && (mode === "old" ? !!testId : !!t.title.trim()) && !rangeErr;

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
                    {folders.length > 0 && <div><label className="label">Folder</label><select value={t.folder_id} onChange={(e) => setT({ ...t, folder_id: e.target.value })} className="input hi"><option value="">— Bina folder —</option>{folders.map((f) => <option key={f.id} value={f.id}>{f.group} · {f.name}</option>)}</select></div>}
                    <div><label className="label">Test kaise chale</label><select value={t.mode} onChange={(e) => setT({ ...t, mode: e.target.value })} className="input"><option value="both">Dono — Practice + Exam</option><option value="practice">Practice (turant sahi/galat + awaaz)</option><option value="exam">Exam (CBT timer)</option></select></div>
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
                    <div className="md:col-span-2"><label className="label">Test Series (optional — Premium Plan me poori series ek saath judti hai)</label><input value={t.series} onChange={(e) => setT({ ...t, series: e.target.value })} placeholder="e.g. CPCT Premium Test Series 2026" className="input" /></div>
                    <div className="md:col-span-2">
                      <label className="label">Test kiske liye? *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setT({ ...t, is_free: true })} className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm ${t.is_free ? "border-green-600 bg-green-50 font-semibold text-green-800" : "border-line"}`}>🔓 Free — sab students</button>
                        <button type="button" onClick={() => setT({ ...t, is_free: false })} className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm ${!t.is_free ? "border-saffron bg-orange-50 font-semibold text-orange-800" : "border-line"}`}>🔒 Premium — sirf paid students</button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <label className="label flex items-center gap-1.5"><Layers className="h-4 w-4" />Section — ek ya zyada chunein</label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSecs(allOn ? ["GK"] : [...SECTIONS])} className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold ${allOn ? "border-brand bg-brand text-white" : "border-dashed border-brand text-brand"}`}>{allOn ? "✓ " : "+ "}All Subjects</button>
                    {SECTIONS.map((s) => { const on = secs.includes(s); return <button key={s} type="button" onClick={() => toggleSec(s)} className={`rounded-xl border-2 px-3 py-2 text-sm ${on ? "border-brand bg-brand-50 font-semibold text-brand" : "border-line hover:border-brand/40"}`}>{on ? "✓ " : ""}{s}</button>; })}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{multi ? `${secs.length} sections chune — neeche batayein kaun-sa sawal kis section ka hai.` : `Sabhi sawal "${section}" section me jayenge. Poora test (kai section) banana ho to aur sections chunein ya All Subjects.`}</p>
                  {multi && (
                    <div className="mt-3 rounded-xl border border-line p-3">
                      <div className="seg max-w-md">
                        <button className={secMode === "ranges" ? "on" : ""} onClick={() => setSecMode("ranges")}>Sawal number se</button>
                        <button className={secMode === "doc" ? "on" : ""} onClick={() => setSecMode("doc")}>Word ki headings se</button>
                      </div>
                      {secMode === "doc" ? (
                        <p className="mt-2 text-xs text-muted">Word file me har section se pehle heading likhein — jaise <b>Section: Maths</b> ya <b>## Reasoning</b> ya sirf <b>Computer</b> (alag line me). {prev ? (docSecs.length ? <span className="font-semibold text-green-700">File me mile: {docSecs.join(", ")}</span> : <span className="font-semibold text-red-600">File me koi heading nahi mili — bina heading wale sawal "{section}" me jayenge.</span>) : "Preview karke check karein."}</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {!prev && <p className="text-xs text-muted">Pehle Preview karein — sawalon ki ginti aate hi range apne aap bhar jayegi.</p>}
                          {ranges.map((r, i) => (
                            <div key={r.name + i} className="flex flex-wrap items-center gap-2 text-sm">
                              <b className="w-44">{r.name}</b>
                              <span className="text-muted">Sawal</span>
                              <input value={r.from} onChange={(e) => setRanges(ranges.map((x, k) => k === i ? { ...x, from: e.target.value.replace(/\D/g, "") } : x))} className="input !w-20 !py-1.5" inputMode="numeric" />
                              <span className="text-muted">se</span>
                              <input value={r.to} onChange={(e) => setRanges(ranges.map((x, k) => k === i ? { ...x, to: e.target.value.replace(/\D/g, "") } : x))} className="input !w-20 !py-1.5" inputMode="numeric" />
                              <span className="text-muted">tak</span>
                              {r.from && r.to && <span className="chip bg-canvas">{Math.max(0, Number(r.to) - Number(r.from) + 1)} Q</span>}
                            </div>
                          ))}
                          {rangeErr && <p className="text-xs font-semibold text-red-600">{rangeErr}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                        <div className="font-semibold">{q.no}. {q.text_en || ""}{multi && secMode === "doc" && q.section && <span className="chip ml-2 bg-brand-50 text-brand">{q.section}</span>}</div>
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

function checkRanges(rs: Rg[], n: number) {
  const seen = new Array(n + 1).fill("");
  for (const r of rs) {
    const a = Number(r.from), b = Number(r.to);
    if (!a || !b) return `${r.name}: sawal number bharein`;
    if (b < a) return `${r.name}: "se" chhota hona chahiye "tak" se`;
    if (b > n) return `${r.name}: file me sirf ${n} sawal hain`;
    for (let i = a; i <= b; i++) { if (seen[i]) return `Sawal ${i} do section (${seen[i]}, ${r.name}) me hai`; seen[i] = r.name; }
  }
  const miss = seen.findIndex((x, i) => i > 0 && !x);
  return miss > 0 ? `Sawal ${miss} kisi section me nahi hai` : "";
}

function Step({ n, t }: { n: number; t: string }) {
  return <div className="flex items-center gap-2 font-bold"><span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-xs text-white">{n}</span>{t}</div>;
}
function Warn({ list }: { list: string[] }) {
  return <ul className="mt-3 max-h-32 list-disc overflow-y-auto rounded-xl bg-amber-50 py-2 pl-8 pr-3 text-xs text-amber-800">{list.map((w, i) => <li key={i}>{w}</li>)}</ul>;
}
