import { getSettings } from "@/lib/settings";
import { SETTING_GROUPS } from "@/lib/resources";
import SettingsForm from "./SettingsForm";
export const metadata = { title: "Site Settings" };
export default async function Settings() {
  const s = await getSettings();
  return <SettingsForm groups={SETTING_GROUPS} initial={s} />;
}
