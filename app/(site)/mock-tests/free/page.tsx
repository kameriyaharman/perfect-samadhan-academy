import Link from "next/link";
import { FileQuestion, Clock, Gift, Lock, Volume2, Zap } from "lucide-react";
import { q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canTest, getAccess } from "@/lib/access";
import { examsWithKind, foldersOf, testsOf } from "@/lib/testLists";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import AdSlot from "@/components/ads/AdSlot";

export const metadata = { title: "Free Mock Test" };

export default async function FreeMock({ searchParams }: { searchParams: { exam?: string; f?: string } }) {
  const exams = await examsWithKind("free");
  const exam = exams.some((e: any) => e.slug === searchParams.exam) ? searchParams.exam! : exams[0]?.slug || "cpct";
  const cur = exams.find((e: any) => e.slug === exam) || (await q("SELECT slug, code, name FROM exams WHERE slug=$1", [exam]))[0];
  const [folders, free] = await Promise.all([foldersOf("test:free", exam), testsOf("free", exam)]);
  const acc = await getAccess(await getUser());
  const tabs = [...folders.map((f: any) => ({ id: String(f.id), name: f.name, list: free.filter((t: any) => t.folder_id === f.id) })),
    { id: "other", name: folders.length ? "Aur Free Tests" : `Free ${cur?.code || ""} Test`, list: free.filter((t: any) => !folders.some((f: any) => f.id === t.folder_id)) }].filter((t) => t.list.length);
  const sel = tabs.find((t) => t.id === searchParams.f) || tabs[0];
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Free Mock Test" }]} title={`${cur?.code || ""} Mock Test Online —`} highlight="बिल्कुल फ्री" subtitle="Ek-ek sawal, option chunte hi turant sahi / galat — awaaz ke saath. Har sawal ki vyakhya bhi." compact
        chips={[<><Gift className="h-4 w-4" />{free.length} Free Tests</>, <><Zap className="h-4 w-4" />Instant result</>, <><Volume2 className="h-4 w-4" />Sahi / galat awaaz</>]} />
      <Container className="py-10">
        <AdSlot place="Mock Test" />
        {exams.length > 1 && (
          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
            {exams.map((e: any) => <Link key={e.slug} href={`/mock-tests/free?exam=${e.slug}`} className={`tab ${exam === e.slug ? "active" : ""}`}>{e.name}</Link>)}
          </div>
        )}
        {!sel ? <Empty text="Abhi free mock test nahi hain — jald aa rahe hain." /> : (
          <div className="rounded-3xl bg-brand-50/50 p-4 md:p-6">
            {tabs.length > 1 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {tabs.map((t) => <Link key={t.id} href={`/mock-tests/free?exam=${exam}&f=${t.id}`} className={`hi rounded-full border px-4 py-2 text-sm font-semibold transition ${t.id === sel.id ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`}>{t.name}</Link>)}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sel.list.map((t: any) => {
                const ok = canTest(acc, t);
                return (
                  <div key={t.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card">
                    <b className="hi text-[16.5px] leading-snug">{t.title}</b>
                    <div className="mt-2 flex gap-4 text-sm text-muted"><span className="flex items-center gap-1"><FileQuestion className="h-4 w-4" />{t.qn} Questions</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{t.duration} min</span></div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-sm font-semibold ${t.is_free ? "text-green-600" : "text-saffron-600"}`}>{t.is_free ? "Free" : "Premium"}</span>
                      {ok ? <Link href={t.mode === "exam" ? `/test/${t.id}` : `/test/practice/${t.id}`} className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-brand">Start Now</Link>
                        : <Link href="/plans" className="inline-flex items-center gap-1 rounded-lg bg-saffron px-4 py-2 text-sm font-bold text-white"><Lock className="h-3.5 w-3.5" />Unlock</Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <AdSlot place="Mock Test" pos="bottom" />
      </Container>
    </>
  );
}
