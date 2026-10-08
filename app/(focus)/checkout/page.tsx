import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { resolveItem } from "@/lib/orders";
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
  const s = await getSettings();
  return (
    <>
      <FocusBar crumbs={[{ label: "Premium", href: "/plans" }, { label: "Checkout" }]} />
      <CheckoutForm item={item} it={it} mode={searchParams.mode} user={{ name: user.name, mobile: user.mobile, email: user.email || "" }} upi={s.upi_id || ""} whatsapp={s.whatsapp || ""} />
    </>
  );
}
