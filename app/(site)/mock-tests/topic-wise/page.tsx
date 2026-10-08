import Link from "next/link";
import { BookOpen } from "lucide-react";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Topic-wise Test" };

export default async function TopicWise({ searchParams }: { searchParams: { exam?: string } }) {
  const exam = searchParams.exam || "cpct";
  const tests = await q(`SELECT m.id, m.subject, m.topic, m.title, (SELECT count(*)::int FROM questions WHERE test_id=m.id) qn FROM mock_tests m WHERE kind='topic' AND active AND exam_slug=$1 ORDER BY sort, id`, [exam]);
  const groups: Record<string, any[]> = {};
  for (const t of tests) (groups[t.subject || "Others"] ||= []).push(t);
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Topic-wise Test" }]} title="सिलेबस अनुसार" highlight="टॉपिक-वाइज़ टेस्ट" subtitle="Official syllabus ke har chapter par chhote tests. Weak topic ko target karein aur turant sudharein." compact />
      <Container className="py-10">
        {!tests.length ? <Empty /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(groups).map(([sub, list]) => (
              <div key={sub} className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy"><BookOpen className="h-5 w-5" />{sub}</h3>
                {list.map((t) => (
                  <Link key={t.id} href={`/test/${t.id}`} className="flex items-center justify-between border-b border-dashed border-line py-3 text-[15px] last:border-0 hover:text-brand">
                    <span>{t.topic}</span><span className="chip bg-brand-50 text-brand py-1.5">{t.qn} Q</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
