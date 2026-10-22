// Premium plan → kya-kya unlock hai.
// plans.includes (JSON) khaali / null = poora premium content (purane plans aise hi chalte rahenge).
// Warna sirf chuni hui series: lesson folders, test series / exam, typing exam categories, passages, keyword MCQ, PDFs.
import { cache } from "react";
import { one, q } from "./db";
import { isPremium, type SessionUser } from "./auth";

export type Includes = {
  all?: boolean;
  folders?: number[];      // lesson_folders.id
  series?: string[];       // "series:<naam>" ya "exam:<slug>"
  typing?: string[];       // typing_patterns.category
  passages?: boolean; keywords?: boolean; materials?: boolean;
};
export type Access = {
  premium: boolean; all: boolean;
  folders: Set<number>; series: Set<string>; typing: Set<string>;
  passages: boolean; keywords: boolean; materials: boolean;
};

export function parseIncludes(v: any): Includes {
  if (!v) return { all: true };
  try { const j = typeof v === "string" ? JSON.parse(v) : v; return j && typeof j === "object" ? j : { all: true }; } catch { return { all: true }; }
}

const NONE: Access = { premium: false, all: false, folders: new Set(), series: new Set(), typing: new Set(), passages: false, keywords: false, materials: false };

export const getAccess = cache(async (u: SessionUser | null): Promise<Access> => {
  if (!isPremium(u)) return NONE;
  const full: Access = { premium: true, all: true, folders: new Set(), series: new Set(), typing: new Set(), passages: true, keywords: true, materials: true };
  if (u!.role === "admin" || !u!.premium_plan) return full;
  const p = await one("SELECT includes FROM plans WHERE name=$1 OR slug=$1 ORDER BY id LIMIT 1", [u!.premium_plan]).catch(() => null);
  if (!p) return full;
  const inc = parseIncludes(p.includes);
  if (inc.all !== false) return full;
  return {
    premium: true, all: false,
    folders: new Set((inc.folders || []).map(Number)), series: new Set(inc.series || []), typing: new Set(inc.typing || []),
    passages: !!inc.passages, keywords: !!inc.keywords, materials: !!inc.materials,
  };
});

/** Mock test khul sakta hai? */
export function canTest(a: Access, t: { is_free?: boolean | null; exam_slug?: string | null; series?: string | null }) {
  if (t.is_free !== false) return true;
  if (!a.premium) return false;
  return a.all || (!!t.series && a.series.has(`series:${t.series}`)) || (!!t.exam_slug && a.series.has(`exam:${t.exam_slug}`));
}
/** Typing lesson — lesson khud lock ho ya uska folder */
export function canLesson(a: Access, l: { is_free?: boolean | null; folder_id?: number | null; folder_free?: boolean | null }) {
  if (l.is_free !== false && l.folder_free !== false) return true;
  if (!a.premium) return false;
  return a.all || (l.folder_id != null && a.folders.has(Number(l.folder_id))) || (l.folder_id == null && a.folders.size > 0);
}
export function canPattern(a: Access, p: { is_free?: boolean | null; category?: string | null }) {
  if (p.is_free !== false) return true;
  return a.premium && (a.all || (!!p.category && a.typing.has(p.category)));
}
export const canPassages = (a: Access) => a.premium && (a.all || a.passages);
export const canKeywords = (a: Access) => a.premium && (a.all || a.keywords);
export const canMaterials = (a: Access) => a.premium && (a.all || a.materials);

/** Admin plan form + plans page ke liye — chunne layak series ki list */
export async function includeOptions() {
  const [folders, series, exams, cats] = await Promise.all([
    q(`SELECT f.id, f.name, f.layout, f.is_free, (SELECT count(*)::int FROM lessons l WHERE l.folder_id=f.id) n,
         (SELECT count(*)::int FROM lessons l WHERE l.folder_id=f.id AND NOT l.is_free) locked
       FROM lesson_folders f ORDER BY CASE WHEN f.layout='english' THEN 1 ELSE 0 END, f.sort, f.id`),
    q(`SELECT series AS name, count(*)::int n, count(*) FILTER (WHERE NOT is_free)::int locked FROM mock_tests WHERE series IS NOT NULL AND series<>'' GROUP BY series ORDER BY series`),
    q(`SELECT m.exam_slug AS slug, COALESCE(max(e.name), m.exam_slug) AS name, count(*)::int n, count(*) FILTER (WHERE NOT m.is_free)::int locked
       FROM mock_tests m LEFT JOIN exams e ON e.slug=m.exam_slug GROUP BY m.exam_slug ORDER BY 2`),
    q(`SELECT category AS name, count(*)::int n, count(*) FILTER (WHERE NOT is_free)::int locked FROM typing_patterns GROUP BY category ORDER BY category`),
  ]);
  return { folders, series, exams, cats };
}
