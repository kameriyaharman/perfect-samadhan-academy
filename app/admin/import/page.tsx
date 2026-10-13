import { redirect } from "next/navigation";
// Purana Bulk Import page — ab har section me apna "Import CSV" button hai.
export default function Import({ searchParams }: { searchParams: { type?: string; testId?: string } }) {
  const type = searchParams.type === "passages" ? "passages" : "questions";
  redirect(`/admin/r/${type}${type === "questions" && searchParams.testId ? `?test_id=${searchParams.testId}` : ""}`);
}
