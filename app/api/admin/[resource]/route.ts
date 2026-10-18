import { NextResponse } from "next/server";
import { q, one } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/resources";
import { listWhere, toRow } from "@/lib/adminApi";

export async function GET(req: Request, { params }: { params: { resource: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = getResource(params.resource);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  const u = new URL(req.url);
  const page = Math.max(1, Number(u.searchParams.get("page")) || 1);
  const per = Math.min(100, Number(u.searchParams.get("per")) || 25);
  const { sql: w, args } = listWhere(r, u.searchParams);
  const cols = ["id", ...r.fields.filter((f) => f.list && f.type !== "password").map((f) => f.name)];
  const [rows, total] = await Promise.all([
    q(`SELECT ${cols.join(",")} FROM ${r.table} ${w} ORDER BY ${r.order} LIMIT ${per} OFFSET ${(page - 1) * per}`, args),
    one(`SELECT count(*)::int n FROM ${r.table} ${w}`, args),
  ]);
  return NextResponse.json({ rows, total: total.n });
}

export async function POST(req: Request, { params }: { params: { resource: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = getResource(params.resource);
  if (!r || r.noCreate) return NextResponse.json({ error: "not allowed" }, { status: 400 });
  try {
    const row = await toRow(r, await req.json(), true);
    const cols = Object.keys(row);
    const res = await one(`INSERT INTO ${r.table} (${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")}) RETURNING id`, cols.map((c) => row[c]));
    return NextResponse.json({ id: res.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "23505" ? "Yeh value pehle se maujood hai (duplicate)" : e.message }, { status: 400 });
  }
}
