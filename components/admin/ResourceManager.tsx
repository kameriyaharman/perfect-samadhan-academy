"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Folder, FolderInput, FolderPlus, Lock, Unlock, ChevronLeft, ChevronRight, Download, Edit3, ExternalLink, FileSpreadsheet, FileText, FileUp, ListChecks, Loader2, Plus, Search, Trash2, X, Save } from "lucide-react";
import type { Field, Resource } from "@/lib/resources";
import { parseCSV, sampleCSV } from "@/lib/csv";
import WordImport from "./WordImport";
import PlanIncludes, { incSummary, type IncOpts } from "./PlanIncludes";

const PUBLIC: Record<string, (r: any) => string> = {
  exams: (r) => `/exams/${r.slug}`, materials: (r) => `/study-material/${r.slug}`, courses: (r) => `/courses/${r.slug}`, posts: (r) => `/blog/${r.slug}`,
  mock_tests: (r) => `/test/${r.id}`, typing_results: (r) => `/typing-test/result/${r.cert_id}`,
};

const isImg = (s: string) => /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(s);
function fmt(v: any, f: Field, o?: IncOpts | null) {
  if (f.type === "includes") return <span className="text-xs">{incSummary(v, o || null)}</span>;
  if (v === null || v === undefined || v === "") return <span className="text-slate-300">—</span>;
  if (f.type === "ref") { const fo = o?.folders.find((x) => x.id === Number(v)); return fo ? <span className="hi inline-flex items-center gap-1"><Folder className="h-3.5 w-3.5 text-brand" />{fo.name}</span> : `#${v}`; }
  if (f.type === "bool") return v ? <span className="chip bg-green-50 text-green-700">Yes</span> : <span className="chip bg-slate-100 text-slate-500">No</span>;
  if (f.type === "datetime" || f.type === "date") { const d = new Date(v); return isNaN(+d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  const s = String(v);
  if (f.type === "file" && isImg(s)) return <img src={s} alt="" className="h-10 max-w-[140px] rounded border border-line object-contain bg-canvas" />;
  return s.length > 70 ? s.slice(0, 70) + "…" : s;
}

export default function ResourceManager({ resource: r, initialFilter }: { resource: Resource; initialFilter: Record<string, string> }) {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    for (const x of r.filters || []) if (initialFilter[x.name]) f[x.name] = initialFilter[x.name];
    if (initialFilter.test_id) f.test_id = initialFilter.test_id;
    if (initialFilter.folder_id) f.folder_id = initialFilter.folder_id;
    return f;
  });
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [importing, setImporting] = useState(false);
  const [wordImp, setWordImp] = useState(false);
  const canWord = r.key === "questions" || r.key === "mock_tests";
  const canImport = !r.noCreate && !r.readonly;
  const per = 25;
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [allMatch, setAllMatch] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const hasFree = r.fields.some((f) => f.name === "is_free");
  const listFields = r.fields.filter((f) => f.list);
  const needOpts = r.key === "lessons" || r.fields.some((f) => f.type === "ref" || f.type === "includes" || f.type === "series");
  const [opts, setOpts] = useState<IncOpts | null>(null);
  const loadOpts = useCallback(() => { if (needOpts) fetch("/api/admin/options").then((x) => x.json()).then((j) => j.folders && setOpts(j)).catch(() => {}); }, [needOpts]);
  useEffect(loadOpts, [loadOpts]);
  const [moveTo, setMoveTo] = useState("");
  const isLessons = r.key === "lessons";

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), per: String(per), q: search, ...filters });
    const j = await fetch(`/api/admin/${r.key}?${p}`).then((x) => x.json());
    setRows(j.rows || []); setTotal(j.total || 0); setLoading(false);
  }, [page, search, filters, r.key]);
  // filter / search badla to selection saaf
  useEffect(() => { setSel(new Set()); setAllMatch(false); }, [search, filters, r.key]);
  const pageIds = rows.map((x) => x.id as number);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => sel.has(id));
  const togglePage = () => { const n = new Set(sel); if (allOnPage) pageIds.forEach((id) => n.delete(id)); else pageIds.forEach((id) => n.add(id)); setSel(n); setAllMatch(false); };
  const toggleOne = (id: number) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); setAllMatch(false); };
  const selCount = allMatch ? total : sel.size;
  const bulk = async (action: "delete" | "lock" | "unlock" | "move") => {
    if (!selCount) return;
    const fName = action === "move" ? (moveTo === "none" ? "bina folder" : opts?.folders.find((x) => String(x.id) === moveTo)?.name || "") : "";
    if (action === "move" && !moveTo) return alert("Pehle folder chunein");
    const what = action === "move" ? `"${fName}" folder me move` : action === "delete" ? "DELETE" : action === "lock" ? "🔒 Premium (lock)" : "Free (unlock)";
    if (!confirm(`${selCount} records ${what} karne hain?${action === "delete" ? " Yeh wapas nahi aayenge." + (r.key === "mock_tests" ? " In tests ke saare sawal bhi delete ho jayenge." : "") : ""}`)) return;
    setBulkBusy(true);
    const extra = action === "move" ? { folder_id: moveTo === "none" ? null : Number(moveTo) } : {};
    const body = allMatch ? { action, all: true, filter: { q: search, ...filters }, ...extra } : { action, ids: Array.from(sel), ...extra };
    const x = await fetch(`/api/admin/${r.key}/bulk`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await x.json().catch(() => ({}));
    setBulkBusy(false);
    if (!x.ok) return alert(j.error || "Error");
    setSel(new Set()); setAllMatch(false); loadOpts();
    if (action === "delete" && page > 1 && rows.length <= (allMatch ? rows.length : sel.size)) setPage(1); else load();
  };
  const quickFree = async (row: any) => {
    await fetch(`/api/admin/${r.key}/bulk`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: row.is_free ? "lock" : "unlock", ids: [row.id] }) });
    load();
  };
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  const openNew = () => {
    const d: Record<string, any> = {};
    for (const f of r.fields) if (f.type === "bool") d[f.name] = ["active", "show_on_home", "published", "is_free", "new_tab"].includes(f.name);
    if (filters.test_id && r.key === "questions") d.test_id = filters.test_id;
    if (r.key === "questions") { d.answer = "A"; d.section = "Computer"; }
    if (isLessons && filters.folder_id && filters.folder_id !== "none") d.folder_id = Number(filters.folder_id);
    setErr(""); setEdit(d);
  };
  useEffect(() => { if (initialFilter.new === "1" && !r.noCreate) openNew(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const openEdit = async (id: number) => { setErr(""); const j = await fetch(`/api/admin/${r.key}/${id}`).then((x) => x.json()); setEdit(j); };
  const save = async () => {
    if (!edit) return;
    setSaving(true); setErr("");
    const isNew = !edit.id;
    const x = await fetch(isNew ? `/api/admin/${r.key}` : `/api/admin/${r.key}/${edit.id}`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    const j = await x.json(); setSaving(false);
    if (!x.ok) return setErr(j.error || "Error");
    setEdit(null); load(); loadOpts();
  };
  const del = async (id: number) => {
    if (!confirm("Pakka delete karna hai? Yeh wapas nahi aayega.")) return;
    const x = await fetch(`/api/admin/${r.key}/${id}`, { method: "DELETE" });
    if (!x.ok) alert((await x.json()).error); else load();
  };
  const pages = Math.max(1, Math.ceil(total / per));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy">{r.label}</h1>
          <p className="text-sm text-muted">{total} records{filters.test_id ? ` · Test #${filters.test_id}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canImport && <button onClick={() => downloadSample(r)} className="btn-ghost" title="Is section ka sample CSV (Excel me khulega)"><Download className="h-4 w-4" />Sample CSV</button>}
          {canImport && <button onClick={() => setImporting(true)} className="btn-soft"><FileUp className="h-4 w-4" />Import CSV</button>}
          {canWord && <button onClick={() => setWordImp(true)} className="btn-orange"><FileText className="h-4 w-4" />Upload Word (.docx)</button>}
          {!r.noCreate && <button onClick={openNew} className="btn-primary"><Plus className="h-4 w-4" />Add New</button>}
        </div>
      </div>
      {isLessons && opts && <FolderBar opts={opts} cur={filters.folder_id || ""} onPick={(v) => { const f = { ...filters }; if (v) f.folder_id = v; else delete f.folder_id; setFilters(f); setPage(1); }} />}
      <div className="mt-5 flex flex-wrap gap-2">
        {r.search && <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3"><Search className="h-4 w-4 text-muted" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search…" className="w-full bg-transparent py-2.5 outline-none" /></label>}
        {(r.filters || []).map((f) => (
          <select key={f.name} value={filters[f.name] || ""} onChange={(e) => { setFilters({ ...filters, [f.name]: e.target.value }); setPage(1); }} className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm">
            <option value="">All {f.name}</option>{f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
        {filters.test_id && <button onClick={() => { const f = { ...filters }; delete f.test_id; setFilters(f); }} className="chip bg-brand-50 text-brand py-2">Test #{filters.test_id} <X className="h-3 w-3" /></button>}
      </div>
      {selCount > 0 && (
        <div className="sticky top-2 z-20 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand/30 bg-brand-50 px-4 py-2.5 shadow-sm">
          <b className="text-sm text-navy">{selCount} selected</b>
          {!allMatch && allOnPage && total > rows.length && <button onClick={() => setAllMatch(true)} className="text-sm font-semibold text-brand underline">Is list ke sabhi {total} chunein</button>}
          {allMatch && <span className="text-xs text-muted">(is search/filter ke sabhi records)</span>}
          <button onClick={() => { setSel(new Set()); setAllMatch(false); }} className="text-sm text-muted hover:text-ink">Clear</button>
          <span className="ml-auto flex flex-wrap gap-2">
            {isLessons && opts && <span className="flex items-center gap-1.5"><select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="hi rounded-lg border border-line bg-white px-2 py-1.5 text-sm"><option value="">Folder chunein…</option>{opts.folders.map((f) => <option key={f.id} value={f.id}>{f.layout === "english" ? "EN" : "HI"} · {f.name}</option>)}<option value="none">— Bina folder —</option></select><button disabled={bulkBusy} onClick={() => bulk("move")} className="btn-soft btn-sm"><FolderInput className="h-3.5 w-3.5" />Move</button></span>}
            {hasFree && <button disabled={bulkBusy} onClick={() => bulk("lock")} className="btn-soft btn-sm"><Lock className="h-3.5 w-3.5" />Lock (Premium)</button>}
            {hasFree && <button disabled={bulkBusy} onClick={() => bulk("unlock")} className="btn-ghost btn-sm"><Unlock className="h-3.5 w-3.5" />Unlock (Free)</button>}
            <button disabled={bulkBusy} onClick={() => bulk("delete")} className="btn-sm inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700">{bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}Delete selected</button>
          </span>
        </div>
      )}
      <div className="card mt-4 overflow-x-auto">
        <table className="table-x min-w-[700px]">
          <thead><tr><th className="w-10"><input type="checkbox" aria-label="Is page ke sab chunein" checked={allOnPage} onChange={togglePage} className="h-4 w-4 cursor-pointer accent-[#1f35b8]" /></th><th className="w-14">ID</th>{listFields.map((f) => <th key={f.name}>{f.label.split("(")[0].split("—")[0]}</th>)}<th className="w-40 text-right">Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={listFields.length + 3} className="py-10 text-center text-muted"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              : !rows.length ? <tr><td colSpan={listFields.length + 3} className="py-10 text-center text-muted">Kuch nahi mila</td></tr>
              : rows.map((row) => (
                <tr key={row.id} className={sel.has(row.id) || allMatch ? "bg-brand-50/50" : ""}>
                  <td><input type="checkbox" aria-label={`Select ${row.id}`} checked={allMatch || sel.has(row.id)} onChange={() => toggleOne(row.id)} className="h-4 w-4 cursor-pointer accent-[#1f35b8]" /></td>
                  <td className="text-muted">{row.id}</td>
                  {listFields.map((f) => <td key={f.name} className={f.name.endsWith("_hi") || f.name === "hindi" ? "hi" : ""}>{f.name === "is_free" && isLessons && row.is_free && opts?.folders.find((x) => x.id === row.folder_id)?.is_free === false
                    ? <span title="Poora folder Premium hai (Typing Lesson Folders me badlein)" className="chip bg-orange-50 text-orange-700"><Lock className="h-3 w-3" />Folder locked</span>
                    : f.name === "is_free"
                    ? <button onClick={() => quickFree(row)} title="Click karke Free / Premium badlein" className={`chip cursor-pointer ${row.is_free ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>{row.is_free ? <><Unlock className="h-3 w-3" />Free</> : <><Lock className="h-3 w-3" />Premium</>}</button>
                    : fmt(row[f.name], f, opts)}</td>)}
                  <td className="whitespace-nowrap text-right">
                    {r.key === "mock_tests" && <Link href={`/admin/r/questions?test_id=${row.id}`} title="Questions" className="mr-1 inline-grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand"><ListChecks className="h-4 w-4" /></Link>}
                    {PUBLIC[r.key] && <a href={PUBLIC[r.key](row)} target="_blank" title="View" className="mr-1 inline-grid h-8 w-8 place-items-center rounded-lg bg-canvas"><ExternalLink className="h-4 w-4" /></a>}
                    {!r.readonly && <button onClick={() => openEdit(row.id)} title="Edit" className="mr-1 inline-grid h-8 w-8 place-items-center rounded-lg bg-canvas hover:bg-brand-50 hover:text-brand"><Edit3 className="h-4 w-4" /></button>}
                    <button onClick={() => del(row.id)} title="Delete" className="inline-grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <span className="text-muted">Page {page} / {pages}</span>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost btn-sm"><ChevronLeft className="h-4 w-4" /></button>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="btn-ghost btn-sm"><ChevronRight className="h-4 w-4" /></button>
      </div>

      {wordImp && <WordImport testId={filters.test_id || ""} defaultNew={r.key === "mock_tests"} onClose={() => setWordImp(false)} onDone={load} />}
      {importing && <ImportModal r={r} testId={filters.test_id || ""} onClose={() => setImporting(false)} onDone={load} />}

      {edit && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setEdit(null)} />
          <div className="relative flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl reveal">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-xl font-bold">{edit.id ? `Edit #${edit.id}` : "Add New"} — {r.label}</h2>
              <button onClick={() => setEdit(null)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-canvas"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {r.fields.filter((f) => f.type !== "datetime" || edit.id).map((f) => (
                  <div key={f.name} className={f.full || f.type === "textarea" || f.type === "html" || f.type === "file" ? "sm:col-span-2" : ""}>
                    <label className="label">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
                    <FieldInput f={f} value={edit[f.name]} opts={opts} onChange={(v) => setEdit({ ...edit, [f.name]: v })} />
                    {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
              <span className="text-sm text-red-600">{err}</span>
              <div className="flex gap-2"><button onClick={() => setEdit(null)} className="btn-ghost"><X className="h-4 w-4" />Cancel</button><button onClick={save} disabled={saving} className="btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}<Save className="h-4 w-4" />Save</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FolderBar({ opts, cur, onPick }: { opts: IncOpts; cur: string; onPick: (v: string) => void }) {
  const groups: [string, IncOpts["folders"]][] = [["हिंदी Typing", opts.folders.filter((f) => f.layout !== "english")], ["English Typing", opts.folders.filter((f) => f.layout === "english")]];
  const chip = (on: boolean) => `hi inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`;
  return (
    <div className="card mt-5 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <b className="flex items-center gap-2 text-navy"><Folder className="h-4 w-4" />Folders</b>
        <span className="flex gap-2">
          <Link href="/admin/r/lesson_folders" className="btn-ghost btn-sm"><Edit3 className="h-3.5 w-3.5" />Folders edit / lock</Link>
          <Link href="/admin/r/lesson_folders?new=1" className="btn-soft btn-sm"><FolderPlus className="h-3.5 w-3.5" />Naya folder</Link>
        </span>
      </div>
      <button onClick={() => onPick("")} className={chip(!cur)}>Sabhi lessons</button>
      {groups.map(([t, list]) => (
        <div key={t} className="mt-3">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t}</div>
          <div className="flex flex-wrap gap-2">
            {!list.length && <span className="text-xs text-muted">Koi folder nahi</span>}
            {list.map((f) => <button key={f.id} onClick={() => onPick(String(f.id))} className={chip(cur === String(f.id))}><Folder className="h-4 w-4" />{f.name}<span className="opacity-70">({f.n})</span>{!f.is_free && <Lock className="h-3.5 w-3.5 text-saffron" />}</button>)}
          </div>
        </div>
      ))}
      <button onClick={() => onPick("none")} className={`${chip(cur === "none")} mt-3`}>Bina folder wale</button>
    </div>
  );
}

function FieldInput({ f, value, onChange, opts }: { f: Field; value: any; onChange: (v: any) => void; opts?: IncOpts | null }) {
  const [up, setUp] = useState(false);
  if (f.type === "includes") return <PlanIncludes value={value} onChange={onChange} opts={opts || null} />;
  if (f.type === "ref") return (
    <select className="input hi" value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">— Bina folder —</option>
      {(opts?.folders || []).map((x) => <option key={x.id} value={x.id}>{x.layout === "english" ? "English" : "हिंदी"} · {x.name}{x.is_free ? "" : " 🔒"}</option>)}
    </select>
  );
  if (f.type === "series") return (
    <>
      <input className="input" list={`dl-${f.name}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Khaali = koi series nahi" />
      <datalist id={`dl-${f.name}`}>{(opts?.series || []).map((x) => <option key={x.name} value={x.name} />)}</datalist>
    </>
  );
  const hi = f.name.endsWith("_hi") || f.name === "hindi" || f.name === "text";
  if (f.type === "datetime") return <input className="input bg-canvas" disabled value={value ? new Date(value).toLocaleString("en-IN") : ""} />;
  if (f.type === "bool") return (
    <button type="button" onClick={() => onChange(!value)} className={`relative h-7 w-12 rounded-full transition ${value ? "bg-brand" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${value ? "left-6" : "left-1"}`} /></button>
  );
  if (f.type === "select") return <select className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}><option value="">—</option>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>;
  if (f.type === "textarea" || f.type === "html") return <textarea className={`input font-${f.type === "html" ? "mono text-sm" : "sans"} ${hi ? "hi" : ""}`} rows={f.rows || 4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "number") return <input className="input" type="number" step="any" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "date") return <input className="input" type="date" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "password") return <input className="input" type="password" value={value ?? ""} onChange={(e) => onChange(e.target.value)} autoComplete="new-password" />;
  if (f.type === "file") {
    const upload = async (file: File) => {
      setUp(true);
      const fd = new FormData(); fd.append("file", file);
      const x = await fetch("/api/admin/upload", { method: "POST", body: fd }); const j = await x.json(); setUp(false);
      if (x.ok) onChange(j.url); else alert(j.error);
    };
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="URL ya file upload karein" />
        <label className="btn-soft shrink-0 cursor-pointer !py-3">{up ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}Upload<input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
        {value && <a href={value} target="_blank" className="btn-ghost shrink-0 !py-3"><ExternalLink className="h-4 w-4" />Open</a>}
        {value && isImg(String(value)) && <img src={value} alt="" className="h-12 max-w-[180px] shrink-0 rounded-lg border border-line bg-canvas object-contain" />}
      </div>
    );
  }
  return <input className={`input ${hi ? "hi" : ""}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function downloadSample(r: Resource) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([sampleCSV(r)], { type: "text/csv;charset=utf-8" }));
  a.download = `${r.key}-sample.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function ImportModal({ r, testId: tid, onClose, onDone }: { r: Resource; testId: string; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<{ name: string; text: string; rows: number } | null>(null);
  const [testId, setTestId] = useState(tid);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [res, setRes] = useState<any>(null);
  const pick = async (f?: File) => {
    if (!f) return;
    const text = await f.text();
    setRes(null); setFile({ name: f.name, text, rows: Math.max(0, parseCSV(text).length - 1) });
  };
  const run = async () => {
    if (!file) return;
    setBusy(true); setRes(null);
    const x = await fetch(`/api/admin/${r.key}/import`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csv: file.text, testId }) });
    const j = await x.json().catch(() => ({ error: "Server error" }));
    setBusy(false); setRes(j);
    if (x.ok && (j.created || j.updated)) onDone();
  };
  const required = r.fields.filter((f) => f.required).map((f) => f.name);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-navy/40" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl reveal">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Import CSV — {r.label}</h2>
          <button onClick={onClose} disabled={busy} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-canvas"><X className="h-5 w-5" /></button>
        </div>

        <ol className="mt-4 space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">1</span>
            <div className="flex-1">
              <p>Sample CSV download karein, Excel me data bharein aur <b>"CSV UTF-8"</b> me save karein.</p>
              <button onClick={() => downloadSample(r)} className="btn-ghost btn-sm mt-2"><Download className="h-4 w-4" />{r.key}-sample.csv</button>
              {required.length > 0 && <p className="mt-2 text-xs text-muted">Zaroori columns: <b>{required.join(", ")}</b>. Baaki khali chhod sakte hain.</p>}
            </div>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">2</span>
            <div className="flex-1">
              <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${drag ? "border-brand bg-brand-50" : "border-line hover:border-brand"}`}>
                <FileSpreadsheet className="h-7 w-7 text-brand" />
                {file ? <><b className="break-all">{file.name}</b><span className="text-xs text-muted">{file.rows} rows mili · badalne ke liye click karein</span></>
                  : <><b>CSV file yahan chhodein ya click karein</b><span className="text-xs text-muted">.csv file</span></>}
                <input type="file" accept=".csv,.tsv,.txt,text/csv" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {r.key === "questions" && (
                <div className="mt-3"><label className="label">Mock Test ID (optional — sab questions isi test me judenge)</label>
                  <input value={testId} onChange={(e) => setTestId(e.target.value)} placeholder="e.g. 12" className="input" inputMode="numeric" /></div>
              )}
            </div>
          </li>
        </ol>

        {res && (
          <div className={`mt-4 rounded-xl p-3 text-sm ${res.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>
            {res.error ? res.error : <>
              <p className="flex items-center gap-1.5 font-semibold"><CheckCircle2 className="h-4 w-4" />{res.created} naye record jude{res.updated ? ` · ${res.updated} update hue` : ""}{res.skipped ? ` · ${res.skipped} rows skip` : ""}</p>
              {res.unknown?.length > 0 && <p className="mt-1 text-xs text-amber-700">Yeh columns pehchane nahi gaye (ignore kiye): {res.unknown.join(", ")}</p>}
              {res.errors?.length > 0 && <ul className="mt-2 max-h-40 list-disc overflow-y-auto pl-5 text-xs text-red-600">{res.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>}
            </>}
          </div>
        )}

        <p className="mt-4 text-xs text-muted">Tip: CSV me <b>id</b> column bharne par wo record update hoga; khali chhodne par naya record banega. Yes/No columns me yes ya no likhein.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} disabled={busy} className="btn-ghost">{res && !res.error ? "Done" : "Cancel"}</button>
          <button onClick={run} disabled={busy || !file || !file.rows} className="btn-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}Import {file?.rows ? `${file.rows} rows` : ""}</button>
        </div>
      </div>
    </div>
  );
}
