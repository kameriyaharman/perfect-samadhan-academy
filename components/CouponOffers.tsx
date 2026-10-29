"use client";
// Coupon offer + live countdown (admin: Coupons → "Show Countdown Timer")
import { useEffect, useState } from "react";
import { Check, Copy, Tag, Timer } from "lucide-react";

export type Offer = { code: string; title: string | null; discount: number; discount_type: string | null; is_percent: boolean; max_discount: number | null; expires_at: string };
const endOf = (d: string) => new Date(`${String(d).slice(0, 10)}T23:59:59+05:30`).getTime();
function left(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d ? `${d}d ` : ""}${p(h)}:${p(m)}:${p(x)}`;
}
export default function CouponOffers({ offers, onApply, compact }: { offers: Offer[]; onApply?: (code: string) => void; compact?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  const [copied, setCopied] = useState("");
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const live = offers.filter((o) => now === null || endOf(o.expires_at) > now);
  if (!live.length) return null;
  return (
    <div className={`space-y-2 ${compact ? "" : "mb-6"}`}>
      {live.map((o) => {
        const pct = o.discount_type ? o.discount_type === "percent" : o.is_percent;
        const off = pct ? `${o.discount}% OFF${o.max_discount ? ` (₹${o.max_discount} tak)` : ""}` : `₹${o.discount} OFF`;
        return (
          <div key={o.code} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-saffron bg-orange-50 px-4 py-3">
            <Tag className="h-5 w-5 shrink-0 text-saffron" />
            <span className={`min-w-0 flex-1 text-sm ${compact ? "basis-[calc(100%-2.5rem)]" : ""}`}>
              <b className="text-navy">{o.title || "Special Offer"} — {off}</b>
              <span className="block text-muted">Code: <b className="font-mono text-ink">{o.code}</b></span>
            </span>
            <span className={`chip bg-navy py-1.5 font-mono text-white ${compact ? "ml-8" : ""}`}><Timer className="h-3.5 w-3.5" />{now === null ? "…" : left(endOf(o.expires_at) - now)}</span>
            {onApply ? <button onClick={() => onApply(o.code)} className="btn-orange btn-sm">Apply</button>
              : <button onClick={() => { navigator.clipboard?.writeText(o.code).catch(() => {}); setCopied(o.code); setTimeout(() => setCopied(""), 1500); }} className="btn-soft btn-sm">{copied === o.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied === o.code ? "Copied" : "Copy"}</button>}
          </div>
        );
      })}
    </div>
  );
}
