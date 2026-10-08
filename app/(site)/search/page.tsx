import { Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Search" };

export default async function Search({ searchParams }: { searchParams: { q?: string } }) {
  const s = (searchParams.q || "").trim();
  const like = `%${s}%`;
  const [exams, mats, tests, posts, notices] = s ? await Promise.all([
    q("SELECT slug, name FROM exams WHERE active AND (name ILIKE $1 OR code ILIKE $1) LIMIT 8", [like]),
    q("SELECT slug, title FROM materials WHERE active AND (title ILIKE $1 OR description ILIKE $1) LIMIT 8", [like]),
    q("SELECT id, title FROM mock_tests WHERE active AND (title ILIKE $1 OR topic ILIKE $1 OR subject ILIKE $1) ORDER BY kind, sort LIMIT 8", [like]),
    q("SELECT slug, title FROM posts WHERE published AND (title ILIKE $1 OR content ILIKE $1) LIMIT 8", [like]),
    q("SELECT id, title FROM notices WHERE active AND title ILIKE $1 LIMIT 8", [like]),
  ]) : [[], [], [], [], []];
  const groups: [string, { href: string; label: string }[]][] = [
    ["Exams", exams.map((x: any) => ({ href: `/exams/${x.slug}`, label: x.name }))],
    ["Study Material", mats.map((x: any) => ({ href: `/study-material/${x.slug}`, label: x.title }))],
    ["Tests", tests.map((x: any) => ({ href: `/test/${x.id}`, label: x.title }))],
    ["Blog", posts.map((x: any) => ({ href: `/blog/${x.slug}`, label: x.title }))],
    ["Notices", notices.map((x: any) => ({ href: `/notices`, label: x.title }))],
  ];
  const total = groups.reduce((a, g) => a + g[1].length, 0);
  return (
    <>
      <PageHero crumbs={[{ label: "Search" }]} title="Search:" highlight={s || "…"} subtitle={`${total} results`} compact>
        <form className="mt-5 flex max-w-2xl gap-2 rounded-2xl bg-white p-2"><input name="q" defaultValue={s} className="flex-1 px-3 text-ink outline-none" placeholder="Search…" /><button className="btn-orange"><SearchIcon className="h-4 w-4" />Search</button></form>
      </PageHero>
      <Container className="py-10">
        {!total ? <Empty text="Kuch nahi mila — doosra shabd try karein." /> : (
          <div className="grid gap-5 md:grid-cols-2">
            {groups.filter((g) => g[1].length).map(([t, list]) => (
              <div key={t} className="card p-6"><h3 className="mb-2 text-lg font-bold">{t}</h3>{list.map((l) => <Link key={l.href + l.label} href={l.href} className="block border-b border-line py-2.5 last:border-0 hover:text-brand">{l.label}</Link>)}</div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
