import ImportForm from "./ImportForm";
export const metadata = { title: "Bulk Import" };
export default function Import({ searchParams }: { searchParams: { type?: string; testId?: string } }) {
  return <ImportForm type={searchParams.type === "passages" ? "passages" : "questions"} testId={searchParams.testId || ""} />;
}
