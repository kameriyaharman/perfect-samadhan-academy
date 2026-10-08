import Link from "next/link";
import { ClipboardCheck, Gauge, IndianRupee, Inbox, Users, FileText } from "lucide-react";
import { q, one } from "@/lib/db";
import { fmtDate, rupee } from "@/lib/utils";

export default async function AdminHome() {
  const s = await one(`SELECT
    (SELECT count(*)::int FROM users WHERE role<>'admin') users,
    (SELECT count(*)::int FROM users WHERE role<>'admin' AND created_at > now()-interval '7 days') users7,
    (SELECT count(*)::int FROM attempts) attempts,
    (SELECT count(*)::int FROM typing_results) typings,
    (SELECT count(*)::int FROM typing_results WHERE created_at > now()-interval '1 day') typings1,
    (SELECT COALESCE(sum(amount),0)::int FROM orders WHERE status='paid') revenue,
    (SELECT count(*)::int FROM orders WHERE status='pending') pending,
    (SELECT count(*)::int FROM enquiries WHERE status='new') enq,
    (SELECT count(*)::int FROM mock_tests) tests, (SELECT count(*)::int FROM questions) questions, (SELECT count(*)::int FROM materials) materials`);
  const [enq, orders, users] = await Promise.all([
    q("SELECT * FROM enquiries ORDER BY id DESC LIMIT 6"), q("SELECT * FROM orders ORDER BY id DESC LIMIT 6"), q("SELECT id,name,mobile,city,created_at FROM users ORDER BY id DESC LIMIT 6"),
  ]);
  const cards = [[Users, "Students", s.users, `+${s.users7} is hafte`, "/admin/r/users"], [Gauge, "Typing Tests", s.typings, `${s.typings1} aaj`, "/admin/r/typing_results"], [ClipboardCheck, "Mock Attempts", s.attempts, `${s.tests} tests · ${s.questions} Q`, "/admin/r/mock_tests"], [IndianRupee, "Revenue", rupee(s.revenue), `${s.pending} pending orders`, "/admin/r/orders"], [Inbox, "New Enquiries", s.enq, "Call back karein", "/admin/r/enquiries"], [FileText, "Study Material", s.materials, "PDFs & notes", "/admin/r/materials"]] as const;
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
      <p className="text-muted">Website ki poori jaankari ek jagah. Left menu se har cheez manage karein.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([I, l, v, sub, h]) => (
          <Link key={l} href={h} className="card flex items-center gap-4 p-5 hover:shadow-lift">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand"><I className="h-5 w-5" /></span>
            <span><span className="block text-sm text-muted">{l}</span><span className="block text-2xl font-bold">{v}</span><span className="text-xs text-muted">{sub}</span></span>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {[["Latest Enquiries", "/admin/r/enquiries", enq.map((e: any) => [e.name, `${e.mobile} · ${e.course || e.type}`, e.status])], ["Latest Orders", "/admin/r/orders", orders.map((o: any) => [o.item_name, `${o.name} · ${rupee(o.amount)}`, o.status])], ["New Students", "/admin/r/users", users.map((u: any) => [u.name, `${u.mobile} · ${u.city || ""}`, fmtDate(u.created_at, false)])]].map(([t, h, list]: any) => (
          <div key={t} className="card p-5">
            <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">{t}</h2><Link href={h} className="text-sm text-brand">Sab dekhein</Link></div>
            {list.length ? list.map((r: string[], i: number) => <div key={i} className="flex items-center justify-between border-b border-line py-2.5 text-sm last:border-0"><span className="min-w-0"><b className="block truncate">{r[0]}</b><span className="text-xs text-muted">{r[1]}</span></span><span className="chip bg-canvas">{r[2]}</span></div>) : <p className="text-sm text-muted">Kuch nahi.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
