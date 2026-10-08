import Link from "next/link";
import { HelpCircle, MessageCircle, Plus, Minus } from "lucide-react";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "FAQ" };

export default async function Faq({ searchParams }: { searchParams: { c?: string } }) {
  const cats = (await q(`SELECT category, min(sort) s FROM faqs GROUP BY category ORDER BY min(id)`)).map((r: any) => r.category);
  const c = searchParams.c && cats.includes(searchParams.c) ? searchParams.c : cats[0];
  const [rows, s] = await Promise.all([q(`SELECT * FROM faqs WHERE category=$1 ORDER BY sort, id`, [c]), getSettings()]);
  return (
    <>
      <PageHero crumbs={[{ label: "FAQ" }]} title="अक्सर पूछे जाने वाले" highlight="सवाल" subtitle="Exam aur website se jude sabse common sawal. Aur doubt hai to WhatsApp karein!" compact />
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">{cats.map((k) => <Link key={k} href={`/faq?c=${encodeURIComponent(k)}`} className={`tab ${k === c ? "active" : ""}`}>{k}</Link>)}</div>
            {!rows.length ? <Empty /> : <div className="space-y-3">{rows.map((f: any, i: number) => (
              <details key={f.id} open={i < 2} className="card group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">{f.question}<span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand"><Plus className="h-4 w-4 group-open:hidden" /><Minus className="hidden h-4 w-4 group-open:block" /></span></summary>
                <p className="mt-2 text-[15px] text-muted">{f.answer}</p>
              </details>
            ))}</div>}
          </div>
          <aside><div className="rounded-2xl bg-navy p-6 text-white" data-dark><h3 className="flex items-center gap-2 text-lg font-bold text-gold"><HelpCircle className="h-5 w-5" />Jawab nahi mila?</h3><p className="mt-2 text-sm text-white/80">Hamari team 1 ghante me jawab degi.</p><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" className="btn mt-4 bg-[#25d366] px-5 py-2.5 text-white"><MessageCircle className="h-4 w-4" />WhatsApp Karein</a></div></aside>
        </div>
      </Container>
    </>
  );
}
