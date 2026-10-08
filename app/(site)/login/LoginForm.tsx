"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Phone, Hand, Sparkles, LogIn, UserPlus } from "lucide-react";

export default function LoginForm({ initialTab, next, exams }: { initialTab: "login" | "register"; next: string; exams: string[] }) {
  const [tab, setTab] = useState(initialTab);
  const [f, setF] = useState({ name: "", mobile: "", password: "", email: "", city: "", targetExam: exams[0] || "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch(`/api/auth/${tab}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error || "Kuch galat hua"); setBusy(false); return; }
    window.location.href = j.role === "admin" && next === "/dashboard" ? "/admin" : next;
  };
  return (
    <div className="w-full max-w-md reveal">
      <div className="seg mb-8 max-w-xs">
        <button className={tab === "login" ? "on" : ""} onClick={() => setTab("login")}>Login</button>
        <button className={tab === "register" ? "on" : ""} onClick={() => setTab("register")}>Register</button>
      </div>
      <h2 className="text-3xl font-extrabold text-navy"><span className="flex items-center gap-2">{tab === "login" ? <>Welcome back <Hand className="h-7 w-7 text-saffron" /></> : <>Free account banayein <Sparkles className="h-7 w-7 text-saffron" /></>}</span></h2>
      <p className="mt-1 text-muted">{tab === "login" ? "Mobile number aur password se login karein" : "Sirf 30 second — aur sab kuch free"}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {tab === "register" && <div><label className="label">Poora Naam</label><input className="input" value={f.name} onChange={set("name")} placeholder="Aapka naam" required /></div>}
        <div>
          <label className="label">Mobile Number</label>
          <div className="flex items-center rounded-xl border border-line focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
            <span className="ml-3 mr-3 flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-line pr-3 text-[15px] font-medium text-ink"><Phone className="h-4 w-4 text-muted" />+91</span>
            <input className="w-full min-w-0 bg-transparent py-3 pr-4 outline-none" inputMode="numeric" maxLength={10} value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "") })} placeholder="98XXX XXXXX" required />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-12" type={show ? "text" : "password"} value={f.password} onChange={set("password")} placeholder={tab === "register" ? "Kam se kam 6 akshar" : "Password"} required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>
        </div>
        {tab === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Shahar</label><input className="input" value={f.city} onChange={set("city")} placeholder="Bhopal" /></div>
            <div><label className="label">Target Exam</label><select className="input" value={f.targetExam} onChange={set("targetExam")}>{exams.map((x) => <option key={x}>{x}</option>)}</select></div>
          </div>
        )}
        {err && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
        <button disabled={busy} className="btn-primary w-full !py-3.5 text-base">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{tab === "login" ? "Login Karein" : "Register Karein"}</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        {tab === "login" ? <>Account nahi hai? <button onClick={() => setTab("register")} className="font-semibold text-brand">Free Register</button></> : <>Pehle se account hai? <button onClick={() => setTab("login")} className="font-semibold text-brand">Login</button></>}
      </p>
      <p className="mt-6 text-center text-xs text-muted">Aage badhkar aap <Link href="/page/terms" className="underline">Terms</Link> & <Link href="/page/privacy-policy" className="underline">Privacy Policy</Link> se sahmat hain. Password bhool gaye? <Link href="/contact" className="underline">Admin se sampark karein</Link>.</p>
    </div>
  );
}
