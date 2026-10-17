import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, CalendarCheck, Crown, Download, Share2, User } from "lucide-react";
import { getUser, isPremium } from "@/lib/auth";
import { q } from "@/lib/db";
import { fmtDate, initials, rupee } from "@/lib/utils";
import { Container, Empty } from "@/components/Section";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "My Account" };
const TABS = [["profile", "Profile"], ["attendance", "Attendance"], ["certificates", "Certificates"], ["tests", "My Tests"], ["purchases", "My Purchases"], ["saved", "Saved"], ["notifications", "Notifications"]];

export default async function Account({ searchParams }: { searchParams: { tab?: string; month?: string } }) {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
  const tab = TABS.some(([k]) => k === searchParams.tab) ? searchParams.tab! : "profile";
  const exams = (await q("SELECT name FROM exams WHERE active ORDER BY sort")).map((e: any) => e.name);
  const certs = await q("SELECT * FROM typing_results WHERE user_id=$1 AND qualified ORDER BY net_wpm DESC LIMIT 12", [user.id]);
  const prem = isPremium(user);
  return (
    <Container className="py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card self-start p-6 text-center">
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand text-3xl font-bold text-white ring-4 ring-gold ring-offset-2">{initials(user.name)}</span>
          <div className="mt-3 text-xl font-bold">{user.name}</div>
          <div className="text-sm text-muted">{user.target_exam || "Student"}{user.city ? ` · ${user.city}` : ""}</div>
          {prem && user.premium_till && <span className="chip mt-2 bg-orange-50 text-orange-700"><Crown className="h-3.5 w-3.5" />Premium — {fmtDate(user.premium_till)} tak</span>}
          <nav className="mt-5 space-y-1 text-left">
            {TABS.map(([k, l]) => <Link key={k} href={`/account?tab=${k}`} className={`block rounded-xl px-4 py-2.5 text-[15px] ${tab === k ? "bg-brand-50 font-semibold text-brand" : "hover:bg-canvas"}`}>{l}</Link>)}
            <a href="/api/auth/logout" className="block rounded-xl px-4 py-2.5 text-[15px] text-red-600 hover:bg-red-50">Logout</a>
          </nav>
        </aside>
        <div className="min-w-0 space-y-6">
          {(tab === "profile" || tab === "certificates") && (
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Award className="h-5 w-5" />Mere Certificates</h2>
              {certs.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{certs.map((c: any) => (
                <div key={c.id} className="rounded-2xl border-2 border-gold bg-gradient-to-b from-white to-amber-50 p-5 text-center">
                  <img src="/logo.png" alt="" className="mx-auto h-11 w-11" />
                  <div className="mt-2 text-[10px] font-bold tracking-[.2em] text-amber-700">TYPING CERTIFICATE</div>
                  <div className="text-2xl font-bold text-navy">{c.language === "hindi" ? "Hindi" : "English"} {Math.round(c.net_wpm)} WPM</div>
                  <div className="text-xs text-muted">{c.layout} · {fmtDate(c.created_at)}</div>
                  <div className="mt-3 flex justify-center gap-2"><Link href={`/certificate/${c.cert_id}`} className="btn-primary btn-sm"><Download className="h-3.5 w-3.5" />PDF</Link><Link href={`/verify?id=${c.cert_id}`} className="btn-soft btn-sm"><Share2 className="h-3.5 w-3.5" /></Link></div>
                </div>))}</div> : <p className="text-sm text-muted">Typing test qualify karne par certificate yahan dikhega. <Link href="/typing-test" className="text-brand underline">Test dein</Link></p>}
            </div>
          )}
          {tab === "profile" && <div className="card p-6"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><User className="h-5 w-5" />Profile Details</h2><ProfileForm user={{ name: user.name, mobile: user.mobile, email: user.email || "", city: user.city || "", target_exam: user.target_exam || "", exam_date: user.exam_date || "" }} exams={exams} /></div>}
          {tab === "attendance" && <AttendanceTab uid={user.id} month={(searchParams as any).month} />}
          {tab === "tests" && <TestsTab uid={user.id} />}
          {tab === "purchases" && <PurchasesTab uid={user.id} />}
          {tab === "saved" && <SavedTab uid={user.id} />}
          {tab === "notifications" && <NotifTab />}
        </div>
      </div>
    </Container>
  );
}

