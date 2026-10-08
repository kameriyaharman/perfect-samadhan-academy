"use client";
import { useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";

const TPL = {
  questions: `section,topic,question_hi,question_en,a_hi,b_hi,c_hi,d_hi,a_en,b_en,c_en,d_en,answer,explanation,source,keywords
Computer,Memory,RAM का पूर्ण रूप क्या है?,What is the full form of RAM?,Random Access Memory,Read Access Memory,Rapid Action Memory,Random Allocate Memory,,,,,A,RAM volatile memory hai,CPCT 2024 Shift 1,ram memory`,
  passages: `title,language,level,exam,year,session,shift,text
CPCT Nov 2025 Shift 1 (Hindi),hindi,exam,CPCT,2025,Nov 2025,Shift 1,"भारत एक विशाल देश है..."
Practice English 1,english,easy,,,,,"Typing is a skill that improves with practice."`,
};
export default function ImportForm({ type: t0, testId: tid }: { type: "questions" | "passages"; testId: string }) {
  const [type, setType] = useState(t0);
  const [testId, setTestId] = useState(tid);
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<any>(null);
  const run = async () => {
    setBusy(true); setRes(null);
    const x = await fetch("/api/admin/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, testId, csv }) });
    setRes(await x.json()); setBusy(false);
  };
  const file = async (f: File) => setCsv(await f.text());
  const dl = () => { const b = new Blob(["﻿" + TPL[type]], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${type}-template.csv`; a.click(); };
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Bulk Import (CSV / Excel)</h1>
      <p className="text-muted">Excel me data bharein → "Save As CSV UTF-8" → yahan upload karein. Ek saath sau-hazaar questions ya passages jod sakte hain.</p>
      <div className="card mt-6 p-6">
        <div className="flex flex-wrap gap-3">
          <div className="seg w-72"><button className={type === "questions" ? "on" : ""} onClick={() => setType("questions")}>Questions</button><button className={type === "passages" ? "on" : ""} onClick={() => setType("passages")}>Typing Passages</button></div>
          {type === "questions" && <input value={testId} onChange={(e) => setTestId(e.target.value)} placeholder="Mock Test ID (optional)" className="input !w-60" />}
          <button onClick={dl} className="btn-ghost"><Download className="h-4 w-4" />Template CSV</button>
          <label className="btn-soft cursor-pointer !py-3"><Upload className="h-4 w-4" />CSV file chunein<input type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={(e) => e.target.files?.[0] && file(e.target.files[0])} /></label>
        </div>
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={12} placeholder={TPL[type]} className="input mt-4 font-mono text-xs hi" />
        <div className="mt-4 flex items-center gap-3"><button onClick={run} disabled={busy || !csv.trim()} className="btn-primary">{busy && <Loader2 className="h-4 w-4 animate-spin" />}<Upload className="h-4 w-4" />Import Karein</button>
          {res && (res.error ? <span className="text-red-600">{res.error}</span> : <span className="text-green-700">{res.imported} records import hue{res.errors?.length ? ` · ${res.errors.length} rows skip` : ""}</span>)}</div>
        {res?.errors?.length > 0 && <ul className="mt-3 list-disc pl-5 text-sm text-red-600">{res.errors.map((e: string) => <li key={e}>{e}</li>)}</ul>}
        <p className="mt-4 text-xs text-muted">Answer column me A/B/C/D likhein. English columns optional hain (khali chhodne par Hindi hi dikhega). Test ID dene par questions usi mock test me judenge.</p>
      </div>
    </div>
  );
}
