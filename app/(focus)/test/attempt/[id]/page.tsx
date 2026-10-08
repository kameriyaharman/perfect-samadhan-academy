import { notFound, redirect } from "next/navigation";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { loadQuestions } from "@/lib/tests";
import CBT from "@/components/test/CBT";

export const metadata = { title: "Online Test" };

export default async function Attempt({ params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) redirect(`/login?next=/test/attempt/${params.id}`);
  const a = await one("SELECT * FROM attempts WHERE id=$1 AND user_id=$2", [Number(params.id) || 0, user.id]);
  if (!a) notFound();
  if (a.status !== "in_progress") redirect(`/test/result/${a.id}`);
  const endAt = new Date(a.started_at).getTime() + a.duration * 60 * 1000;
  if (Date.now() > endAt + 5000) redirect(`/test/result/${a.id}?autosubmit=1`);
  const qs = (await loadQuestions(JSON.parse(a.question_ids))).map((x) => ({
    id: x.id, section: x.section, topic: x.topic, hi: x.text_hi, en: x.text_en,
    oh: [x.opt_a_hi, x.opt_b_hi, x.opt_c_hi, x.opt_d_hi], oe: [x.opt_a_en, x.opt_b_en, x.opt_c_en, x.opt_d_en],
  }));
  const neg = a.test_id ? (await one("SELECT negative, marks_per_q FROM mock_tests WHERE id=$1", [a.test_id])) : null;
  return (
    <CBT attempt={{ id: a.id, title: a.title, duration: a.duration, endAt, language: a.language, answers: JSON.parse(a.answers), marked: JSON.parse(a.marked), visited: JSON.parse(a.visited), negative: neg?.negative || 0, mpq: neg?.marks_per_q || 1 }}
      questions={qs} user={{ name: user.name, roll: `PSA-${new Date().getFullYear()}-${String(user.id).padStart(4, "0")}` }} />
  );
}
