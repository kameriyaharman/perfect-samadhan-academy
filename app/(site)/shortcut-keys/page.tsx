import Link from "next/link";
import { Download, PlayCircle } from "lucide-react";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Important Shortcut Keys" };

function Keys({ k }: { k: string }) {
  const parts = k.split("+").map((x) => x.trim()).filter(Boolean);
  if (k.endsWith("++")) parts.push("+");
  return <span className="flex flex-wrap items-center gap-1.5">{parts.map((p, i) => <span key={i} className="flex items-center gap-1.5">{i > 0 && <span className="text-muted">+</span>}<span className="kbd">{p}</span></span>)}</span>;
}

export default async function Shortcuts({ searchParams }: { searchParams: { c?: string } }) {
  const cats = (await q(`SELECT category, min(id) m FROM shortcuts GROUP BY category ORDER BY m`)).map((r: any) => r.category);
  const cat = searchParams.c && cats.includes(searchParams.c) ? searchParams.c : cats[0];
  const rows = await q(`SELECT * FROM shortcuts WHERE category=$1 ORDER BY sort, id`, [cat]);
  const half = Math.ceil(rows.length / 2);
  const total = (await q(`SELECT count(*)::int n FROM shortcuts`))[0]?.n || 0;
  const pdf = (await q(`SELECT slug FROM materials WHERE type='shortcut' AND active LIMIT 1`))[0];
  const Table = ({ list }: { list: any[] }) => (
    <div className="card overflow-x-auto">
      <table className="table-x min-w-[420px]"><thead><tr><th>Shortcut</th><th>Kaam</th><th className="hi">हिंदी</th></tr></thead>
        <tbody>{list.map((r) => <tr key={r.id}><td><Keys k={r.keys} /></td><td>{r.action}</td><td className="hi text-[15px]">{r.hindi}</td></tr>)}</tbody></table>
    </div>
  );
  return (
    <>
      <PageHero crumbs={[{ label: "Study Material", href: "/study-material" }, { label: "Shortcut Keys" }]} title="महत्वपूर्ण" highlight="शॉर्टकट कुंजियाँ"
        subtitle={`CPCT aur computer exams me baar-baar poochhi jaane wali ${total}+ shortcut keys — Word, Excel, PowerPoint, Windows aur Browser.`}>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {pdf && <a href={`/api/download/material/${pdf.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm"><Download className="h-4 w-4" />PDF Download</a>}
          <Link href="/mock-tests/keyword?q=shortcut" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm"><PlayCircle className="h-4 w-4" />Shortcut Quiz</Link>
        </div>
      </PageHero>
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {cats.map((c) => <Link key={c} href={`/shortcut-keys?c=${encodeURIComponent(c)}`} className={`tab ${c === cat ? "active" : ""}`}>{c}</Link>)}
        </div>
        {!rows.length ? <Empty /> : <div className="grid gap-5 lg:grid-cols-2"><Table list={rows.slice(0, half)} /><Table list={rows.slice(half)} /></div>}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy p-6 md:flex-row md:items-center text-white" data-dark>
          <div><h3 className="text-2xl font-bold">Shortcut Keys Quiz — 20 sawal</h3><p className="text-sm text-white/75">Yaad hua ya nahi? 5 minute me check karein.</p></div>
          <Link href="/mock-tests/keyword?q=shortcut" className="btn-orange !py-3"><PlayCircle className="h-5 w-5" />Quiz Dein</Link>
        </div>
      </Container>
    </>
  );
}
