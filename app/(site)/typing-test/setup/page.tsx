import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import SetupForm from "./SetupForm";
import { getPatterns } from "@/lib/patterns";
import { getUser } from "@/lib/auth";
import { canPassages, getAccess } from "@/lib/access";

export const metadata = { title: "Typing Test — Setting chunein" };

export default async function Setup({ searchParams }: { searchParams: Record<string, string> }) {
  const lang = searchParams.lang === "english" ? "english" : "hindi";
  const patterns = await getPatterns();
  const passages = await q(`SELECT p.id, p.title, p.language, p.level, p.exam, p.year, p.session, p.shift, p.is_free, f.name AS folder FROM passages p LEFT JOIN folders f ON f.id=p.folder_id AND f.active WHERE p.active ORDER BY f.sort NULLS LAST, f.id NULLS LAST, p.year DESC NULLS FIRST, p.id`);
  return (
    <>
      <PageHero crumbs={[{ label: "Typing Test", href: "/typing-test" }, { label: lang === "hindi" ? "Hindi Typing Test" : "English Typing Test" }]}
        title={lang === "hindi" ? "हिंदी टाइपिंग टेस्ट —" : "English Typing Test —"} highlight="सेटिंग चुनें"
        subtitle="Apna exam, keyboard layout, samay aur passage chunein. Test shuru karne se pehle niche ke nirdesh zaroor padhein." compact />
      <Container className="py-10">
        <SetupForm initial={{ lang, layout: searchParams.layout, pattern: searchParams.pattern, duration: searchParams.duration, passage: searchParams.passage }} passages={passages as any} patterns={patterns} premium={canPassages(await getAccess(await getUser()))} />
      </Container>
    </>
  );
}
