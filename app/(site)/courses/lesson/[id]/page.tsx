import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, FileText, Lock, NotebookText, PlayCircle } from "lucide-react";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { bySection, courseLessons, isVideoFile, ownsCourse, ytEmbed } from "@/lib/courses";
import { md } from "@/lib/utils";
import { Container } from "@/components/Section";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const l = await one("SELECT title FROM course_lessons WHERE id=$1", [Number(params.id) || 0]).catch(() => null);
  return { title: l?.title || "Course Lesson" };
}
const KIND_ICON: Record<string, any> = { video: PlayCircle, pdf: FileText, notes: NotebookText };

export default async function Lesson({ params }: { params: { id: string } }) {
  const id = Number(params.id) || 0;
  const l = await one("SELECT * FROM course_lessons WHERE id=$1 AND active", [id]);
  if (!l) notFound();
  const c = await one("SELECT id, slug, title FROM courses WHERE id=$1", [l.course_id]);
  if (!c) notFound();
  const user = await getUser();
  const owned = await ownsCourse(user, c.slug);
  const back = `/courses/${encodeURIComponent(c.slug)}?tab=content`;
  if (!owned && !l.is_free) redirect(user ? back : `/login?next=${encodeURIComponent(`/courses/lesson/${id}`)}`);
  const all = await courseLessons(c.id);
  const open = all.filter((x: any) => owned || x.is_free);
  const idx = open.findIndex((x: any) => x.id === id);
  const prev = open[idx - 1], next = open[idx + 1];
  const yt = ytEmbed(l.video_url);
  const vfile = !yt && isVideoFile(l.video_url) ? l.video_url : null;
  const pdf = l.file_url || (l.kind === "pdf" && l.video_url && !yt && !vfile ? l.video_url : null);
  return (
    <Container className="py-6 md:py-8">
      <Link href={back} className="mb-3 inline-flex items-center gap-1 text-sm text-brand"><ChevronLeft className="h-4 w-4" />{c.title}</Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          {yt && <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-lift"><iframe src={yt} title={l.title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen /></div>}
          {vfile && <video src={vfile} controls controlsList="nodownload" playsInline className="aspect-video w-full rounded-2xl bg-black shadow-lift" />}
          {l.kind === "video" && !yt && !vfile && l.video_url && <a href={l.video_url} target="_blank" rel="noreferrer" className="btn-primary"><PlayCircle className="h-4 w-4" />Video kholein</a>}
          <div className="card p-5">
            {l.section && <span className="hi text-sm text-muted">{l.section}</span>}
            <h1 className="hi text-2xl font-bold text-navy">{l.title}</h1>
            {l.notes && <div className="prose-psa hi mt-3" dangerouslySetInnerHTML={{ __html: md(l.notes) }} />}
          </div>
          {pdf && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3 text-sm"><span className="flex items-center gap-2"><FileText className="h-4 w-4" />PDF</span><a href={pdf} target="_blank" rel="noreferrer" className="btn-soft btn-sm"><Download className="h-3.5 w-3.5" />Kholein / Download</a></div>
              <iframe src={pdf} title={l.title} className="h-[75vh] w-full" />
            </div>
          )}
          <div className="flex justify-between gap-2">
            {prev ? <Link href={`/courses/lesson/${prev.id}`} className="btn-ghost"><ChevronLeft className="h-4 w-4" />Pichhla</Link> : <span />}
            {next && <Link href={`/courses/lesson/${next.id}`} className="btn-primary">Agla Lesson<ChevronRight className="h-4 w-4" /></Link>}
          </div>
        </div>
        <aside className="card h-fit overflow-hidden lg:sticky lg:top-20">
          <div className="border-b border-line px-5 py-3 font-bold">Course Content</div>
          <div className="max-h-[70vh] overflow-y-auto">
            {bySection(all).map((g) => (
              <div key={g.name}>
                <div className="hi bg-canvas px-5 py-2 text-xs font-bold uppercase text-muted">{g.name}</div>
                {g.items.map((x: any) => {
                  const ok = owned || x.is_free; const Ic = KIND_ICON[x.kind] || PlayCircle;
                  const inner = <><Ic className="h-4 w-4 shrink-0" /><span className="hi flex-1 leading-snug">{x.title}</span>{!ok && <Lock className="h-3.5 w-3.5" />}</>;
                  return ok ? <Link key={x.id} href={`/courses/lesson/${x.id}`} className={`flex items-center gap-2 px-5 py-2.5 text-sm ${x.id === id ? "bg-brand-50 font-semibold text-brand" : "hover:bg-canvas"}`}>{inner}</Link>
                    : <div key={x.id} className="flex items-center gap-2 px-5 py-2.5 text-sm text-muted">{inner}</div>;
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Container>
  );
}
