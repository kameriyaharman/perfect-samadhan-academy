import Link from "next/link";
import { Award, Keyboard } from "lucide-react";
import { leaderboard } from "@/lib/queries";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { one } from "@/lib/db";
import { initials } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Typing Leaderboard" };
const P = [["week", "Is Hafte"], ["today", "Aaj"], ["month", "Is Mahine"], ["all", "All Time"]] as const;

export default async function Leaderboard({ searchParams }: { searchParams: { p?: string } }) {
  const period = (P.find(([k]) => k === searchParams.p)?.[0] || "week") as any;
  const [rows, user, s] = await Promise.all([leaderboard(period, 50), getUser(), getSettings()]);
  const myIdx = user ? rows.findIndex((r) => r.user_id === user.id) : -1;
  const mine = user ? await one(`SELECT ROUND(MAX(CASE WHEN language='hindi' THEN net_wpm END)::numeric)::int h, ROUND(MAX(CASE WHEN language='english' THEN net_wpm END)::numeric)::int e FROM typing_results WHERE user_id=$1`, [user.id]) : null;
  const tenth = rows[9]?.best;
  const podium = [rows[1], rows[0], rows[2]];
  return (
    <>
      <PageHero crumbs={[{ label: "Typing Test", href: "/typing-test" }, { label: "Leaderboard" }]} title="टाइपिंग" highlight="लीडरबोर्ड" subtitle="Is hafte ke sabse tez aur sahi typists. Roz test dein aur apna naam yahan dekhein!" compact />
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {P.map(([k, l]) => <Link key={k} href={`/typing-test/leaderboard?p=${k}`} className={`tab ${period === k ? "active" : ""}`}>{l}</Link>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            {!rows.length ? <Empty text="Is period me abhi koi result nahi — pehla test dekar top par aaiye!" /> : (
              <>
                <div className="mb-6 grid grid-cols-3 items-end gap-3">
                  {podium.map((r, i) => r ? (
                    <div key={r.user_id} className={`card p-4 md:p-6 text-center ${i === 1 ? "md:pb-9" : ""}`}>
                      <span className={`mx-auto grid h-14 w-14 md:h-20 md:w-20 place-items-center rounded-full text-lg md:text-2xl font-bold text-white ring-4 ring-gold/60 ring-offset-2 ${i === 1 ? "bg-gold" : i === 0 ? "bg-slate-400" : "bg-amber-600/70"}`}>{initials(r.name)}</span>
                      <div className="mt-3 truncate font-bold md:text-lg">{r.name}</div>
                      <div className="text-xs text-muted">{r.city || "—"}</div>
                      <span className="chip mt-2 bg-green-50 text-green-700">{r.best} WPM</span>
                    </div>
                  ) : <div key={i} />)}
                </div>
                <div className="card overflow-x-auto">
                  <table className="table-x min-w-[640px]">
                    <thead><tr><th>Rank</th><th>Student</th><th>Exam</th><th>Hindi NWPM</th><th>English NWPM</th><th>Accuracy</th></tr></thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={r.user_id} className={user?.id === r.user_id ? "[&>td]:!bg-brand-50" : ""}>
                          <td><span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${i === 0 ? "bg-gold text-ink" : i === 1 ? "bg-slate-200" : i === 2 ? "bg-amber-600/70 text-white" : "bg-canvas"}`}>{i + 1}</span></td>
                          <td><div className="font-bold">{r.name}</div><div className="text-xs text-muted">{r.city || ""}</div></td>
                          <td>{r.exam || "—"}</td>
                          <td className="font-bold text-brand">{r.hindi ?? "—"}</td>
                          <td className="font-bold text-saffron">{r.english ?? "—"}</td>
                          <td>{r.accuracy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl bg-navy p-6 text-white" data-dark>
              <div className="text-sm text-white/70">Aapki rank</div>
              {user ? (
                <>
                  <div className="text-5xl font-extrabold text-gold">{myIdx >= 0 ? `#${myIdx + 1}` : "—"}</div>
                  <div className="mt-2 text-sm text-white/85">Hindi {mine?.h ?? "—"} NWPM · English {mine?.e ?? "—"} NWPM</div>
                  {tenth && myIdx !== -1 && myIdx > 9 && <div className="mt-1 text-sm text-white/85">Top 10 me aane ke liye <b>+{tenth - rows[myIdx].best + 1} WPM</b> chahiye</div>}
                </>
              ) : <div className="mt-1 text-sm text-white/85">Login karke test dein — aapka naam yahan aayega.</div>}
              <Link href="/typing-test" className="btn-orange mt-4"><Keyboard className="h-4 w-4" />Abhi Test Dein</Link>
            </div>
            <div className="card p-6">
              <div className="mb-2 flex items-center gap-2 text-lg font-bold"><Award className="h-5 w-5" />Weekly Rewards</div>
              <p className="text-sm text-muted">{s.weekly_rewards}</p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
