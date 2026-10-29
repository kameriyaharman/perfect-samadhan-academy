import Link from "next/link";
import { ChevronDown, Download, Lock } from "lucide-react";
import { getUser } from "@/lib/auth";
import { canTest, getAccess } from "@/lib/access";
import { examsWithKind, foldersOf, sessionLabel, testHref, testsOf } from "@/lib/testLists";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import AdSlot from "@/components/ads/AdSlot";

export const metadata = { title: "Old Paper Tests" };

export default async function Pyq({ searchParams }: { searchParams: { exam?: string } }) {
  const exams = await examsWithKind("pyq");
  const exam = exams.some((e: any) => e.slug === searchParams.exam) ? searchParams.exam! : exams[0]?.slug || "cpct";
  const cur = exams.find((e: any) => e.slug === exam);
  const [folders, tests] = await Promise.all([foldersOf("test:old", exam), testsOf("pyq", exam)]);
  const acc = await getAccess(await getUser());
  // folder wise; bina folder wale saal ke hisaab se
  const groups: { key: string; name: string; list: any[] }[] = folders.map((f: any) => ({ key: `f${f.id}`, name: f.name, list: tests.filter((t: any) => t.folder_id === f.id) }));
  const loose = tests.filter((t: any) => !folders.some((f: any) => f.id === t.folder_id));
  const years = Array.from(new Set(loose.map((t: any) => t.year || 0))).sort((a: any, b: any) => b - a);
  for (const y of years) groups.push({ key: `y${y}`, name: `${cur?.code || ""} ${y || ""} Old Paper Tests`.trim(), list: loose.filter((t: any) => (t.year || 0) === y) });
  const shown = groups.filter((g) => g.list.length);
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Old Paper Tests" }]} title={`Practice ${cur?.code || ""}`} highlight="Old Paper Tests" subtitle="Asli purane paper ab online test format me — timer, instant result aur answer key ke saath." compact />
      <Container className="py-10">
        <AdSlot place="Mock Test" />
        <Link href="/mock-tests/cpct-computer" className="mb-6 flex flex-col gap-3 rounded-2xl bg-navy p-5 text-white transition hover:-translate-y-0.5 hover:shadow-lift md:flex-row md:items-center md:p-6" data-dark>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold text-lg font-extrabold text-navy">52</span>
          <span className="flex-1"><b className="block text-lg md:text-xl">CPCT Previous Year Online Test — <span className="hi">कंप्यूटर (52 प्रश्न)</span></b><span className="text-sm text-white/75">Sirf Computer wala hissa · saal aur shift ke hisaab se · Hindi + English</span></span>
          <span className="btn bg-gold px-5 py-2.5 font-bold text-navy">Test dein →</span>
        </Link>
        {exams.length > 1 && (
          <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
            {exams.map((e: any) => <Link key={e.slug} href={`/mock-tests/pyq?exam=${e.slug}`} className={`tab ${exam === e.slug ? "active" : ""}`}>{e.name}</Link>)}
          </div>
        )}
        {!shown.length ? <Empty /> : (
          <div className="mx-auto max-w-5xl space-y-3">
            {shown.map((g, gi) => (
              <details key={g.key} open={gi === 0} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-navy px-5 py-3.5 font-bold text-white group-open:bg-brand" data-dark>
                  <span className="hi">{g.name} <span className="font-normal text-white/70">({g.list.length})</span></span>
                  <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
                </summary>
                <div className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
                  {g.list.map((t: any) => {
                    const ok = canTest(acc, t);
                    return (
                      <div key={t.id} className="flex flex-col items-center rounded-xl bg-brand-50/60 p-3 text-center">
                        <b className="text-[14px] leading-snug text-navy">{sessionLabel(t)}</b>
                        <span className="mt-0.5 text-xs text-muted">{t.qn} Q · {t.duration} min</span>
                        {ok ? <Link href={testHref(t)} className="mt-2 rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white hover:bg-brand">Start Test</Link>
                          : <Link href="/plans" className="mt-2 inline-flex items-center gap-1 rounded-full bg-saffron px-4 py-1.5 text-xs font-bold text-white"><Lock className="h-3 w-3" />Premium</Link>}
                        {t.pdf_url && <a href={t.pdf_url} className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-brand underline"><Download className="h-3 w-3" />PDF</a>}
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        )}
        <AdSlot place="Mock Test" pos="bottom" />
      </Container>
    </>
  );
}
