import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { q } from "@/lib/db";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const [user, s] = await Promise.all([getUser(), getSettings()]);
  let ticker: { title: string }[] = [];
  try { ticker = await q("SELECT title FROM notices WHERE active AND show_in_ticker ORDER BY date DESC LIMIT 6"); } catch {}
  return (
    <HeaderClient
      user={user ? { name: user.name, role: user.role, premium: !!user.premium_till && new Date(user.premium_till) > new Date() } : null}
      phone={s.phone || ""} email={s.email || ""} hours={s.hours || ""} ticker={ticker.map((t) => t.title)}
    />
  );
}
