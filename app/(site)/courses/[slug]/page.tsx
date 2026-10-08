import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, CheckCircle2, Clock, ListChecks, MapPin, Users } from "lucide-react";
import { one, q } from "@/lib/db";
import { initials, lines, md, pipeRows, rupee } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import EnrollBox from "./EnrollBox";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await one("SELECT title FROM courses WHERE slug=$1", [params.slug]);
  return { title: c?.title || "Course" };
}
const TABS = [["overview", "Overview"], ["syllabus", "Syllabus"], ["faculty", "Faculty"], ["reviews", "Reviews"]];

export default async function Course({ params, searchParams }: { params: { slug: string }; searchParams: { tab?: string } }) {
  const c = await one("SELECT * FROM courses WHERE slug=$1 AND active", [params.slug]);
  if (!c) notFound();
  const tab = TABS.some(([k]) => k === searchParams.tab) ? searchParams.tab : "overview";
  const fac = c.faculty ? await one("SELECT * FROM faculty WHERE name=$1", [c.faculty]) : null;
  const allFac = tab === "faculty" ? await q("SELECT * FROM faculty ORDER BY sort") : [];
  const reviews = tab === "reviews" ? await q("SELECT * FROM testimonials ORDER BY sort") : [];
  const words = c.title.split(" ");
  return (
    <>
      <PageHero crumbs={[{ label: "Courses", href: "/courses" }, { label: c.title }]} title={words[0]} highlight={words.slice(1).join(" ")} after=" — नया बैच" subtitle={c.subtitle}
        chips={[c.start_date && <><CalendarDays className="h-4 w-4" />Shuru: {c.start_date}</>, c.timing && <><Clock className="h-4 w-4" />{c.timing}</>, c.seats && <><Users className="h-4 w-4" />{c.seats} seats</>].filter(Boolean) as any} compact />
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-5">
            <div className="flex gap-1 overflow-x-auto border-b border-line scrollbar-none">{TABS.map(([k, l]) => <Link key={k} href={`/courses/${c.slug}?tab=${k}`} className={`tab ${tab === k ? "active" : ""}`}>{l}</Link>)}</div>
            {tab === "overview" && (
              <>
                <div className="card p-6"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ListChecks className="h-5 w-5" />Is course me kya milega</h2>
                  <div className="grid gap-3 sm:grid-cols-2">{lines(c.features).map((f) => <div key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-ink" />{f}</div>)}</div></div>
                {pipeRows(c.plan).length > 0 && <div className="card p-6"><h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5" />Course Plan</h2>
                  {pipeRows(c.plan).map((r, i) => <div key={i} className="flex gap-4 border-b border-line py-4 last:border-0"><span className="chip h-fit shrink-0 bg-orange-50 text-orange-600 py-1.5">{r[0]}</span><span><b className="block">{r[1]}</b><span className="text-sm text-muted">{r[2]}</span></span></div>)}</div>}
                {fac && <div className="card flex items-center gap-4 p-6"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy text-xl font-bold text-white ring-4 ring-gold/50">{initials(fac.name)}</span><span><b className="block text-lg">{fac.name}</b><span className="text-sm text-muted">{fac.bio || `${fac.subject} · ${fac.experience}`}</span></span></div>}
              </>
            )}
            {tab === "syllabus" && <div className="card prose-psa p-6" dangerouslySetInnerHTML={{ __html: md(c.syllabus || pipeRows(c.plan).map((r) => `## ${r[0]} — ${r[1]}\n${r[2]}`).join("\n")) }} />}
            {tab === "faculty" && <div className="grid gap-4 sm:grid-cols-2">{allFac.map((f: any) => <div key={f.id} className="card flex items-center gap-4 p-5"><span className="grid h-14 w-14 place-items-center rounded-full bg-brand font-bold text-white">{initials(f.name)}</span><span><b className="block">{f.name}</b><span className="text-sm text-muted">{f.subject} · {f.experience}</span></span></div>)}</div>}
            {tab === "reviews" && <div className="grid gap-4 sm:grid-cols-2">{reviews.map((r: any) => <div key={r.id} className="card p-5"><p className="italic text-muted">“{r.quote}”</p><b className="mt-2 block">— {r.name}, {r.exam}</b></div>)}</div>}
          </div>
          <aside className="space-y-4">
            <EnrollBox slug={c.slug} title={c.title} price={c.price} mrp={c.mrp} offer={c.offer_text} mode={c.mode} />
            {c.centre && <div className="card p-6"><h3 className="flex items-center gap-2 text-lg font-bold"><MapPin className="h-5 w-5" />Centre</h3><p className="mt-1 text-sm text-muted">{c.centre}</p></div>}
          </aside>
        </div>
      </Container>
    </>
  );
}
