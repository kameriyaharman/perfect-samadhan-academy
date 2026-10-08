import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE } from "@/lib/auth";
export async function POST() {
  cookies().delete(COOKIE);
  return NextResponse.json({ ok: true });
}
export async function GET(req: Request) {
  cookies().delete(COOKIE);
  return NextResponse.redirect(new URL("/", req.url));
}
