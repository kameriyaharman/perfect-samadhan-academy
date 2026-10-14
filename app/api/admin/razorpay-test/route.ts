import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getRazorpay } from "@/lib/payments";

// Admin: saved Razorpay keys sahi hain ya nahi — Razorpay se ek chhota read request karke check
export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rz = await getRazorpay();
  if (!rz) return NextResponse.json({ ok: false, error: "Razorpay keys save nahi hain ya online payment band hai." });
  try {
    const r = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: { Authorization: "Basic " + Buffer.from(`${rz.key}:${rz.secret}`).toString("base64") },
      cache: "no-store",
    });
    if (r.ok) return NextResponse.json({ ok: true, mode: rz.key.startsWith("rzp_live_") ? "live" : "test" });
    const j = await r.json().catch(() => null);
    return NextResponse.json({ ok: false, error: j?.error?.description || `Razorpay ne mana kiya (HTTP ${r.status}) — Key ID / Secret check karein.` });
  } catch {
    return NextResponse.json({ ok: false, error: "Razorpay se connect nahi ho paya, thodi der baad try karein." });
  }
}
