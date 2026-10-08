import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { setAuthCookie, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim().slice(0, 80);
  const m = String(b.mobile || "").replace(/\D/g, "").slice(-10);
  const password = String(b.password || "");
  if (name.length < 2) return NextResponse.json({ error: "Apna naam daalein" }, { status: 400 });
  if (!/^[6-9]\d{9}$/.test(m)) return NextResponse.json({ error: "Sahi 10 digit mobile number daalein" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password kam se kam 6 akshar ka ho" }, { status: 400 });
  const ex = await one("SELECT id FROM users WHERE mobile=$1", [m]);
  if (ex) return NextResponse.json({ error: "Is number se account pehle se hai — Login karein" }, { status: 409 });
  const u = await one("INSERT INTO users (name, mobile, email, city, target_exam, password) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
    [name, m, b.email || null, b.city || null, b.targetExam || null, await bcrypt.hash(password, 10)]);
  setAuthCookie(await signToken(u.id));
  return NextResponse.json({ ok: true });
}
