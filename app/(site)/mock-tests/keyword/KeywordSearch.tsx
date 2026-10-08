"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListOrdered, Loader2, Search, Sparkles } from "lucide-react";

const POPULAR = ["RAM", "Shortcut", "Excel", "Email", "Virus", "Networking", "Full Form", "BODMAS", "MP GK"];
export default function KeywordSearch({ loggedIn, children, initial }: { loggedIn: boolean; children: React.ReactNode; initial?: string }) {
  const r = useRouter();
  const [kw, setKw] = useState(initial || "Excel function");
  const [n, setN] = useState(10);
  const [lang, setLang] = useState("hi");
  const [res, setRes] = useState<{ count: number; items: any[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    const t = setTimeout(async () => {
      if (kw.trim().length < 2) return setRes(null);
      const j = await fetch(`/api/questions/search?q=${encodeURIComponent(kw)}`).then((x) => x.json());
      setRes(j);
    }, 300);
    return () => clearTimeout(t);
  }, [kw]);
  const make = async () => {
    if (!loggedIn) return r.push("/login?next=/mock-tests/keyword");
    setBusy(true); setErr("");
    const x = await fetch("/api/test/keyword", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyword: kw, count: n, language: lang }) });
    const j = await x.json();
    if (!x.ok) { setErr(j.error || "Error"); setBusy(false); return; }
    r.push(`/test/attempt/${j.attemptId}`);
  };
  return (
    <>
      <div className="card p-5 md:p-7">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border-2 border-brand/70 px-4 focus-within:ring-4 focus-within:ring-brand/10">
            <Search className="h-5 w-5 text-muted" />
            <input value={kw} onChange={(e) => setKw(e.target.value)} className="w-full bg-transparent py-3.5 text-lg outline-none" placeholder="Keyword likhiye…" />
          </label>
          <select value={n} onChange={(e) => setN(+e.target.value)} className="input lg:w-44"><option value={10}>10 sawal</option><option value={20}>20 sawal</option><option value={30}>30 sawal</option></select>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="input lg:w-40"><option value="hi">हिंदी</option><option value="en">English</option></select>
          <button onClick={make} disabled={busy || !res?.count} className="btn-primary !px-7 !py-3.5 text-base">{busy && <Loader2 className="h-4 w-4 animate-spin" />}<Sparkles className="h-4 w-4" />Test Banayein</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">Popular: {POPULAR.map((p) => <button key={p} onClick={() => setKw(p)} className="chip bg-brand-50 text-brand hover:bg-brand-100">{p}</button>)}</div>
        {err && <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><ListOrdered className="h-5 w-5" />"{kw}" — {res?.count ?? 0} sawal mile</h3>
          {res?.items.map((i) => (
            <div key={i.id} className="border-b border-line py-3 last:border-0"><div className="hi text-[15.5px]">{i.text_hi.length > 120 ? i.text_hi.slice(0, 120) + "…" : i.text_hi}</div><div className="text-xs text-muted">{i.source || i.topic || "Practice set"}</div></div>
          ))}
          {!res?.count && <p className="text-sm text-muted">Koi aur keyword try karein.</p>}
        </div>
        {children}
      </div>
    </>
  );
}
