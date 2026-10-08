import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardCheck, FileText, Languages, Layers, PlayCircle, Target } from "lucide-react";
import { q } from "@/lib/db";
import { color } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, SectionTitle } from "@/components/Section";

export const metadata = { title: "Online Mock Tests" };

export default async function MockTests() {
  const exams = await q(`SELECT e.*, (SELECT count(*)::int FROM mock_tests m WHERE m.exam_slug=e.slug AND m.active AND m.kind='full') mocks,
    (SELECT max(cnt)::int FROM (SELECT count(*) cnt FROM questions qq JOIN mock_tests m2 ON m2.id=qq.test_id WHERE m2.exam_slug=e.slug AND m2.kind='full' GROUP BY m2.id) x) qn
    FROM exams e WHERE e.active ORDER BY e.sort`);
  const total = exams.reduce((a: number, e: any) => a + e.mocks, 0);
  const tag: Record<string, string> = { "Most Popular": "bg-green-50 text-green-700", Popular: "bg-green-50 text-green-700", New: "bg-green-50 text-green-700", Free: "bg-green-50 text-green-700", Soon: "bg-green-50 text-green-700", Typing: "bg-brand-50 text-brand" };
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests" }]} title="ऑनलाइन" highlight="मॉक टेस्ट" subtitle="Real exam jaisa interface, Hindi/English dono me, instant result aur har question ka explanation."
        chips={[<><ClipboardCheck className="h-4 w-4" />{total}+ Mock Tests</>, <><Languages className="h-4 w-4" />Bilingual</>, <><BarChart3 className="h-4 w-4" />All-India Rank</>]} />
      <Container className="py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[ClipboardCheck, "Full Mock Test", "Poora paper, 75 min", "/mock-tests/cpct", "blue"], [Layers, "Subject-wise", "Computer, Maths, GK…", "/mock-tests/cpct?tab=subject", "orange"], [Target, "Topic-wise", "Ek chapter, chhote tests", "/mock-tests/topic-wise", "green"], [FileText, "PYQ Online Test", "Purane paper online", "/mock-tests/pyq", "red"]].map(([I, t, d, h, c]: any) => (
            <Link key={t} href={h} className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-lift">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${color(c).bg} ${color(c).text}`}><I className="h-5 w-5" /></span>
              <span><span className="block text-lg font-bold">{t}</span><span className="text-sm text-muted">{d}</span></span>
            </Link>
          ))}
        </div>
        <div className="mt-12">
          <SectionTitle eyebrow="Exam Chunein" title="परीक्षा के अनुसार मॉक टेस्ट" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exams.map((e: any) => (
              <Link key={e.id} href={`/mock-tests/${e.slug}`} className="card group p-5 transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <span className={`grid h-12 min-w-[48px] place-items-center rounded-xl px-2 text-xs font-extrabold ${color(e.color).bg} ${color(e.color).text}`}>{e.code}</span>
                  {e.tag && <span className={`chip ${tag[e.tag] || "bg-green-50 text-green-700"}`}>{e.tag}</span>}
                </div>
                <div className="mt-4 text-xl font-bold">{e.name}</div>
                <div className="mt-1 flex gap-4 text-sm text-muted"><span>{e.mocks} Mocks</span><span>{e.qn || 0} Q</span></div>
                <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted">Free + Premium</span><span className="flex items-center gap-1 font-bold text-brand transition group-hover:gap-2">Dekhein <ArrowRight className="h-4 w-4" /></span></div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-bold text-navy">Daily Free Quiz — <span className="hi">आज का क्विज़</span></h3>
            <p className="text-sm text-muted">10 sawal · 10 minute · roz naya. Computer + GK + Reasoning</p>
          </div>
          <Link href="/mock-tests/quiz" className="btn-orange !py-3.5"><PlayCircle className="h-5 w-5" />Quiz Shuru Karein</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/mock-tests/keyword" className="card flex items-center justify-between p-5 hover:shadow-lift"><span><b className="block text-lg">Keyword se Test banayein</b><span className="text-sm text-muted">"Excel", "RAM", "Shortcut" — kisi bhi topic par turant test</span></span><ArrowRight className="h-5 w-5 text-brand" /></Link>
          <Link href="/typing-test" className="card flex items-center justify-between p-5 hover:shadow-lift"><span><b className="block text-lg">Typing Test bhi dein</b><span className="text-sm text-muted">CPCT Hindi + English typing practice</span></span><ArrowRight className="h-5 w-5 text-brand" /></Link>
        </div>
      </Container>
    </>
  );
}
