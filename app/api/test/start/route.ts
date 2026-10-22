import { NextResponse } from "next/server";
import { one, q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canTest, getAccess } from "@/lib/access";
import { createAttempt, gradeAttempt } from "@/lib/tests";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const t = await one("SELECT * FROM mock_tests WHERE id=$1 AND active", [Number(b.testId)]);
  if (!t) return NextResponse.json({ error: "Test nahi mila" }, { status: 404 });
  if (!canTest(await getAccess(user), t)) return NextResponse.json({ error: "premium" }, { status: 402 });
  // Purana adhoora attempt: time bacha hai to wahi resume (dusre computer par bhi), warna use band karke naya test shuru.
  // (Pehle expired attempt resume ho jata tha aur turant 0 marks ke saath submit ho jata tha.)
  const old = await q("SELECT id, started_at, duration FROM attempts WHERE user_id=$1 AND test_id=$2 AND status='in_progress' ORDER BY id DESC", [user.id, t.id]);
  for (const a of old) {
    const endAt = new Date(a.started_at).getTime() + a.duration * 60 * 1000;
    if (endAt - Date.now() > 60 * 1000) return NextResponse.json({ attemptId: a.id, resumed: true });
    await gradeAttempt(a.id);
  }
  const qs = await q("SELECT id FROM questions WHERE test_id=$1 ORDER BY sort, id", [t.id]);
  if (!qs.length) return NextResponse.json({ error: "Is test me abhi questions nahi hain" }, { status: 400 });
  const id = await createAttempt(user.id, { testId: t.id, title: t.title, kind: t.kind, duration: t.duration, questionIds: qs.map((x: any) => x.id), language: b.language === "en" ? "en" : "hi" });
  return NextResponse.json({ attemptId: id });
}
