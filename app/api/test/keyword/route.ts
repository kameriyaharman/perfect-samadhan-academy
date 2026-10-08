import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createAttempt } from "@/lib/tests";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const kw = String(b.keyword || "").trim().slice(0, 60);
  const n = Math.min(50, Math.max(5, Number(b.count) || 10));
  const words = kw.split(/\s+/).filter(Boolean).slice(0, 4);
  if (!words.length) return NextResponse.json({ error: "Keyword daalein" }, { status: 400 });
  const conds = words.map((_, i) => `(text_hi ILIKE $${i + 1} OR text_en ILIKE $${i + 1} OR keywords ILIKE $${i + 1} OR topic ILIKE $${i + 1})`).join(" OR ");
  const rows = await q(`SELECT id FROM (SELECT DISTINCT ON (text_hi) id, text_hi FROM questions WHERE ${conds} ORDER BY text_hi, id) x ORDER BY random() LIMIT ${n}`, words.map((w) => `%${w}%`));
  if (!rows.length) return NextResponse.json({ error: "Is keyword par sawal nahi mile" }, { status: 404 });
  const id = await createAttempt(user.id, { title: `Keyword Test — ${kw}`, kind: "keyword", duration: Math.max(5, rows.length), questionIds: rows.map((r: any) => r.id), language: b.language === "en" ? "en" : "hi", keyword: kw });
  return NextResponse.json({ attemptId: id });
}
