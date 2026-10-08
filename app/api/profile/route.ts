import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const name = String(b.name || "").trim().slice(0, 80);
  if (name.length < 2) return NextResponse.json({ error: "Naam daalein" }, { status: 400 });
  await one("UPDATE users SET name=$2, email=$3, city=$4, target_exam=$5, exam_date=$6 WHERE id=$1 RETURNING id", [u.id, name, b.email || null, b.city || null, b.target_exam || null, b.exam_date || null]);
  if (b.password) {
    if (String(b.password).length < 6) return NextResponse.json({ error: "Password 6+ akshar ka ho" }, { status: 400 });
    await one("UPDATE users SET password=$2 WHERE id=$1 RETURNING id", [u.id, await bcrypt.hash(String(b.password), 10)]);
  }
  return NextResponse.json({ ok: true });
}
