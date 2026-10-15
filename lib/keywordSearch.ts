import { q } from "./db";

// Keyword test: sawal kis paper/shift se aaya — PYQ ho to uska session, warna question ka source, warna "Practice / Mock sets"
const SRC = `CASE WHEN NULLIF(qq.source,'') IS NOT NULL THEN qq.source
  WHEN m.kind='pyq' THEN 'PYQ · ' || COALESCE(NULLIF(m.session,''), m.title)
  ELSE 'Practice / Mock sets' END`;

export type KwFilter = { keyword: string; sources?: string[]; topics?: string[] };

function where(f: KwFilter) {
  const words = f.keyword.trim().split(/\s+/).filter(Boolean).slice(0, 4);
  const args: any[] = words.map((w) => `%${w}%`);
  const conds = [
    "(" + words.map((_, i) => `(qq.text_hi ILIKE $${i + 1} OR qq.text_en ILIKE $${i + 1} OR qq.keywords ILIKE $${i + 1} OR qq.topic ILIKE $${i + 1})`).join(" OR ") + ")",
  ];
  if (f.sources?.length) { args.push(f.sources); conds.push(`(${SRC}) = ANY($${args.length}::text[])`); }
  if (f.topics?.length) { args.push(f.topics); conds.push(`COALESCE(NULLIF(qq.topic,''), qq.section) = ANY($${args.length}::text[])`); }
  return { ok: words.length > 0, sql: conds.join(" AND "), args };
}

const FROM = "FROM questions qq LEFT JOIN mock_tests m ON m.id = qq.test_id";

/** Keyword se mile sawal + filter ke options (paper/shift aur topic, har ek ke saath sawalon ki ginti) */
export async function keywordSearch(f: KwFilter) {
  const w = where(f);
  if (!w.ok) return { count: 0, items: [], sources: [], topics: [] };
  const base = where({ keyword: f.keyword }); // options hamesha poore keyword result par, taki checkbox gayab na hon
  const [items, cnt, sources, topics] = await Promise.all([
    q(`SELECT DISTINCT ON (qq.text_hi) qq.id, qq.text_hi, qq.source, qq.topic, ${SRC} AS src ${FROM} WHERE ${w.sql} ORDER BY qq.text_hi, qq.id LIMIT 8`, w.args),
    q(`SELECT count(DISTINCT qq.text_hi)::int AS n ${FROM} WHERE ${w.sql}`, w.args),
    q(`SELECT ${SRC} AS label, count(DISTINCT qq.text_hi)::int AS n, max(m.year) AS yr, max(m.id) AS mid ${FROM} WHERE ${base.sql} GROUP BY 1 ORDER BY (${SRC}) = 'Practice / Mock sets', yr DESC NULLS LAST, mid DESC NULLS LAST, 1 LIMIT 120`, base.args),
    q(`SELECT COALESCE(NULLIF(qq.topic,''), qq.section) AS label, count(DISTINCT qq.text_hi)::int AS n ${FROM} WHERE ${base.sql} GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 40`, base.args),
  ]);
  return {
    count: cnt[0]?.n || 0,
    items,
    sources: sources.map((s: any) => ({ label: s.label as string, n: s.n as number })),
    topics: topics.filter((t: any) => t.label).map((t: any) => ({ label: t.label as string, n: t.n as number })),
  };
}

/** Test ke liye random sawal (filter ke andar, duplicate text hata kar) */
export async function keywordPick(f: KwFilter, n: number) {
  const w = where(f);
  if (!w.ok) return [];
  return q(`SELECT id FROM (SELECT DISTINCT ON (qq.text_hi) qq.id, qq.text_hi ${FROM} WHERE ${w.sql} ORDER BY qq.text_hi, qq.id) x ORDER BY random() LIMIT ${Math.min(100, Math.max(1, n))}`, w.args);
}
