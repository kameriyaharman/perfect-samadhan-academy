import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/resources";
import { toRow } from "@/lib/adminApi";
import { grantOrder } from "@/lib/orders";

type P = { params: { resource: string; id: string } };
export async function GET(_: Request, { params }: P) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = getResource(params.resource);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  const cols = ["id", ...r.fields.filter((f) => f.type !== "password").map((f) => f.name)];
  const row = await one(`SELECT ${cols.join(",")} FROM ${r.table} WHERE id=$1`, [Number(params.id)]);
  return row ? NextResponse.json(row) : NextResponse.json({ error: "not found" }, { status: 404 });
}
export async function PUT(req: Request, { params }: P) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = getResource(params.resource);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const before = r.key === "orders" ? await one("SELECT status FROM orders WHERE id=$1", [Number(params.id)]) : null;
    const row = await toRow(r, await req.json(), false);
    const cols = Object.keys(row);
    if (!cols.length) return NextResponse.json({ ok: true });
    const extra = r.table === "materials" ? ", updated_at=now()" : "";
    await one(`UPDATE ${r.table} SET ${cols.map((c, i) => `${c}=$${i + 2}`).join(",")}${extra} WHERE id=$1 RETURNING id`, [Number(params.id), ...cols.map((c) => row[c])]);
    if (r.key === "orders" && row.status === "paid" && before?.status !== "paid") await grantOrder(Number(params.id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "23505" ? "Duplicate value" : e.message }, { status: 400 });
  }
}
export async function DELETE(_: Request, { params }: P) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = getResource(params.resource);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (r.key === "users" && Number(params.id) === me.id) return NextResponse.json({ error: "Apna khud ka account delete nahi kar sakte" }, { status: 400 });
  await one(`DELETE FROM ${r.table} WHERE id=$1 RETURNING id`, [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
