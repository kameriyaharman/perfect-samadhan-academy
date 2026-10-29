import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, Languages, MonitorCheck, Search } from "lucide-react";
import { getUser } from "@/lib/auth";
import { canTest, getAccess } from "@/lib/access";
import { cpctComputerPapers, splitSession } from "@/lib/pyqComputer";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import StartButton from "./StartButton";
import AdSlot from "@/components/ads/AdSlot";

export const metadata = { title: "CPCT Previous Year Online Test — Computer (52 प्रश्न)" };

export default async function CpctComputer() {
  const [papers, user] = await Promise.all([cpctComputerPapers(), getUser()]);
  const acc = await getAccess(user);
  const byYear = new Map<string, any[]>();
  for (const p of papers) {
    const y = String(p.year || "Other");
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "CPCT Computer PYQ" }]} title="CPCT Previous Year Online Test —" highlight="कंप्यूटर (52 प्रश्न)"
        subtitle="Pichhle saalon ke CPCT paper ka sirf Computer / IT wala hissa — 52 sawal, Hindi + English me. Submit karte hi score card aur answer key."
        chips={[<><MonitorCheck className="h-4 w-4" />52 प्रश्न · Computer &amp; IT</>, <><Clock className="h-4 w-4" />1 min / sawal</>, <><Languages className="h-4 w-4" />हिंदी / English</>]} compact />
      <Container className="py-10">
        <AdSlot place="Mock Test" />
        <div className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-5 text-sm md:grid-cols-3">
          <div className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />Sabhi sawal hal karein, phir <b className="hi">&nbsp;सबमिट</b>&nbsp;dabayein.</div>
          <div className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />Score card aur har sawal ka sahi uttar milega.</div>
          <div className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />CPCT 75 sawal me se 52 Computer ke hote hain.</div>
        </div>
        {!papers.length ? <Empty text="Abhi koi CPCT paper upload nahi hua." /> : (
          <div className="space-y-8">
            {Array.from(byYear.entries()).map(([y, list], i) => (
              <section key={y}>
                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-navy"><CalendarDays className="h-5 w-5 text-brand" />Previous Year {y}</h2>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p) => {
                    const { label, shift } = splitSession(p.session, p.title);
                    return <StartButton key={p.id} testId={p.id} loggedIn={!!user} locked={!canTest(acc, { is_free: p.is_free, exam_slug: "cpct", series: p.series, folder_id: p.folder_id })} label={`${label}${shift ? ` – ${shift}` : ""} · ${p.qn} Q`} />;
                  })}
                </div>
                {i === 0 && (
                  <Link href="/mock-tests/keyword" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-saffron-600 hover:underline"><Search className="h-4 w-4" />Topic-wise Mock Test By Keyword Search</Link>
                )}
              </section>
            ))}
          </div>
        )}
        <AdSlot place="Mock Test" pos="bottom" />
      </Container>
    </>
  );
}
