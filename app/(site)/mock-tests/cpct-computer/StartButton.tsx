"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, PenLine } from "lucide-react";

export default function StartButton({ testId, label, locked, loggedIn }: { testId: number; label: string; locked: boolean; loggedIn: boolean }) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  if (locked) return <Link href="/plans" className="flex w-full items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left text-[15px] font-semibold text-orange-800 hover:bg-orange-100"><Lock className="h-4 w-4 shrink-0" /><span className="flex-1">{label}</span><span className="text-xs">Premium</span></Link>;
  const go = async () => {
    if (!loggedIn) return r.push("/login?next=/mock-tests/cpct-computer");
    setBusy(true);
    const x = await fetch("/api/test/pyq-computer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testId }) });
    const j = await x.json().catch(() => ({}));
    if (x.status === 402) return r.push("/plans");
    if (!x.ok) { alert(j.error || "Error"); setBusy(false); return; }
    r.push(`/test/attempt/${j.attemptId}`);
  };
  return (
    <button onClick={go} disabled={busy} className="flex w-full items-center gap-2 rounded-xl border border-brand/25 bg-white px-4 py-3 text-left text-[15px] font-semibold text-brand transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand-50">
      {busy ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <PenLine className="h-4 w-4 shrink-0" />}<span className="flex-1">{label}</span>
    </button>
  );
}
