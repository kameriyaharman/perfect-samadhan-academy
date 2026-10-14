import { one } from "./db";

/** Admin panel ke secret settings — inki value kabhi browser ko nahi bheji jaati */
export const SECRET_SETTINGS = ["razorpay_key_secret"];

/**
 * Razorpay credentials: pehle Admin → Site Settings → Payment (Razorpay) se,
 * nahi to Railway env vars (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) se.
 */
export async function getRazorpay(): Promise<{ key: string; secret: string } | null> {
  let s: Record<string, string> = {};
  try {
    const rows = await one<{ v: Record<string, string> }>(
      "SELECT json_object_agg(key, value) AS v FROM settings WHERE key IN ('razorpay_enabled','razorpay_key_id','razorpay_key_secret')"
    );
    s = rows?.v || {};
  } catch {}
  if (s.razorpay_enabled === "0") return null;
  const key = (s.razorpay_key_id || process.env.RAZORPAY_KEY_ID || "").trim();
  const secret = (s.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "").trim();
  return key && secret ? { key, secret } : null;
}
