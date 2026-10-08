import Link from "next/link";
import { q } from "@/lib/db";
import { color, fmtDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Blog aur Lekh" };
const CATS = ["Exam News", "Typing Tips", "Strategy", "Computer Notes"];
const PER = 9;

export default async function Blog({ searchParams }: { searchParams: { c?: string; page?: string } }) {
  const c = CATS.includes(searchParams.c || "") ? searchParams.c! : "";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const args = c ? [c] : [];
  const total = (await q(`SELECT count(*)::int n FROM posts WHERE published ${c ? "AND category=$1" : ""}`, args))[0].n;
  const rows = await q(`SELECT * FROM posts WHERE published ${c ? "AND category=$1" : ""} ORDER BY date DESC, id DESC LIMIT ${PER} OFFSET ${(page - 1) * PER}`, args);
  const pages = Math.ceil(total / PER);
  return (
    <>
      <PageHero crumbs={[{ label: "Blog" }]} title="ब्लॉग और" highlight="लेख" subtitle="Exam news, preparation strategy, typing tips aur computer notes — har hafte naye articles." compact />
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          <Link href="/blog" className={`tab ${!c ? "active" : ""}`}>Sabhi</Link>
          {CATS.map((k) => <Link key={k} href={`/blog?c=${encodeURIComponent(k)}`} className={`tab ${c === k ? "active" : ""}`}>{k}</Link>)}
        </div>
        {!rows.length ? <Empty /> : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((p: any) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <div className={`flex h-40 items-end bg-gradient-to-br ${color(p.color).grad} p-5`}><h3 className="hi text-xl font-bold leading-snug text-white line-clamp-2">{p.title}</h3></div>
                <div className="p-5"><span className="chip bg-brand-50 text-brand">{p.category.replace("Exam News", "News").replace("Typing Tips", "Typing")}</span><h4 className="hi mt-2 font-bold leading-snug group-hover:text-brand">{p.title}</h4><div className="mt-1 text-xs text-muted">{fmtDate(p.date, false)} · {p.read_time} min read</div></div>
              </Link>
            ))}
          </div>
        )}
        {pages > 1 && <div className="mt-8 flex justify-center gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} href={`/blog?${c ? `c=${encodeURIComponent(c)}&` : ""}page=${n}`} className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-bold ${n === page ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>{n}</Link>)}</div>}
      </Container>
    </>
  );
}
