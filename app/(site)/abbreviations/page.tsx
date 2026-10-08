import Link from "next/link";
import { Download, PlayCircle, Search } from "lucide-react";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Computer Abbreviations — Full Forms" };

export default async function Abbr({ searchParams }: { searchParams: { q?: string; l?: string } }) {
  const args: any[] = []; let where = "TRUE";
  if (searchParams.q) { args.push(`%${searchParams.q}%`); where = "(short ILIKE $1 OR full_form ILIKE $1 OR hindi ILIKE $1)"; }
  else if (searchParams.l) { args.push(`${searchParams.l}%`); where = "short ILIKE $1"; }
  const rows = await q(`SELECT * FROM abbreviations WHERE ${where} ORDER BY short`, args);
  const letters = (await q(`SELECT DISTINCT upper(left(short,1)) l FROM abbreviations ORDER BY l`)).map((r: any) => r.l);
  const total = (await q(`SELECT count(*)::int n FROM abbreviations`))[0]?.n || 0;
  return (
    <>
      <PageHero crumbs={[{ label: "Study Material", href: "/study-material" }, { label: "Computer Abbreviations" }]} title="कंप्यूटर" highlight="संक्षिप्ताक्षर" after=" — Full Forms" subtitle={`CPCT ke liye zaroori ${total}+ computer abbreviations, English aur Hindi arth ke saath. Har abbreviation par test bhi.`} compact />
      <Container className="py-10">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <form action="/abbreviations" className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4"><Search className="h-4 w-4 text-muted" /><input name="q" defaultValue={searchParams.q} placeholder='Abbreviation search karein — jaise "RAM"' className="w-full bg-transparent py-3 outline-none" /></form>
          <div className="flex flex-wrap gap-1.5">
            <Link href="/abbreviations" className={`grid h-11 min-w-[44px] place-items-center rounded-xl border px-3 text-sm font-bold ${!searchParams.l && !searchParams.q ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>All</Link>
            {letters.map((l) => <Link key={l} href={`/abbreviations?l=${l}`} className={`grid h-11 w-11 place-items-center rounded-xl border text-sm font-bold ${searchParams.l === l ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`}>{l}</Link>)}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {!rows.length ? <Empty text="Kuch nahi mila." /> : (
            <div className="card overflow-x-auto">
              <table className="table-x min-w-[520px]"><thead><tr><th>Short</th><th>Full Form</th><th className="hi">हिंदी</th></tr></thead>
                <tbody>{rows.map((r: any) => <tr key={r.id}><td className="font-bold text-brand">{r.short}</td><td>{r.full_form}</td><td className="hi text-[15px]">{r.hindi}</td></tr>)}</tbody></table>
            </div>
          )}
          <aside className="space-y-4">
            <div className="card p-6"><h3 className="flex items-center gap-2 text-lg font-bold"><PlayCircle className="h-5 w-5" />Abbreviation Test</h3><p className="mt-1 text-sm text-muted">10–20 sawal · Hindi/English</p><Link href="/mock-tests/keyword?q=full form" className="btn-primary mt-3 w-full">Test Dein</Link></div>
            <div className="card p-6"><h3 className="flex items-center gap-2 text-lg font-bold"><Download className="h-5 w-5" />PDF</h3><p className="mt-1 text-sm text-muted">{total}+ abbreviations ki printable list</p><a href="/abbreviations/print" className="btn-ghost mt-3 w-full">Download</a></div>
          </aside>
        </div>
      </Container>
    </>
  );
}
