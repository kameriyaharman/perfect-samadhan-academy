import Link from "next/link";
import { Award, CalendarDays, Download, ExternalLink, FileText, Info, MessageCircle } from "lucide-react";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { MONTHS } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Notice Board aur Important Dates" };
const TABS = [["", "Sabhi"], ["Admit Card", "Admit Card"], ["Result", "Result"], ["Vacancy", "Vacancy"], ["Answer Key", "Answer Key"]];
const CC: Record<string, string> = { "Admit Card": "bg-red-50 text-red-600", Objection: "bg-orange-50 text-orange-700", Result: "bg-green-50 text-green-700", Application: "bg-brand-50 text-brand", Notification: "bg-slate-100 text-slate-700", "Old Paper": "bg-green-50 text-green-700", Vacancy: "bg-amber-50 text-amber-700", "Answer Key": "bg-violet-50 text-violet-700" };

export default async function Notices({ searchParams }: { searchParams: { c?: string } }) {
  const c = searchParams.c || "";
  const rows = c ? await q(`SELECT * FROM notices WHERE active AND (category=$1 OR ($1='Answer Key' AND category='Objection')) ORDER BY date DESC`, [c]) : await q(`SELECT * FROM notices WHERE active ORDER BY date DESC LIMIT 60`);
  const [up, s] = await Promise.all([q(`SELECT * FROM upcoming_exams ORDER BY sort`), getSettings()]);
  return (
    <>
      <PageHero crumbs={[{ label: "Notices" }]} title="नोटिस बोर्ड और" highlight="महत्वपूर्ण तिथियाँ" subtitle="Admit card, result, answer key, vacancy aur exam dates — sab updates ek jagah. WhatsApp par bhi milenge." compact />
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">{TABS.map(([k, l]) => <Link key={k} href={k ? `/notices?c=${encodeURIComponent(k)}` : "/notices"} className={`tab ${c === k ? "active" : ""}`}>{l}</Link>)}</div>
            {!rows.length ? <Empty /> : (
              <div className="card divide-y divide-line overflow-hidden">
                {rows.map((n: any) => {
                  const d = new Date(n.date);
                  return (
                    <details key={n.id} className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 md:p-5 hover:bg-canvas">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-center leading-none text-brand"><span><b className="block text-xl">{String(d.getDate()).padStart(2, "0")}</b><span className="text-[10px] font-bold uppercase">{MONTHS[d.getMonth()]}</span></span></span>
                        <span className="min-w-0 flex-1"><span className={`chip ${CC[n.category] || "bg-slate-100"}`}>{n.category}</span><span className="mt-1 block font-bold">{n.title}</span><span className="text-xs text-muted">Posted by Admin · {n.exam}</span></span>
                        {n.link && n.link !== "/notices" ? <a href={n.link} target={n.link.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="btn-soft btn-sm"><NoticeIcon label={n.link_label} />{n.link_label || "Details"}</a> : <span className="btn-soft btn-sm"><NoticeIcon label={n.link_label} />{n.link_label || "Details"}</span>}
                      </summary>
                      {n.content && <div className="px-5 pb-5 pl-[92px] text-sm text-muted">{n.content}</div>}
                    </details>
                  );
                })}
              </div>
            )}
          </div>
          <aside className="space-y-4">
            <div className="card p-6"><h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><CalendarDays className="h-5 w-5" />Upcoming Exams</h3>{up.map((u: any) => <div key={u.id} className="flex justify-between border-b border-line py-3 last:border-0"><span>{u.name}</span><b className="text-brand">{u.date}</b></div>)}</div>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6"><h3 className="flex items-center gap-2 text-lg font-bold text-green-700"><MessageCircle className="h-5 w-5" />WhatsApp Alerts</h3><p className="mt-1 text-sm text-muted">Har notice sabse pehle WhatsApp par paayein.</p><a href={s.whatsapp_group || `https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" className="btn mt-3 bg-[#25d366] px-5 py-2.5 text-white"><MessageCircle className="h-4 w-4" />Join Group</a></div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function NoticeIcon({ label }: { label?: string | null }) {
  const l = (label || "").toLowerCase();
  const I = l.includes("download") ? Download : l.includes("pdf") ? FileText : l.includes("score") || l.includes("result") ? Award : l.includes("apply") ? ExternalLink : Info;
  return <I className="h-3.5 w-3.5" />;
}
