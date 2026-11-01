// Forgot password OTP — Fast2SMS (OTP route). Admin → Settings → "Forgot Password (SMS OTP)" me API key + chalu.
import { one } from "./db";

export async function smsConfig() {
  const r = await one<{ v: Record<string, string> | null }>(
    "SELECT json_object_agg(key, value) AS v FROM settings WHERE key IN ('sms_otp_enabled','sms_api_key')"
  ).catch(() => null);
  const s = r?.v || {};
  const key = (s.sms_api_key || process.env.FAST2SMS_API_KEY || "").trim();
  return { on: s.sms_otp_enabled === "1" && !!key, key };
}

export async function sendOtp(mobile: string, otp: string, key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const u = new URL("https://www.fast2sms.com/dev/bulkV2");
    u.searchParams.set("route", "otp");
    u.searchParams.set("variables_values", otp);
    u.searchParams.set("numbers", mobile);
    const r = await fetch(u, { headers: { authorization: key, "cache-control": "no-cache" }, cache: "no-store" });
    const j: any = await r.json().catch(() => ({}));
    if (r.ok && j.return === true) return { ok: true };
    return { ok: false, error: Array.isArray(j.message) ? j.message.join(" ") : j.message || `SMS fail (${r.status})` };
  } catch (e: any) {
    return { ok: false, error: e.message || "SMS fail" };
  }
}
