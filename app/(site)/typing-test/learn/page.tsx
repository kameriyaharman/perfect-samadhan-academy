import Link from "next/link";
import { Check, Clock, GraduationCap, Hand, Languages, Keyboard, PlayCircle } from "lucide-react";
import { q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import KeyboardView from "@/components/typing/KeyboardView";
import { FINGER_COLOR, FINGER_NAME } from "@/lib/keyboard";

export const metadata = { title: "Typing Seekhein — Lessons" };
const TABS = [["remington", "हिंदी — Remington Gail"], ["inscript", "हिंदी — Inscript"], ["english", "English"]];
const NUM = ["bg-green-50 text-green-700", "bg-brand-50 text-brand", "bg-orange-50 text-orange-600", "bg-violet-50 text-violet-700"];

export default async function Learn({ searchParams }: { searchParams: { layout?: string } }) {
  const layout = TABS.some(([k]) => k === searchParams.layout) ? searchParams.layout! : "remington";
  const user = await getUser();
  const lessons = await q(`SELECT * FROM lessons WHERE active AND layout=$1 ORDER BY number`, [layout]);
  const prog = user ? await q(`SELECT lesson_id, accuracy FROM lesson_progress WHERE user_id=$1`, [user.id]) : [];
  const done = new Map(prog.map((p: any) => [p.lesson_id, p.accuracy]));
  const doneCount = lessons.filter((l: any) => done.has(l.id)).length;
  return (
    <>
      <PageHero crumbs={[{ label: "Typing Test", href: "/typing-test" }, { label: "Learn Typing" }]} title="टाइपिंग सीखें —" highlight="शुरुआत से"
        subtitle={`Kabhi typing nahi ki? Koi baat nahi. ${lessons.length} aasaan lessons me sahi finger placement ke saath Hindi aur English typing seekhein.`}
        chips={[<><GraduationCap className="h-4 w-4" />{lessons.length} Lessons</>, <><Clock className="h-4 w-4" />Roz 20 min</>, <><Languages className="h-4 w-4" />Hindi Remington Gail · Inscript · English</>]} />
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          {TABS.map(([k, l]) => <Link key={k} href={`/typing-test/learn?layout=${k}`} className={`tab hi ${layout === k ? "active" : ""}`}>{l}</Link>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 self-start">
            {lessons.map((l: any, i: number) => {
              const acc = done.get(l.id);
              return (
                <Link key={l.id} href={`/typing-test/learn/${l.id}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-bold ${acc != null ? NUM[0] : NUM[1 + (i % 3)]}`}>{l.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="hi block font-bold">{l.title}</span>
                    <span className="hi block truncate text-sm text-muted">{l.subtitle}</span>
                    <span className="mt-2 block h-1.5 rounded-full bg-canvas"><span className={`block h-1.5 rounded-full ${acc != null ? "bg-green-600" : "bg-brand/20"}`} style={{ width: acc != null ? `${Math.max(30, acc)}%` : "0%" }} /></span>
                  </span>
                  {acc != null ? <span className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-green-600"><Check className="h-5 w-5" /></span> : <span className="btn-soft btn-sm"><PlayCircle className="h-4 w-4" />Start</span>}
                </Link>
              );
            })}
          </div>
          <aside className="card self-start p-6">
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
