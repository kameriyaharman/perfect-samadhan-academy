import Link from "next/link";
import { BarChart3, Download, FileCheck2, Printer } from "lucide-react";
import { q } from "@/lib/db";
import { kfmt } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Previous Year Papers" };

export default async function Papers({ searchParams }: { searchParams: { exam?: string; missing?: string } }) {
  const tabs = (await q(`SELECT exam, min(sort) s FROM prev_papers GROUP BY exam ORDER BY (exam='CPCT') DESC, exam`)).map((r: any) => r.exam);
  const exam = searchParams.exam && tabs.includes(searchParams.exam) ? searchParams.exam : tabs[0];
  const rows = await q(`SELECT * FROM prev_papers WHERE exam=$1 ORDER BY year DESC, sort`, [exam]);
  return (
    <>
      <PageHero crumbs={[{ label: "Study Material", href: "/study-material" }, { label: "Previous Year Papers" }]} title="पिछले वर्षों के" highlight="प्रश्न पत्र" subtitle="Sabhi solved papers — answer key ke saath. PDF download karein ya online test dein." compact />
      <Container className="py-10">
        {searchParams.missing && <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Is paper ki PDF jald upload hogi. Tab tak online test ya doosre papers dekhein.</div>}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {tabs.map((t) => <Link key={t} href={`/previous-papers?exam=${encodeURIComponent(t)}`} className={`tab ${t === exam ? "active" : ""}`}>{t}</Link>)}
        </div>
        {!rows.length ? <Empty /> : (
          <div className="card overflow-x-auto">
            <table className="table-x min-w-[760px]">
              <thead><tr><th>Exam Session</th><th>Shifts</th><th>Language</th><th>Solution</th><th>Downloads</th><th></th></tr></thead>
              <tbody>{rows.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-bold">{p.title}</td><td>{p.shifts}</td><td>{p.language}</td>
                  <td><span className="chip bg-green-50 text-green-700 py-1.5">Answer Key</span></td><td>{kfmt(p.downloads)}</td>
                  <td className="whitespace-nowrap text-right"><a href={`/api/download/paper/${p.id}`} className="btn-primary btn-sm"><Download className="h-3.5 w-3.5" />PDF</a> <Link href={p.test_id ? `/test/${p.test_id}` : "/mock-tests/pyq"} className="btn-soft btn-sm">Online Test</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[[FileCheck2, "Answer Key", "Har paper ke saath official/expert answer key."], [BarChart3, "Topic Weightage", "Kis topic se kitne sawal aaye — chart ke saath."], [Printer, "Print Friendly", "A4 size, saaf font — print karke padhein."]].map(([I, t, d]: any) => (
            <div key={t} className="card p-5"><div className="flex items-center gap-2 text-lg font-bold"><I className="h-5 w-5" />{t}</div><p className="mt-1 text-sm text-muted">{d}</p></div>
          ))}
        </div>
      </Container>
    </>
  );
}
