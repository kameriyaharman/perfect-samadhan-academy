import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { applyCoupon, grantOrder, resolveItem } from "@/lib/orders";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json();
  const it = await resolveItem(b.item);
  if (!it) return NextResponse.json({ error: "Item nahi mila" }, { status: 404 });
  const name = String(b.name || user.name).slice(0, 80);
  const mobile = String(b.mobile || user.mobile).replace(/\D/g, "").slice(-10);
  const c = await applyCoupon(b.coupon, it.price);
  const amount = Math.max(0, it.price - c.discount);
  const o = await one(`INSERT INTO orders (user_id, item, item_name, name, mobile, email, amount, coupon, method, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING id`,
    [user.id, `${it.kind}:${it.slug}`, it.name + (b.mode ? ` (${b.mode})` : ""), name, mobile, b.email || user.email, amount, c.code, String(b.method || "UPI").slice(0, 20)]);
  if (amount === 0) {
    await one("UPDATE orders SET status='paid' WHERE id=$1 RETURNING id", [o.id]);
    await grantOrder(o.id);
    return NextResponse.json({ orderId: o.id, paid: true });
  }
  const key = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  if (key && secret) {
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64") },
      body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt: `psa_${o.id}` }),
    });
    const j = await r.json();
    if (!r.ok) return NextResponse.json({ error: j?.error?.description || "Payment gateway error" }, { status: 502 });
    await one("UPDATE orders SET gateway_order_id=$2 WHERE id=$1 RETURNING id", [o.id, j.id]);
    return NextResponse.json({ orderId: o.id, razorpay: { key, order_id: j.id, amount: amount * 100, name, mobile, email: b.email || "" } });
  }
  return NextResponse.json({ orderId: o.id, manual: true, amount });
}
