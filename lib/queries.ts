import { q } from "./db";

export type LeaderRow = { user_id: number; name: string; city: string | null; exam: string | null; hindi: number | null; english: number | null; accuracy: number; best: number };

export async function leaderboard(period: "today" | "week" | "month" | "all", limit = 50): Promise<LeaderRow[]> {
  const since = period === "today" ? "date_trunc('day', now())" : period === "week" ? "now() - interval '7 days'" : period === "month" ? "now() - interval '30 days'" : "'1970-01-01'::timestamptz";
  return q<LeaderRow>(
    `SELECT u.id AS user_id, u.name, u.city, u.target_exam AS exam,
       ROUND(MAX(CASE WHEN r.language='hindi' THEN r.net_wpm END)::numeric,0)::int AS hindi,
       ROUND(MAX(CASE WHEN r.language='english' THEN r.net_wpm END)::numeric,0)::int AS english,
       ROUND(AVG(r.accuracy)::numeric,1)::float AS accuracy,
       ROUND(MAX(r.net_wpm)::numeric,0)::int AS best
     FROM typing_results r JOIN users u ON u.id=r.user_id
     WHERE r.created_at >= ${since} AND u.role <> 'admin'
     GROUP BY u.id ORDER BY best DESC, accuracy DESC LIMIT $1`,
    [limit]
  );
}
