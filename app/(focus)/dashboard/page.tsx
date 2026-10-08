import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, BarChart3, Bell, BookMarked, ClipboardList, Clock, Flame, Gauge, GraduationCap, Home, Keyboard, LayoutDashboard, PlayCircle, Settings, Target, Trophy, ShieldCheck } from "lucide-react";
import { getUser, isPremium } from "@/lib/auth";
import { q, one } from "@/lib/db";
import { fmtDate, initials } from "@/lib/utils";
import LineChart from "@/components/charts/LineChart";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: { paid?: string } }) {
  const user = await getUser();
  if (!user) redirect("/login?next=/dashboard");
  const [best, mock, typingDays, weekly, attempts, typings, topics] = await Promise.all([
    one(`SELECT ROUND(MAX(CASE WHEN language='hindi' THEN net_wpm END)::numeric)::int h, ROUND(MAX(CASE WHEN language='english' THEN net_wpm END)::numeric)::int e,
         ROUND(MAX(CASE WHEN language='hindi' AND created_at > now()-interval '30 days' THEN net_wpm END)::numeric - COALESCE(MAX(CASE WHEN language='hindi' AND created_at <= now()-interval '30 days' THEN net_wpm END),0)::numeric)::int hd,
         ROUND(MAX(CASE WHEN language='english' AND created_at > now()-interval '30 days' THEN net_wpm END)::numeric - COALESCE(MAX(CASE WHEN language='english' AND created_at <= now()-interval '30 days' THEN net_wpm END),0)::numeric)::int ed
       FROM typing_results WHERE user_id=$1`, [user.id]),
    one(`SELECT ROUND(AVG(score)::numeric)::int avg, ROUND(AVG(total)::numeric)::int total, count(*)::int n FROM attempts WHERE user_id=$1 AND status='submitted' AND kind IN ('full','pyq')`, [user.id]),
    q(`SELECT DISTINCT d FROM (SELECT date(created_at) d FROM typing_results WHERE user_id=$1 UNION SELECT date(started_at) FROM attempts WHERE user_id=$1) x ORDER BY d DESC LIMIT 60`, [user.id]),
    q(`SELECT date_trunc('week', created_at) w, language, MAX(net_wpm) v FROM typing_results WHERE user_id=$1 AND created_at > now()-interval '42 days' GROUP BY 1,2 ORDER BY 1`, [user.id]),
    q(`SELECT id, title, kind, score, total, status, started_at d FROM attempts WHERE user_id=$1 ORDER BY id DESC LIMIT 6`, [user.id]),
    q(`SELECT cert_id, language, layout, passage_title, net_wpm, accuracy, qualified, created_at d FROM typing_results WHERE user_id=$1 ORDER BY id DESC LIMIT 6`, [user.id]),
    q(`SELECT section_stats FROM attempts WHERE user_id=$1 AND status='submitted' ORDER BY id DESC LIMIT 20`, [user.id]),
  ]);
  // streak
  let streak = 0; const days = new Set(typingDays.map((d: any) => new Date(d.d).toDateString()));
  for (let i = 0; i < 60; i++) { const d = new Date(Date.now() - i * 86400000).toDateString(); if (days.has(d)) streak++; else if (i > 0) break; }
  // weekly chart
  const weeks: string[] = []; for (let i = 5; i >= 0; i--) { const d = new Date(Date.now() - i * 7 * 86400000); weeks.push(d.toDateString()); }
  const wk = (lang: string) => { const vals = weekly.filter((w: any) => w.language === lang).map((w: any) => Math.round(w.v)); return vals; };
  const hi = wk("hindi"), en = wk("english");
  // weak topics
  const agg: Record<string, [number, number]> = {};
  for (const t of topics) { const s = JSON.parse(t.section_stats || "{}"); for (const sec of Object.values<any>(s)) for (const [k, [c, n]] of Object.entries<any>(sec.topics || {})) { agg[k] ||= [0, 0]; agg[k][0] += c; agg[k][1] += n; } }
  const weak = Object.entries(agg).map(([k, [c, n]]) => [k, Math.round((c / n) * 100)] as [string, number]).sort((a, b) => a[1] - b[1]).slice(0, 4);
  const activity = [
    ...typings.map((t: any) => ({ name: `${t.language === "hindi" ? "Hindi" : "English"} Typing · ${t.passage_title || ""}`.slice(0, 48), type: `Typing · ${t.layout}`, val: `${Math.round(t.net_wpm)} WPM · ${t.accuracy}%`, d: t.d, st: t.qualified ? "Qualified" : "Practice", ok: t.qualified, href: `/typing-test/result/${t.cert_id}`, act: "Result" })),
    ...attempts.map((a: any) => ({ name: a.title, type: a.kind === "full" ? "Full Mock" : a.kind, val: a.status === "submitted" ? `${a.score} / ${a.total}` : "—", d: a.d, st: a.status !== "submitted" ? "In progress" : a.score / Math.max(1, a.total) >= 0.5 ? "Pass" : "Weak", ok: a.status === "submitted" && a.score / Math.max(1, a.total) >= 0.5, href: a.status === "submitted" ? `/test/solutions/${a.id}` : `/test/attempt/${a.id}`, act: a.status === "submitted" ? "Solution" : "Resume" })),
  ].sort((a, b) => +new Date(b.d) - +new Date(a.d)).slice(0, 6);
  const examDays = user.exam_date ? Math.ceil((new Date(user.exam_date).getTime() - Date.now()) / 86400000) : null;
  const nav = [[LayoutDashboard, "Dashboard", "/dashboard"], [Keyboard, "Typing Test", "/typing-test"], [ClipboardList, "My Tests", "/account?tab=tests"], [BookMarked, "Saved PDFs", "/account?tab=saved"], [Trophy, "Leaderboard", "/typing-test/leaderboard"], [GraduationCap, "My Courses", "/account?tab=purchases"], [Award, "Certificates", "/account?tab=certificates"], [Settings, "Settings", "/account"]] as const;
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[250px] shrink-0 flex-col bg-navy p-4 text-white lg:flex" data-dark>
        <Link href="/" className="mb-6 flex items-center gap-2 px-2"><img src="/logo.png" className="h-10 w-10" alt="" /><span className="hi text-lg font-bold">परफेक्ट समाधान</span></Link>
        {nav.map(([I, l, h], i) => <Link key={l} href={h} className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] ${i === 0 ? "bg-white/10 font-semibold" : "text-white/80 hover:bg-white/5"}`}><I className="h-4 w-4" />{l}</Link>)}
        {user.role === "admin" && <Link href="/admin" className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] text-gold hover:bg-white/5"><ShieldCheck className="h-4 w-4" />Admin Panel</Link>}
        {!isPremium(user) && <div className="mt-6 rounded-2xl bg-gradient-to-br from-saffron to-gold p-4 text-navy"><b className="block">Premium Test Series</b><span className="text-xs">60 CPCT mocks + PYQ bundle</span><Link href="/plans" className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-sm font-bold">Upgrade</Link></div>}
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="hi text-3xl font-bold text-navy">नमस्ते {user.name.split(" ")[0]} 👋</h1>
            <p className="text-muted">{examDays && examDays > 0 ? <>{user.target_exam || "Exam"} me <b className="text-saffron">{examDays} din</b> baaki — </> : null}aaj ka goal: 1 mock + 15 min typing</p>
          </div>
          <div className="flex items-center gap-2"><Link href="/" className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white lg:hidden"><Home className="h-4 w-4" /></Link><Link href="/notices" className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white"><Bell className="h-4 w-4" /></Link><Link href="/account" className="grid h-11 w-11 place-items-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-saffron ring-offset-2">{initials(user.name)}</Link></div>
        </div>
        {searchParams.paid && <div className="mt-4 rounded-xl bg-green-50 p-4 text-green-700">Payment safal raha — aapka premium access activate ho gaya! 🎉</div>}
        <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden scrollbar-none">{nav.slice(1).map(([, l, h]) => <Link key={l} href={h} className="chip whitespace-nowrap bg-white border border-line py-2">{l}</Link>)}</div>
        <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <div className="rounded-2xl bg-navy p-5 text-white" data-dark><div className="flex items-center gap-1.5 text-sm text-white/70"><Gauge className="h-4 w-4" />Best Hindi Speed</div><div className="mt-1 text-3xl font-bold text-gold">{best?.h ?? 0} <span className="text-sm text-white/60">WPM</span></div>{best?.hd ? <div className="text-xs text-green-400">▲ {best.hd} is mahine</div> : null}</div>
          <div className="card p-5"><div className="flex items-center gap-1.5 text-sm text-muted"><Keyboard className="h-4 w-4" />Best English Speed</div><div className="mt-1 text-3xl font-bold">{best?.e ?? 0} <span className="text-sm text-muted">WPM</span></div>{best?.ed ? <div className="text-xs text-green-600">▲ {best.ed} is mahine</div> : null}</div>
          <div className="card p-5"><div className="flex items-center gap-1.5 text-sm text-muted"><ClipboardList className="h-4 w-4" />Avg Mock Score</div><div className="mt-1 text-3xl font-bold">{mock?.avg ?? 0} <span className="text-sm text-muted">/ {mock?.total || 75}</span></div><div className="text-xs text-muted">{mock?.n || 0} mocks diye</div></div>
          <div className="card p-5"><div className="flex items-center gap-1.5 text-sm text-muted"><Flame className="h-4 w-4" />Practice Streak</div><div className="mt-1 text-3xl font-bold">{streak} <span className="text-sm text-muted">din</span></div><div className="text-xs text-saffron">Roz practice karein!</div></div>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <div className="card p-6">
            <div className="mb-2 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><BarChart3 className="h-5 w-5" />Typing Speed Progress (Net WPM)</h2><span className="flex gap-3 text-xs"><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-brand" />Hindi</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-saffron" />English</span></span></div>
            {hi.length + en.length >= 2 ? <LineChart series={[{ color: "#1f35b8", values: hi }, { color: "#f28c0f", values: en }]} labels={Array.from({ length: Math.max(hi.length, en.length) }, (_, i) => `W${i + 1}`)} /> : <div className="grid h-52 place-items-center rounded-xl bg-canvas text-center text-sm text-muted"><div>Kuch typing tests dein — yahan aapki progress dikhegi.<br /><Link href="/typing-test" className="btn-primary btn-sm mt-3">Typing Test Dein</Link></div></div>}
          </div>
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5" />Weak Topics — inpar dhyan dein</h2>
            {weak.length ? weak.map(([t, p]) => (
              <div key={t} className="mb-3"><div className="flex justify-between text-sm"><span>{t}</span><b className={p < 50 ? "text-red-500" : p < 75 ? "text-saffron" : "text-green-600"}>{p}%</b></div><div className="mt-1 h-2 rounded-full bg-canvas"><div className={`h-2 rounded-full ${p < 50 ? "bg-red-500" : p < 75 ? "bg-saffron" : "bg-green-600"}`} style={{ width: `${p}%` }} /></div></div>
            )) : <p className="text-sm text-muted">Mock tests dene ke baad yahan weak topics dikhenge.</p>}
            <Link href={weak[0] ? `/mock-tests/keyword?q=${encodeURIComponent(weak[0][0])}` : "/mock-tests"} className="btn-primary mt-3 w-full"><PlayCircle className="h-4 w-4" />{weak[0] ? `${weak[0][0]} Test Dein` : "Mock Test Dein"}</Link>
          </div>
        </div>
        <div className="card mt-5 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><Clock className="h-5 w-5" />Recent Activity</h2>
          {activity.length ? (
            <div className="overflow-x-auto"><table className="table-x min-w-[680px]"><thead><tr><th>Test</th><th>Type</th><th>Score / Speed</th><th>Date</th><th>Status</th><th></th></tr></thead>
              <tbody>{activity.map((a, i) => <tr key={i}><td className="font-bold">{a.name}</td><td>{a.type}</td><td>{a.val}</td><td>{fmtDate(a.d)}</td><td><span className={`chip ${a.ok ? "bg-green-50 text-green-700" : a.st === "In progress" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"}`}>{a.st}</span></td><td><Link href={a.href} className="font-bold text-brand">{a.act}</Link></td></tr>)}</tbody></table></div>
          ) : <p className="text-sm text-muted">Abhi koi activity nahi. <Link href="/mock-tests" className="text-brand underline">Pehla test dein</Link>.</p>}
        </div>
      </main>
    </div>
  );
}
