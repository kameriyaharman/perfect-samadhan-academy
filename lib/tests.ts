import { one, q } from "./db";

export async function createAttempt(userId: number, opts: { testId?: number | null; title: string; kind: string; duration: number; questionIds: number[]; language?: string; keyword?: string }) {
  const a = await one(
    `INSERT INTO attempts (user_id, test_id, title, kind, duration, question_ids, language, keyword) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [userId, opts.testId || null, opts.title, opts.kind, opts.duration, JSON.stringify(opts.questionIds), opts.language || "hi", opts.keyword || null]
  );
  return a.id as number;
}

export async function loadQuestions(ids: number[]) {
  if (!ids.length) return [];
  const rows = await q(`SELECT * FROM questions WHERE id = ANY($1::int[])`, [ids]);
  const map = new Map(rows.map((r: any) => [r.id, r]));
  return ids.map((id) => map.get(id)).filter(Boolean) as any[];
}

export async function gradeAttempt(attemptId: number) {
  const a = await one(`SELECT a.*, m.marks_per_q, m.negative FROM attempts a LEFT JOIN mock_tests m ON m.id=a.test_id WHERE a.id=$1`, [attemptId]);
  if (!a) return null;
  const ids: number[] = JSON.parse(a.question_ids);
  const answers: Record<string, string> = JSON.parse(a.answers || "{}");
  const qs = await loadQuestions(ids);
  const mpq = a.marks_per_q ?? 1, neg = a.negative ?? 0;
  let correct = 0, wrong = 0, skipped = 0;
  const sec: Record<string, { total: number; correct: number; wrong: number; topics: Record<string, [number, number]> }> = {};
  for (const qq of qs) {
    const s = (sec[qq.section] ||= { total: 0, correct: 0, wrong: 0, topics: {} });
    s.total++;
    const t = (s.topics[qq.topic || qq.section] ||= [0, 0]);
    t[1]++;
    const ans = answers[qq.id];
    if (!ans) skipped++;
    else if (ans === qq.answer) { correct++; s.correct++; t[0]++; }
    else { wrong++; s.wrong++; }
  }
  const score = Math.round((correct * mpq - wrong * neg) * 100) / 100;
  const timeTaken = Math.min(a.duration * 60, Math.round((Date.now() - new Date(a.started_at).getTime()) / 1000));
  await q(`UPDATE attempts SET status='submitted', score=$2, correct=$3, wrong=$4, skipped=$5, total=$6, time_taken=$7, section_stats=$8, submitted_at=now() WHERE id=$1`,
    [attemptId, score, correct, wrong, skipped, qs.length, timeTaken, JSON.stringify(sec)]);
  return { score, correct, wrong, skipped };
}

export const KIND_LABEL: Record<string, string> = { full: "Full Mock", subject: "Subject-wise", topic: "Topic-wise", pyq: "PYQ", quiz: "Daily Quiz", keyword: "Keyword Test" };
