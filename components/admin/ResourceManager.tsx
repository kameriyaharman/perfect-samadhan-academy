"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Edit3, ExternalLink, FileUp, ListChecks, Loader2, Plus, Search, Trash2, X, Save } from "lucide-react";
import type { Field, Resource } from "@/lib/resources";

const PUBLIC: Record<string, (r: any) => string> = {
  exams: (r) => `/exams/${r.slug}`, materials: (r) => `/study-material/${r.slug}`, courses: (r) => `/courses/${r.slug}`, posts: (r) => `/blog/${r.slug}`,
  mock_tests: (r) => `/test/${r.id}`, typing_results: (r) => `/typing-test/result/${r.cert_id}`,
};

function fmt(v: any, f: Field) {
  if (v === null || v === undefined || v === "") return <span className="text-slate-300">—</span>;
  if (f.type === "bool") return v ? <span className="chip bg-green-50 text-green-700">Yes</span> : <span className="chip bg-slate-100 text-slate-500">No</span>;
  if (f.type === "datetime" || f.type === "date") { const d = new Date(v); return isNaN(+d) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  const s = String(v);
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
    return f;
  });
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const per = 25;
  const listFields = r.fields.filter((f) => f.list);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), per: String(per), q: search, ...filters });
    const j = await fetch(`/api/admin/${r.key}?${p}`).then((x) => x.json());
    setRows(j.rows || []); setTotal(j.total || 0); setLoading(false);
  }, [page, search, filters, r.key]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  const openNew = () => {
    const d: Record<string, any> = {};
    for (const f of r.fields) if (f.type === "bool") d[f.name] = ["active", "show_on_home", "published", "is_free"].includes(f.name);
    if (filters.test_id && r.key === "questions") d.test_id = filters.test_id;
    if (r.key === "questions") { d.answer = "A"; d.section = "Computer"; }
    setErr(""); setEdit(d);
  };
  const openEdit = async (id: number) => { setErr(""); const j = await fetch(`/api/admin/${r.key}/${id}`).then((x) => x.json()); setEdit(j); };
  const save = async () => {
    if (!edit) return;
    setSaving(true); setErr("");
    const isNew = !edit.id;
    const x = await fetch(isNew ? `/api/admin/${r.key}` : `/api/admin/${r.key}/${edit.id}`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    const j = await x.json(); setSaving(false);
    if (!x.ok) return setErr(j.error || "Error");
    setEdit(null); load();
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
        <div className="flex gap-2">
          {r.key === "questions" && <Link href={`/admin/import?type=questions${filters.test_id ? `&testId=${filters.test_id}` : ""}`} className="btn-ghost"><FileUp className="h-4 w-4" />CSV Import</Link>}
          {r.key === "passages" && <Link href="/admin/import?type=passages" className="btn-ghost"><FileUp className="h-4 w-4" />CSV Import</Link>}
          {!r.noCreate && <button onClick={openNew} className="btn-primary"><Plus className="h-4 w-4" />Add New</button>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {r.search && <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3"><Search className="h-4 w-4 text-muted" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search…" className="w-full bg-transparent py-2.5 outline-none" /></label>}
        {(r.filters || []).map((f) => (
          <select key={f.name} value={filters[f.name] || ""} onChange={(e) => { setFilters({ ...filters, [f.name]: e.target.value }); setPage(1); }} className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm">
            <option value="">All {f.name}</option>{f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
        {filters.test_id && <button onClick={() => { const f = { ...filters }; delete f.test_id; setFilters(f); }} className="chip bg-brand-50 text-brand py-2">Test #{filters.test_id} <X className="h-3 w-3" /></button>}
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="table-x min-w-[700px]">
          <thead><tr><th className="w-14">ID</th>{listFields.map((f) => <th key={f.name}>{f.label.split("(")[0].split("—")[0]}</th>)}<th className="w-40 text-right">Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={listFields.length + 2} className="py-10 text-center text-muted"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              : !rows.length ? <tr><td colSpan={listFields.length + 2} className="py-10 text-center text-muted">Kuch nahi mila</td></tr>
              : rows.map((row) => (
                <tr key={row.id}>
                  <td className="text-muted">{row.id}</td>
                  {listFields.map((f) => <td key={f.name} className={f.name.endsWith("_hi") || f.name === "hindi" ? "hi" : ""}>{fmt(row[f.name], f)}</td>)}
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
                    <FieldInput f={f} value={edit[f.name]} onChange={(v) => setEdit({ ...edit, [f.name]: v })} />
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

function FieldInput({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }) {
  const [up, setUp] = useState(false);
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
      </div>
    );
  }
  return <input className={`input ${hi ? "hi" : ""}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}
