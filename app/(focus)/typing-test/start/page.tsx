import { redirect } from "next/navigation";
import { one, q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import TypingTest from "@/components/typing/TypingTest";
import { LAYOUT_NAME, PATTERN_NAME } from "@/lib/typingScore";

export const metadata = { title: "Typing Test" };

export default async function Start({ searchParams: sp }: { searchParams: Record<string, string> }) {
  const lang = sp.lang === "english" ? "english" : "hindi";
  let passage = sp.passage ? await one("SELECT * FROM passages WHERE id=$1 AND active", [Number(sp.passage) || 0]) : null;
  if (!passage) passage = await one("SELECT * FROM passages WHERE active AND language=$1 ORDER BY random() LIMIT 1", [lang]);
  if (!passage) redirect("/typing-test");
  const passages = await q(
    "SELECT id, title, level, exam, session, year FROM passages WHERE active AND language=$1 ORDER BY exam NULLS FIRST, year DESC NULLS FIRST, id",
    [passage.language === "english" ? "english" : "hindi"]
  );
  const user = await getUser();
  const layout = (lang === "english" ? "english" : ["inscript", "remington", "system"].includes(sp.layout) ? sp.layout : "remington") as any;
  const layoutName = LAYOUT_NAME[sp.layoutName || layout] || LAYOUT_NAME[layout];
  const duration = Math.min(60, Math.max(1, Number(sp.duration) || 10));
  const limit = [100, 150, 200, 250, 300].includes(Number(sp.limit)) ? Number(sp.limit) : 0;
  const pattern = PATTERN_NAME[sp.pattern] ? sp.pattern : "cpct";
  return (
    <TypingTest key={passage.id + layout} passage={{ id: passage.id, title: passage.title, text: passage.text, session: passage.session, level: passage.level }}
      passages={passages.map((x: any) => ({ id: x.id, title: x.title, level: x.level, exam: x.exam, session: x.session, year: x.year }))}
      userName={user?.name || null} limit={limit}
      lang={lang} layout={layout} layoutName={layoutName} pattern={pattern} duration={duration} mode={sp.mode === "practice" ? "practice" : "exam"} />
  );
}
