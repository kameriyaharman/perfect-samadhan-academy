import Link from "next/link";
import { Trophy, Users } from "lucide-react";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import { SelectionCard, type Sel } from "@/components/home/Selections";

export const metadata = { title: "Hamare Selections — Results" };

export default async function Selections({ searchParams }: { searchParams: { year?: string; exam?: string } }) {
  const all = (await q<Sel & { year: number | null }>(`SELECT * FROM selections WHERE active ORDER BY year DESC NULLS LAST, featured DESC, sort, id`).catch(() => [])) as Sel[];
  const years = Array.from(new Set(all.map((s) => s.year).filter(Boolean))) as number[];
  const exams = Array.from(new Set(all.map((s) => s.exam.trim())));
  const year = Number(searchParams.year) || null;
  const exam = searchParams.exam || "";
  const list = all.filter((s) => (!year || s.year === year) && (!exam || s.exam.trim() === exam));
  const groups = new Map<string, Sel[]>();
  for (const s of list) { const k = s.year ? String(s.year) : "Anya"; if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(s); }
  const href = (y: number | null, e: string) => { const p = new URLSearchParams(); if (y) p.set("year", String(y)); if (e) p.set("exam", e); const s = p.toString(); return `/selections${s ? "?" + s : ""}`; };
  return (
    <>
      <PageHero crumbs={[{ label: "Selections" }]} title="हमारे" highlight="चयनित विद्यार्थी" subtitle="Perfect Samadhan Academy se taiyari karke sarkari naukri paane wale hamare students — saal aur exam ke hisaab se."
        chips={[<><Trophy className="h-4 w-4" />{all.length}+ Selections</>, <><Users className="h-4 w-4" />{exams.length} Exams</>]} compact />
      <Container className="py-10">
        {!all.length ? <Empty text="Selections jald hi yahan dikhenge." /> : (
          <>
            <div className="card mb-6 space-y-3 p-4">
              <div className="flex flex-wrap gap-2">
                <Link href={href(null, exam)} className={`chip py-1.5 ${!year ? "bg-brand text-white" : "bg-canvas text-ink hover:bg-brand-50"}`}>Sabhi saal</Link>
                {years.map((y) => <Link key={y} href={href(y, exam)} className={`chip py-1.5 ${year === y ? "bg-brand text-white" : "bg-canvas text-ink hover:bg-brand-50"}`}>{y}</Link>)}
              </div>
              {exams.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <Link href={href(year, "")} className={`chip py-1.5 ${!exam ? "bg-saffron text-white" : "bg-orange-50 text-orange-700"}`}>Sabhi exam</Link>
                  {exams.map((e) => <Link key={e} href={href(year, e)} className={`hi chip py-1.5 ${exam === e ? "bg-saffron text-white" : "bg-orange-50 text-orange-700"}`}>{e}</Link>)}
                </div>
              )}
            </div>
            {!list.length ? <Empty text="Is filter me koi selection nahi." /> : Array.from(groups.entries()).map(([y, items]) => (
              <section key={y} className="mb-10">
                <h2 className="mb-4 text-xl font-bold text-navy">{y === "Anya" ? "Anya" : `Selections ${y}`} <span className="text-base font-normal text-muted">· {items.length}</span></h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
                  {items.map((s) => <SelectionCard key={s.id} s={s} wide />)}
                </div>
              </section>
            ))}
          </>
        )}
      </Container>
    </>
  );
}
