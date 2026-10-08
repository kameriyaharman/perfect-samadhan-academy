import { NextResponse } from "next/server";
import crypto from "crypto";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { grantOrder } from "@/lib/orders";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const o = await one("SELECT * FROM orders WHERE id=$1 AND user_id=$2", [Number(b.orderId), user.id]);
  if (!o) return NextResponse.json({ error: "Order nahi mila" }, { status: 404 });
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const sig = crypto.createHmac("sha256", secret).update(`${o.gateway_order_id}|${b.razorpay_payment_id}`).digest("hex");
  if (!secret || sig !== b.razorpay_signature) {
    await one("UPDATE orders SET status='failed' WHERE id=$1 RETURNING id", [o.id]);
    return NextResponse.json({ error: "Payment verify nahi hua" }, { status: 400 });
  }
  await one("UPDATE orders SET status='paid', gateway_payment_id=$2 WHERE id=$1 RETURNING id", [o.id, b.razorpay_payment_id]);
  await grantOrder(o.id);
  return NextResponse.json({ ok: true });
}
