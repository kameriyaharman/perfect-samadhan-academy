import Link from "next/link";
import { CalendarDays, Download, Lock, MonitorPlay } from "lucide-react";
import { getUser, isPremium } from "@/lib/auth";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import AdSlot from "@/components/ads/AdSlot";

export const metadata = { title: "Previous Year Online Test" };

export default async function Pyq({ searchParams }: { searchParams: { exam?: string } }) {
  const exams = await q(`SELECT DISTINCT e.slug, e.code, e.name, e.sort FROM exams e JOIN mock_tests m ON m.exam_slug=e.slug AND m.kind='pyq' AND m.active ORDER BY e.sort`);
  const exam = searchParams.exam || exams[0]?.slug || "cpct";
  const tests = await q(`SELECT * FROM mock_tests WHERE kind='pyq' AND active AND exam_slug=$1 ORDER BY year DESC, sort`, [exam]);
  const premium = isPremium(await getUser());
  const byYear: Record<string, any[]> = {};
  for (const t of tests) (byYear[t.year || "Other"] ||= []).push(t);
  const cur = exams.find((e: any) => e.slug === exam);
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Previous Year Online Test" }]} title="पिछले वर्षों के पेपर —" highlight="ऑनलाइन टेस्ट" subtitle="Asli purane paper ab online test format me — timer, instant result aur answer key ke saath." compact />
      <Container className="py-10">
        <AdSlot place="Mock Test" />
        <Link href="/mock-tests/cpct-computer" className="mb-6 flex flex-col gap-3 rounded-2xl bg-navy p-5 text-white transition hover:-translate-y-0.5 hover:shadow-lift md:flex-row md:items-center md:p-6" data-dark>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold text-lg font-extrabold text-navy">52</span>
          <span className="flex-1"><b className="block text-lg md:text-xl">CPCT Previous Year Online Test — <span className="hi">कंप्यूटर (52 प्रश्न)</span></b><span className="text-sm text-white/75">Sirf Computer wala hissa · saal aur shift ke hisaab se · Hindi + English</span></span>
          <span className="btn bg-gold px-5 py-2.5 font-bold text-navy">Test dein →</span>
        </Link>
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {exams.map((e: any) => <Link key={e.slug} href={`/mock-tests/pyq?exam=${e.slug}`} className={`tab ${exam === e.slug ? "active" : ""}`}>{e.name.replace("MP ", "") === e.name ? e.name : e.name}</Link>)}
        </div>
        {!tests.length ? <Empty /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(byYear).sort((a, b) => Number(b[0]) - Number(a[0])).map(([y, list]) => (
              <div key={y} className="card p-5">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><CalendarDays className="h-5 w-5" />{cur?.code} {y}</h3>
                {list.map((t) => {
                  const [ses, sh] = (t.session || t.title).split("·").map((s: string) => s.trim());
                  return (
                    <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2.5 last:border-0">
                      <span className="whitespace-nowrap text-sm"><b>{ses}</b>{sh ? ` · ${sh}` : ""}</span>
                      <span className="flex gap-1.5">
                        {!t.is_free && !premium
                          ? <Link href="/plans" className="btn-orange btn-sm !py-1.5"><Lock className="h-3.5 w-3.5" />Premium</Link>
                          : <Link href={`/test/${t.id}`} className="btn-primary btn-sm"><MonitorPlay className="h-4 w-4" />Online Test</Link>}
                        <a href={t.pdf_url || `/previous-papers?exam=${encodeURIComponent(cur?.name || "")}`} className="btn-soft btn-sm"><Download className="h-3.5 w-3.5" />PDF</a>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        <AdSlot place="Mock Test" pos="bottom" />
      </Container>
    </>
  );
}
