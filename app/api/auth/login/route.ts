import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { setAuthCookie, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { mobile, password } = await req.json().catch(() => ({}));
  const m = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (m.length !== 10 || !password) return NextResponse.json({ error: "Mobile number aur password daalein" }, { status: 400 });
  const u = await one("SELECT id, password, blocked, role FROM users WHERE mobile=$1", [m]);
  if (!u || !(await bcrypt.compare(String(password), u.password))) return NextResponse.json({ error: "Mobile number ya password galat hai" }, { status: 401 });
  if (u.blocked) return NextResponse.json({ error: "Account block hai — admin se sampark karein" }, { status: 403 });
  setAuthCookie(await signToken(u.id));
  return NextResponse.json({ ok: true, role: u.role });
}
