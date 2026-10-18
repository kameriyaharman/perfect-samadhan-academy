import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Quote, Star } from "lucide-react";
import { initials } from "@/lib/utils";

export type Sel = { id: number; name: string; photo_url: string | null; exam: string; post: string | null; year: number | null; rank_text: string | null; city: string | null; course: string | null; quote: string | null; featured: boolean };

const GRADS = ["from-[#1f35b8] to-[#0e1756]", "from-[#f28c0f] to-[#c2610c]", "from-[#15803d] to-[#0f5a2b]", "from-[#7c3aed] to-[#4c1d95]", "from-[#0d9488] to-[#115e59]"];

export function Photo({ s, size = "h-24 w-24" }: { s: Sel; size?: string }) {
  return s.photo_url
    ? <img src={s.photo_url} alt={s.name} loading="lazy" className={`${size} rounded-full object-cover ring-4 ring-gold/60 ring-offset-2`} />
    : <span className={`${size} grid place-items-center rounded-full bg-gradient-to-br text-2xl font-bold text-white ring-4 ring-gold/60 ring-offset-2 ${GRADS[s.id % GRADS.length]}`}>{initials(s.name)}</span>;
}

/** Ek selection card — photo, naam, exam, post, saal */
export function SelectionCard({ s, wide = false }: { s: Sel; wide?: boolean }) {
  return (
    <div className={`relative flex shrink-0 flex-col items-center overflow-hidden rounded-2xl border border-line bg-white px-4 pb-4 pt-6 text-center shadow-sm ${wide ? "w-full" : "w-[220px]"}`}>
      <span className="absolute right-0 top-3 rounded-l-full bg-green-600 py-0.5 pl-2.5 pr-2 text-[10px] font-bold tracking-wider text-white">SELECTED</span>
      {s.featured && <Star className="absolute left-3 top-3 h-4 w-4 fill-gold text-gold" />}
      <Photo s={s} />
      <div className="hi mt-3 line-clamp-1 text-[16px] font-bold text-navy">{s.name}</div>
      <div className="hi mt-0.5 line-clamp-1 text-sm font-semibold text-brand">{s.exam}</div>
      {s.post && <div className="hi line-clamp-1 text-xs text-muted">{s.post}</div>}
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {s.year && <span className="chip bg-brand-50 text-brand">{s.year}</span>}
        {s.rank_text && <span className="chip bg-orange-50 text-orange-700">{s.rank_text}</span>}
      </div>
      {s.city && <div className="hi mt-2 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" />{s.city}</div>}
    </div>
  );
}

/** Home page: chalti hui patti (5+ selections) ya grid */
export default function SelectionsSection({ list, total, years, stat }: { list: Sel[]; total: number; years: string; stat?: string }) {
  if (!list.length) return null;
  const moving = list.length >= 5;
  const featured = list.filter((s) => s.featured && s.quote).slice(0, 2);
  return (
    <section className="overflow-hidden bg-gradient-to-b from-white to-[#f4f6fd] py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="eyebrow mb-1.5">Hamare Selections</div>
            <h2 className="hi text-2xl font-bold leading-tight text-navy md:text-[32px]">अब तक के चयनित विद्यार्थी</h2>
            <p className="mt-1.5 text-sm text-muted">Perfect Samadhan Academy se padhkar sarkari naukri paane wale hamare students{years ? ` · ${years}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-navy px-5 py-2.5 text-center text-white" data-dark><div className="text-2xl font-extrabold text-gold">{stat || `${total}+`}</div><div className="text-[11px] text-white/70">Selections</div></div>
            <Link href="/selections" className="btn-primary">Sabhi Selections <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      {moving ? (
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#f8f9fe] to-transparent md:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#f8f9fe] to-transparent md:w-24" />
          <div className="marquee flex w-max gap-4 py-2 group-hover:[animation-play-state:paused]" style={{ animationDuration: `${Math.max(30, list.length * 5)}s` }}>
            {[...list, ...list].map((s, i) => <SelectionCard key={i} s={s} />)}
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-4 px-4 md:px-8">{list.map((s) => <SelectionCard key={s.id} s={s} />)}</div>
      )}

      {featured.length > 0 && (
        <div className="mx-auto mt-8 grid max-w-7xl gap-4 px-4 md:grid-cols-2 md:px-8">
          {featured.map((s) => (
            <div key={s.id} className="card flex gap-4 p-5">
              <Photo s={s} size="h-16 w-16 shrink-0" />
              <div className="min-w-0">
                <Quote className="h-5 w-5 text-gold" />
                <p className="hi mt-1 text-[15px] italic text-ink/80">{s.quote}</p>
                <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-navy"><BadgeCheck className="h-4 w-4 text-green-600" />{s.name} <span className="font-normal text-muted">· {s.exam}{s.year ? ` ${s.year}` : ""}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
