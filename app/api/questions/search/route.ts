import { NextResponse } from "next/server";
import { keywordSearch } from "@/lib/keywordSearch";

const list = (v: string | null) => (v ? v.split("|").map((x) => x.trim()).filter(Boolean).slice(0, 100) : []);

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const s = u.get("q")?.trim() || "";
  if (s.length < 2) return NextResponse.json({ count: 0, items: [], sources: [], topics: [] });
  return NextResponse.json(await keywordSearch({ keyword: s, sources: list(u.get("src")), topics: list(u.get("topic")) }));
}
