import { one, q } from "./db";

/** Admin → Typing Exam Patterns. Har pattern ek exam ke typing rules hai (samay, backspace, highlight, qualifying speed). */
export type TypingPattern = {
  id: number; name: string; slug: string; category: string;
  language: "hindi" | "english" | "both";
  hindi_layout: "any" | "remington" | "remington-cbi" | "krutidev" | "inscript" | "system";
  duration: number; backspace: "full" | "word" | "prev" | "off"; highlight: "word" | "error" | "none";
  hindi_speed: number; english_speed: number; words: number; lock_rules: boolean; description: string | null; sort: number; is_free: boolean;
};

const BS = ["full", "word", "prev", "off"], HL = ["word", "error", "none"], LANG = ["hindi", "english", "both"];
const LAY = ["any", "remington", "remington-cbi", "krutidev", "inscript", "system"];

// table na ho (migration se pehle) to bhi site chale
const FALLBACK: Omit<TypingPattern, "id" | "is_free">[] = [
  { name: "CPCT", slug: "cpct", category: "MP State", language: "both", hindi_layout: "remington", duration: 15, backspace: "full", highlight: "error", hindi_speed: 20, english_speed: 30, words: 0, lock_rules: false, description: null, sort: 1 },
  { name: "SSC DEST (CHSL / CGL)", slug: "ssc", category: "SSC", language: "both", hindi_layout: "remington", duration: 15, backspace: "full", highlight: "error", hindi_speed: 30, english_speed: 35, words: 0, lock_rules: false, description: null, sort: 2 },
  { name: "High Court", slug: "highcourt", category: "Court", language: "both", hindi_layout: "remington", duration: 10, backspace: "full", highlight: "none", hindi_speed: 25, english_speed: 30, words: 0, lock_rules: false, description: null, sort: 3 },
  { name: "Free Practice", slug: "practice", category: "Practice", language: "both", hindi_layout: "any", duration: 5, backspace: "full", highlight: "error", hindi_speed: 20, english_speed: 30, words: 0, lock_rules: false, description: null, sort: 4 },
];

function clean(r: any): TypingPattern {
  return {
    id: r.id ?? 0, name: String(r.name || r.slug), slug: String(r.slug), category: (r.category || "Other").trim(),
    language: LANG.includes(r.language) ? r.language : "both",
    hindi_layout: LAY.includes(r.hindi_layout) ? r.hindi_layout : "any",
    duration: Math.min(60, Math.max(1, Number(r.duration) || 10)),
    backspace: BS.includes(r.backspace) ? r.backspace : "full",
    highlight: HL.includes(r.highlight) ? r.highlight : "error",
    hindi_speed: Number(r.hindi_speed) || 25, english_speed: Number(r.english_speed) || 30,
    words: [100, 150, 200, 250, 300].includes(Number(r.words)) ? Number(r.words) : 0,
    lock_rules: !!r.lock_rules, description: r.description || null, sort: Number(r.sort) || 0, is_free: r.is_free !== false,
  };
}

export async function getPatterns(): Promise<TypingPattern[]> {
  try {
    const rows = await q("SELECT * FROM typing_patterns WHERE active ORDER BY sort NULLS LAST, id");
    return rows.map(clean);
  } catch {
    return FALLBACK.map((f, i) => clean({ ...f, id: -(i + 1) }));
  }
}

export async function getPattern(slug: string | undefined | null): Promise<TypingPattern | null> {
  if (!slug) return null;
  try {
    const r = await one("SELECT * FROM typing_patterns WHERE slug=$1", [slug]);
    if (r) return clean(r);
  } catch {}
  const f = FALLBACK.find((x) => x.slug === slug);
  return f ? clean({ ...f, id: 0 }) : null;
}

export const qualifyFor = (p: TypingPattern, lang: string) => (lang === "english" ? p.english_speed : p.hindi_speed);

export type TypingCategory = { name: string; icon: string; image_url: string | null; color: string; description: string | null };
export async function getTypingCategories(): Promise<TypingCategory[]> {
  try {
    return await q<TypingCategory>("SELECT name, icon, image_url, color, description FROM typing_categories WHERE active ORDER BY sort, id");
  } catch {
    return [];
  }
}
