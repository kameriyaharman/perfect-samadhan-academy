import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Globe, Info, Layers, ListChecks, ShieldCheck, Ticket, Zap, Award, FileText } from "lucide-react";
import { one, q } from "@/lib/db";
import { pipeRows, md } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import SyllabusGrid from "./SyllabusGrid";

const TABS = [["overview", "Overview"], ["pattern", "Exam Pattern"], ["syllabus", "Syllabus"], ["eligibility", "Eligibility"], ["apply", "How to Apply"], ["admit", "Admit Card"], ["result", "Result"]];

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const e = await one("SELECT name FROM exams WHERE slug=$1", [params.slug]);
  return { title: e ? `${e.name} — Poori Jaankari` : "Exam" };
}

export default async function Exam({ params, searchParams }: { params: { slug: string }; searchParams: { tab?: string } }) {
  const e = await one("SELECT * FROM exams WHERE slug=$1 AND active", [params.slug]);
  if (!e) notFound();
  const tab = TABS.some(([k]) => k === searchParams.tab) ? searchParams.tab! : "overview";
  const notices = await q("SELECT * FROM notices WHERE active AND exam ILIKE $1 ORDER BY date DESC LIMIT 4", [e.code]);
  const pattern = pipeRows(e.pattern);
  const steps = pipeRows(e.how_to_apply);
  const dates = pipeRows(e.important_dates);
  const Box = ({ icon: I, title, children }: any) => <div className="card p-6"><h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><I className="h-5 w-5" />{title}</h2>{children}</div>;
  const Pattern = () => pattern.length ? (
    <Box icon={Layers} title="Exam Pattern">
      <div className="overflow-x-auto"><table className="table-x min-w-[520px]"><thead><tr><th>Part</th><th>Questions</th><th>Time</th><th>Qualifying</th></tr></thead>
        <tbody>{pattern.map((r, i) => <tr key={i}><td className="font-bold">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table></div>
    </Box>
  ) : null;
  const Apply = () => steps.length ? (
    <Box icon={ListChecks} title="Apply kaise karein">
      <ol className="relative ml-2 border-l-2 border-line">{steps.map((s, i) => <li key={i} className="relative mb-5 pl-6 last:mb-0"><span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-orange-100 bg-saffron" /><b className="block">{s[0]}</b><span className="text-sm text-muted">{s[1]}</span></li>)}</ol>
    </Box>
  ) : null;
  const Text = ({ icon, title, body }: any) => <Box icon={icon} title={title}><div className="prose-psa" dangerouslySetInnerHTML={{ __html: md(body || "Jaankari jald update hogi.") }} /></Box>;
  return (
    <>
      <PageHero crumbs={[{ label: "Exams", href: "/exams" }, { label: e.code }]} title={`${e.name} परीक्षा —`} highlight="पूरी जानकारी" subtitle={e.description}
        chips={[e.next_exam && <><CalendarDays className="h-4 w-4" />Next Exam: {e.next_exam}</>, e.fee && <><Ticket className="h-4 w-4" />Fee {e.fee}</>, e.validity && <><ShieldCheck className="h-4 w-4" />Validity {e.validity}</>].filter(Boolean) as any} />
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {TABS.map(([k, l]) => <Link key={k} href={`/exams/${e.slug}?tab=${k}`} className={`tab ${tab === k ? "active" : ""}`}>{l}</Link>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-5">
            {tab === "overview" && <><Text icon={Info} title={`${e.code} kya hai?`} body={e.overview || e.description} /><Pattern /><Apply /></>}
            {tab === "pattern" && <Pattern />}
            {tab === "syllabus" && <SyllabusGrid syllabus={e.syllabus} slug={e.slug} />}
            {tab === "eligibility" && <Text icon={Award} title="Eligibility" body={e.eligibility} />}
            {tab === "apply" && <Apply />}
            {tab === "admit" && <Text icon={Ticket} title="Admit Card" body={e.admit_card} />}
            {tab === "result" && <Text icon={FileText} title="Result" body={e.result_info} />}
          </div>
          <aside className="space-y-5">
            {dates.length > 0 && (
              <div className="rounded-2xl bg-navy p-6 text-white" data-dark>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gold"><CalendarDays className="h-5 w-5" />Important Dates</h3>
                {dates.map((d, i) => <div key={i} className="flex justify-between border-b border-white/10 py-2.5 text-sm"><span className="text-white/80">{d[0]}</span><b>{d[1]}</b></div>)}
                {e.official_url && <a href={e.official_url} target="_blank" rel="noreferrer" className="btn-orange mt-4 w-full"><Globe className="h-4 w-4" />Official Website</a>}
              </div>
            )}
            <div className="card p-6">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><Zap className="h-5 w-5" />Quick Links</h3>
              {[[`${e.code} Mock Test`, `/mock-tests/${e.slug}`], ["Hindi Typing Test", "/typing-test/setup?lang=hindi"], ["English Typing Test", "/typing-test/setup?lang=english"], ["Previous Papers", "/previous-papers"], ["Syllabus", `/exams/${e.slug}/syllabus`], [`Free ${e.code} Guide`, `/exams/${e.slug}/guide`]].map(([l, h]) => (
                <Link key={h} href={h} className="flex items-center justify-between border-b border-line py-3 text-[15px] last:border-0 hover:text-brand">{l}<ChevronRight className="h-4 w-4" /></Link>
              ))}
            </div>
            {notices.length > 0 && (
              <div className="card p-6"><h3 className="mb-2 text-lg font-bold">Latest Notices</h3>{notices.map((n: any) => <Link key={n.id} href="/notices" className="block border-b border-line py-2.5 text-sm last:border-0 hover:text-brand">{n.title}</Link>)}</div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
