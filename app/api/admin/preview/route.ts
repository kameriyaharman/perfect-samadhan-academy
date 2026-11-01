import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { PREVIEW_COOKIE } from "@/lib/access";

// Admin: "Student ki nazar se dekhein" — premium/lock wahi dikhenge jo free student ko dikhte hain
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { on } = await req.json().catch(() => ({ on: false }));
  if (on) cookies().set(PREVIEW_COOKIE, "1", { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 8 });
  else cookies().delete(PREVIEW_COOKIE);
  return NextResponse.json({ ok: true });
}
