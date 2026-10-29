import { redirect } from "next/navigation";
// purana link — ab Syllabus Wise Test page
export default function TopicWise({ searchParams }: { searchParams: { exam?: string } }) {
  redirect(`/mock-tests/syllabus${searchParams.exam ? `?exam=${searchParams.exam}` : ""}`);
}
