"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";

export default function StartTest({ testId, loggedIn, locked, empty }: { testId: number; loggedIn: boolean; locked: boolean; empty: boolean }) {
  const r = useRouter();
  const [lang, setLang] = useState("hi");
  const [ok, setOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const go = async () => {
    if (!loggedIn) return r.push(`/login?next=/test/${testId}`);
    setBusy(true); setErr("");
    const x = await fetch("/api/test/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testId, language: lang }) });
    const j = await x.json();
    if (x.status === 402) return r.push("/plans");
    if (!x.ok) { setErr(j.error || "Error"); setBusy(false); return; }
    r.push(`/test/attempt/${j.attemptId}`);
  };
  return (
    <>
      <h3 className="mt-6 font-bold">Default Language</h3>
      <div className="seg mt-2 max-w-xs"><button className={lang === "hi" ? "on hi" : "hi"} onClick={() => setLang("hi")}>हिंदी</button><button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button></div>
      {err && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <div className="mt-7 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="h-4 w-4 accent-[#1f35b8]" />Maine sabhi nirdesh padh kar samajh liye hain</label>
        {locked ? <Link href="/plans" className="btn-orange !py-3.5"><Lock className="h-4 w-4" />Premium se Unlock karein</Link>
          : <button disabled={!ok || busy || empty} onClick={go} className="btn-primary !py-3.5 !px-7 text-base">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{loggedIn ? "Test Shuru Karein" : "Login karke Shuru Karein"} <ArrowRight className="h-4 w-4" /></button>}
      </div>
    </>
  );
}
