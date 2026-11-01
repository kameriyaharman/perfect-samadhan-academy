"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Phone, Hand, Sparkles, LogIn, UserPlus, KeyRound, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function LoginForm({ initialTab, next, exams, why }: { initialTab: "login" | "register" | "forgot"; next: string; exams: string[]; why?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [f, setF] = useState({ name: "", mobile: "", password: "", email: "", city: "", targetExam: exams[0] || "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  // Forgot password: 1 = mobile, 2 = OTP + naya password, 3 = SMS band — request admin ko gayi
  const [fStep, setFStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [pass2, setPass2] = useState("");
  const [info, setInfo] = useState("");
  const forgot = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setInfo(""); setBusy(true);
    if (fStep === 1) {
      const r = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile: f.mobile }) });
      const j = await r.json().catch(() => ({}));
      setBusy(false);
      if (!r.ok) { setErr(j.error || "Kuch galat hua"); return; }
      if (j.sent) { setFStep(2); setInfo(`+91 ${f.mobile} par 6 ankon ka OTP bheja gaya hai (10 minute tak chalega).`); }
      else setFStep(3);
      return;
    }
    if (f.password !== pass2) { setBusy(false); setErr("Dono password ek jaise nahi hain"); return; }
    const r = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile: f.mobile, otp, password: f.password }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setBusy(false); setErr(j.error || "Kuch galat hua"); return; }
    window.location.href = j.role === "admin" && next === "/dashboard" ? "/admin" : next;
  };
  const goTab = (t: "login" | "register" | "forgot") => { setTab(t); setErr(""); setInfo(""); setFStep(1); };
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
        <button className={tab === "login" || tab === "forgot" ? "on" : ""} onClick={() => goTab("login")}>Login</button>
        <button className={tab === "register" ? "on" : ""} onClick={() => goTab("register")}>Register</button>
      </div>
      {why === "test" && tab !== "forgot" && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-50 px-4 py-3 text-[15px] text-navy">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <span>Test / typing dene ke liye <b>login</b> karein. Account nahi hai to <button type="button" onClick={() => goTab("register")} className="font-semibold text-brand underline">free Register</button> karein — sirf 30 second.</span>
        </div>
      )}
      {tab === "forgot" ? (
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-extrabold text-navy"><KeyRound className="h-7 w-7 text-saffron" />Password bhool gaye?</h2>
          <p className="mt-1 text-muted">{fStep === 1 ? "Apna registered mobile number daalein" : fStep === 2 ? "OTP aur naya password daalein" : ""}</p>
          {fStep === 3 ? (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-[15px] text-green-900">
              <b className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />Request bhej di gayi</b>
              <p className="mt-1">Academy aapke number <b>+91 {f.mobile}</b> par sampark karke naya password batayegi. Jaldi chahiye to <a href="/contact" className="font-semibold underline">Contact page</a> se call / WhatsApp karein.</p>
            </div>
          ) : (
            <form onSubmit={forgot} className="mt-6 space-y-4">
              <div>
                <label className="label">Mobile Number</label>
                <div className="flex items-center rounded-xl border border-line focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                  <span className="ml-3 mr-3 flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-line pr-3 text-[15px] font-medium text-ink"><Phone className="h-4 w-4 text-muted" />+91</span>
                  <input className="w-full min-w-0 bg-transparent py-3 pr-4 outline-none" inputMode="numeric" maxLength={10} disabled={fStep === 2} value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "") })} placeholder="98XXX XXXXX" required />
                </div>
              </div>
              {fStep === 2 && (
                <>
                  <div><label className="label">OTP (SMS me aaya 6 ank)</label><input className="input tracking-[0.4em] font-mono text-lg" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="••••••" required autoFocus /></div>
                  <div><label className="label">Naya Password</label><input className="input" type={show ? "text" : "password"} value={f.password} onChange={set("password")} placeholder="Kam se kam 6 akshar" minLength={6} required /></div>
                  <div><label className="label">Naya Password dobara</label><input className="input" type={show ? "text" : "password"} value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Wahi password" minLength={6} required /></div>
                  <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Password dikhayein</label>
                </>
              )}
              {info && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{info}</div>}
              {err && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
              <button disabled={busy} className="btn-primary w-full !py-3.5 text-base">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{fStep === 1 ? "OTP bhejein" : "Password badlein aur Login"}</button>
              {fStep === 2 && <button type="button" disabled={busy} onClick={() => { setFStep(1); setOtp(""); setInfo(""); }} className="w-full text-center text-sm font-semibold text-brand">OTP nahi aaya? Dobara bhejein</button>}
            </form>
          )}
          <button type="button" onClick={() => goTab("login")} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"><ArrowLeft className="h-4 w-4" />Login par wapas</button>
        </div>
      ) : (<>
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
          {tab === "login" && <div className="mt-1.5 text-right"><button type="button" onClick={() => goTab("forgot")} className="text-sm font-semibold text-brand hover:underline">Password bhool gaye?</button></div>}
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
        {tab === "login" ? <>Account nahi hai? <button onClick={() => goTab("register")} className="font-semibold text-brand">Free Register</button></> : <>Pehle se account hai? <button onClick={() => goTab("login")} className="font-semibold text-brand">Login</button></>}
      </p>
      </>)}
      <p className="mt-6 text-center text-xs text-muted">Aage badhkar aap <Link href="/page/terms" className="underline">Terms</Link> & <Link href="/page/privacy-policy" className="underline">Privacy Policy</Link> se sahmat hain. Password bhool gaye? <button type="button" onClick={() => goTab("forgot")} className="underline">Yahan reset karein</button>.</p>
    </div>
  );
}
