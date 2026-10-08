import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { q, one } from "@/lib/db";
import { createAttempt } from "@/lib/tests";

export default async function Quiz() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mock-tests/quiz");
  const today = new Date().toISOString().slice(0, 10);
  const title = `Daily Quiz — ${today}`;
  const ex = await one(`SELECT id, status FROM attempts WHERE user_id=$1 AND title=$2 ORDER BY id DESC LIMIT 1`, [user.id, title]);
  if (ex) redirect(ex.status === "submitted" ? `/test/result/${ex.id}` : `/test/attempt/${ex.id}`);
  const rows = await q(`SELECT DISTINCT ON (text_hi) id, text_hi FROM questions WHERE section IN ('Computer','Reasoning','General Awareness','Maths') ORDER BY text_hi, id`);
  const seed = Number(today.replace(/-/g, ""));
  const picked = rows.map((r: any) => r.id).sort((a: number, b: number) => ((a * 9301 + seed) % 233280) - ((b * 9301 + seed) % 233280)).slice(0, 10);
  const id = await createAttempt(user.id, { title, kind: "quiz", duration: 10, questionIds: picked });
  redirect(`/test/attempt/${id}`);
}
