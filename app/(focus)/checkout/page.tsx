import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { liveOffers, ownedMaterialIds, resolveItem } from "@/lib/orders";
import { ownsCourse } from "@/lib/courses";
import { one } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import FocusBar from "@/components/FocusBar";
import CheckoutForm from "./CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function Checkout({ searchParams }: { searchParams: { item?: string; mode?: string } }) {
  const user = await getUser();
  const item = searchParams.item || "";
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout?item=${item}${searchParams.mode ? `&mode=${searchParams.mode}` : ""}`)}`);
  const it = await resolveItem(item);
  if (!it) redirect("/plans");
  // pehle se khareeda hai to dobara payment nahi — seedha kholo
  if (it.kind === "material") {
    const m = await one("SELECT id FROM materials WHERE slug=$1", [it.slug]);
    if (m && (await ownedMaterialIds(user!.id)).has(m.id)) redirect(`/study-material/${encodeURIComponent(it.slug)}`);
  }
  if (it.kind === "course" && user!.role !== "admin" && (await ownsCourse(user, it.slug))) redirect(`/courses/${encodeURIComponent(it.slug)}?tab=content`);
  const s = await getSettings();
  const offers = it.showCoupon ? await liveOffers(it.kind) : [];
  return (
    <>
      <FocusBar crumbs={[{ label: "Premium", href: "/plans" }, { label: "Checkout" }]} />
      <CheckoutForm item={item} it={it} mode={searchParams.mode} user={{ name: user.name, mobile: user.mobile, email: user.email || "" }} upi={s.upi_id || ""} whatsapp={s.whatsapp || ""} showCoupon={it.showCoupon !== false} offers={offers as any} />
    </>
  );
}
