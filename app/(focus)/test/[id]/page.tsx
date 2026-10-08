import { notFound } from "next/navigation";
import { Layers, User } from "lucide-react";
import { one, q } from "@/lib/db";
import { getUser, isPremium } from "@/lib/auth";
import { initials, lines } from "@/lib/utils";
import FocusBar from "@/components/FocusBar";
import StartTest from "./StartTest";

export default async function Instructions({ params }: { params: { id: string } }) {
  const t = await one("SELECT m.*, e.code FROM mock_tests m LEFT JOIN exams e ON e.slug=m.exam_slug WHERE m.id=$1", [Number(params.id) || 0]);
  if (!t) notFound();
  const user = await getUser();
  const secs = await q("SELECT section, count(*)::int n FROM questions WHERE test_id=$1 GROUP BY section ORDER BY min(sort)", [t.id]);
  const total = secs.reduce((a: number, s: any) => a + s.n, 0);
  const instr = lines(t.instructions).length ? lines(t.instructions) : ["Screen ke upar-daayein kone par timer dikhega. Samay khatam hone par test apne aap submit ho jayega.", "Question palette me rang question ki sthiti batate hain.", "Kisi bhi samay Hindi / English bhasha badal sakte hain.", "\"Save & Next\" dabane par hi uttar save hoga.", "Section tabs se ek section se doosre section me ja sakte hain."];
  return (
    <>
      <FocusBar crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: t.code || "Test", href: `/mock-tests/${t.exam_slug}` }, { label: `${t.title} — Instructions` }]} />
      <div className="mx-auto grid max-w-[1500px] gap-5 px-3 md:px-10 py-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-5 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy">{t.title}</h1>
          <p className="text-muted">Kripya test shuru karne se pehle sabhi nirdesh dhyan se padhein</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Questions", total], ["Duration", `${t.duration} min`], ["Max Marks", total * (t.marks_per_q || 1)], ["Negative", t.negative ? `-${t.negative}` : "Nahi"]].map(([l, v]) => (
              <div key={l as string} className="rounded-2xl border border-line p-4"><div className="text-sm text-muted">{l}</div><div className="mt-1 text-2xl md:text-3xl font-bold text-navy">{v}</div></div>
            ))}
          </div>
          <h2 className="mt-7 font-bold">Samanya Nirdesh (General Instructions)</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-6 text-[15px]">{instr.map((x, i) => <li key={i}>{x}</li>)}</ol>
          <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="chip bg-green-50 text-green-700">Answered</span><span className="chip bg-red-50 text-red-600">Not Answered</span><span className="chip bg-violet-50 text-violet-700">Marked</span><span className="chip bg-white border border-line text-muted">Not Visited</span></div>
          <StartTest testId={t.id} loggedIn={!!user} locked={!t.is_free && !isPremium(user)} empty={!total} />
        </div>
        <aside className="space-y-4">
          <div className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><User className="h-5 w-5" />Candidate</h3>
            {user ? (
              <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full bg-brand font-bold text-white ring-2 ring-saffron ring-offset-2">{initials(user.name)}</span><span><b className="block">{user.name}</b><span className="text-xs text-muted">Roll: PSA-{new Date().getFullYear()}-{String(user.id).padStart(4, "0")}</span></span></div>
            ) : <p className="text-sm text-muted">Test dene ke liye login karein.</p>}
          </div>
          <div className="card p-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><Layers className="h-5 w-5" />Sections</h3>
            {secs.map((s: any) => <div key={s.section} className="flex justify-between border-b border-line py-2.5 text-[15px] last:border-0"><span>{s.section}</span><b>{s.n} Q</b></div>)}
          </div>
        </aside>
      </div>
    </>
  );
}
