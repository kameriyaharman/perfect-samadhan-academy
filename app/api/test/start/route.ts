import { NextResponse } from "next/server";
import { one, q } from "@/lib/db";
import { getUser, isPremium } from "@/lib/auth";
import { createAttempt } from "@/lib/tests";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const t = await one("SELECT * FROM mock_tests WHERE id=$1 AND active", [Number(b.testId)]);
  if (!t) return NextResponse.json({ error: "Test nahi mila" }, { status: 404 });
  if (!t.is_free && !isPremium(user)) return NextResponse.json({ error: "premium" }, { status: 402 });
  const ex = await one("SELECT id FROM attempts WHERE user_id=$1 AND test_id=$2 AND status='in_progress' ORDER BY id DESC LIMIT 1", [user.id, t.id]);
  if (ex) return NextResponse.json({ attemptId: ex.id });
  const qs = await q("SELECT id FROM questions WHERE test_id=$1 ORDER BY sort, id", [t.id]);
  if (!qs.length) return NextResponse.json({ error: "Is test me abhi questions nahi hain" }, { status: 400 });
  const id = await createAttempt(user.id, { testId: t.id, title: t.title, kind: t.kind, duration: t.duration, questionIds: qs.map((x: any) => x.id), language: b.language === "en" ? "en" : "hi" });
  return NextResponse.json({ attemptId: id });
}
