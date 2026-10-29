import Link from "next/link";
import { ChevronRight, Layers, Languages, Zap } from "lucide-react";
import { color } from "@/lib/utils";
import { examsWithKind, foldersOf, testsOf } from "@/lib/testLists";
import Icon from "@/components/Icon";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import AdSlot from "@/components/ads/AdSlot";

export const metadata = { title: "Syllabus Wise Mock Test" };
const ICONS = ["monitor", "cpu", "file-spreadsheet", "file-text", "presentation", "globe", "shield", "calculator", "brain", "book-open"];
const COLS = ["blue", "purple", "green", "orange", "red", "teal", "amber", "navy"];

export default async function Syllabus({ searchParams }: { searchParams: { exam?: string } }) {
  const exams = await examsWithKind("topic");
  const exam = exams.some((e: any) => e.slug === searchParams.exam) ? searchParams.exam! : exams[0]?.slug || "cpct";
  const cur = exams.find((e: any) => e.slug === exam);
  const [folders, tests] = await Promise.all([foldersOf("test:syllabus", exam), testsOf("topic", exam)]);
  const cards = folders.map((f: any) => ({ f, n: tests.filter((t: any) => t.folder_id === f.id).length })).filter((c: any) => c.n > 0);
  const loose = tests.filter((t: any) => !folders.some((f: any) => f.id === t.folder_id));
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Syllabus Wise Test" }]} title={`${cur?.code || ""} Syllabus Wise`} highlight="मॉक टेस्ट"
        subtitle={`${cur?.code || "Exam"} ki taiyari me tension mat lo! Topic-wise tests se systematic tareeke se practice karo — official syllabus ke mutabik, Hindi + English dono me.`} compact
        chips={[<><Layers className="h-4 w-4" />{tests.length} Topic Tests</>, <><Languages className="h-4 w-4" />Hindi / English</>, <><Zap className="h-4 w-4" />Turant sahi / galat</>]} />
      <Container className="py-10">
        <AdSlot place="Mock Test" />
        {exams.length > 1 && (
          <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
            {exams.map((e: any) => <Link key={e.slug} href={`/mock-tests/syllabus?exam=${e.slug}`} className={`tab ${exam === e.slug ? "active" : ""}`}>{e.name}</Link>)}
          </div>
        )}
        {!tests.length ? <Empty /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ f, n }: any, i: number) => {
              const c = color(f.color && f.color !== "blue" ? f.color : COLS[i % COLS.length]);
              return (
                <Link key={f.id} href={`/mock-tests/syllabus/${f.id}`} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${c.bg} ${c.text}`}><Icon name={f.icon || ICONS[i % ICONS.length]} className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <b className="hi block text-[17px] leading-snug">{f.name}</b>
                    <span className="block text-sm text-muted">{f.description || `${n} Topic ${n === 1 ? "Test" : "Tests"} · Syllabus-wise · Hindi/English`}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-brand" />
                </Link>
              );
            })}
            {loose.length > 0 && (
              <Link href={`/mock-tests/syllabus/0?exam=${exam}`} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"><Layers className="h-5 w-5" /></span>
                <span className="flex-1"><b className="block text-[17px]">Aur Topic Tests</b><span className="text-sm text-muted">{loose.length} Topic Tests · Syllabus-wise</span></span>
                <ChevronRight className="h-5 w-5 text-muted" />
              </Link>
            )}
          </div>
        )}
        <AdSlot place="Mock Test" pos="bottom" />
      </Container>
    </>
  );
}
