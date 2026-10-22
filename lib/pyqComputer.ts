import { q, one } from "./db";

/** CPCT PYQ paper ka sirf Computer wala hissa (52 sawal). Paper ka subject 'Computer' ho to poora paper. */
const COMP = `(qq.section ILIKE 'computer%' OR m.subject ILIKE 'computer%')`;

export async function cpctComputerPapers() {
  return q(
    `SELECT m.id, m.title, m.session, m.year, m.is_free, m.series, m.sort, count(qq.id)::int AS qn
       FROM mock_tests m JOIN questions qq ON qq.test_id = m.id AND ${COMP}
      WHERE m.exam_slug = 'cpct' AND m.kind = 'pyq' AND m.active
      GROUP BY m.id ORDER BY m.year DESC NULLS LAST, m.sort, m.id`
  );
}

export async function cpctComputerPaper(testId: number) {
  const t = await one(`SELECT id, title, session, year, is_free, series FROM mock_tests WHERE id=$1 AND exam_slug='cpct' AND kind='pyq' AND active`, [testId]);
  if (!t) return null;
  const ids = await q<{ id: number }>(`SELECT qq.id FROM questions qq JOIN mock_tests m ON m.id = qq.test_id WHERE qq.test_id=$1 AND ${COMP} ORDER BY qq.sort, qq.id`, [testId]);
  return { ...t, questionIds: ids.map((r) => r.id) };
}

/** "Nov 2025 · Shift 2" → { label: "Nov 2025", shift: "Shift 02" } */
export function splitSession(session: string | null, title: string) {
  const s = (session || title || "").replace(/^CPCT\s*/i, "");
  const m = /shift\s*0?(\d+)/i.exec(s);
  const label = s.replace(/[·,\-–|]*\s*shift\s*0?\d+.*$/i, "").replace(/[·,\-–|\s]+$/, "").trim() || s;
  return { label, shift: m ? `Shift ${m[1].padStart(2, "0")}` : "" };
}
