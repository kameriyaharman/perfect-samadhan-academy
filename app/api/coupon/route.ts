import { NextResponse } from "next/server";
import { applyCoupon, resolveItem } from "@/lib/orders";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const it = await resolveItem(u.searchParams.get("item") || "");
  if (!it) return NextResponse.json({ error: "Item nahi mila" }, { status: 404 });
  const r = await applyCoupon(u.searchParams.get("code") || "", it.price);
  if ((r as any).error) return NextResponse.json({ error: (r as any).error }, { status: 400 });
  return NextResponse.json(r);
}
