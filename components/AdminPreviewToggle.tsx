"use client";
import { useState } from "react";
import { Eye, ShieldCheck, X } from "lucide-react";

export default function AdminPreviewToggle({ on }: { on: boolean }) {
  const [busy, setBusy] = useState(false);
  const [min, setMin] = useState(false);
  const flip = async () => {
    setBusy(true);
    await fetch("/api/admin/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: !on }) }).catch(() => {});
    window.location.reload();
  };
  if (min) return <button onClick={() => setMin(false)} title={on ? "Student view chalu" : "Admin view"} className={`no-print fixed bottom-5 left-5 z-40 grid h-11 w-11 place-items-center rounded-full shadow-lift ${on ? "bg-amber-500 text-navy" : "bg-navy text-white"}`}>{on ? <Eye className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</button>;
  return (
    <div className={`no-print fixed bottom-5 left-5 z-40 flex max-w-[calc(100vw-110px)] items-center gap-3 rounded-2xl px-4 py-2.5 text-sm shadow-lift ${on ? "bg-amber-500 text-navy" : "bg-navy text-white"}`} data-dark={!on || undefined}>
      {on ? <Eye className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
      <span className="leading-tight">{on ? <>Student view chalu — locks wahi dikh rahe hain jo free student ko</> : <>Aap Admin hain — premium / locked tests aapke liye khule dikhte hain</>}</span>
      <button disabled={busy} onClick={flip} className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold ${on ? "bg-navy text-white" : "bg-gold text-navy"}`}>{on ? "Admin view" : "Student ki nazar se dekhein"}</button>
      <button onClick={() => setMin(true)} title="Chhota karein" className="shrink-0 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}
