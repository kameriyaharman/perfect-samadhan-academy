import { NextRequest, NextResponse } from "next/server";

const DEMO_COOKIE = "psa_demo_access";

async function tokenFor(password: string) {
  const data = new TextEncoder().encode(`psa-demo:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim();
  const password = process.env.DEMO_PASSWORD || "8654";

  if (code !== password) {
    return NextResponse.json({ ok: false, error: "Galat code. Dobara koshish karein." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, next: safeNext(body?.next) });
  res.cookies.set(DEMO_COOKIE, await tokenFor(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 din tak dobara code nahi maangega
  });
  return res;
}
