import { cookies } from "next/headers";
import { getUser } from "@/lib/auth";
import { PREVIEW_COOKIE } from "@/lib/access";
import AdminPreviewToggle from "./AdminPreviewToggle";

/** Sirf admin ko: batata hai ki premium / locked content admin ke liye khula dikhta hai, aur student-view ka button */
export default async function AdminPreviewBar() {
  const u = await getUser();
  if (u?.role !== "admin") return null;
  const on = cookies().get(PREVIEW_COOKIE)?.value === "1";
  return <AdminPreviewToggle on={on} />;
}
