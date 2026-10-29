import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: { default: "Admin Panel", template: "%s | Admin — Perfect Samadhan" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?next=/admin");
  const nav = RESOURCES.filter((r) => !r.hidden).map((r) => ({ key: r.key, label: r.label, group: r.group, icon: r.icon }));
  return <AdminShell nav={nav} name={admin.name}>{children}</AdminShell>;
}
