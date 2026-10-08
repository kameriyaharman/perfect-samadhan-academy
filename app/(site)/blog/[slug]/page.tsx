import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Keyboard, List, Newspaper } from "lucide-react";
import { one, q } from "@/lib/db";
import { color, fmtDate, headings, initials, md } from "@/lib/utils";
import { Container } from "@/components/Section";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await one("SELECT title, excerpt FROM posts WHERE slug=$1", [params.slug]);
  return { title: p?.title || "Blog", description: p?.excerpt };
}

export default async function Post({ params }: { params: { slug: string } }) {
  const p = await one("SELECT * FROM posts WHERE slug=$1 AND published", [params.slug]);
  if (!p) notFound();
  const related = await q("SELECT slug, title FROM posts WHERE published AND id<>$1 ORDER BY (category=$2) DESC, date DESC LIMIT 3", [p.id, p.category]);
  const toc = headings(p.content);
  return (
    <Container className="py-8">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted"><Link href="/">Home</Link><ChevronRight className="h-3.5 w-3.5" /><Link href="/blog">Blog</Link><ChevronRight className="h-3.5 w-3.5" /><span>{p.category}</span></nav>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0">
          <span className="chip bg-orange-50 text-orange-700">{p.category}</span>
          <h1 className="hi mt-3 text-3xl md:text-[42px] font-bold leading-tight text-navy">{p.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-white ring-2 ring-saffron ring-offset-2">{initials(p.author)}</span>{p.author} · {fmtDate(p.date)} · {p.read_time} min read</div>
          <div className={`mt-6 grid h-56 md:h-72 place-items-center rounded-3xl bg-gradient-to-br ${color(p.color).grad} p-6 text-center`}><span className="hi text-4xl md:text-6xl font-extrabold text-white">{p.cover_text || p.title.split(":")[0].split("—")[0]}</span></div>
          <div className="prose-psa hi mt-8" dangerouslySetInnerHTML={{ __html: md(p.content) }} />
          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl bg-navy p-6 text-white sm:flex-row sm:items-center" data-dark>
            <b className="hi text-lg">अभी अपनी स्पीड चेक करें</b>
            <Link href="/typing-test" className="btn-orange"><Keyboard className="h-4 w-4" />Free Typing Test</Link>
          </div>
        </article>
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          {toc.length > 0 && <div className="card p-6"><h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><List className="h-5 w-5" />Is lekh me</h3><ol className="hi list-decimal space-y-1.5 pl-5 text-[15px]">{toc.map((h) => <li key={h}><a href={`#${encodeURIComponent(h)}`} className="hover:text-brand">{h.replace(/^\d+\.\s*/, "")}</a></li>)}</ol></div>}
          {related.length > 0 && <div className="card p-6"><h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><Newspaper className="h-5 w-5" />Related</h3>{related.map((r: any) => <Link key={r.slug} href={`/blog/${r.slug}`} className="hi block border-b border-line py-3 text-[15px] last:border-0 hover:text-brand">{r.title}</Link>)}</div>}
        </aside>
      </div>
    </Container>
  );
}
