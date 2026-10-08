import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/auth";

function clear(r: NextResponse) {
  r.cookies.set(COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" });
  return r;
}
export async function POST() {
  return clear(NextResponse.json({ ok: true }));
}
export async function GET() {
  return clear(new NextResponse(null, { status: 302, headers: { Location: "/", "Cache-Control": "no-store" } }));
}
