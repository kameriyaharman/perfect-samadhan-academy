import Link from "next/link";
import { Filter, FileText, Keyboard, Languages, PlayCircle } from "lucide-react";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "CPCT Typing Paragraphs" };

export default async function Paragraphs({ searchParams }: { searchParams: { year?: string } }) {
  const rows = await q(`SELECT id, title, language, year, session, shift, text FROM passages WHERE active AND exam IS NOT NULL AND year IS NOT NULL ORDER BY year DESC, id`);
  const years = Array.from(new Set(rows.map((r: any) => r.year))) as number[];
  const year = Number(searchParams.year) || years[0];
  const yr = rows.filter((r: any) => r.year === year);
  const sessions: Record<string, any[]> = {};
  for (const r of yr) (sessions[r.session || "—"] ||= []).push(r);
  const allSessions: Record<string, any[]> = {};
  for (const r of rows) (allSessions[r.session || "—"] ||= []).push(r);
  const sampleHi = yr.find((r: any) => r.language === "hindi");
  const sampleEn = yr.find((r: any) => r.language === "english");
  const shiftsOf = (list: any[]) => Array.from(new Set(list.map((x) => (x.shift || "").replace("Shift ", "")))).filter(Boolean).join(" · ");
  return (
    <>
      <PageHero crumbs={[{ label: "Typing Test", href: "/typing-test" }, { label: "CPCT Exam Paragraphs" }]} title="CPCT के असली" highlight="टाइपिंग पैराग्राफ" subtitle="Pichhle CPCT exams me aaye actual paragraphs par practice karein — year aur shift ke hisaab se." compact />
      <Container className="py-10">
        {!rows.length ? <Empty /> : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="card self-start p-5">
              <div className="mb-3 flex items-center gap-2 text-lg font-bold"><Filter className="h-5 w-5" />Saal chunein</div>
              <div className="space-y-2.5">
                {years.map((y) => {
                  const n = rows.filter((r: any) => r.year === y).length;
                  return (
                    <Link key={y} href={`/typing-test/paragraphs?year=${y}`} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${y === year ? "border-brand bg-brand-50/60 ring-2 ring-brand/10" : "border-line hover:border-brand/40"}`}>
                      <span><span className="block font-medium">{y}</span><span className="text-xs text-muted">{n} paragraphs</span></span>
                      <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${y === year ? "border-brand" : "border-slate-300"}`}>{y === year && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}</span>
                    </Link>
                  );
                })}
              </div>
            </aside>
            <div className="space-y-6 min-w-0">
              <div className="card overflow-x-auto">
                <table className="table-x min-w-[640px]">
                  <thead><tr><th>Exam Session</th><th>Shifts</th><th>Language</th><th>Layout</th><th></th></tr></thead>
                  <tbody>
                    {Object.entries(sessions).map(([sess, list]) => {
                      const hi = list.find((x) => x.language === "hindi"); const en = list.find((x) => x.language === "english");
                      return (
                        <tr key={sess}>
                          <td className="font-bold">{sess}</td><td>Shift {shiftsOf(list)}</td>
                          <td><div className="flex gap-1.5">
                            {hi && <Link href={`/typing-test/setup?lang=hindi&passage=${hi.id}`} className="btn-primary btn-sm"><Keyboard className="h-3.5 w-3.5" />Hindi</Link>}
                            {en && <Link href={`/typing-test/setup?lang=english&passage=${en.id}`} className="btn-soft btn-sm"><Languages className="h-4 w-4" /><Languages className="h-3.5 w-3.5" />English</Link>}
                          </div></td>
                          <td>Inscript + Remington</td>
                          <td><span className={`chip ${year >= new Date().getFullYear() ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand"}`}>{year >= new Date().getFullYear() ? "New" : year}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {[sampleHi, sampleEn].filter(Boolean).map((s: any) => (
                  <div key={s.id} className="card p-6">
                    <div className="mb-3 flex items-center gap-2 font-bold"><FileText className="h-5 w-5" />Sample — {s.title}</div>
                    <p className={`line-clamp-3 text-[16px] leading-8 text-ink ${s.language === "hindi" ? "hi text-[17px]" : ""}`}>{s.text}</p>
                    <Link href={`/typing-test/setup?lang=${s.language}&passage=${s.id}`} className="btn-primary mt-4"><PlayCircle className="h-4 w-4" />Is paragraph par test dein</Link>
                  </div>
                ))}
              </div>
              {Object.keys(allSessions).length > 0 && <p className="text-xs text-muted">Kul {rows.length} exam paragraphs · admin panel se naye paragraphs jode ja sakte hain.</p>}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
