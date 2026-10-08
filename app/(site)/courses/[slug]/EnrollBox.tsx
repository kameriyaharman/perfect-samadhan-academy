"use client";
import Link from "next/link";
import { useState } from "react";
import { Loader2, Phone, GraduationCap, PhoneCall } from "lucide-react";
import { rupee } from "@/lib/utils";

export default function EnrollBox({ slug, title, price, mrp, offer, mode }: { slug: string; title: string; price: number; mrp: number | null; offer: string | null; mode: string }) {
  const both = /offline/i.test(mode) && /online/i.test(mode);
  const [m, setM] = useState(/online/i.test(mode) && !/offline/i.test(mode) ? "Online" : "Offline");
  const [cb, setCb] = useState(false);
  const [f, setF] = useState({ name: "", mobile: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const r = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, course: `${title} (${m})`, type: "callback" }) });
    const j = await r.json(); setBusy(false);
    setMsg(r.ok ? "Dhanyavaad! Hamari team jald call karegi." : j.error || "Error");
  };
  return (
    <div className="rounded-2xl border-2 border-brand bg-white p-6 shadow-lift">
      <div className="flex items-end gap-2"><span className="text-4xl font-extrabold text-navy">{rupee(price)}</span>{mrp && <span className="pb-1 text-muted line-through">{rupee(mrp)}</span>}</div>
      {offer && <span className="chip mt-2 bg-green-50 text-green-700 py-1.5">{offer}</span>}
      {both && <div className="seg mt-4"><button className={m === "Offline" ? "on" : ""} onClick={() => setM("Offline")}>Offline</button><button className={m === "Online" ? "on" : ""} onClick={() => setM("Online")}>Online</button></div>}
      <Link href={`/checkout?item=course:${slug}&mode=${m}`} className="btn-orange mt-4 w-full !py-3.5 text-base"><GraduationCap className="h-4 w-4" />Abhi Enroll Karein</Link>
      <button onClick={() => setCb(!cb)} className="btn-ghost mt-2 w-full"><Phone className="h-4 w-4" />Call Back Request</button>
      {cb && (msg ? <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-700">{msg}</p> : (
        <form onSubmit={send} className="mt-3 space-y-2">
          <input required placeholder="Aapka naam" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input required placeholder="Mobile number" inputMode="numeric" maxLength={10} className="input" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "") })} />
          <button disabled={busy} className="btn-primary w-full">{busy && <Loader2 className="h-4 w-4 animate-spin" />}<PhoneCall className="h-4 w-4" />Request Bhejein</button>
        </form>
      ))}
      <p className="mt-3 text-center text-xs text-muted">EMI available · 7-din refund</p>
    </div>
  );
}
