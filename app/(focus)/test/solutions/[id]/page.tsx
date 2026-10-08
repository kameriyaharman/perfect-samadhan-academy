import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Grid3x3, Info, ArrowLeft } from "lucide-react";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { loadQuestions } from "@/lib/tests";
import FocusBar from "@/components/FocusBar";

export default async function Solutions({ params, searchParams }: { params: { id: string }; searchParams: { f?: string; lang?: string } }) {
  const user = await getUser();
  if (!user) redirect(`/login?next=/test/solutions/${params.id}`);
  const a = await one("SELECT * FROM attempts WHERE id=$1 AND (user_id=$2 OR $3)", [Number(params.id) || 0, user.id, user.role === "admin"]);
  if (!a) notFound();
  if (a.status !== "submitted") redirect(`/test/attempt/${a.id}`);
  const ans: Record<string, string> = JSON.parse(a.answers || "{}");
  const qs = await loadQuestions(JSON.parse(a.question_ids));
  const lang = searchParams.lang === "en" ? "en" : "hi";
  const f = searchParams.f || "all";
  const st = (x: any) => (!ans[x.id] ? "skipped" : ans[x.id] === x.answer ? "correct" : "wrong");
  const counts = { all: qs.length, correct: qs.filter((x) => st(x) === "correct").length, wrong: qs.filter((x) => st(x) === "wrong").length, skipped: qs.filter((x) => st(x) === "skipped").length } as Record<string, number>;
  const list = qs.map((x, i) => ({ x, i })).filter(({ x }) => f === "all" || st(x) === f);
  const link = (o: Record<string, string>) => `/test/solutions/${a.id}?${new URLSearchParams({ f, lang, ...o }).toString()}`;
  const pal: Record<string, string> = { correct: "bg-green-600 text-white", wrong: "bg-red-500 text-white", skipped: "bg-slate-200 text-ink" };
  return (
    <>
      <FocusBar crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: a.title, href: `/test/result/${a.id}` }, { label: "Solutions" }]} />
      <div className="mx-auto grid max-w-[1500px] gap-5 px-3 md:px-10 py-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="seg bg-white border border-line">
              {[["all", "All"], ["correct", "Correct"], ["wrong", "Wrong"], ["skipped", "Skipped"]].map(([k, l]) => <Link key={k} href={link({ f: k })} className={f === k ? "on" : ""}>{l} ({counts[k]})</Link>)}
            </div>
            <div className="seg bg-white border border-line"><Link href={link({ lang: "hi" })} className={`hi ${lang === "hi" ? "on" : ""}`}>हिंदी</Link><Link href={link({ lang: "en" })} className={lang === "en" ? "on" : ""}>English</Link></div>
          </div>
          <div className="space-y-4">
            {list.map(({ x, i }) => {
              const s = st(x);
              const opts = [0, 1, 2, 3].map((k) => (lang === "en" ? x[`opt_${"abcd"[k]}_en`] || x[`opt_${"abcd"[k]}_hi`] : x[`opt_${"abcd"[k]}_hi`]));
              const t = lang === "en" ? x.text_en || x.text_hi : x.text_hi;
              const alt = lang === "en" ? x.text_hi : x.text_en;
              return (
                <div key={x.id} id={`q${i + 1}`} className="card p-5 md:p-6 scroll-mt-24">
                  <div className="flex items-center justify-between"><b>Q {i + 1}</b><span className={`chip ${s === "correct" ? "bg-green-50 text-green-700" : s === "wrong" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}>{s === "correct" ? "Sahi" : s === "wrong" ? "Galat" : "Chhoda"}</span></div>
                  <h3 className={`mt-3 text-lg font-bold ${lang === "hi" ? "hi" : ""}`}>{t}</h3>
                  {alt && alt !== t && <p className={`mt-1 text-sm text-muted ${lang === "en" ? "hi" : ""}`}>{alt}</p>}
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {opts.map((o, k) => {
                      const L = "ABCD"[k];
                      const isAns = x.answer === L, isMine = ans[x.id] === L;
                      const cls = isAns ? "border-green-500 bg-green-50" : isMine ? "border-red-400 bg-red-50" : "border-line";
                      return <div key={k} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${cls}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${isAns ? "bg-green-600 text-white" : isMine ? "bg-red-500 text-white" : "bg-canvas"}`}>{L}</span><span className={lang === "hi" ? "hi" : ""}>{o}</span></div>;
                    })}
                  </div>
                  {x.explanation && <div className="tip mt-4 flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span><b>Vyakhya:</b> {x.explanation}</span></div>}
                </div>
              );
            })}
          </div>
        </div>
        <aside className="self-start lg:sticky lg:top-20">
          <div className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><Grid3x3 className="h-5 w-5" />Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {qs.map((x, i) => <a key={x.id} href={f === "all" ? `#q${i + 1}` : link({ f: "all" }) + `#q${i + 1}`} className={`grid h-10 place-items-center rounded-lg text-sm font-semibold ${pal[st(x)]}`}>{i + 1}</a>)}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted"><span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-green-600" />Correct</span><span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-red-500" />Wrong</span><span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-slate-200" />Skipped</span></div>
            <Link href={`/test/result/${a.id}`} className="btn-ghost mt-4 w-full"><ArrowLeft className="h-4 w-4" />Result par wapas</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
