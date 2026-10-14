import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SECRET_SETTINGS } from "@/lib/payments";
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json();
  for (const [k, v] of Object.entries(b)) {
    if (!/^[a-z0-9_]{1,40}$/.test(k)) continue;
    if (SECRET_SETTINGS.includes(k) && !String(v ?? "").trim()) continue; // khali chhoda = purana secret rahe
    await one("INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value RETURNING key", [k, SECRET_SETTINGS.includes(k) || k === "razorpay_key_id" ? String(v ?? "").trim() : String(v ?? "")]);
  }
  return NextResponse.json({ ok: true });
}
