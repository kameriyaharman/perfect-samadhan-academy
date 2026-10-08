import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const a = await one("UPDATE attempts SET answers=$3, marked=$4, visited=$5, language=$6 WHERE id=$1 AND user_id=$2 AND status='in_progress' RETURNING id",
    [Number(b.attemptId), user.id, JSON.stringify(b.answers || {}), JSON.stringify(b.marked || []), JSON.stringify(b.visited || []), b.language === "en" ? "en" : "hi"]);
  return NextResponse.json({ ok: !!a });
}
