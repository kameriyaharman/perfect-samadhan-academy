import { NextResponse } from "next/server";
import { q, one } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const STATUS = ["present", "absent", "leave", "late"];
const isDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

async function studentsOf(batch: string) {
  return q("SELECT id, name, mobile, roll_no FROM users WHERE batch=$1 AND NOT blocked ORDER BY NULLIF(regexp_replace(COALESCE(roll_no,''),'\\D','','g'),'')::bigint NULLS LAST, name", [batch]);
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const u = new URL(req.url).searchParams;
  const batch = (u.get("batch") || "").trim();
  if (!batch) return NextResponse.json({ error: "Batch chunein" }, { status: 400 });
  const students = await studentsOf(batch);

  const month = u.get("month");
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const rows = await q(
      "SELECT user_id, to_char(date,'YYYY-MM-DD') AS date, status FROM attendance WHERE batch=$1 AND date >= ($2 || '-01')::date AND date < (($2 || '-01')::date + interval '1 month') ORDER BY date",
      [batch, month]
    );
    const days = Array.from(new Set(rows.map((r: any) => r.date))).sort();
    return NextResponse.json({ students, days, rows });
  }

  const date = u.get("date");
  if (!isDate(date)) return NextResponse.json({ error: "Date galat hai" }, { status: 400 });
  const marks = await q("SELECT user_id, status, note FROM attendance WHERE batch=$1 AND date=$2", [batch, date]);
  return NextResponse.json({ students, marks });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json();
  const batch = String(b.batch || "").trim();
  if (!batch) return NextResponse.json({ error: "Batch chunein" }, { status: 400 });

  // student ko batch me jodna / hatana (mobile se)
  if (b.action === "assign" || b.action === "remove") {
    const mobile = String(b.mobile || "").replace(/\D/g, "").slice(-10);
    if (b.action === "remove") {
      await one("UPDATE users SET batch=NULL WHERE id=$1 AND batch=$2 RETURNING id", [Number(b.userId) || 0, batch]);
      return NextResponse.json({ ok: true });
    }
    if (mobile.length !== 10) return NextResponse.json({ error: "10 ankon ka mobile number daalein" }, { status: 400 });
    const u = await one("UPDATE users SET batch=$2, roll_no=COALESCE(NULLIF($3,''), roll_no) WHERE mobile=$1 RETURNING id, name", [mobile, batch, String(b.rollNo || "").trim()]);
    if (!u) return NextResponse.json({ error: "Is mobile se koi student registered nahi hai — pehle Students me jodein ya student se register karwayein" }, { status: 404 });
    return NextResponse.json({ ok: true, name: u.name });
  }

  const date = String(b.date || "");
  if (!isDate(date)) return NextResponse.json({ error: "Date galat hai" }, { status: 400 });
  const rows: { user_id: number; status: string; note?: string }[] = Array.isArray(b.rows) ? b.rows.slice(0, 1000) : [];
  let saved = 0;
  for (const r of rows) {
    const uid = Number(r.user_id) || 0;
    if (!uid) continue;
    if (!STATUS.includes(r.status)) {
      await one("DELETE FROM attendance WHERE user_id=$1 AND batch=$2 AND date=$3 RETURNING id", [uid, batch, date]);
      continue;
    }
    await one(
      "INSERT INTO attendance (user_id, batch, date, status, note) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, batch, date) DO UPDATE SET status=EXCLUDED.status, note=EXCLUDED.note RETURNING id",
      [uid, batch, date, r.status, (r.note || "").slice(0, 200) || null]
    );
    saved++;
  }
  return NextResponse.json({ ok: true, saved });
}
