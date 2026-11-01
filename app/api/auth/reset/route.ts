import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { setAuthCookie, signToken } from "@/lib/auth";

// Step 2: OTP + naya password → password badlo aur login
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const m = String(b.mobile || "").replace(/\D/g, "").slice(-10);
  const otp = String(b.otp || "").replace(/\D/g, "");
  const pass = String(b.password || "");
  if (m.length !== 10 || otp.length !== 6) return NextResponse.json({ error: "Mobile number aur 6 ankon ka OTP daalein" }, { status: 400 });
  if (pass.length < 6) return NextResponse.json({ error: "Naya password kam se kam 6 akshar ka rakhein" }, { status: 400 });
  const r = await one("SELECT * FROM password_resets WHERE mobile=$1 AND status='otp' ORDER BY id DESC LIMIT 1", [m]);
  if (!r || !r.otp_hash || new Date(r.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "OTP ka samay khatam ho gaya — naya OTP mangayein" }, { status: 400 });
  if (r.tries >= 5) return NextResponse.json({ error: "Bahut baar galat OTP — naya OTP mangayein" }, { status: 429 });
  if (!(await bcrypt.compare(otp, r.otp_hash))) {
    await one("UPDATE password_resets SET tries=tries+1 WHERE id=$1 RETURNING id", [r.id]);
    return NextResponse.json({ error: "OTP galat hai" }, { status: 400 });
  }
  await one("UPDATE users SET password=$1 WHERE id=$2 RETURNING id", [await bcrypt.hash(pass, 10), r.user_id]);
  await one("UPDATE password_resets SET status='used' WHERE mobile=$1 AND status IN ('otp','request') RETURNING id", [m]).catch(() => null);
  const u = await one("SELECT role FROM users WHERE id=$1", [r.user_id]);
  setAuthCookie(await signToken(r.user_id));
  return NextResponse.json({ ok: true, role: u?.role });
}
