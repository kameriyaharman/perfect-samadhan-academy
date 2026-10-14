import { getSettings } from "@/lib/settings";
import { SETTING_GROUPS } from "@/lib/resources";
import { SECRET_SETTINGS } from "@/lib/payments";
import SettingsForm from "./SettingsForm";
export const metadata = { title: "Site Settings" };
export default async function Settings() {
  const all = await getSettings();
  const initial: Record<string, string> = {};
  const saved: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(all)) {
    if (SECRET_SETTINGS.includes(k)) saved[k] = !!v; // secret browser ko nahi jaata
    else initial[k] = v;
  }
  const env = { razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) };
  return <SettingsForm groups={SETTING_GROUPS} initial={initial} savedSecrets={saved} env={env} />;
}
