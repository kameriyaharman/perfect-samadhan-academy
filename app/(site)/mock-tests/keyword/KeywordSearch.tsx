"use client";
// Keyword / topic se test: keyword likho → us keyword ke Topic aur Paper/Shift (PYQ) checkbox ke saath, har ek me kitne sawal →
// jo chuno sirf unhi me se test bane (koi na chuna ho to sab me se).
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Filter, ListOrdered, Loader2, Search, Sparkles, X } from "lucide-react";

type Opt = { label: string; n: number };
type Res = { count: number; items: any[]; sources: Opt[]; topics: Opt[] };
const DEFAULT_POPULAR = ["Excel", "Word", "PowerPoint", "Network", "Printer", "Memory", "Windows", "Input", "Shortcut", "Email", "Virus", "Full Form"];

export default function KeywordSearch({ loggedIn, children, initial, topics = [], popular }: { loggedIn: boolean; children: React.ReactNode; initial?: string; topics?: string[]; popular?: string[] }) {
  const POPULAR = popular?.length ? popular : DEFAULT_POPULAR;
  const r = useRouter();
  const [kw, setKw] = useState(initial || "");
  const [n, setN] = useState(20);
  const [lang, setLang] = useState("hi");
  const [res, setRes] = useState<Res | null>(null);
  const [loading, setLoading] = useState(false);
  const [srcSel, setSrcSel] = useState<string[]>([]);
  const [topSel, setTopSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // keyword badla → filter reset
  useEffect(() => { setSrcSel([]); setTopSel([]); }, [kw]);

  useEffect(() => {
    if (kw.trim().length < 2) { setRes(null); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const p = new URLSearchParams({ q: kw.trim() });
      if (srcSel.length) p.set("src", srcSel.join("|"));
      if (topSel.length) p.set("topic", topSel.join("|"));
      try { setRes(await fetch(`/api/questions/search?${p}`).then((x) => x.json())); } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [kw, srcSel, topSel]);

  const total = res?.count ?? 0;
  const make = async () => {
    if (!loggedIn) return r.push(`/login?next=/mock-tests/keyword?q=${encodeURIComponent(kw)}`);
    setBusy(true); setErr("");
    const x = await fetch("/api/test/keyword", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyword: kw, count: n || total, language: lang, sources: srcSel, topics: topSel }) });
    const j = await x.json();
    if (!x.ok) { setErr(j.error || "Error"); setBusy(false); return; }
    r.push(`/test/attempt/${j.attemptId}`);
  };
  const qCount = Math.min(n || total, total, 100);

  return (
    <>
      <div className="card p-5 md:p-7">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border-2 border-brand/70 px-4 focus-within:ring-4 focus-within:ring-brand/10">
            <Search className="h-5 w-5 text-muted" />
            <input autoFocus value={kw} onChange={(e) => setKw(e.target.value)} className="w-full bg-transparent py-3.5 text-lg outline-none" placeholder="Topic ya keyword likhiye — jaise ms excel, printer, network…" />
            {kw && <button onClick={() => setKw("")} aria-label="Clear" className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>}
          </label>
          <select value={n} onChange={(e) => setN(+e.target.value)} className="input lg:w-44">
            {[10, 20, 30, 50].map((v) => <option key={v} value={v}>{v} sawal</option>)}<option value={0}>Sabhi sawal (max 100)</option>
          </select>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="input lg:w-40"><option value="hi">हिंदी</option><option value="en">English</option></select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">Popular: {POPULAR.map((p) => <button key={p} onClick={() => setKw(p)} className={`chip ${kw === p ? "bg-brand text-white" : "bg-brand-50 text-brand hover:bg-brand-100"}`}>{p}</button>)}</div>
        {kw.trim().length > 0 && kw.trim().length < 2 && <p className="mt-2 text-sm italic text-muted">Kam se kam 2 akshar type karein…</p>}
        {topics.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-navy"><BookOpen className="h-4 w-4 text-brand" />Topic list — topic chunein, usi par test banega</div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((t) => (
                <button key={t} onClick={() => { setKw(t); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`hi rounded-xl border px-3 py-2.5 text-left text-[14.5px] transition ${kw === t ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand hover:text-brand"}`}>{t}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {res && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="card flex flex-col p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-lg font-bold"><Filter className="h-5 w-5 text-brand" />Filter lagayein</h3>
              {(srcSel.length > 0 || topSel.length > 0) && <button onClick={() => { setSrcSel([]); setTopSel([]); }} className="text-sm font-semibold text-brand">Sab filter hatayein</button>}
            </div>
            <p className="mt-1 text-sm text-muted">Jo topic / paper chunenge, test sirf unhi ke "{kw}" wale sawalon se banega. Kuch na chunein to sabhi me se.</p>

            {res.topics.length > 1 && <CheckList title="Topic" opts={res.topics} sel={topSel} set={setTopSel} />}
            {res.sources.length > 0 && <CheckList title="Paper / Shift (PYQ)" opts={res.sources} sel={srcSel} set={setSrcSel} tall />}
            {!res.sources.length && !res.topics.length && <p className="mt-4 text-sm text-muted">Is keyword par koi sawal nahi mila — dusra keyword try karein.</p>}

            {err && <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}
            <div className="sticky bottom-3 mt-5 rounded-xl bg-white/90 backdrop-blur">
              <button onClick={make} disabled={busy || !total} className="btn-primary w-full !py-3.5 text-base">
                {busy || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {total ? `टेस्ट शुरू करें — ${qCount} sawal` : "टेस्ट शुरू करें"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><ListOrdered className="h-5 w-5" />"{kw}" — {total} sawal mile{(srcSel.length || topSel.length) ? " (filter ke saath)" : ""}</h3>
              {res.items.map((i) => (
                <div key={i.id} className="border-b border-line py-3 last:border-0"><div className="hi text-[15.5px]">{i.text_hi.length > 120 ? i.text_hi.slice(0, 120) + "…" : i.text_hi}</div><div className="text-xs text-muted">{i.topic ? `${i.topic} · ` : ""}{i.src}</div></div>
              ))}
              {!total && <p className="text-sm text-muted">Koi aur keyword try karein.</p>}
            </div>
            {children}
          </div>
        </div>
      )}
      {!res && <div className="mt-6">{children}</div>}
    </>
  );
}

function CheckList({ title, opts, sel, set, tall }: { title: string; opts: Opt[]; sel: string[]; set: (v: string[]) => void; tall?: boolean }) {
  const [f, setF] = useState("");
  const shown = useMemo(() => opts.filter((o) => !f || o.label.toLowerCase().includes(f.toLowerCase())), [opts, f]);
  const toggle = (l: string) => set(sel.includes(l) ? sel.filter((x) => x !== l) : [...sel, l]);
  return (
    <div className="mt-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold uppercase tracking-wider text-muted">{title}</span>
        <span className="chip bg-canvas text-muted">{opts.length}</span>
        <span className="ml-auto flex gap-3 text-xs font-semibold">
          <button onClick={() => set(Array.from(new Set([...sel, ...shown.map((o) => o.label)])))} className="text-brand">Sab chunein</button>
          {sel.length > 0 && <button onClick={() => set([])} className="text-muted hover:text-ink">Clear</button>}
        </span>
      </div>
      {opts.length > 8 && <input value={f} onChange={(e) => setF(e.target.value)} placeholder={`${title} me dhoondhein…`} className="input !py-2 mb-2 text-sm" />}
      <div className={`overflow-y-auto rounded-xl border border-line ${tall ? "max-h-[360px]" : "max-h-[220px]"}`}>
        {shown.map((o) => {
          const on = sel.includes(o.label);
          return (
            <label key={o.label} className={`flex cursor-pointer items-center gap-3 border-b border-line px-3 py-2 text-[14.5px] last:border-0 ${on ? "bg-brand-50/70" : "hover:bg-canvas"}`}>
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${on ? "border-brand bg-brand text-white" : "border-slate-400"}`}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
              <input type="checkbox" checked={on} onChange={() => toggle(o.label)} className="sr-only" />
              <span className="flex-1">{o.label}</span>
              <span className="hi shrink-0 text-xs text-muted">({o.n} प्रश्न)</span>
            </label>
          );
        })}
        {!shown.length && <div className="px-3 py-4 text-sm text-muted">Kuch nahi mila.</div>}
      </div>
    </div>
  );
}
