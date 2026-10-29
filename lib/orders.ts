import { one, q } from "./db";

export async function resolveItem(item: string) {
  const [kind, slug] = String(item || "").split(":");
  if (kind === "plan") { const p = await one("SELECT * FROM plans WHERE slug=$1 AND active", [slug]); return p ? { kind, slug, name: p.name, price: p.price, sub: `Validity ${p.validity_days >= 365 ? Math.round(p.validity_days / 365) + " saal" : p.validity_days + " din"}`, icon: "plan", showCoupon: p.show_coupon !== false } : null; }
  if (kind === "course") { const c = await one("SELECT * FROM courses WHERE slug=$1 AND active", [slug]); return c ? { kind, slug, name: c.title, price: c.price, sub: `${c.mode} · ${c.duration}`, icon: "course", showCoupon: c.show_coupon !== false } : null; }
  if (kind === "material") { const m = await one("SELECT * FROM materials WHERE slug=$1 AND active", [slug]); return m ? { kind, slug, name: m.title, price: m.price || 99, sub: "PDF · Lifetime access", icon: "pdf", showCoupon: true } : null; }
  return null;
}

/** aaj ki tareekh (India) — YYYY-MM-DD */
export const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
type Ctx = { kind?: string; showCoupon?: boolean; userId?: number | null; premiumTill?: string | null };
type CouponResult = { discount: number; code: string | null; error?: string };

/** Coupon ke saare niyam: tareekh, product, limit, user type, validity extension, max discount */
export async function applyCoupon(code: string | undefined, amount: number, ctx: Ctx = {}): Promise<CouponResult> {
  if (!code || !String(code).trim()) return { discount: 0, code: null };
  const c = await one("SELECT * FROM coupons WHERE upper(code)=upper($1) AND active", [String(code).trim()]);
  const no = (error: string): CouponResult => ({ discount: 0, code: null, error });
  if (!c) return no("Coupon valid nahi hai");
  if (ctx.showCoupon === false) return no("Is product par coupon nahi lagta");
  const today = todayIST();
  if (c.starts_at && today < String(c.starts_at).slice(0, 10)) return no("Ye coupon abhi shuru nahi hua");
  if (c.expires_at && today > String(c.expires_at).slice(0, 10)) return no("Ye coupon expire ho gaya");
  if (ctx.kind && c.product_type && c.product_type !== "all" && c.product_type !== ctx.kind) return no(`Ye coupon sirf ${({ plan: "Premium Plans", course: "Courses", material: "PDFs" } as any)[c.product_type] || c.product_type} par lagta hai`);
  if (c.max_uses) {
    const n = await one("SELECT count(*)::int n FROM orders WHERE status='paid' AND upper(coupon)=upper($1)", [c.code]);
    if ((n?.n || 0) >= c.max_uses) return no("Is coupon ki limit poori ho gayi");
  }
  if (c.per_user || (c.user_type && c.user_type !== "all") || c.on_extension === false) {
    if (!ctx.userId) return no("Coupon lagane ke liye login karein");
    if (c.per_user) {
      const n = await one("SELECT count(*)::int n FROM orders WHERE status='paid' AND user_id=$1 AND upper(coupon)=upper($2)", [ctx.userId, c.code]);
      if ((n?.n || 0) >= c.per_user) return no("Aap ye coupon pehle hi use kar chuke hain");
    }
    if (c.user_type === "new" || c.user_type === "existing") {
      const bought = await one("SELECT 1 FROM orders WHERE status='paid' AND user_id=$1 LIMIT 1", [ctx.userId]);
      if (c.user_type === "new" && bought) return no("Ye coupon sirf naye students ke liye hai");
      if (c.user_type === "existing" && !bought) return no("Ye coupon sirf purane students ke liye hai");
    }
    if (c.on_extension === false && ctx.kind === "plan" && ctx.premiumTill && new Date(ctx.premiumTill).getTime() > Date.now()) return no("Premium pehle se chalu hai — ye coupon validity badhane par nahi lagta");
  }
  const pct = c.discount_type ? c.discount_type === "percent" : !!c.is_percent;
  let d = pct ? Math.round((amount * c.discount) / 100) : c.discount;
  if (c.max_discount) d = Math.min(d, c.max_discount);
  return { discount: Math.max(0, Math.min(d, amount)), code: c.code as string };
}

/** Website par countdown wale offers (sirf jinme "Show Countdown Timer" on hai) */
export async function liveOffers(kind?: string) {
  const today = todayIST();
  return q(`SELECT code, title, discount, discount_type, is_percent, max_discount, expires_at FROM coupons
    WHERE active AND show_countdown AND expires_at IS NOT NULL AND expires_at >= $1 AND (starts_at IS NULL OR starts_at <= $1)
      AND ($2::text IS NULL OR product_type='all' OR product_type=$2) ORDER BY expires_at, id LIMIT 3`, [today, kind || null]);
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
