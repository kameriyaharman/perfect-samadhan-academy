import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { gradeAttempt } from "@/lib/tests";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const a = await one("SELECT * FROM attempts WHERE id=$1 AND user_id=$2", [Number(b.attemptId), user.id]);
  if (!a) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (a.status === "in_progress") {
    if (b.answers) await one("UPDATE attempts SET answers=$2, marked=$3 WHERE id=$1 RETURNING id", [a.id, JSON.stringify(b.answers), JSON.stringify(b.marked || [])]);
    await gradeAttempt(a.id);
  }
  return NextResponse.json({ ok: true, attemptId: a.id });
}
