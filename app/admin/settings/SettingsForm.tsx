"use client";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
export default function SettingsForm({ groups, initial }: { groups: { title: string; keys: [string, string, ("text" | "textarea")?][] }[]; initial: Record<string, string> }) {
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const save = async () => {
    setBusy(true); setMsg("");
    const x = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    setBusy(false); setMsg(x.ok ? "Save ho gaya ✓" : "Error");
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-navy">Site Settings</h1><p className="text-muted">Contact details, home page text, policies — sab yahan se badlein.</p></div>
        <div className="flex items-center gap-3">{msg && <span className="text-sm text-green-700">{msg}</span>}<button onClick={save} disabled={busy} className="btn-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save All</button></div>
      </div>
      <div className="mt-6 space-y-5">
        {groups.map((g) => (
          <div key={g.title} className="card p-6">
            <h2 className="mb-4 text-lg font-bold">{g.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {g.keys.map(([k, l, t]) => (
                <div key={k} className={t === "textarea" ? "md:col-span-2" : ""}>
                  <label className="label">{l}</label>
                  {t === "textarea" ? <textarea className="input" rows={k.includes("policy") || k === "terms" || k === "disclaimer" ? 8 : 3} value={v[k] || ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
                    : <input className="input" value={v[k] || ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end"><button onClick={save} disabled={busy} className="btn-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save All</button></div>
    </div>
  );
}
