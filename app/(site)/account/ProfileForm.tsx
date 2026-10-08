"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Save } from "lucide-react";
export default function ProfileForm({ user, exams }: { user: Record<string, string>; exams: string[] }) {
  const r = useRouter();
  const [f, setF] = useState<Record<string, string>>({ ...user, password: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const x = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await x.json(); setBusy(false); setMsg(x.ok ? "Save ho gaya" : j.error); if (x.ok) r.refresh();
  };
  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <div><label className="label">Naam</label><input className="input" value={f.name} onChange={set("name")} /></div>
      <div><label className="label">Mobile</label><input className="input bg-canvas" value={`+91 ${f.mobile}`} disabled /></div>
      <div><label className="label">Email</label><input className="input" type="email" value={f.email} onChange={set("email")} /></div>
      <div><label className="label">Shahar</label><input className="input" value={f.city} onChange={set("city")} /></div>
      <div><label className="label">Target Exam</label><select className="input" value={f.target_exam} onChange={set("target_exam")}><option value="">—</option>{exams.map((x) => <option key={x}>{x}</option>)}</select></div>
      <div><label className="label">Exam Date</label><input className="input" type="date" value={f.exam_date} onChange={set("exam_date")} /></div>
      <div className="sm:col-span-2"><label className="label">Naya Password (optional)</label><input className="input" type="password" value={f.password} onChange={set("password")} placeholder="Khali chhodein agar nahi badalna" /></div>
      <div className="flex items-center gap-3 sm:col-span-2"><button disabled={busy} className="btn-primary">{busy && <Loader2 className="h-4 w-4 animate-spin" />}<Save className="h-4 w-4" />Save Changes</button>{msg && <span className="flex items-center gap-1 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{msg}</span>}</div>
    </form>
  );
}
