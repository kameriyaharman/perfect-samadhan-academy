// Course ke andar ke lessons (video / PDF / notes) — access sirf khareedne wale ko
import { one, q } from "./db";
import type { SessionUser } from "./auth";

/** admin ya jisne course ka paid order kiya hai */
export async function ownsCourse(u: SessionUser | null, slug: string) {
  if (!u) return false;
  if (u.role === "admin") return true;
  // slug se, ya (slug badal gaya ho to) course ke naam se
  return !!(await one(`SELECT 1 FROM orders o WHERE o.user_id=$1 AND o.status='paid' AND o.item ILIKE 'course:%'
      AND (lower(btrim(o.item))=lower(btrim($2)) OR lower(btrim(regexp_replace(o.item_name, '\\s*\\([^)]*\\)\\s*$', ''))) = (SELECT lower(btrim(title)) FROM courses WHERE slug=$3 LIMIT 1)) LIMIT 1`, [u.id, `course:${slug}`, slug]));
}

export async function courseLessons(courseId: number) {
  return q("SELECT id, section, title, kind, duration, is_free, video_url, file_url FROM course_lessons WHERE course_id=$1 AND active ORDER BY sort, id", [courseId]).catch(() => [] as any[]);
}

/** lessons ko chapter (section) ke hisaab se group karein, kram bana rahe */
export function bySection<T extends { section?: string | null }>(rows: T[]) {
  const out: { name: string; items: T[] }[] = [];
  for (const r of rows) {
    const name = (r.section || "").trim() || "Lessons";
    const g = out.find((x) => x.name === name);
    g ? g.items.push(r) : out.push({ name, items: [r] });
  }
  return out;
}

/** YouTube link → embed URL (watch, youtu.be, shorts, live, embed sab chalega) */
export function ytEmbed(url?: string | null) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1` : null;
}
export const isVideoFile = (u?: string | null) => !!u && (/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(u));
