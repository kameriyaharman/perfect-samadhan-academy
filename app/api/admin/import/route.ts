import { NextResponse } from "next/server";
import { one, q } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function parseCSV(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cur = ""; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
    else if (c === '"') inQ = true;
    else if (c === "," || c === "\t") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); if (row.some((x) => x.trim())) rows.push(row); row = []; cur = ""; }
    else cur += c;
  }
  row.push(cur); if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json();
  const rows = parseCSV(String(b.csv || ""));
  if (rows.length < 2) return NextResponse.json({ error: "CSV me header + kam se kam 1 row chahiye" }, { status: 400 });
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (k: string) => head.indexOf(k);
  let n = 0; const errors: string[] = [];
  if (b.type === "questions") {
    const testId = b.testId ? Number(b.testId) : null;
    if (testId && !(await one("SELECT id FROM mock_tests WHERE id=$1", [testId]))) return NextResponse.json({ error: "Test ID galat hai" }, { status: 400 });
    const startSort = testId ? ((await one("SELECT COALESCE(max(sort),0)::int m FROM questions WHERE test_id=$1", [testId]))?.m || 0) : 0;
    for (let i = 1; i < rows.length; i++) {
      const g = (k: string) => (idx(k) >= 0 ? (rows[i][idx(k)] || "").trim() : "");
      const ans = g("answer").toUpperCase();
      if (!g("question_hi") || !g("a_hi") || !"ABCD".includes(ans) || !ans) { errors.push(`Row ${i + 1}: question_hi/options/answer missing`); continue; }
      await q(`INSERT INTO questions (test_id, section, topic, text_hi, text_en, opt_a_hi, opt_b_hi, opt_c_hi, opt_d_hi, opt_a_en, opt_b_en, opt_c_en, opt_d_en, answer, explanation, source, keywords, sort)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [testId, g("section") || "Computer", g("topic") || null, g("question_hi"), g("question_en") || null, g("a_hi"), g("b_hi"), g("c_hi"), g("d_hi"),
          g("a_en") || null, g("b_en") || null, g("c_en") || null, g("d_en") || null, ans, g("explanation") || null, g("source") || null, g("keywords") || null, startSort + i]);
      n++;
    }
  } else if (b.type === "passages") {
    for (let i = 1; i < rows.length; i++) {
      const g = (k: string) => (idx(k) >= 0 ? (rows[i][idx(k)] || "").trim() : "");
      if (!g("title") || !g("text")) { errors.push(`Row ${i + 1}: title/text missing`); continue; }
      await q(`INSERT INTO passages (title, language, level, exam, year, session, shift, text) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [g("title"), g("language") === "english" ? "english" : "hindi", g("level") || "exam", g("exam") || null, Number(g("year")) || null, g("session") || null, g("shift") || null, g("text")]);
      n++;
    }
  } else return NextResponse.json({ error: "type?" }, { status: 400 });
  return NextResponse.json({ imported: n, errors: errors.slice(0, 20) });
}
