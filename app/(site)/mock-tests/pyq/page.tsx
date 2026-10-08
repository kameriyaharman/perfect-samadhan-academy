import Link from "next/link";
import { CalendarDays, Download } from "lucide-react";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Previous Year Online Test" };

export default async function Pyq({ searchParams }: { searchParams: { exam?: string } }) {
  const exams = await q(`SELECT DISTINCT e.slug, e.code, e.name, e.sort FROM exams e JOIN mock_tests m ON m.exam_slug=e.slug AND m.kind='pyq' AND m.active ORDER BY e.sort`);
  const exam = searchParams.exam || exams[0]?.slug || "cpct";
  const tests = await q(`SELECT * FROM mock_tests WHERE kind='pyq' AND active AND exam_slug=$1 ORDER BY year DESC, sort`, [exam]);
  const byYear: Record<string, any[]> = {};
  for (const t of tests) (byYear[t.year || "Other"] ||= []).push(t);
  const cur = exams.find((e: any) => e.slug === exam);
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Previous Year Online Test" }]} title="पिछले वर्षों के पेपर —" highlight="ऑनलाइन टेस्ट" subtitle="Asli purane paper ab online test format me — timer, instant result aur answer key ke saath." compact />
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {exams.map((e: any) => <Link key={e.slug} href={`/mock-tests/pyq?exam=${e.slug}`} className={`tab ${exam === e.slug ? "active" : ""}`}>{e.name.replace("MP ", "") === e.name ? e.name : e.name}</Link>)}
        </div>
        {!tests.length ? <Empty /> : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(byYear).sort((a, b) => Number(b[0]) - Number(a[0])).map(([y, list]) => (
              <div key={y} className="card p-5">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><CalendarDays className="h-5 w-5" />{cur?.code} {y}</h3>
                {list.map((t) => {
                  const [ses, sh] = (t.session || t.title).split("·").map((s: string) => s.trim());
                  return (
                    <div key={t.id} className="flex items-center justify-between gap-2 border-b border-line py-2.5 last:border-0">
                      <span className="text-sm"><b>{ses}</b>{sh ? ` · ${sh}` : ""}</span>
                      <span className="flex gap-1.5">
                        <Link href={`/test/${t.id}`} className="btn-primary btn-sm">Online Test</Link>
                        <a href={t.pdf_url || `/previous-papers?exam=${encodeURIComponent(cur?.name || "")}`} className="btn-soft btn-sm"><Download className="h-3.5 w-3.5" />PDF</a>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
