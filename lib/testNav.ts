// Test kis public page par dikhta hai — wapas jaane ka link
export function listHref(t: { kind: string; exam_slug: string; folder_id?: number | null }) {
  if (t.kind === "topic") return t.folder_id ? `/mock-tests/syllabus/${t.folder_id}` : `/mock-tests/syllabus?exam=${t.exam_slug}`;
  if (t.kind === "pyq") return `/mock-tests/pyq?exam=${t.exam_slug}`;
  if (t.kind === "free") return `/mock-tests/free?exam=${t.exam_slug}${t.folder_id ? `&f=${t.folder_id}` : ""}`;
  return `/mock-tests/${t.exam_slug}${t.kind !== "full" ? `?tab=${t.kind}` : ""}`;
}
export const KIND_PAGE: Record<string, string> = { topic: "Syllabus Wise Test", pyq: "Old Paper Tests", free: "Free Mock Tests", full: "Mock Tests", subject: "Mock Tests", quiz: "Mock Tests" };
