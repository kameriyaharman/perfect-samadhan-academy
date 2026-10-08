import Link from "next/link";
import { Check, Download, Eye, Filter, Lock, PlayCircle, Search, Star } from "lucide-react";
import { q } from "@/lib/db";
import { kfmt } from "@/lib/utils";
import { Container, Empty } from "@/components/Section";
import Cover from "@/components/Cover";
import SaveButton from "@/components/SaveButton";

export const metadata = { title: "Study Material — Notes PDF" };
const TYPES: [string, string][] = [["notes", "Notes PDF"], ["pyq", "Previous Papers"], ["shortcut", "Shortcut Keys"], ["syllabus", "Syllabus"]];
const EXAMS = ["CPCT", "SSC", "Patwari", "Police", "Court", "Railway"];
const SUBJECTS = ["Computer", "Maths", "Reasoning", "GK / GS", "Hindi / English"];
const LANG: [string, string][] = [["", "All"], ["hindi", "हिंदी"], ["english", "Eng"]];

export default async function StudyMaterial({ searchParams: sp }: { searchParams: Record<string, string | undefined> }) {
  const types = (sp.type || "").split(",").filter(Boolean);
  const subj = (sp.subject || "").split(",").filter(Boolean);
  const where: string[] = ["active"]; const args: any[] = [];
  const add = (sql: string, v: any) => { args.push(v); where.push(sql.replace("?", `$${args.length}`)); };
  if (sp.q) { args.push(`%${sp.q}%`); const n = args.length; where.push(`(title ILIKE $${n} OR description ILIKE $${n} OR contents ILIKE $${n})`); }
  if (types.length) add("type = ANY(?)", types);
  if (sp.exam) add("exam ILIKE ?", `%${sp.exam}%`);
  if (subj.length) add("subject = ANY(?)", subj);
  if (sp.lang) add("(language = ? OR language='bilingual')", sp.lang);
  const order = sp.sort === "new" ? "updated_at DESC" : "downloads DESC";
  const rows = await q(`SELECT * FROM materials WHERE ${where.join(" AND ")} ORDER BY popular DESC, ${order} LIMIT 60`, args);
  const counts = await q(`SELECT type, count(*)::int n FROM materials WHERE active GROUP BY type`);
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(); const m = { ...sp, ...patch };
    for (const [k, v] of Object.entries(m)) if (v) p.set(k, v);
    return `/study-material?${p.toString()}`;
  };
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]).join(",");
  const langLabel: Record<string, string> = { hindi: "हिंदी", english: "English", bilingual: "Bilingual" };
  const typeLabel: Record<string, string> = { notes: "Notes", pyq: "PYQ", shortcut: "Shortcut", syllabus: "Syllabus" };
  return (
    <>
      <section className="hero-bg text-white" data-dark>
        <Container className="py-10 md:py-14">
          <h1 className="hi text-4xl md:text-5xl font-bold">अध्ययन सामग्री</h1>
          <p className="mt-2 text-white/85">{counts.reduce((a: number, c: any) => a + c.n, 0)}+ PDFs · Hindi & English · Free download</p>
          <form action="/study-material" className="mt-6 flex max-w-3xl items-center gap-2 rounded-2xl bg-white p-2 shadow-lift">
            <Search className="ml-3 h-5 w-5 text-muted" />
            <input name="q" defaultValue={sp.q} placeholder='PDF ya topic search karein — jaise "Excel shortcut", "CPCT 2024 paper"' className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-ink outline-none" />
            <button className="btn-orange"><Search className="h-4 w-4" />Search</button>
          </form>
        </Container>
      </section>
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="card self-start p-5">
            <div className="mb-3 flex items-center gap-2 text-lg font-bold"><Filter className="h-5 w-5" />Filter</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Type</div>
            <div className="mt-2 space-y-2">{TYPES.map(([k, l]) => <Link key={k} href={link({ type: toggle(types, k) })} className="flex items-center gap-2 text-[15px]"><span className={`grid h-4 w-4 place-items-center rounded border ${types.includes(k) ? "border-brand bg-brand text-white" : "border-slate-400"}`}>{types.includes(k) && <Check className="h-3 w-3" strokeWidth={3} />}</span>{l} <span className="text-muted">({counts.find((c: any) => c.type === k)?.n || 0})</span></Link>)}</div>
            <div className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">Exam</div>
            <div className="mt-2 flex flex-wrap gap-2">{EXAMS.map((e) => <Link key={e} href={link({ exam: sp.exam === e ? undefined : e })} className={`chip py-1.5 ${sp.exam === e ? "bg-brand text-white" : "bg-brand-50 text-brand"}`}>{e}</Link>)}</div>
            <div className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">Subject</div>
            <div className="mt-2 space-y-2">{SUBJECTS.map((s) => <Link key={s} href={link({ subject: toggle(subj, s) })} className="flex items-center gap-2 text-[15px]"><span className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${subj.includes(s) ? "border-brand bg-brand text-white" : "border-slate-400"}`}>{subj.includes(s) && <Check className="h-3 w-3" strokeWidth={3} />}</span>{s}</Link>)}</div>
            <div className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">Language</div>
            <div className="seg mt-2">{LANG.map(([k, l]) => <Link key={k} href={link({ lang: k || undefined })} className={(sp.lang || "") === k ? "on" : ""}>{l}</Link>)}</div>
            {Object.values(sp).some(Boolean) && <Link href="/study-material" className="mt-4 block text-center text-sm text-brand underline">Sab filters hatayein</Link>}
          </aside>
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold">{[sp.exam, subj.join(", ")].filter(Boolean).join(" · ") || "Sabhi material"} — {rows.length} results</h2>
              <div className="flex gap-2 text-sm"><Link href={link({ sort: undefined })} className={!sp.sort ? "font-bold text-brand" : "text-muted"}>Most downloaded</Link>·<Link href={link({ sort: "new" })} className={sp.sort === "new" ? "font-bold text-brand" : "text-muted"}>Latest</Link></div>
            </div>
            {!rows.length ? <Empty text="Is filter me kuch nahi mila." /> : (
              <div className="grid gap-4 md:grid-cols-2">
                {rows.map((m: any) => (
                  <div key={m.id} className="card flex gap-4 p-4 md:p-5 transition hover:shadow-lift">
                    <Cover text={m.cover_text} color={m.color} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="chip bg-brand-50 text-brand">{typeLabel[m.type]} · {langLabel[m.language] || m.language}</span>
                        {m.is_premium ? <span className="chip bg-orange-50 text-orange-600">Premium</span> : m.popular ? <span className="chip bg-orange-50 text-orange-600"><Star className="h-3 w-3 fill-current" />Popular</span> : m.type === "pyq" ? <span className="chip bg-green-50 text-green-700">With Answers</span> : null}
                      </div>
                      <Link href={`/study-material/${m.slug}`} className="mt-2 block font-bold leading-snug hover:text-brand">{m.title}</Link>
                      <div className="mt-1 text-xs text-muted">{m.pages ? `${m.pages} pages · ` : ""}{m.size_mb ? `${m.size_mb} MB · ` : ""}<Download className="inline h-3 w-3" /> {kfmt(m.downloads)}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.is_premium ? <Link href={`/checkout?item=material:${m.slug}`} className="btn-orange btn-sm !py-1.5"><Lock className="h-3.5 w-3.5" />Unlock ₹{m.price || 99}</Link> : <a href={`/api/download/material/${m.slug}`} className="btn-primary btn-sm"><Download className="h-3.5 w-3.5" />Download</a>}
                        {m.type === "pyq" && !m.is_premium ? <Link href="/mock-tests/pyq" className="btn-soft btn-sm"><PlayCircle className="h-3.5 w-3.5" />Online Test</Link> : <Link href={`/study-material/${m.slug}`} className="btn-soft btn-sm"><Eye className="h-3.5 w-3.5" />{m.is_premium ? "Sample" : "Preview"}</Link>}
                        {!m.is_premium && m.type !== "pyq" && <SaveButton kind="material" id={m.id} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
