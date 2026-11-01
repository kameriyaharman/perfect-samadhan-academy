import { redirect } from "next/navigation";
import { one, q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canPassages, canPattern, getAccess, isGuest, loginHref } from "@/lib/access";
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
  const here0 = `/typing-test/start?${new URLSearchParams(sp).toString()}`;
  const PSEL = "SELECT p.*, f.guest AS folder_guest FROM passages p LEFT JOIN folders f ON f.id=p.folder_id";
  let passage = sp.passage ? await one(`${PSEL} WHERE p.id=$1 AND p.active`, [Number(sp.passage) || 0]) : null;
  // random passage: free student ko sirf free passages; bina login sirf "bina login" wale
  if (!passage) passage = await one(`${PSEL} WHERE p.active AND p.language=$1 AND (p.is_free OR $2) AND ($3 OR p.guest OR COALESCE(f.guest,false)) ORDER BY random() LIMIT 1`, [lang, premium, !!user]);
  if (!passage) redirect(user ? "/typing-test" : loginHref(here0));
  // login zaroori — sirf admin ke chune "bina login" passage / folder chhod kar
  if (!user && !isGuest(passage)) redirect(loginHref(here0));
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
      rules={{ name: pat.name, backspace: pat.backspace, highlight: pat.highlight, locked: pat.lock_rules, qualify: qualifyFor(pat, lang), errPen: pat.error_penalty, bsPen: pat.backspace_penalty }}
      lang={lang} layout={layout} layoutName={layoutName} pattern={pat.slug} duration={duration} mode={sp.mode === "practice" || pat.slug === "practice" ? "practice" : "exam"} />
  );
}
