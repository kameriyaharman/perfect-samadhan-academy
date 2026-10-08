import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { one } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import SyllabusGrid from "../SyllabusGrid";

export default async function Syllabus({ params }: { params: { slug: string } }) {
  const e = await one("SELECT * FROM exams WHERE slug=$1", [params.slug]);
  if (!e) notFound();
  const pdf = await one("SELECT slug FROM materials WHERE type='syllabus' AND exam ILIKE $1 AND active LIMIT 1", [e.code]);
  return (
    <>
      <PageHero crumbs={[{ label: "Exams", href: "/exams" }, { label: e.code, href: `/exams/${e.slug}` }, { label: "Syllabus" }]} title={e.code} highlight="सिलेबस" after={` ${new Date().getFullYear()}`} subtitle="Official syllabus ke anusaar topic list — har topic ke saath notes aur test ka link.">
        {pdf && <a href={`/api/download/material/${pdf.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm"><Download className="h-4 w-4" />Syllabus PDF</a>}
      </PageHero>
      <Container className="py-10"><SyllabusGrid syllabus={e.syllabus} slug={e.slug} /></Container>
    </>
  );
}
