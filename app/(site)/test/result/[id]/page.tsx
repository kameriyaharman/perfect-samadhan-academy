import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, Brain, CheckCircle2, Download, Eye, PieChart, Target, Trophy, XCircle } from "lucide-react";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";
import { gradeAttempt } from "@/lib/tests";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import PrintButton from "@/components/PrintButton";

export const metadata = { title: "Test Result" };

export default async function Result({ params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) redirect(`/login?next=/test/result/${params.id}`);
  let a = await one("SELECT a.*, m.pass_marks, m.exam_slug FROM attempts a LEFT JOIN mock_tests m ON m.id=a.test_id WHERE a.id=$1 AND (a.user_id=$2 OR $3)", [Number(params.id) || 0, user.id, user.role === "admin"]);
  if (!a) notFound();
  if (a.status === "in_progress") {
    if (Date.now() < new Date(a.started_at).getTime() + a.duration * 60000) redirect(`/test/attempt/${a.id}`);
    await gradeAttempt(a.id);
    a = await one("SELECT a.*, m.pass_marks, m.exam_slug FROM attempts a LEFT JOIN mock_tests m ON m.id=a.test_id WHERE a.id=$1", [a.id]);
  }
  const stats = a.test_id ? await one(`SELECT count(*)::int total, count(*) FILTER (WHERE score > $2)::int above, max(score) top, avg(score) avg FROM (SELECT DISTINCT ON (user_id) user_id, score FROM attempts WHERE test_id=$1 AND status='submitted' ORDER BY user_id, score DESC) x`, [a.test_id, a.score]) : null;
  const rank = (stats?.above || 0) + 1;
  const totalUsers = Math.max(1, stats?.total || 1);
  const percentile = Math.round(((totalUsers - rank) / totalUsers) * 1000) / 10;
  const sec: Record<string, { total: number; correct: number; wrong: number; topics: Record<string, [number, number]> }> = JSON.parse(a.section_stats || "{}");
  const attempted = a.correct + a.wrong;
  const accuracy = attempted ? Math.round((a.correct / attempted) * 100) : 0;
  const pass = a.pass_marks ?? Math.ceil(a.total * 0.5);
  const passed = a.score >= pass;
  const weak: string[] = [];
  for (const s of Object.values(sec)) for (const [t, [c, n]] of Object.entries(s.topics)) if (n > 0 && c / n < 0.6) weak.push(t);
  const top = Math.max(Number(stats?.top || a.score), a.score);
  const avg = Math.round(Number(stats?.avg || a.score));
  const C = 2 * Math.PI * 42;
  const pc = a.correct / Math.max(1, a.total), pw = a.wrong / Math.max(1, a.total);
  const perSecTime = (n: number) => Math.round(((a.time_taken || 0) / 60) * (n / Math.max(1, a.total)));
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: a.title }, { label: "Result" }]} title="आपका रिज़ल्ट —" highlight={`${a.score} / ${a.total}`}
        subtitle={`${a.title} · ${fmtDate(a.submitted_at)} · ${Math.round((a.time_taken || 0) / 60)} min me submit kiya`}
        chips={[<>{passed ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-300" />}{passed ? "Pass" : "Fail"} ({pass}+ required)</>, <><Trophy className="h-4 w-4" />Rank {rank} / {totalUsers.toLocaleString("en-IN")}</>, <><BarChart3 className="h-4 w-4" />Percentile {percentile}</>]} compact />
      <Container className="py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[["Score", `${a.score} / ${a.total}`, "text-navy"], ["Correct", a.correct, "text-green-600"], ["Wrong", a.wrong, "text-red-500"], ["Skipped", a.skipped, "text-slate-500"], ["Accuracy", `${accuracy}%`, "text-brand"]].map(([l, v, c]) => (
            <div key={l as string} className="card p-5"><div className="text-sm text-muted">{l}</div><div className={`mt-1 text-3xl md:text-4xl font-bold ${c}`}>{v}</div></div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="card overflow-x-auto p-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><PieChart className="h-5 w-5" />Section-wise Performance</h2>
            <table className="table-x min-w-[460px]">
              <thead><tr><th>Section</th><th>Score</th><th>Accuracy</th><th>Time</th><th></th></tr></thead>
              <tbody>{Object.entries(sec).map(([s, v]) => {
                const acc = Math.round((v.correct / Math.max(1, v.total)) * 100);
                return <tr key={s}><td className="font-bold">{s.replace("Reading Comprehension", "Reading Comp.").replace("General Awareness", "Gen. Awareness")}</td><td>{v.correct} / {v.total}</td><td>{acc}%</td><td>{perSecTime(v.total)}m</td><td className="w-32"><div className="h-1.5 rounded-full bg-canvas"><div className={`h-1.5 rounded-full ${acc >= 75 ? "bg-green-600" : "bg-saffron"}`} style={{ width: `${acc}%` }} /></div></td></tr>;
              })}</tbody>
            </table>
          </div>
          <div className="card flex flex-col items-center gap-8 p-6 sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <svg viewBox="0 0 100 100" className="h-44 w-44 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e6f0" strokeWidth="12" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="12" strokeDasharray={`${pc * C} ${C}`} />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${pw * C} ${C}`} strokeDashoffset={-pc * C} />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center"><div><div className="text-4xl font-bold">{a.score}</div><div className="text-xs text-muted">out of {a.total}</div></div></div>
            </div>
            <div className="w-full">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5" />Topper se tulna</h3>
              {[["Aap", a.score, "bg-brand"], ["Topper", top, "bg-green-600"], ["Average", avg, "bg-saffron"]].map(([l, v, c]) => (
                <div key={l as string} className="mb-3"><div className="flex justify-between text-sm"><span>{l}</span><b>{v}</b></div><div className="mt-1 h-2 rounded-full bg-canvas"><div className={`h-2 rounded-full ${c}`} style={{ width: `${(Number(v) / Math.max(1, a.total)) * 100}%` }} /></div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="card mt-5 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold"><Brain className="h-5 w-5" />{weak.length ? `Weak Topics: ${weak.slice(0, 4).join(", ")}` : "Koi weak topic nahi — badhiya!"}</div>
            <p className="text-sm text-muted">{weak.length ? `In topics ke liye ${Math.min(3, weak.length)} topic tests suggest kiye gaye hain.` : "Agla full mock dein aur speed badhayein."}</p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <Link href={`/test/solutions/${a.id}`} className="btn-ghost"><Eye className="h-4 w-4" />Solutions Dekhein</Link>
            <PrintButton className="btn-ghost"><Download className="h-4 w-4" />Result PDF</PrintButton>
            <Link href={weak.length ? `/mock-tests/keyword?q=${encodeURIComponent(weak[0])}` : "/mock-tests"} className="btn-primary">Weak Topic Test</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
