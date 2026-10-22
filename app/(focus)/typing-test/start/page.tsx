import { redirect } from "next/navigation";
import { one, q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canPassages, canPattern, getAccess } from "@/lib/access";
import LockedNotice from "@/components/typing/LockedNotice";
import TypingTest from "@/components/typing/TypingTest";
import { LAYOUT_NAME } from "@/lib/typingScore";
import { getPattern, qualifyFor } from "@/lib/patterns";

export const metadata = { title: "Typing Test" };

export default async function Start({ searchParams: sp }: { searchParams: Record<string, string> }) {
  const pat = (await getPattern(sp.pattern)) || (await getPattern("cpct"))!;
  const lang = sp.lang === "english" || sp.lang === "hindi" ? sp.lang : pat.language === "english" ? "english" : "hindi";
  const user = await getUser();
  const acc = await getAccess(user);
  const premium = canPassages(acc);
  let passage = sp.passage ? await one("SELECT * FROM passages WHERE id=$1 AND active", [Number(sp.passage) || 0]) : null;
  // random passage: free student ko sirf free passages
  if (!passage) passage = await one("SELECT * FROM passages WHERE active AND language=$1 AND (is_free OR $2) ORDER BY random() LIMIT 1", [lang, premium]);
  if (!passage) redirect("/typing-test");
  const passages = await q(
    "SELECT id, title, level, exam, session, year, is_free FROM passages WHERE active AND language=$1 ORDER BY exam NULLS FIRST, year DESC NULLS FIRST, id",
    [passage.language === "english" ? "english" : "hindi"]
  );
  const here = `/typing-test/start?${new URLSearchParams(sp).toString()}`;
  if (!canPattern(acc, pat)) return <LockedNotice title={`${pat.name} typing test`} loggedIn={!!user} back="/typing-test" next={here} />;
  if (!premium && passage.is_free === false) return <LockedNotice title={passage.title} loggedIn={!!user} back="/typing-test" next={here} />;
  // layout: URL se, warna exam pattern ka layout, warna Remington Gail
  const wanted = sp.layoutName || sp.layout || (pat.hindi_layout !== "any" ? pat.hindi_layout : "remington");
  const engine = wanted === "remington-cbi" ? "remington" : wanted;
  const layout = (lang === "english" ? "english" : ["inscript", "remington", "krutidev", "system"].includes(engine) ? engine : "remington") as any;
  const layoutName = LAYOUT_NAME[lang === "english" ? "english" : wanted] || LAYOUT_NAME[layout];
  const duration = Math.min(60, Math.max(1, Number(sp.duration) || pat.duration));
  const limit = [100, 150, 200, 250, 300].includes(Number(sp.limit)) ? Number(sp.limit) : sp.limit === "0" ? 0 : pat.words;
  return (
    <TypingTest key={passage.id + layout} passage={{ id: passage.id, title: passage.title, text: passage.text, session: passage.session, level: passage.level }}
      passages={passages.map((x: any) => ({ id: x.id, title: (x.is_free === false && !premium ? "🔒 " : "") + x.title, level: x.level, exam: x.exam, session: x.session, year: x.year }))}
      userName={user?.name || null} limit={limit}
      rules={{ name: pat.name, backspace: pat.backspace, highlight: pat.highlight, locked: pat.lock_rules, qualify: qualifyFor(pat, lang) }}
      lang={lang} layout={layout} layoutName={layoutName} pattern={pat.slug} duration={duration} mode={sp.mode === "practice" || pat.slug === "practice" ? "practice" : "exam"} />
  );
}
