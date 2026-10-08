import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ClipboardCheck, FileText, Lock, PieChart, Target, Users } from "lucide-react";
import { q, one } from "@/lib/db";
import { getUser, isPremium } from "@/lib/auth";
import { rupee, sections } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

const TABS = [["full", "Full Mock"], ["subject", "Subject-wise"], ["topic", "Topic-wise"], ["pyq", "PYQ"]] as const;
const PER = 10;

export async function generateMetadata({ params }: { params: { exam: string } }) {
  const e = await one("SELECT name FROM exams WHERE slug=$1", [params.exam]);
  return { title: e ? `${e.name} Mock Test Series` : "Mock Tests" };
}

export default async function Series({ params, searchParams }: { params: { exam: string }; searchParams: { tab?: string; page?: string } }) {
  const exam = await one("SELECT * FROM exams WHERE slug=$1", [params.exam]);
  if (!exam) notFound();
  const tab = (TABS.find(([k]) => k === searchParams.tab)?.[0] || "full") as string;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const user = await getUser();
  const premium = isPremium(user);
  const [counts, tests, plan, students] = await Promise.all([
    q(`SELECT kind, count(*)::int n FROM mock_tests WHERE exam_slug=$1 AND active GROUP BY kind`, [exam.slug]),
    q(`SELECT m.*, (SELECT count(*)::int FROM questions WHERE test_id=m.id) qn,
        (SELECT string_agg(section || ' ' || c, ' · ') FROM (SELECT section, count(*) c FROM questions WHERE test_id=m.id GROUP BY section ORDER BY min(sort)) s) breakdown
       FROM mock_tests m WHERE exam_slug=$1 AND kind=$2 AND active ORDER BY sort, id LIMIT $3 OFFSET $4`, [exam.slug, tab, PER, (page - 1) * PER]),
    one(`SELECT * FROM plans WHERE active AND popular ORDER BY sort LIMIT 1`),
    one(`SELECT count(DISTINCT a.user_id)::int n FROM attempts a JOIN mock_tests m ON m.id=a.test_id WHERE m.exam_slug=$1`, [exam.slug]),
  ]);
  const cnt = (k: string) => counts.find((c: any) => c.kind === k)?.n || 0;
  const pages = Math.ceil(cnt(tab) / PER);
  const attempts = user && tests.length ? await q(`SELECT DISTINCT ON (test_id) test_id, id, status, score, total FROM attempts WHERE user_id=$1 AND test_id = ANY($2::int[]) ORDER BY test_id, id DESC`, [user.id, tests.map((t: any) => t.id)]) : [];
  const att = new Map(attempts.map((a: any) => [a.test_id, a]));
  const pattern = sections(exam.syllabus).filter((s) => !/typing/i.test(s.title));
  const shortBreak = (b: string | null) => (b || "").replace("Reading Comprehension", "RC").replace("General Awareness", "GK");
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: exam.code }]} title={exam.code} highlight="मॉक टेस्ट सीरीज़"
        subtitle={exam.description}
        chips={[<><ClipboardCheck className="h-4 w-4" />{cnt("full")} Full Mocks</>, <><Target className="h-4 w-4" />{cnt("topic")} Topic Tests</>, <><FileText className="h-4 w-4" />{cnt("pyq")} PYQ Tests</>, <><Users className="h-4 w-4" />{((students?.n || 0) + (exam.students || 0)).toLocaleString("en-IN")} students</>]} />
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
              {TABS.map(([k, l]) => <Link key={k} href={`/mock-tests/${exam.slug}?tab=${k}`} className={`tab ${tab === k ? "active" : ""}`}>{l} ({cnt(k)})</Link>)}
            </div>
            {!tests.length ? <Empty text="Is category me abhi test nahi hain — jald aa rahe hain." /> : (
              <div className="card overflow-x-auto">
                <table className="table-x min-w-[720px]">
                  <thead><tr><th>Test</th><th>Pattern</th><th>Language</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {tests.map((t: any) => {
                      const a: any = att.get(t.id);
                      const locked = !t.is_free && !premium;
                      return (
                        <tr key={t.id}>
                          <td><div className="font-bold">{t.title}</div><div className="text-xs text-muted">{shortBreak(t.breakdown)}</div></td>
                          <td className="whitespace-nowrap">{t.qn} Q · {t.duration} min</td>
                          <td className="hi whitespace-nowrap">हिंदी / English</td>
                          <td>{a?.status === "submitted" ? <span className="chip bg-green-50 text-green-700">Score {a.score}/{a.total}</span> : a ? <span className="chip bg-red-50 text-red-600">● In progress</span> : locked ? <span className="chip bg-orange-50 text-orange-600"><Lock className="h-3 w-3" />Premium</span> : <span className="chip bg-green-50 text-green-700">Free</span>}</td>
                          <td className="whitespace-nowrap text-right">
                            {a?.status === "submitted" ? (<div className="flex justify-end gap-1.5"><Link href={`/test/solutions/${a.id}`} className="btn-soft btn-sm">Solution</Link><Link href={`/test/${t.id}`} className="btn-soft btn-sm">Reattempt</Link></div>)
                              : a ? <Link href={`/test/attempt/${a.id}`} className="btn-primary btn-sm">Resume</Link>
                              : locked ? <Link href="/plans" className="btn-orange btn-sm !py-1.5">Unlock</Link>
                              : <Link href={`/test/${t.id}`} className="btn-primary btn-sm">Start</Link>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {pages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <Link key={n} href={`/mock-tests/${exam.slug}?tab=${tab}&page=${n}`} className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-bold ${n === page ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>{n}</Link>
                ))}
              </div>
            )}
          </div>
          <aside className="space-y-5">
            {plan && !premium && (
              <div className="rounded-2xl border-2 border-brand bg-white p-6 shadow-lift">
                <span className="chip bg-orange-50 text-orange-600">Best Value</span>
                <h3 className="mt-3 text-2xl font-bold text-navy">{plan.name}</h3>
                <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-extrabold text-navy">{rupee(plan.price)}</span>{plan.mrp && <span className="pb-1 text-muted line-through">{rupee(plan.mrp)}</span>}</div>
                <ul className="mt-4 space-y-2 text-sm">{plan.features.split("\n").filter((x: string) => x.startsWith("+")).map((x: string) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-green-600" />{x.slice(1)}</li>)}<li className="flex gap-2"><Check className="h-4 w-4 text-green-600" />Validity: {Math.round(plan.validity_days / 365) >= 1 ? `${Math.round(plan.validity_days / 365)} saal` : `${plan.validity_days} din`}</li></ul>
                <Link href={`/checkout?item=plan:${plan.slug}`} className="btn-primary mt-5 w-full">Abhi Kharidein</Link>
              </div>
            )}
            {premium && <div className="rounded-2xl bg-green-50 p-5 text-sm text-green-800"><b>Premium active ✓</b><br />Sabhi tests unlocked hain.</div>}
            {pattern.length > 0 && (
              <div className="card p-6">
                <div className="mb-2 flex items-center gap-2 text-lg font-bold"><PieChart className="h-5 w-5" />{exam.code} Pattern</div>
                {pattern.map((s) => <div key={s.title} className="flex justify-between border-b border-line py-3 text-sm last:border-0"><span>{s.title}</span><b>{parseInt(s.meta) || s.meta}</b></div>)}
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
