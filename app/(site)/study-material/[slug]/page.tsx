import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileText, Languages, List, Lock, PlayCircle, Star } from "lucide-react";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { fmtDate, lines } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import DocPreview from "./DocPreview";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const m = await one("SELECT title FROM materials WHERE slug=$1", [params.slug]);
  return { title: m?.title || "Study Material" };
}

export default async function Material({ params }: { params: { slug: string } }) {
  const m = await one("SELECT * FROM materials WHERE slug=$1 AND active", [params.slug]);
  if (!m) notFound();
  const user = await getUser();
  const saved = user ? !!(await one("SELECT 1 FROM saved_items WHERE user_id=$1 AND kind='material' AND ref_id=$2", [user.id, m.id])) : false;
  const related = m.related_test_id ? await one("SELECT id, title FROM mock_tests WHERE id=$1", [m.related_test_id]) : await one("SELECT id, title FROM mock_tests WHERE kind='topic' AND active AND (title ILIKE $1 OR topic ILIKE $1) LIMIT 1", [`%${m.title.split(/[\s—-]+/)[1] || m.subject}%`]);
  const typeName: Record<string, string> = { notes: "Notes PDF", pyq: "Previous Papers", shortcut: "Shortcut Keys", syllabus: "Syllabus" };
  const langName: Record<string, string> = { hindi: "हिंदी", english: "English", bilingual: "Bilingual" };
  const words = m.title.split(" ");
  const half = Math.ceil(words.length * 0.65);
  const isPdf = m.file_url && /\.pdf($|\?)|\/api\/files\//i.test(m.file_url);
  return (
    <>
      <PageHero crumbs={[{ label: "Study Material", href: "/study-material" }, { label: typeName[m.type], href: `/study-material?type=${m.type}` }, { label: m.title.split("—")[0].trim() }]}
        title={words.slice(0, half).join(" ")} highlight={words.slice(half).join(" ")}
        subtitle={`${m.description || ""}${m.pages ? ` · ${m.pages} pages` : ""} · Updated ${fmtDate(m.updated_at)}`}
        chips={[<><Download className="h-4 w-4" />{m.downloads.toLocaleString("en-IN")} downloads</>, ...(m.rating ? [<><Star className="h-4 w-4" />{m.rating} rating</>] : []), <><Languages className="h-4 w-4" />{langName[m.language]}</>]} />
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {isPdf && !m.is_premium ? (
              <div className="card overflow-hidden"><div className="flex items-center gap-2 border-b border-line px-5 py-3 text-sm"><FileText className="h-4 w-4" />PDF Preview</div><iframe src={m.file_url} className="h-[75vh] w-full" title={m.title} /></div>
            ) : (
              <DocPreview title={m.title} pages={m.pages} html={m.preview_html} contents={lines(m.contents)} premium={m.is_premium} slug={m.slug} />
            )}
          </div>
          <aside className="space-y-4">
            <div className="card p-5">
              {m.is_premium ? <Link href={`/checkout?item=material:${m.slug}`} className="btn-orange w-full !py-3.5 text-base"><Lock className="h-5 w-5" />Unlock ₹{m.price || 99}</Link>
                : <a href={`/api/download/material/${m.slug}`} className="btn-orange w-full !py-3.5 text-base"><Download className="h-5 w-5" />Free Download{m.size_mb ? ` (${m.size_mb} MB)` : ""}</a>}
              <div className="mt-3 grid grid-cols-2 gap-2"><SaveButton kind="material" id={m.id} big initial={saved} /><ShareButton title={m.title} /></div>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[["Exam", m.exam], ["Subject", m.subject], ["Language", langName[m.language]], ["Pages", m.pages], ["Updated", fmtDate(m.updated_at)]].filter(([, v]) => v).map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="font-bold">{v}</dd></div>)}
              </dl>
            </div>
            {lines(m.contents).length > 0 && (
              <div className="card p-6">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><List className="h-5 w-5" />Contents</h3>
                <ol className="list-decimal space-y-1.5 pl-5 text-[15px]">{lines(m.contents).map((c) => <li key={c}>{c}</li>)}</ol>
              </div>
            )}
            {related && (
              <div className="card p-6">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><PlayCircle className="h-5 w-5" />Related Test</h3>
                <p className="text-sm text-muted">{related.title}</p>
                <Link href={`/test/${related.id}`} className="btn-primary mt-3">Test Dein</Link>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
