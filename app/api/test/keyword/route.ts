import { NextResponse } from "next/server";
import { keywordLocked, keywordPick } from "@/lib/keywordSearch";
import { getUser, isPremium } from "@/lib/auth";
import { createAttempt } from "@/lib/tests";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const kw = String(b.keyword || "").trim().slice(0, 120);
  const n = Math.min(100, Math.max(5, Number(b.count) || 10));
  if (kw.length < 2) return NextResponse.json({ error: "Keyword daalein" }, { status: 400 });
  if (!isPremium(user) && (await keywordLocked(kw))) return NextResponse.json({ error: "premium" }, { status: 402 });
  const arr = (v: any) => (Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 100) : []);
  const sources = arr(b.sources), topics = arr(b.topics);
  const rows = await keywordPick({ keyword: kw, sources, topics }, n);
  if (!rows.length) return NextResponse.json({ error: "Is keyword par sawal nahi mile" }, { status: 404 });
  const id = await createAttempt(user.id, { title: `Keyword Test — ${kw}${sources.length === 1 ? ` (${sources[0]})` : sources.length ? ` (${sources.length} papers)` : ""}`, kind: "keyword", duration: Math.max(5, rows.length), questionIds: rows.map((r: any) => r.id), language: b.language === "en" ? "en" : "hi", keyword: kw });
  return NextResponse.json({ attemptId: id });
}
