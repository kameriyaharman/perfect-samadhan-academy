import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { includeOptions } from "@/lib/access";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
// Admin forms: lesson folders dropdown, test series list, plan "kya unlock hoga" picker
export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const scope = new URL(req.url).searchParams.get("scope") || "";
  const out: any = await includeOptions();
  if (scope) {
    const table = scope === "passage" ? "passages" : "mock_tests";
    out.cfolders = await q(`SELECT f.id, f.name, f.language, f.exam_slug, true AS is_free, (SELECT count(*)::int FROM ${table} x WHERE x.folder_id=f.id) n
      FROM folders f WHERE f.scope=$1 ORDER BY f.exam_slug NULLS FIRST, f.sort, f.id`, [scope]);
  }
  out.courses = await q(`SELECT c.id, c.title AS name, (SELECT count(*)::int FROM course_lessons l WHERE l.course_id=c.id) n FROM courses c ORDER BY c.sort, c.id`).catch(() => []);
  return NextResponse.json(out);
}
