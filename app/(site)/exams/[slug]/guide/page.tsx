import { notFound } from "next/navigation";
import { Check, Download, Target } from "lucide-react";
import { one } from "@/lib/db";
import { sections, pipeRows } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import PrintButton from "@/components/PrintButton";

export default async function Guide({ params }: { params: { slug: string } }) {
  const e = await one("SELECT * FROM exams WHERE slug=$1", [params.slug]);
  if (!e) notFound();
  const weeks = sections(e.guide);
  const typing = pipeRows(e.pattern).filter((r) => /typing/i.test(r[0]));
  return (
    <>
      <PageHero crumbs={[{ label: "Exams", href: "/exams" }, { label: e.code, href: `/exams/${e.slug}` }, { label: "Free Guide" }]} title={`${e.code} पहली बार में कैसे पास करें —`} highlight="Free Guide" subtitle="Purane sawalon ke analysis se bana step-by-step plan — passing aur top score dono ke liye." compact />
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="hi text-3xl font-bold text-navy">{weeks.length * 7 || 30} दिन का प्लान</h2>
            <p className="text-muted">Roz 2 ghante — 1 ghanta MCQ + 1 ghanta typing</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(weeks.length ? weeks : [{ title: "Week 1", meta: "Basics", items: ["Syllabus padhein", "Topic tests dein"] }]).map((w) => (
                <div key={w.title} className="card p-6">
                  <span className="chip bg-orange-50 text-orange-600">{w.title}</span>
                  <h3 className="mt-2 text-lg font-bold">{w.meta}</h3>
                  <ul className="mt-3 space-y-1.5">{w.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-1 h-4 w-4 text-green-600" />{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-amber-800"><Target className="h-5 w-5" />Score Target</h3>
              {[["Passing", "38+"], ["Achha score", "50+"], ...typing.map((t) => [t[0], `${t[3]}+`])].map(([l, v]) => <div key={l} className="flex justify-between py-2"><span>{l}</span><b className="text-lg">{v}</b></div>)}
            </div>
            <div className="card p-6"><h3 className="flex items-center gap-2 text-lg font-bold"><Download className="h-5 w-5" />Guide PDF</h3><p className="mt-1 text-sm text-muted">Poori guide PDF me — free download</p><PrintButton className="btn-orange mt-3 w-full"><Download className="h-4 w-4" />Free Download</PrintButton></div>
          </aside>
        </div>
      </Container>
    </>
  );
}
