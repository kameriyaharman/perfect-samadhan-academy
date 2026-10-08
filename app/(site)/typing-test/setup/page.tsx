import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import SetupForm from "./SetupForm";

export const metadata = { title: "Typing Test — Setting chunein" };

export default async function Setup({ searchParams }: { searchParams: Record<string, string> }) {
  const lang = searchParams.lang === "english" ? "english" : "hindi";
  const passages = await q(`SELECT id, title, language, level, exam, year, session, shift FROM passages WHERE active ORDER BY year DESC NULLS FIRST, id`);
  return (
    <>
      <PageHero crumbs={[{ label: "Typing Test", href: "/typing-test" }, { label: lang === "hindi" ? "Hindi Typing Test" : "English Typing Test" }]}
        title={lang === "hindi" ? "हिंदी टाइपिंग टेस्ट —" : "English Typing Test —"} highlight="सेटिंग चुनें"
        subtitle="Apna exam, keyboard layout, samay aur passage chunein. Test shuru karne se pehle niche ke nirdesh zaroor padhein." compact />
      <Container className="py-10">
        <SetupForm initial={{ lang, layout: searchParams.layout, pattern: searchParams.pattern, duration: searchParams.duration, passage: searchParams.passage }} passages={passages as any} />
      </Container>
    </>
  );
}
