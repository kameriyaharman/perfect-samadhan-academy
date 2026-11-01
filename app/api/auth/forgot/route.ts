import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { sendOtp, smsConfig } from "@/lib/sms";

// Step 1: mobile number → OTP SMS (ya SMS band ho to admin ke paas reset request)
export async function POST(req: Request) {
  const { mobile } = await req.json().catch(() => ({}));
  const m = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (m.length !== 10) return NextResponse.json({ error: "10 ankon ka mobile number daalein" }, { status: 400 });
  const u = await one("SELECT id, blocked FROM users WHERE mobile=$1", [m]);
  if (!u) return NextResponse.json({ error: "Is mobile number se koi account nahi hai — pehle Register karein" }, { status: 404 });
  if (u.blocked) return NextResponse.json({ error: "Account block hai — admin se sampark karein" }, { status: 403 });
  // ek ghante me 3 se zyada OTP nahi
  const recent = await one("SELECT count(*)::int n FROM password_resets WHERE mobile=$1 AND created_at > now() - interval '1 hour'", [m]);
  if ((recent?.n || 0) >= 3) return NextResponse.json({ error: "Bahut baar koshish ho chuki — 1 ghante baad dobara try karein" }, { status: 429 });
  const sms = await smsConfig();
  if (!sms.on) {
    await one("INSERT INTO password_resets (user_id, mobile, status) VALUES ($1,$2,'request') RETURNING id", [u.id, m]);
    return NextResponse.json({ request: true });
  }
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const sent = await sendOtp(m, otp, sms.key);
  if (!sent.ok) {
    await one("INSERT INTO password_resets (user_id, mobile, status) VALUES ($1,$2,'request') RETURNING id", [u.id, m]);
    console.error("OTP SMS failed:", sent.error);
    return NextResponse.json({ request: true, smsFailed: true });
  }
  await one("INSERT INTO password_resets (user_id, mobile, otp_hash, status, expires_at) VALUES ($1,$2,$3,'otp', now() + interval '10 minutes') RETURNING id", [u.id, m, await bcrypt.hash(otp, 8)]);
  return NextResponse.json({ sent: true });
}