async function TestsTab({ uid }: { uid: number }) {
  const rows = await q("SELECT * FROM attempts WHERE user_id=$1 ORDER BY id DESC LIMIT 50", [uid]);
  if (!rows.length) return <Empty text="Abhi koi test nahi diya." />;
  return <div className="card overflow-x-auto"><table className="table-x min-w-[600px]"><thead><tr><th>Test</th><th>Score</th><th>Date</th><th></th></tr></thead><tbody>{rows.map((a: any) => <tr key={a.id}><td className="font-bold">{a.title}</td><td>{a.status === "submitted" ? `${a.score}/${a.total}` : "In progress"}</td><td>{fmtDate(a.started_at)}</td><td><Link className="font-bold text-brand" href={a.status === "submitted" ? `/test/result/${a.id}` : `/test/attempt/${a.id}`}>{a.status === "submitted" ? "Result" : "Resume"}</Link></td></tr>)}</tbody></table></div>;
}
async function PurchasesTab({ uid }: { uid: number }) {
  const rows = await q("SELECT * FROM orders WHERE user_id=$1 ORDER BY id DESC", [uid]);
  if (!rows.length) return <Empty text="Koi purchase nahi. Premium plans dekhein." />;
  return <div className="card overflow-x-auto"><table className="table-x min-w-[600px]"><thead><tr><th>Order</th><th>Item</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{rows.map((o: any) => <tr key={o.id}><td>#{o.id}</td><td className="font-bold">{o.item_name}</td><td>{rupee(o.amount)}</td><td><span className={`chip ${o.status === "paid" ? "bg-green-50 text-green-700" : o.status === "failed" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>{o.status}</span></td><td>{fmtDate(o.created_at)}</td></tr>)}</tbody></table></div>;
}
async function SavedTab({ uid }: { uid: number }) {
  const rows = await q("SELECT m.* FROM saved_items s JOIN materials m ON m.id=s.ref_id AND s.kind='material' WHERE s.user_id=$1 ORDER BY s.id DESC", [uid]);
  if (!rows.length) return <Empty text="Koi saved PDF nahi." />;
  return <div className="grid gap-3 sm:grid-cols-2">{rows.map((m: any) => <Link key={m.id} href={`/study-material/${m.slug}`} className="card p-5 font-bold hover:text-brand">{m.title}</Link>)}</div>;
}
async function NotifTab() {
  const rows = await q("SELECT * FROM notices WHERE active ORDER BY date DESC LIMIT 15");
  return <div className="card divide-y divide-line">{rows.map((n: any) => <div key={n.id} className="p-4"><b>{n.title}</b><div className="text-xs text-muted">{n.category} · {fmtDate(n.date)}</div></div>)}</div>;
}

async function AttendanceTab({ uid, month }: { uid: number; month?: string }) {
  const m = month && /^\d{4}-\d{2}$/.test(month) ? month : new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 7);
  const [me, rows, total] = await Promise.all([
    q("SELECT batch, roll_no FROM users WHERE id=$1", [uid]),
    q("SELECT to_char(date,'YYYY-MM-DD') AS date, status, note, batch FROM attendance WHERE user_id=$1 AND date >= ($2 || '-01')::date AND date < (($2 || '-01')::date + interval '1 month') ORDER BY date", [uid, m]),
    q("SELECT status, count(*)::int AS n FROM attendance WHERE user_id=$1 GROUP BY status", [uid]),
  ]);
  const batch = me[0]?.batch;
  if (!batch && !rows.length) return <Empty text="Aap abhi kisi offline batch me nahi jude hain. Academy me admission ke baad yahan aapki attendance dikhegi." />;
  const c = (list: any[], k: string) => list.filter((r) => r.status === k).length;
  const held = rows.length;
  const pct = held ? Math.round(((c(rows, "present") + c(rows, "late")) / held) * 100) : null;
  const tAll = total.reduce((a: number, r: any) => a + r.n, 0);
  const tPres = total.filter((r: any) => r.status === "present" || r.status === "late").reduce((a: number, r: any) => a + r.n, 0);
  const [y, mo] = m.split("-").map(Number);
  const prev = `${mo === 1 ? y - 1 : y}-${String(mo === 1 ? 12 : mo - 1).padStart(2, "0")}`;
  const next = `${mo === 12 ? y + 1 : y}-${String(mo === 12 ? 1 : mo + 1).padStart(2, "0")}`;
  const days = new Date(y, mo, 0).getDate();
  const first = new Date(y, mo - 1, 1).getDay();
  const byDay = new Map(rows.map((r: any) => [Number(r.date.slice(8)), r.status]));
  const CELL: Record<string, string> = { present: "bg-green-500 text-white", absent: "bg-red-500 text-white", leave: "bg-amber-400 text-white", late: "bg-violet-500 text-white" };
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><CalendarCheck className="h-5 w-5" />Meri Attendance</h2>
        <p className="text-sm text-muted">{batch ? `Batch: ${batch}` : ""}{me[0]?.roll_no ? ` · Roll no. ${me[0].roll_no}` : ""}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-canvas p-4"><div className="text-xs text-muted">Is mahine</div><div className={`text-2xl font-bold ${pct == null ? "" : pct >= 75 ? "text-green-700" : "text-red-600"}`}>{pct == null ? "—" : `${pct}%`}</div></div>
          <div className="rounded-xl bg-canvas p-4"><div className="text-xs text-muted">Present</div><div className="text-2xl font-bold text-green-700">{c(rows, "present") + c(rows, "late")}</div></div>
          <div className="rounded-xl bg-canvas p-4"><div className="text-xs text-muted">Absent / Leave</div><div className="text-2xl font-bold text-red-600">{c(rows, "absent")} <span className="text-base text-amber-600">/ {c(rows, "leave")}</span></div></div>
          <div className="rounded-xl bg-canvas p-4"><div className="text-xs text-muted">Kul (shuru se)</div><div className="text-2xl font-bold">{tAll ? Math.round((tPres / tAll) * 100) : 0}%</div></div>
        </div>
      </div>
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/account?tab=attendance&month=${prev}`} className="btn-ghost btn-sm">‹</Link>
          <b>{new Date(y, mo - 1, 1).toLocaleDateString("hi-IN", { month: "long", year: "numeric" })}</b>
          <Link href={`/account?tab=attendance&month=${next}`} className="btn-ghost btn-sm">›</Link>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {["र", "सो", "मं", "बु", "गु", "शु", "श"].map((d) => <div key={d} className="hi py-1 font-bold text-muted">{d}</div>)}
          {Array.from({ length: first }).map((_, i) => <div key={"e" + i} />)}
          {Array.from({ length: days }).map((_, i) => { const st = byDay.get(i + 1) as string | undefined; return <div key={i} className={`grid h-10 place-items-center rounded-lg text-sm font-semibold ${st ? CELL[st] : "bg-canvas text-muted"}`}>{i + 1}</div>; })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-500" />Present</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500" />Absent</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400" />Leave</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-violet-500" />Late</span>
        </div>
      </div>
    </div>
  );
}
