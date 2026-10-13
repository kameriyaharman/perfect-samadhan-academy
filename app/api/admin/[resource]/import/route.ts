import { NextResponse } from "next/server";
import { one, q } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/resources";
import { toRow } from "@/lib/adminApi";
import { ALIASES, importFields, parseCSV } from "@/lib/csv";

const YES = ["yes", "y", "true", "1", "haan", "ha", "हाँ", "हां", "on", "active"];

function pgError(e: any) {
  if (e.code === "23505") { const m = /\((.+?)\)=\((.*)\)/.exec(e.detail || ""); return m ? `${m[1]} "${m[2]}" pehle se maujood hai (duplicate)` : "duplicate value (pehle se maujood hai)"; }
  if (e.code === "23502") return `"${e.column}" khali nahi ho sakta`;
  if (e.code === "22P02" || e.code === "22007" || e.code === "22008") return "galat number/date format";
  if (e.code === "23503") return "linked ID maujood nahi hai";
  return e.message;
}

export async function POST(req: Request, { params }: { params: { resource: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = getResource(params.resource);
  if (!r || r.noCreate || r.readonly) return NextResponse.json({ error: "Is section me import allowed nahi hai" }, { status: 400 });
  const b = await req.json();
  const rows = parseCSV(String(b.csv || ""));
  if (rows.length < 2) return NextResponse.json({ error: "CSV me header row + kam se kam 1 data row chahiye" }, { status: 400 });

  // Header → field map: field name, field label, or old alias — case-insensitive
  const fields = importFields(r);
  const alias = ALIASES[r.key] || {};
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "_");
  const cols = rows[0].map((h) => {
    const k = norm(h);
    if (k === "id") return "id";
    const f = fields.find((f) => f.name === k) || fields.find((f) => f.name === alias[k]) || fields.find((f) => norm(f.label) === k);
    return f ? f.name : null;
  });
  if (!cols.some((c) => c && c !== "id")) return NextResponse.json({ error: "CSV ke headers is section se match nahi kar rahe. Sample CSV download karke wahi headers use karein." }, { status: 400 });
  const unknown = rows[0].filter((_, i) => !cols[i]).map((h) => h.trim()).filter(Boolean);

  // Questions: optional Test ID from the import box + auto sort order
  const testId = r.key === "questions" && b.testId ? Number(b.testId) : null;
  if (testId && !(await one("SELECT id FROM mock_tests WHERE id=$1", [testId]))) return NextResponse.json({ error: `Mock Test #${testId} maujood nahi hai` }, { status: 400 });
  let sort = r.key === "questions" && testId ? ((await one("SELECT COALESCE(max(sort),0)::int m FROM questions WHERE test_id=$1", [testId]))?.m || 0) : 0;

  let created = 0, updated = 0; const errors: string[] = [];
  for (let i = 1; i < rows.length; i++) {
    const body: Record<string, any> = {};
    let id: number | null = null;
    cols.forEach((c, j) => {
      if (!c) return;
      const v = (rows[i][j] ?? "").trim();
      if (c === "id") { id = Number(v) || null; return; }
      if (v === "") return; // khali cell = default value
      const f = fields.find((f) => f.name === c)!;
      if (f.type === "bool") body[c] = YES.includes(v.toLowerCase());
      else if (f.type === "select") body[c] = f.options?.find((o) => o.toLowerCase() === v.toLowerCase()) ?? v;
      else body[c] = v;
    });
    if (r.key === "questions") {
      if (body.answer) body.answer = String(body.answer).toUpperCase();
      if (body.answer && !["A", "B", "C", "D"].includes(body.answer)) { errors.push(`Row ${i + 1}: answer sirf A/B/C/D ho sakta hai`); continue; }
      if (!body.test_id && testId) body.test_id = testId;
      if (!body.sort) body.sort = ++sort;
    }
    try {
      if (id && (await one(`SELECT id FROM ${r.table} WHERE id=$1`, [id]))) {
        const row = await toRow(r, body, false);
        const k = Object.keys(row);
        if (k.length) await q(`UPDATE ${r.table} SET ${k.map((c, n) => `${c}=$${n + 1}`).join(",")} WHERE id=$${k.length + 1}`, [...k.map((c) => row[c]), id]);
        updated++;
      } else {
        const row = await toRow(r, body, true);
        const k = Object.keys(row);
        await q(`INSERT INTO ${r.table} (${k.join(",")}) VALUES (${k.map((_, n) => `$${n + 1}`).join(",")})`, k.map((c) => row[c]));
        created++;
      }
    } catch (e: any) {
      errors.push(`Row ${i + 1}: ${pgError(e)}`);
    }
  }
  return NextResponse.json({ created, updated, skipped: errors.length, errors: errors.slice(0, 50), unknown });
}
