// Public test pages (Syllabus Wise / Old Papers / Free Mock) ke liye queries
import { q } from "./db";

export async function examsWithKind(kind: string) {
  return q(`SELECT e.slug, e.code, e.name FROM exams e WHERE EXISTS (SELECT 1 FROM mock_tests m WHERE m.exam_slug=e.slug AND m.kind=$1 AND m.active) ORDER BY e.sort`, [kind]);
}
/** kisi exam + type ke saare tests, sawal ginti ke saath */
export async function testsOf(kind: string, exam: string, extra = "") {
  return q(`SELECT m.id, m.title, m.subject, m.topic, m.year, m.session, m.duration, m.is_free, m.exam_slug, m.series, m.folder_id, m.mode, m.pdf_url, m.kind,
      (SELECT count(*)::int FROM questions WHERE test_id=m.id) qn
    FROM mock_tests m WHERE m.kind=$1 AND m.active AND m.exam_slug=$2 ${extra} ORDER BY m.sort, m.id`, [kind, exam]);
}
export async function foldersOf(scope: string, exam: string) {
  return q(`SELECT * FROM folders WHERE scope=$1 AND active AND (exam_slug IS NULL OR exam_slug='' OR exam_slug=$2) ORDER BY sort, id`, [scope, exam]);
}
/** "08 September 2026 · Shift 2" → "08 September 2026 (Shift 2)" */
export function sessionLabel(t: { session?: string | null; title: string }) {
  const s = (t.session || t.title || "").replace(/^CPCT\s*/i, "");
  const [a, b] = s.split(/\s*[·|]\s*/);
  return b ? `${a} (${b})` : a;
}
/** practice ya exam — test kholne ka link */
export const testHref = (t: { id: number; mode?: string }) => (t.mode === "practice" ? `/test/practice/${t.id}` : `/test/${t.id}`);
