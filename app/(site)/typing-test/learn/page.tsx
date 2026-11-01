import Link from "next/link";
import { BookOpen, Check, Clock, Folder, GraduationCap, Hand, Languages, Keyboard, Lock, PlayCircle, Sparkles } from "lucide-react";
import { parseInstructions } from "@/lib/instructions";
import { q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canLesson, getAccess } from "@/lib/access";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import KeyboardView from "@/components/typing/KeyboardView";
import { FINGER_COLOR, FINGER_NAME } from "@/lib/keyboard";

export const metadata = { title: "Typing Seekhein — Lessons" };
const TABS = [["remington", "हिंदी — Remington Gail Mangal"], ["inscript", "हिंदी — Inscript"], ["english", "English"]];
const NUM = ["bg-green-50 text-green-700", "bg-brand-50 text-brand", "bg-orange-50 text-orange-600", "bg-violet-50 text-violet-700"];

export default async function Learn({ searchParams }: { searchParams: { layout?: string } }) {
  const layout = TABS.some(([k]) => k === searchParams.layout) ? searchParams.layout! : "remington";
  const user = await getUser();
  const lessons = await q(`SELECT l.*, f.is_free AS folder_free FROM lessons l LEFT JOIN lesson_folders f ON f.id=l.folder_id
    WHERE l.active AND l.layout=$1 AND (f.id IS NULL OR f.active) ORDER BY l.number`, [layout]);
  const folders = await q(`SELECT * FROM lesson_folders WHERE active AND layout=$1 ORDER BY sort, id`, [layout]);
  const acc = await getAccess(user);
  const groups = [...folders.map((f: any) => ({ f, list: lessons.filter((l: any) => l.folder_id === f.id) })), { f: null as any, list: lessons.filter((l: any) => !folders.some((f: any) => f.id === l.folder_id)) }].filter((g) => g.list.length);
  const prog = user ? await q(`SELECT lesson_id, accuracy FROM lesson_progress WHERE user_id=$1`, [user.id]) : [];
  const done = new Map(prog.map((p: any) => [p.lesson_id, p.accuracy]));
  const doneCount = lessons.filter((l: any) => done.has(l.id)).length;
  // lamba folder description = instructions → side me step-by-step; chhota description folder par hi dikhe
  const isLong = (d: string | null) => !!d && d.trim().length > 140;
  const guides = folders.filter((f: any) => isLong(f.description)).map((f: any) => ({ f, g: parseInstructions(f.description)! })).filter((x: any) => x.g);
  return (
    <>
      <PageHero crumbs={[{ label: "Typing Test", href: "/typing-test" }, { label: "Learn Typing" }]} title="टाइपिंग सीखें —" highlight="शुरुआत से"
        subtitle={`Kabhi typing nahi ki? Koi baat nahi. ${lessons.length} aasaan lessons me sahi finger placement ke saath Hindi aur English typing seekhein.`}
        chips={[<><GraduationCap className="h-4 w-4" />{lessons.length} Lessons</>, <><Clock className="h-4 w-4" />Roz 20 min</>, <><Languages className="h-4 w-4" />Hindi Remington Gail Mangal · Inscript · English</>]} />
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {TABS.map(([k, l]) => <Link key={k} href={`/typing-test/learn?layout=${k}`} className={`tab hi ${layout === k ? "active" : ""}`}>{l}</Link>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8 self-start">
            {!groups.length && <div className="card p-8 text-center text-muted">Is layout me abhi koi lesson nahi hai.</div>}
            {groups.map(({ f, list }) => {
              const fDone = list.filter((l: any) => done.has(l.id)).length;
              const fLocked = f && f.is_free === false && !canLesson(acc, { is_free: true, folder_id: f.id, folder_free: false });
              return (
                <section key={f?.id || "other"}>
                  {(f || groups.length > 1) && (
                    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand"><Folder className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <b className="hi block text-navy">{f ? f.name : "Aur lessons"}</b>
                        <span className="hi block text-sm text-muted">{f?.description && !isLong(f.description) ? f.description : `${list.length} lessons${isLong(f?.description) ? " · Niyam / instructions side me dekhein" : ""}`}</span>
                      </span>
                      {fLocked ? <span className="chip bg-orange-50 py-1.5 text-saffron-600"><Lock className="h-3.5 w-3.5" />Premium folder</span> : <span className="chip bg-canvas py-1.5 text-muted">{fDone} / {list.length} done</span>}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {list.map((l: any, i: number) => {
                      const acc2 = done.get(l.id);
                      const locked = !canLesson(acc, l);
                      return (
                        <Link key={l.id} href={locked ? "/plans" : `/typing-test/learn/${l.id}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-bold ${acc2 != null ? NUM[0] : NUM[1 + (i % 3)]}`}>{l.number}</span>
                          <span className="min-w-0 flex-1">
                            <span className="hi block font-bold">{l.title}</span>
                            <span className="hi block truncate text-sm text-muted">{l.subtitle}</span>
                            <span className="mt-2 block h-1.5 rounded-full bg-canvas"><span className={`block h-1.5 rounded-full ${acc2 != null ? "bg-green-600" : "bg-brand/20"}`} style={{ width: acc2 != null ? `${Math.max(30, acc2)}%` : "0%" }} /></span>
                          </span>
                          {locked ? <span className="chip bg-orange-50 py-1.5 text-saffron-600"><Lock className="h-3.5 w-3.5" />Premium</span> : acc2 != null ? <span className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-green-600"><Check className="h-5 w-5" /></span> : <span className="btn-soft btn-sm"><PlayCircle className="h-4 w-4" />Start</span>}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
          <aside className="space-y-5 self-start">
          <div className="card p-6">
            <div className="mb-2 flex items-center gap-2 text-lg font-bold text-navy"><Hand className="h-5 w-5" />Finger Placement Guide</div>
            <p className="text-sm text-muted">Har rang ek ungli ko darshata hai. F aur J par ubhra hua nishaan hota hai — wahi home position hai.</p>
            <ul className="mt-4 space-y-2.5">
              {Object.entries(FINGER_NAME).map(([k, v]) => <li key={k} className="flex items-center gap-3 text-sm"><span className="h-5 w-5 rounded" style={{ background: FINGER_COLOR[k] }} />{v}</li>)}
            </ul>
            <div className="mt-6 rounded-2xl bg-navy p-5 text-white" data-dark>
              <div className="text-sm text-white/70">Aapki progress</div>
              <div className="text-4xl font-bold text-gold">{doneCount} / {lessons.length}</div>
              <div className="mt-3 h-1.5 rounded-full bg-white/15"><div className="h-1.5 rounded-full bg-gold" style={{ width: `${(doneCount / Math.max(1, lessons.length)) * 100}%` }} /></div>
              {!user && <Link href="/login?next=/typing-test/learn" className="mt-3 block text-xs text-gold underline">Progress save karne ke liye login karein</Link>}
            </div>
          </div>
          {guides.map(({ f, g }: any) => (
            <div key={f.id} className="card p-6">
              <div className="mb-1 flex items-center gap-2 text-lg font-bold text-navy"><BookOpen className="h-5 w-5" />Instructions</div>
              <div className="hi text-sm font-semibold text-brand">{g.heading || f.name}</div>
              {g.intro && (
                <details className="group mt-3 rounded-xl bg-canvas px-4 py-3 text-sm">
                  <summary className="cursor-pointer list-none font-semibold text-navy"><span className="group-open:hidden">Course ke baare me ▾</span><span className="hidden group-open:inline">Band karein ▴</span></summary>
                  <p className="hi mt-2 leading-relaxed text-muted">{g.intro}</p>
                </details>
              )}
              {g.steps.length > 0 && (
                <ol className="mt-4 space-y-3">
                  {g.steps.map((st: any, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand">{i + 1}</span>
                      <span className="hi min-w-0 text-sm leading-relaxed">
                        <b className="block text-ink">{st.icon && <span className="mr-1">{st.icon}</span>}{st.title}</b>
                        {st.body && <span className="block text-muted">{st.body}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {g.rule && (
                <div className="hi mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                  <div className="mb-1 flex items-center gap-1.5 font-bold text-amber-800"><Sparkles className="h-4 w-4" />Golden Rule</div>
                  {g.rule}
                </div>
              )}
              {g.outro && <p className="hi mt-3 text-right text-sm font-semibold text-navy">{g.outro}</p>}
            </div>
          ))}
          </aside>
        </div>
        <div className="card mt-8 p-5 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Keyboard className="h-5 w-5" />Keyboard — Finger Colour Map</h2>
          <KeyboardView layout={layout as any} fingerColors />
        </div>
      </Container>
    </>
  );
}
