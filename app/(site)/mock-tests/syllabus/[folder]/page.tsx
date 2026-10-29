import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, FileQuestion, Lock, MonitorPlay, Zap } from "lucide-react";
import { one, q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canTest, getAccess } from "@/lib/access";
import { testsOf } from "@/lib/testLists";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import AdSlot from "@/components/ads/AdSlot";

export default async function SyllabusFolder({ params, searchParams }: { params: { folder: string }; searchParams: { exam?: string } }) {
  const fid = Number(params.folder) || 0;
  const f = fid ? await one("SELECT * FROM folders WHERE id=$1 AND scope='test:syllabus' AND active", [fid]) : null;
  if (fid && !f) notFound();
  const exam = f?.exam_slug || searchParams.exam || "cpct";
  const tests = fid
    ? await q(`SELECT m.*, (SELECT count(*)::int FROM questions WHERE test_id=m.id) qn FROM mock_tests m WHERE m.kind='topic' AND m.active AND m.folder_id=$1 ORDER BY m.sort, m.id`, [fid])
    : await testsOf("topic", exam, `AND (m.folder_id IS NULL OR m.folder_id NOT IN (SELECT id FROM folders WHERE active))`);
  const acc = await getAccess(await getUser());
  const name = f?.name || "Aur Topic Tests";
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Syllabus Wise", href: `/mock-tests/syllabus?exam=${exam}` }, { label: name }]} title={name} highlight="" subtitle={f?.description || `${tests.length} topic tests — ek-ek topic par practice karein, turant sahi / galat dekhein.`} compact />
      <Container className="py-10">
        <AdSlot place="Mock Test" />
        {!tests.length ? <Empty /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((t: any, i: number) => {
              const ok = canTest(acc, t);
              return (
                <div key={t.id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-bold text-brand">{i + 1}</span>
                    {t.is_free ? <span className="chip bg-green-50 text-green-700">Free</span> : <span className="chip bg-orange-50 text-orange-700"><Lock className="h-3 w-3" />Premium</span>}
                  </div>
                  <b className="hi mt-3 block text-[16px] leading-snug">{t.topic || t.title}</b>
                  {t.topic && t.title !== t.topic && <span className="hi text-sm text-muted">{t.title}</span>}
                  <div className="mt-2 flex gap-4 text-sm text-muted"><span className="flex items-center gap-1"><FileQuestion className="h-4 w-4" />{t.qn} Q</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{t.duration} min</span></div>
                  <div className="mt-auto flex gap-2 pt-4">
                    {!ok ? <Link href="/plans" className="btn-orange btn-sm flex-1 justify-center"><Lock className="h-3.5 w-3.5" />Unlock</Link> : <>
                      {t.mode !== "exam" && <Link href={`/test/practice/${t.id}`} className="btn-primary btn-sm flex-1 justify-center"><Zap className="h-3.5 w-3.5" />Practice</Link>}
                      {t.mode !== "practice" && <Link href={`/test/${t.id}`} className="btn-soft btn-sm flex-1 justify-center"><MonitorPlay className="h-3.5 w-3.5" />Exam Mode</Link>}
                    </>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <AdSlot place="Mock Test" pos="bottom" />
      </Container>
    </>
  );
}
