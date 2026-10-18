import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap, Phone, Plus, Quote } from "lucide-react";
import { initials } from "@/lib/utils";

export type Leader = { id: number; name: string; designation: string; photo_url: string | null; qualification: string | null; experience: string | null; message: string | null; phone: string | null };

export function LeaderCard({ l, full = false }: { l: Leader; full?: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 bg-gradient-to-r from-navy to-brand p-4 text-white" data-dark>
        {l.photo_url
          ? <img src={l.photo_url} alt={l.name} className="h-28 w-24 shrink-0 rounded-2xl bg-white object-cover object-top ring-2 ring-gold md:h-32 md:w-28" />
          : <span className="grid h-28 w-24 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-bold ring-2 ring-gold md:h-32 md:w-28">{initials(l.name)}</span>}
        <div className="min-w-0">
          <div className="hi text-lg font-bold leading-tight">{l.name}</div>
          <div className="mt-1 inline-block rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-navy">{l.designation}</div>
          {(l.qualification || l.experience) && <div className="mt-1.5 flex items-center gap-1 text-xs text-white/75"><GraduationCap className="h-3.5 w-3.5" />{[l.qualification, l.experience].filter(Boolean).join(" · ")}</div>}
        </div>
      </div>
      {l.message && (
        <div className="p-4">
          <Quote className="h-5 w-5 text-gold" />
          <p className={`hi mt-1 whitespace-pre-line text-[14.5px] leading-7 text-ink/80 ${full ? "" : "line-clamp-5"}`}>{l.message}</p>
          {l.phone && <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"><Phone className="h-3.5 w-3.5" />{l.phone}</a>}
        </div>
      )}
    </div>
  );
}

/** Home page ke neeche: academy ki jaankari + owner / MD */
export default function AboutSection({ s, leaders, isAdmin = false }: { s: Record<string, string>; leaders: Leader[]; isAdmin?: boolean }) {
  const points = (s.about_highlights || "").split("\n").map((x) => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean).slice(0, 6);
  const stats = [[s.about_students, "Students"], [s.about_selections, "Selections"], [s.about_years, "Anubhav"]].filter(([v]) => v);
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <div className="eyebrow mb-1.5">Hamare Baare Me</div>
          <h2 className="hi text-2xl font-bold leading-tight text-navy md:text-[32px]">{s.about_home_title || s.tagline || "परफेक्ट समाधान एकेडमी"}</h2>
          {s.about_story && <p className="hi mt-4 whitespace-pre-line text-[15.5px] leading-8 text-muted">{s.about_story}</p>}
          {points.length > 0 && (
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {points.map((p) => <li key={p} className="hi flex gap-2 text-[15px] text-ink"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-600" />{p}</li>)}
            </ul>
          )}
          {stats.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {stats.map(([v, l]) => <div key={l} className="rounded-2xl border border-line bg-white p-4 text-center"><div className="text-2xl font-extrabold text-brand md:text-3xl">{v}</div><div className="text-xs text-muted">{l}</div></div>)}
            </div>
          )}
          <Link href="/about" className="btn-ghost mt-6">Academy ke baare me aur padhein <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4">
          {leaders.length > 0
            ? leaders.slice(0, 3).map((l) => <LeaderCard key={l.id} l={l} />)
            : ["Founder & Owner", "Managing Director"].map((d) => (
              <div key={d} className="card flex items-center gap-4 overflow-hidden bg-gradient-to-r from-navy to-brand p-4 text-white" data-dark>
                <img src="/logo.png" alt="" className="h-20 w-20 shrink-0 rounded-2xl bg-white object-contain p-1.5 ring-2 ring-gold md:h-24 md:w-24" />
                <div>
                  <div className="hi text-lg font-bold">परफेक्ट समाधान एकेडमी</div>
                  <div className="mt-1 inline-block rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-navy">{d}</div>
                  {isAdmin && <div className="mt-1.5 text-xs text-white/75">Admin → About — Owner / Director me photo aur naam daalein</div>}
                </div>
              </div>
            ))}
          {isAdmin && <Link href="/admin/r/leaders" className="btn-orange justify-self-start"><Plus className="h-4 w-4" />{leaders.length ? "Owner / Director edit karein" : "Owner / MD ki photo jodein"}</Link>}
        </div>
      </div>
    </section>
  );
}
