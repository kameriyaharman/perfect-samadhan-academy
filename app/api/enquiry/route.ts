import { NextResponse } from "next/server";
import { one } from "@/lib/db";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim().slice(0, 80);
  const mobile = String(b.mobile || "").replace(/\D/g, "").slice(-10);
  if (name.length < 2 || mobile.length !== 10) return NextResponse.json({ error: "Naam aur sahi mobile number daalein" }, { status: 400 });
  await one("INSERT INTO enquiries (name, mobile, course, message, type) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    [name, mobile, String(b.course || "").slice(0, 120), String(b.message || "").slice(0, 2000), b.type === "callback" ? "callback" : "enquiry"]);
  return NextResponse.json({ ok: true });
}
