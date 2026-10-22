"use client";
// Premium Plan form: is plan me kaun-si locked series unlock hongi
import { BookOpen, ClipboardCheck, FileText, Keyboard, Lock, Search } from "lucide-react";

export type IncOpts = {
  folders: { id: number; name: string; layout: string; is_free: boolean; n: number; locked: number }[];
  series: { name: string; n: number; locked: number }[];
  exams: { slug: string; name: string; n: number; locked: number }[];
  cats: { name: string; n: number; locked: number }[];
};
type Inc = { all?: boolean; folders?: number[]; series?: string[]; typing?: string[]; passages?: boolean; keywords?: boolean; materials?: boolean };

export function parseInc(v: any): Inc {
  if (!v) return { all: true };
  try { const j = typeof v === "string" ? JSON.parse(v) : v; return j && typeof j === "object" ? j : { all: true }; } catch { return { all: true }; }
}
export function incSummary(v: any, o: IncOpts | null) {
  const i = parseInc(v);
  if (i.all !== false) return "Sab premium content";
  const parts: string[] = [];
  if (i.folders?.length) parts.push(`${i.folders.length} lesson folder`);
  const s = i.series?.length || 0; if (s) parts.push(`${s} test series`);
  if (i.typing?.length) parts.push(`${i.typing.length} typing exam`);
  if (i.passages) parts.push("passages"); if (i.keywords) parts.push("keyword MCQ"); if (i.materials) parts.push("PDFs");
  return parts.join(" · ") || "Kuch nahi chuna";
}

const LAYOUT: Record<string, string> = { remington: "हिंदी Remington", inscript: "हिंदी Inscript", english: "English" };

export default function PlanIncludes({ value, onChange, opts }: { value: any; onChange: (v: string) => void; opts: IncOpts | null }) {
  const inc = parseInc(value);
  const all = inc.all !== false;
  const set = (p: Partial<Inc>) => onChange(JSON.stringify({ ...inc, all: false, ...p }));
  const toggle = <T,>(arr: T[] | undefined, x: T) => { const a = new Set(arr || []); a.has(x) ? a.delete(x) : a.add(x); return Array.from(a); };
  const Box = ({ on, onClick, title, sub, locked }: { on: boolean; onClick: () => void; title: string; sub?: string; locked?: boolean }) => (
    <button type="button" onClick={onClick} className={`flex items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition ${on ? "border-brand bg-brand-50" : "border-line hover:border-brand/40"}`}>
      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border-2 text-[10px] font-bold ${on ? "border-brand bg-brand text-white" : "border-slate-300"}`}>{on ? "✓" : ""}</span>
      <span className="min-w-0"><b className="hi block leading-snug">{title}{locked && <Lock className="ml-1 inline h-3 w-3 text-saffron" />}</b>{sub && <span className="block text-xs text-muted">{sub}</span>}</span>
    </button>
  );
  const H = ({ icon, t }: { icon: React.ReactNode; t: string }) => <div className="mb-2 mt-5 flex items-center gap-2 text-sm font-bold text-navy first:mt-0">{icon}{t}</div>;
  const hindi = opts?.folders.filter((f) => f.layout !== "english") || [];
  const eng = opts?.folders.filter((f) => f.layout === "english") || [];

  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => onChange("")} className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm ${all ? "border-green-600 bg-green-50 font-semibold text-green-800" : "border-line"}`}>👑 Sab kuch — poora premium content</button>
        <button type="button" onClick={() => !all || set({})} className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm ${!all ? "border-saffron bg-orange-50 font-semibold text-orange-800" : "border-line"}`}>🎯 Sirf chuni hui series</button>
      </div>
      {!all && (
        !opts ? <p className="mt-4 text-sm text-muted">Load ho raha hai…</p> : (
          <div className="mt-4">
            <H icon={<BookOpen className="h-4 w-4" />} t="Typing Lesson Folders" />
            {!opts.folders.length && <p className="text-xs text-muted">Abhi koi folder nahi — Admin → Typing Lesson Folders me banayein.</p>}
            {[["हिंदी typing", hindi], ["English typing", eng]].map(([t, list]: any) => list.length > 0 && (
              <div key={t} className="mb-2">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t}</div>
                <div className="grid gap-2 sm:grid-cols-2">{list.map((f: any) => <Box key={f.id} on={!!inc.folders?.includes(f.id)} onClick={() => set({ folders: toggle(inc.folders, f.id) })} title={f.name} sub={`${LAYOUT[f.layout] || f.layout} · ${f.n} lessons${!f.is_free ? " · poora folder locked" : f.locked ? ` · ${f.locked} locked` : ""}`} locked={!f.is_free || f.locked > 0} />)}</div>
              </div>
            ))}

            <H icon={<ClipboardCheck className="h-4 w-4" />} t="Mock Test Series" />
            {opts.series.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{opts.series.map((s) => <Box key={s.name} on={!!inc.series?.includes(`series:${s.name}`)} onClick={() => set({ series: toggle(inc.series, `series:${s.name}`) })} title={s.name} sub={`${s.n} tests · ${s.locked} locked`} locked={s.locked > 0} />)}</div>}
            <div className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Ya poore exam ke saare locked tests</div>
            <div className="grid gap-2 sm:grid-cols-2">{opts.exams.map((e) => <Box key={e.slug} on={!!inc.series?.includes(`exam:${e.slug}`)} onClick={() => set({ series: toggle(inc.series, `exam:${e.slug}`) })} title={`${e.name} — sabhi tests`} sub={`${e.n} tests · ${e.locked} locked`} locked={e.locked > 0} />)}</div>

            <H icon={<Keyboard className="h-4 w-4" />} t="Typing Exam Tests (category)" />
            <div className="grid gap-2 sm:grid-cols-3">{opts.cats.map((c) => <Box key={c.name} on={!!inc.typing?.includes(c.name)} onClick={() => set({ typing: toggle(inc.typing, c.name) })} title={c.name} sub={`${c.n} exams · ${c.locked} locked`} locked={c.locked > 0} />)}</div>

            <H icon={<FileText className="h-4 w-4" />} t="Aur" />
            <div className="grid gap-2 sm:grid-cols-3">
              <Box on={!!inc.passages} onClick={() => set({ passages: !inc.passages })} title="Premium typing passages" sub="Locked paragraphs" />
              <Box on={!!inc.keywords} onClick={() => set({ keywords: !inc.keywords })} title="Keyword MCQ topics" sub="Locked keyword tests" />
              <Box on={!!inc.materials} onClick={() => set({ materials: !inc.materials })} title="Premium PDFs / Notes" sub="Study material" />
            </div>
            <p className="mt-4 flex items-start gap-1.5 text-xs text-muted"><Search className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Naya test ya lesson lock karke kisi chuni hui series / folder me daalenge to wo apne aap is plan me aa jayega. Test ki series: Mock Tests → Edit → <b>Test Series</b>.</span></p>
          </div>
        )
      )}
    </div>
  );
}
