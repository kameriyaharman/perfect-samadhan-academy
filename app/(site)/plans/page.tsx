import Link from "next/link";
import { Check, CreditCard, Layers, ShoppingCart, UserPlus, X } from "lucide-react";
import { includeOptions, parseIncludes } from "@/lib/access";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { rupee } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import CouponBox from "./CouponBox";

export const metadata = { title: "Premium Plans" };

export default async function Plans() {
  const [plans, s, o] = await Promise.all([q(`SELECT * FROM plans WHERE active ORDER BY sort`), getSettings(), includeOptions()]);
  // plan me chuni hui series ke naam (website par dikhane ke liye)
  const seriesNames = (v: any): string[] => {
    const i = parseIncludes(v);
    if (i.all !== false) return [];
    const out: string[] = [];
    for (const id of i.folders || []) { const f = o.folders.find((x: any) => x.id === Number(id)); if (f) out.push(`${f.name} (Typing lessons)`); }
    for (const k of i.series || []) {
      if (k.startsWith("series:")) out.push(k.slice(7));
      else if (k.startsWith("exam:")) { const e = o.exams.find((x: any) => x.slug === k.slice(5)); out.push(`${e?.name || k.slice(5)} — sabhi mock tests`); }
    }
    for (const c of i.typing || []) out.push(`${c} typing exam tests`);
    if (i.passages) out.push("Premium typing passages");
    if (i.keywords) out.push("Keyword MCQ tests");
    if (i.materials) out.push("Premium PDFs / Notes");
    return out;
  };
  return (
    <>
      <PageHero crumbs={[{ label: "Premium Plans" }]} title="अपना" highlight="प्लान" after=" चुनें" subtitle="Free me shuru karein. Jab zarurat ho, Premium lekar poori test series aur PDFs unlock karein." compact />
      <Container className="py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p: any) => (
            <div key={p.id} className={`relative flex flex-col rounded-2xl bg-white p-6 ${p.popular ? "border-2 border-brand shadow-lift lg:-translate-y-2" : "border border-line shadow-card"}`}>
              {p.popular && <span className="chip absolute -top-3 left-6 bg-orange-100 text-orange-700">Most Popular</span>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-3 flex items-end gap-1"><span className="text-4xl font-extrabold text-navy">{rupee(p.price)}</span><span className="pb-1 text-muted">/ {p.validity_days >= 365 ? "saal" : `${p.validity_days} din`}</span></div>
              <p className="mt-2 text-sm text-muted">{p.subtitle}</p>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {p.features.split("\n").filter(Boolean).map((f: string) => f.startsWith("-") ? <li key={f} className="flex gap-2 text-slate-400"><X className="mt-0.5 h-4 w-4 text-red-400" />{f.slice(1)}</li> : <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-green-600" />{f.replace(/^\+/, "")}</li>)}
              </ul>
              {seriesNames(p.includes).length > 0 && (
                <div className="mt-4 rounded-xl bg-brand-50 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand"><Layers className="h-3.5 w-3.5" />Is plan me unlock</div>
                  <ul className="space-y-1 text-[13.5px]">{seriesNames(p.includes).map((n) => <li key={n} className="hi flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />{n}</li>)}</ul>
                </div>
              )}
              <Link href={p.price ? `/checkout?item=plan:${p.slug}` : "/login?tab=register"} className={`mt-auto pt-6`}><span className={`w-full ${p.popular ? "btn-primary" : "btn-ghost"}`}>{p.price ? <><ShoppingCart className="h-4 w-4" />Buy Now</> : <><UserPlus className="h-4 w-4" />Free Register</>}</span></Link>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="card p-6"><h3 className="flex items-center gap-2 text-lg font-bold"><CreditCard className="h-5 w-5" />Payment Options</h3><p className="mt-2 text-muted">{s.payment_note}</p></div>
          <CouponBox />
        </div>
      </Container>
    </>
  );
}
