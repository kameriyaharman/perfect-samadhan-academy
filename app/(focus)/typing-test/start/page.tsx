import { redirect } from "next/navigation";
import { one } from "@/lib/db";
import FocusBar from "@/components/FocusBar";
import TypingTest from "@/components/typing/TypingTest";
import { LAYOUT_NAME, PATTERN_NAME } from "@/lib/typingScore";

export const metadata = { title: "Typing Test" };

export default async function Start({ searchParams: sp }: { searchParams: Record<string, string> }) {
  const lang = sp.lang === "english" ? "english" : "hindi";
  let passage = sp.passage ? await one("SELECT * FROM passages WHERE id=$1 AND active", [Number(sp.passage) || 0]) : null;
  if (!passage) passage = await one("SELECT * FROM passages WHERE active AND language=$1 ORDER BY random() LIMIT 1", [lang]);
  if (!passage) redirect("/typing-test");
  const layout = (lang === "english" ? "english" : ["inscript", "remington", "system"].includes(sp.layout) ? sp.layout : "inscript") as any;
  const layoutName = LAYOUT_NAME[sp.layoutName || layout] || LAYOUT_NAME[layout];
  const duration = Math.min(30, Math.max(1, Number(sp.duration) || 10));
  const pattern = PATTERN_NAME[sp.pattern] ? sp.pattern : "cpct";
  return (
    <>
      <FocusBar crumbs={[{ label: "Home", href: "/" }, { label: "Typing Test", href: "/typing-test" }, { label: `${lang === "hindi" ? "Hindi · " + layoutName : "English"} · ${duration} min · ${PATTERN_NAME[pattern]}` }]} />
      <TypingTest key={passage.id + layout + duration} passage={{ id: passage.id, title: passage.title, text: passage.text, session: passage.session, level: passage.level }}
        lang={lang} layout={layout} layoutName={layoutName} pattern={pattern} duration={duration} mode={sp.mode === "practice" ? "practice" : "exam"} />
    </>
  );
}
