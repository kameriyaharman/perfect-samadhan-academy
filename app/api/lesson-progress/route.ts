import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  await q(`INSERT INTO lesson_progress (user_id, lesson_id, accuracy, wpm) VALUES ($1,$2,$3,$4)
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET accuracy=GREATEST(lesson_progress.accuracy, EXCLUDED.accuracy), wpm=GREATEST(lesson_progress.wpm, EXCLUDED.wpm), created_at=now()`,
    [u.id, Number(b.lessonId), Number(b.accuracy) || 0, Number(b.wpm) || 0]);
  return NextResponse.json({ ok: true });
}
