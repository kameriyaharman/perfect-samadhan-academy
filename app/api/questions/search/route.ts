import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET(req: Request) {
  const s = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (s.length < 2) return NextResponse.json({ count: 0, items: [] });
  const words = s.split(/\s+/).slice(0, 4);
  const conds = words.map((_, i) => `(text_hi ILIKE $${i + 1} OR text_en ILIKE $${i + 1} OR keywords ILIKE $${i + 1} OR topic ILIKE $${i + 1})`).join(" OR ");
  const rows = await q(`SELECT DISTINCT ON (text_hi) id, text_hi, source, topic FROM questions WHERE ${conds} ORDER BY text_hi, id LIMIT 200`, words.map((w) => `%${w}%`));
  return NextResponse.json({ count: rows.length, items: rows.slice(0, 8) });
}
