import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileText, Keyboard, Search } from "lucide-react";
import { q } from "@/lib/db";
import { color } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Sabhi Sarkari Exams" };
const CATS = [["", "Sabhi"], ["MP", "MP"], ["Central", "Central"], ["Typing", "Typing wale"], ["Rajasthan", "Rajasthan"]];

export default async function Exams({ searchParams }: { searchParams: { c?: string; q?: string } }) {
  const args: any[] = []; const w = ["active"];
  if (searchParams.c === "Typing") w.push("(category='Typing' OR show_in_typing)");
  else if (searchParams.c) { args.push(searchParams.c); w.push(`category=$${args.length}`); }
  if (searchParams.q) { args.push(`%${searchParams.q}%`); w.push(`(name ILIKE $${args.length} OR code ILIKE $${args.length})`); }
  const rows = await q(`SELECT * FROM exams WHERE ${w.join(" AND ")} ORDER BY sort`, args);
  return (
    <>
      <PageHero crumbs={[{ label: "Exams" }]} title="सभी" highlight="सरकारी परीक्षाएँ" subtitle="Jis exam ki tayari kar rahe hain use chunein — mock test, typing test, syllabus, PYQ aur notices ek hi page par." compact />
      <Container className="py-10">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <form action="/exams" className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4"><Search className="h-4 w-4 text-muted" /><input name="q" defaultValue={searchParams.q} placeholder="Exam search karein" className="w-full bg-transparent py-3.5 outline-none" />{searchParams.c && <input type="hidden" name="c" value={searchParams.c} />}</form>
          <div className="seg lg:w-[560px]">{CATS.map(([k, l]) => <Link key={k} href={k ? `/exams?c=${k}` : "/exams"} className={(searchParams.c || "") === k ? "on" : ""}>{l}</Link>)}</div>
        </div>
        {!rows.length ? <Empty /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((e: any) => (
              <Link key={e.id} href={`/exams/${e.slug}`} className="card group p-5 transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-start justify-between"><span className={`grid h-12 min-w-[48px] place-items-center rounded-xl px-2 text-[11px] font-extrabold ${color(e.color).bg} ${color(e.color).text}`}>{e.code}</span>{e.body && <span className="chip bg-brand-50 text-brand">{e.body}</span>}</div>
                <div className="mt-4 text-xl font-bold">{e.name}</div>
                <div className="mt-2 flex gap-3 text-xs text-muted"><span className="flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" />Mocks</span><span className="flex items-center gap-1"><Keyboard className="h-3.5 w-3.5" />Typing</span><span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />PYQ</span></div>
                <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted">Syllabus · Notices</span><span className="flex items-center gap-1 font-bold text-brand transition group-hover:gap-2">Dekhein <ArrowRight className="h-4 w-4" /></span></div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
