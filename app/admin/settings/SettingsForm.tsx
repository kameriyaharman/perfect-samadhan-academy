"use client";
import { useState } from "react";
import { Loader2, Save, CheckCircle2, AlertTriangle, KeyRound, PlugZap, Info, FileUp } from "lucide-react";
import type { SettingType } from "@/lib/resources";

type Group = { title: string; note?: string; keys: [string, string, SettingType?][] };

export default function SettingsForm({ groups, initial, savedSecrets = {}, env = { razorpay: false } }: { groups: Group[]; initial: Record<string, string>; savedSecrets?: Record<string, boolean>; env?: { razorpay: boolean } }) {
  const [v, setV] = useState(initial);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(savedSecrets);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [test, setTest] = useState<{ busy?: boolean; ok?: boolean; t?: string }>({});

  const save = async () => {
    setBusy(true); setMsg(null);
    const body: Record<string, string> = { ...v };
    for (const [k, s] of Object.entries(secrets)) if (s.trim()) body[k] = s.trim();
    const x = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (x.ok) {
      const nowSaved = { ...saved };
      for (const [k, s] of Object.entries(secrets)) if (s.trim()) nowSaved[k] = true;
      setSaved(nowSaved); setSecrets({});
      setMsg({ ok: true, t: "Save ho gaya" });
    } else setMsg({ ok: false, t: "Save nahi hua — dobara try karein" });
    return x.ok;
  };

  const testRazorpay = async () => {
    setTest({ busy: true });
    if (Object.values(secrets).some((s) => s.trim()) || initial.razorpay_key_id !== v.razorpay_key_id || initial.razorpay_enabled !== v.razorpay_enabled) {
      if (!(await save())) return setTest({});
    }
    const r = await fetch("/api/admin/razorpay-test", { method: "POST" }).then((x) => x.json()).catch(() => ({ ok: false, error: "Network error" }));
    setTest(r.ok ? { ok: true, t: `Keys sahi hain — Razorpay ${r.mode === "live" ? "LIVE" : "TEST"} mode me connect ho gaya.` } : { ok: false, t: r.error });
  };

  const keyId = (v.razorpay_key_id || "").trim();
  const keyBad = keyId && !/^rzp_(live|test)_[A-Za-z0-9]+$/.test(keyId);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-navy">Site Settings</h1><p className="text-muted">Payment, contact details, home page text, policies — sab yahan se badlein.</p></div>
        <div className="flex items-center gap-3">{msg && <span className={`flex items-center gap-1 text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{msg.t}</span>}<button onClick={save} disabled={busy} className="btn-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save All</button></div>
      </div>
      <div className="mt-6 space-y-5">
        {groups.map((g) => {
          const isPay = g.keys.some(([k]) => k.startsWith("razorpay_"));
          return (
            <div key={g.title} className={`card p-6 ${isPay ? "ring-2 ring-brand/15" : ""}`}>
              <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">{isPay && <KeyRound className="h-5 w-5 text-brand" />}{g.title}</h2>
              {g.note && <p className="mb-4 flex gap-2 text-sm text-muted"><Info className="mt-0.5 h-4 w-4 shrink-0" />{g.note}</p>}
              <div className="grid gap-4 md:grid-cols-2">
                {g.keys.map(([k, l, t]) => {
                  if (t === "toggle") {
                    const on = v[k] !== "0";
                    return (
                      <div key={k} className="md:col-span-2">
                        <button type="button" onClick={() => setV({ ...v, [k]: on ? "0" : "1" })} className="flex items-center gap-3">
                          <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} /></span>
                          <span className="text-[15px] font-semibold">{l}</span>
                        </button>
                        {!on && isPay && <p className="mt-1.5 text-xs text-amber-700">Band hai — checkout par manual UPI payment ka option dikhega.</p>}
                      </div>
                    );
                  }
                  if (t === "file") {
                    return <FileSetting key={k} label={l} value={v[k] || ""} onChange={(x) => setV({ ...v, [k]: x })} />;
                  }
                  if (t === "secret") {
                    return (
                      <div key={k}>
                        <label className="label">{l}</label>
                        <input type="password" autoComplete="new-password" className="input font-mono" value={secrets[k] || ""} onChange={(e) => setSecrets({ ...secrets, [k]: e.target.value })}
                          placeholder={saved[k] ? "•••••••• saved — badalna ho to naya dalein" : "Secret yahan paste karein"} />
                        <p className={`mt-1 text-xs ${saved[k] ? "text-green-700" : "text-muted"}`}>{saved[k] ? "✓ Secret saved hai. Khali chhodne par wahi rahega." : isPay && env.razorpay ? "Abhi Railway env variable wala secret use ho raha hai." : "Abhi koi secret saved nahi hai."}</p>
                      </div>
                    );
                  }
                  return (
                    <div key={k} className={t === "textarea" ? "md:col-span-2" : ""}>
                      <label className="label">{l}</label>
                      {t === "textarea" ? <textarea className="input" rows={k.includes("policy") || k === "terms" || k === "disclaimer" ? 8 : 3} value={v[k] || ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
                        : <input className={`input ${k === "razorpay_key_id" ? "font-mono" : ""}`} value={v[k] || ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
                      {k === "razorpay_key_id" && (keyBad
                        ? <p className="mt-1 text-xs text-red-600">Key ID rzp_live_ ya rzp_test_ se shuru hoti hai.</p>
                        : keyId ? <p className="mt-1 text-xs text-muted">Mode: <b className={keyId.startsWith("rzp_live_") ? "text-green-700" : "text-amber-700"}>{keyId.startsWith("rzp_live_") ? "LIVE (asli payment)" : "TEST (sirf testing)"}</b></p> : null)}
                    </div>
                  );
                })}
              </div>
              {isPay && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <button type="button" onClick={testRazorpay} disabled={test.busy || busy} className="btn-soft">{test.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}Save &amp; Test Connection</button>
                  {test.t && <span className={`flex items-center gap-1.5 text-sm ${test.ok ? "text-green-700" : "text-red-600"}`}>{test.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{test.t}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end"><button onClick={save} disabled={busy} className="btn-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save All</button></div>
    </div>
  );
}

function FileSetting({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [up, setUp] = useState(false);
  const [err, setErr] = useState("");
  const upload = async (file: File) => {
    setUp(true); setErr("");
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    setUp(false);
    if (r.ok && j.url) onChange(j.url); else setErr(j.error || "Upload nahi hua");
  };
  return (
    <div className="md:col-span-2">
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL ya file upload karein" />
        <label className="btn-soft shrink-0 cursor-pointer !py-3">{up ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}Upload<input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
      </div>
      {value && /\.(mp3|wav|ogg|m4a)($|\?)/i.test(value) && <audio controls src={value} className="mt-2 h-9" />}
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
