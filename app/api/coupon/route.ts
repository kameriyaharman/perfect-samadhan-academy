import { NextResponse } from "next/server";
import { applyCoupon, resolveItem } from "@/lib/orders";
import { getUser } from "@/lib/auth";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const it = await resolveItem(u.searchParams.get("item") || "");
  if (!it) return NextResponse.json({ error: "Item nahi mila" }, { status: 404 });
  const user = await getUser();
  const r = await applyCoupon(u.searchParams.get("code") || "", it.price, { kind: it.kind, showCoupon: it.showCoupon, userId: user?.id, premiumTill: user?.premium_till });
  if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json(r);
}
