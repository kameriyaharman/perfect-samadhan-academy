import { NextResponse } from "next/server";
import { one, pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { docxLines } from "@/lib/docx";
import { parseQuestionDoc } from "@/lib/questionDoc";

// Admin: Word (.docx) file se sawal upload — mode=preview sirf padh kar dikhata hai, mode=import save karta hai.
// Test: maujooda Mock Test ID, ya naya Mock Test (title, exam, type, samay…) isi upload me ban jata hai.
export async function POST(req: Request, { params }: { params: { resource: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!["questions", "mock_tests", "tests_syllabus", "tests_old", "tests_free"].includes(params.resource)) return NextResponse.json({ error: "not allowed" }, { status: 400 });
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!fd || !file || typeof file === "string") return NextResponse.json({ error: "Word (.docx) file chunein" }, { status: 400 });
  if (!/\.docx$/i.test((file as File).name || "")) return NextResponse.json({ error: "Sirf .docx file chalegi (Word me 'Save As → Word Document (.docx)' karein). Purani .doc file nahi chalti." }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "File 15 MB se badi hai" }, { status: 400 });

  const lines = docxLines(Buffer.from(await file.arrayBuffer()));
  if (!lines) return NextResponse.json({ error: "File padh nahi paye — sahi .docx file hai?" }, { status: 400 });
  const { questions, warnings } = parseQuestionDoc(lines);

  const mode = String(fd.get("mode") || "preview");
  if (mode !== "import") return NextResponse.json({ count: questions.length, questions: questions.slice(0, 200), warnings });
  if (!questions.length) return NextResponse.json({ error: "File me koi sahi sawal nahi mila", warnings }, { status: 400 });

  const section = String(fd.get("section") || "GK").slice(0, 60);
  // multiple sections: "doc" = Word file ki headings se, ya ranges [{name, from, to}] (sawal kram 1..N)
  const secMode = String(fd.get("secMode") || "one");
  let ranges: { name: string; from: number; to: number }[] = [];
  try { ranges = (JSON.parse(String(fd.get("ranges") || "[]")) || []).map((r: any) => ({ name: String(r.name || "").slice(0, 60), from: Number(r.from) || 0, to: Number(r.to) || 0 })).filter((r: any) => r.name && r.from > 0 && r.to >= r.from); } catch {}
  const secFor = (qq: { section?: string | null }, pos: number) => {
    if (secMode === "doc" && qq.section) return qq.section;
    if (secMode === "ranges") { const r = ranges.find((x) => pos >= x.from && pos <= x.to); if (r) return r.name; }
    return section;
  };
  const topic = String(fd.get("topic") || "").trim().slice(0, 80) || null;
  const source = String(fd.get("source") || "").trim().slice(0, 80) || null;
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    let testId = Number(fd.get("testId")) || 0;
    const nt = fd.get("newTest");
    if (nt) {
      const t = JSON.parse(String(nt));
      if (!String(t.title || "").trim()) throw new Error("Naye Mock Test ka title daalein");
      const kind = ["full", "subject", "topic", "pyq", "free", "quiz"].includes(t.kind) ? t.kind : "full";
      const r = await c.query(
        `INSERT INTO mock_tests (title, exam_slug, kind, subject, topic, year, session, duration, marks_per_q, negative, is_free, series, folder_id, mode, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true) RETURNING id`,
        [String(t.title).trim().slice(0, 200), String(t.exam_slug || "cpct").trim().slice(0, 60) || "cpct", kind, t.subject || null, topic, Number(t.year) || null, t.session || null,
          Math.max(1, Number(t.duration) || questions.length), Number(t.marks_per_q) || 1, Number(t.negative) || 0, t.is_free !== false, String(t.series || "").trim().slice(0, 120) || null,
          Number(t.folder_id) || null, ["both", "practice", "exam"].includes(t.mode) ? t.mode : kind === "free" ? "practice" : "both"]
      );
      testId = r.rows[0].id;
    } else if (!testId || !(await one("SELECT id FROM mock_tests WHERE id=$1", [testId]))) {
      throw new Error("Mock Test chunein (ID sahi nahi hai) ya naya Mock Test banayein");
    }
    let sort = (await c.query("SELECT COALESCE(max(sort),0)::int m FROM questions WHERE test_id=$1", [testId])).rows[0].m;
    let pos = 0;
    for (const q of questions) {
      pos++;
      const o = (i: number) => q.opts[i] || { hi: "", en: null };
      await c.query(
        `INSERT INTO questions (test_id, section, topic, text_hi, text_en, opt_a_hi, opt_a_en, opt_b_hi, opt_b_en, opt_c_hi, opt_c_en, opt_d_hi, opt_d_en, opt_e_hi, opt_e_en, answer, explanation, source, sort)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [testId, secFor(q, pos), topic, q.text_hi, q.text_en, o(0).hi, o(0).en, o(1).hi, o(1).en, o(2).hi, o(2).en, o(3).hi, o(3).en, q.opts[4]?.hi || null, q.opts[4]?.en || null, q.answer, q.explanation, source, ++sort]
      );
    }
    await c.query("COMMIT");
    return NextResponse.json({ ok: true, testId, created: questions.length, warnings });
  } catch (e: any) {
    await c.query("ROLLBACK").catch(() => {});
    return NextResponse.json({ error: e.message || "Import nahi hua", warnings }, { status: 400 });
  } finally {
    c.release();
  }
}
