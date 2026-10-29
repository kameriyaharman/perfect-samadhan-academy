import { notFound, redirect } from "next/navigation";
import { one, q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canTest, getAccess } from "@/lib/access";
import { listHref, KIND_PAGE } from "@/lib/testNav";
import FocusBar from "@/components/FocusBar";
import LockedNotice from "@/components/typing/LockedNotice";
import PracticePlayer from "@/components/test/PracticePlayer";

export const dynamic = "force-dynamic";

export default async function Practice({ params }: { params: { id: string } }) {
  const t = await one(`SELECT m.*, f.name AS folder_name FROM mock_tests m LEFT JOIN folders f ON f.id=m.folder_id WHERE m.id=$1 AND m.active`, [Number(params.id) || 0]);
  if (!t) notFound();
  if (t.mode === "exam") redirect(`/test/${t.id}`);
  const back = listHref(t);
  const user = await getUser();
  if (!canTest(await getAccess(user), t)) return <LockedNotice title={t.title} loggedIn={!!user} back={back} next={`/test/practice/${t.id}`} />;
  const rows = await q(`SELECT id, section, text_hi, text_en, opt_a_hi, opt_a_en, opt_b_hi, opt_b_en, opt_c_hi, opt_c_en, opt_d_hi, opt_d_en, opt_e_hi, opt_e_en, answer, explanation
    FROM questions WHERE test_id=$1 ORDER BY sort, id`, [t.id]);
  const questions = rows.map((r: any) => ({
    id: r.id, section: r.section, text_hi: r.text_hi, text_en: r.text_en, answer: r.answer, explanation: r.explanation,
    opts: ["a", "b", "c", "d", "e"].map((k) => ({ hi: r[`opt_${k}_hi`], en: r[`opt_${k}_en`] })).filter((o) => o.hi),
  }));
  // isi folder (ya isi exam + type) ke pichle / agle test
  const sib = await q(`SELECT id, title FROM mock_tests WHERE active AND mode<>'exam' AND kind=$1 AND exam_slug=$2 AND folder_id IS NOT DISTINCT FROM $3 ORDER BY sort, id`, [t.kind, t.exam_slug, t.folder_id]);
  const i = sib.findIndex((x: any) => x.id === t.id);
  return (
    <>
      <FocusBar crumbs={[{ label: KIND_PAGE[t.kind] || "Mock Tests", href: back }, { label: t.title }]} />
      <PracticePlayer test={{ id: t.id, title: t.title, duration: t.duration, marks_per_q: t.marks_per_q, negative: t.negative, folder: t.folder_name }}
        questions={questions} prev={i > 0 ? sib[i - 1] : null} next={i >= 0 && i < sib.length - 1 ? sib[i + 1] : null} back={back} backLabel={KIND_PAGE[t.kind] || "Mock Tests"} />
    </>
  );
}
