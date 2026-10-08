"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
export default function ContactForm({ courses }: { courses: string[] }) {
  const [f, setF] = useState({ name: "", mobile: "", course: courses[0] || "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json(); setBusy(false);
    if (r.ok) setDone(true); else setErr(j.error);
  };
  if (done) return <div className="card grid place-items-center p-10 text-center"><div><CheckCircle2 className="mx-auto h-14 w-14 text-green-600" /><h2 className="mt-3 text-2xl font-bold">Dhanyavaad!</h2><p className="text-muted">Aapka sandesh mil gaya — hamari team jald sampark karegi.</p></div></div>;
  return (
    <form onSubmit={submit} className="card p-6 md:p-8">
      <h2 className="text-3xl font-extrabold text-navy">Enquiry Form</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className="label">Naam</label><input required className="input" placeholder="Aapka naam" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label">Mobile</label><input required className="input" placeholder="+91" inputMode="numeric" maxLength={10} value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "") })} /></div>
      </div>
      <label className="label mt-4">Kis course me ruchi hai?</label>
      <select className="input" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })}>{courses.map((c) => <option key={c}>{c}</option>)}<option>Other / General</option></select>
      <label className="label mt-4">Sandesh</label>
      <textarea className="input min-h-[130px]" placeholder="Apna sawal likhein…" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="btn-primary mt-5 !py-3 !px-6">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Bhejein</button>
    </form>
  );
}
