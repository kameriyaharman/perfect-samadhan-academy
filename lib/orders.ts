import { one } from "./db";

export async function resolveItem(item: string) {
  const [kind, slug] = String(item || "").split(":");
  if (kind === "plan") { const p = await one("SELECT * FROM plans WHERE slug=$1 AND active", [slug]); return p ? { kind, slug, name: p.name, price: p.price, sub: `Validity ${p.validity_days >= 365 ? Math.round(p.validity_days / 365) + " saal" : p.validity_days + " din"}`, icon: "plan" } : null; }
  if (kind === "course") { const c = await one("SELECT * FROM courses WHERE slug=$1 AND active", [slug]); return c ? { kind, slug, name: c.title, price: c.price, sub: `${c.mode} · ${c.duration}`, icon: "course" } : null; }
  if (kind === "material") { const m = await one("SELECT * FROM materials WHERE slug=$1 AND active", [slug]); return m ? { kind, slug, name: m.title, price: m.price || 99, sub: "PDF · Lifetime access", icon: "pdf" } : null; }
  return null;
}

export async function applyCoupon(code: string | undefined, amount: number) {
  if (!code) return { discount: 0, code: null as string | null };
  const c = await one("SELECT * FROM coupons WHERE upper(code)=upper($1) AND active", [code.trim()]);
  if (!c) return { discount: 0, code: null, error: "Coupon valid nahi hai" };
  const d = c.is_percent ? Math.round((amount * c.discount) / 100) : c.discount;
  return { discount: Math.min(d, amount), code: c.code as string };
}

export async function grantOrder(orderId: number) {
  const o = await one("SELECT * FROM orders WHERE id=$1", [orderId]);
  if (!o || !o.user_id) return;
  const [kind, slug] = o.item.split(":");
  if (kind === "plan") {
    const p = await one("SELECT * FROM plans WHERE slug=$1", [slug]);
    const days = p?.validity_days || 365;
    await one(`UPDATE users SET premium_plan=$2, premium_till = GREATEST(COALESCE(premium_till, now()), now()) + ($3 || ' days')::interval WHERE id=$1 RETURNING id`, [o.user_id, p?.name || slug, String(days)]);
  }
}
