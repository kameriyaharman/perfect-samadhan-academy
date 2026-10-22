import { NextResponse } from "next/server";
import { one, q } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/resources";
import { listWhere } from "@/lib/adminApi";

// Ek saath kai records: delete / lock (premium) / unlock (free).
// body: { action, ids: number[] }  ya  { action, all: true, filter: {q, kind, test_id …} } (filter ke sabhi records)
export async function POST(req: Request, { params }: { params: { resource: string } }) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = getResource(params.resource);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action || "");
  const hasFree = r.fields.some((f) => f.name === "is_free");
  const isMove = action === "move" && r.key === "lessons";
  if (!isMove && (!["delete", "lock", "unlock"].includes(action) || (action !== "delete" && !hasFree))) return NextResponse.json({ error: "Galat action" }, { status: 400 });

  let where: string; let args: any[];
  if (b.all) {
    const w = listWhere(r, b.filter || {});
    where = w.sql || "WHERE true"; args = w.args;
  } else {
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n: number) => n > 0).slice(0, 5000);
    if (!ids.length) return NextResponse.json({ error: "Kuch select nahi kiya" }, { status: 400 });
    where = "WHERE id = ANY($1::int[])"; args = [ids];
  }
  // apna admin account kabhi delete na ho
  if (r.key === "users" && action === "delete") { args.push(me.id); where += ` AND id <> $${args.length}`; }

  if (isMove) {
    const fid = Number(b.folder_id) || 0;
    const fo = fid ? await one("SELECT id, layout FROM lesson_folders WHERE id=$1", [fid]) : null;
    if (fid && !fo) return NextResponse.json({ error: "Folder nahi mila" }, { status: 400 });
    args.push(fo ? fo.id : null);
    const rows = fo
      ? await q(`UPDATE lessons SET folder_id=$${args.length}, layout='${fo.layout === "english" ? "english" : fo.layout === "inscript" ? "inscript" : "remington"}' ${where} RETURNING id`, args)
      : await q(`UPDATE lessons SET folder_id=$${args.length} ${where} RETURNING id`, args);
    return NextResponse.json({ ok: true, n: rows.length });
  }
  if (action === "delete") {
    const res = await one(`WITH d AS (DELETE FROM ${r.table} ${where} RETURNING 1) SELECT count(*)::int n FROM d`, args);
    return NextResponse.json({ ok: true, n: res?.n || 0 });
  }
  const rows = await q(`UPDATE ${r.table} SET is_free=${action === "unlock" ? "true" : "false"} ${where} RETURNING id`, args);
  return NextResponse.json({ ok: true, n: rows.length });
}
