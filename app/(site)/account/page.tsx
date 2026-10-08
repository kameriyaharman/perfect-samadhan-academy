import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, Crown, Download, Share2, User } from "lucide-react";
import { getUser, isPremium } from "@/lib/auth";
import { q } from "@/lib/db";
import { fmtDate, initials, rupee } from "@/lib/utils";
import { Container, Empty } from "@/components/Section";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "My Account" };
const TABS = [["profile", "Profile"], ["certificates", "Certificates"], ["tests", "My Tests"], ["purchases", "My Purchases"], ["saved", "Saved"], ["notifications", "Notifications"]];

export default async function Account({ searchParams }: { searchParams: { tab?: string } }) {
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
