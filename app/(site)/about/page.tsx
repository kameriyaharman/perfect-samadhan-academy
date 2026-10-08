import { Heart, Sparkles, Target } from "lucide-react";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { color, initials } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, SectionTitle } from "@/components/Section";

export const metadata = { title: "About Us" };

export default async function About() {
  const [s, fac, t] = await Promise.all([getSettings(), q("SELECT * FROM faculty ORDER BY sort"), q("SELECT * FROM testimonials ORDER BY sort")]);
  return (
    <>
      <PageHero crumbs={[{ label: "About Us" }]} title="हमारे" highlight="बारे में" subtitle={`Perfect Samadhan Academy — sarkari pariksha ki tayari me har vidyarthi ke liye "perfect samadhan".`} compact />
      <Container className="py-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="eyebrow">Hamari Kahani</div>
            <h2 className="hi mt-2 text-3xl md:text-4xl font-bold text-navy">{s.tagline}</h2>
            <p className="mt-4 text-[16px] leading-8 text-muted">{s.about_story}</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[[s.about_students, "Students"], [s.about_selections, "Selections"], [s.about_years, "Anubhav"]].map(([v, l]) => <div key={l} className="card p-4 md:p-5"><div className="text-2xl md:text-3xl font-bold text-brand">{v}</div><div className="mt-1 text-sm text-muted">{l}</div></div>)}
            </div>
          </div>
          <div className="hero-bg grid aspect-[1.3] place-items-center rounded-[28px]" data-dark><img src="/logo.png" alt="Perfect Samadhan Academy" className="h-56 w-56 md:h-72 md:w-72 rounded-full bg-white p-1 shadow-2xl float-y" /></div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[[Target, "Hamara Mission", s.mission, "blue"], [Sparkles, "Hamara Vision", s.vision, "orange"], [Heart, "Hamare Moolya", s.values, "green"]].map(([I, t, d, c]: any) => (
            <div key={t} className="card p-6"><span className={`grid h-12 w-12 place-items-center rounded-xl ${color(c).bg} ${color(c).text}`}><I className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>
          ))}
        </div>
        <div className="mt-14"><SectionTitle eyebrow="Faculty" title="हमारे शिक्षक" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{fac.map((f: any) => (
            <div key={f.id} className="card p-6 text-center">
              {f.photo_url ? <img src={f.photo_url} alt={f.name} className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-gold/50" /> : <span className={`mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br text-2xl font-bold text-white ring-4 ring-gold/50 ring-offset-2 ${color(f.color).grad}`}>{initials(f.name)}</span>}
              <div className="mt-3 text-lg font-bold">{f.name}</div><div className="text-sm text-muted">{f.subject}{f.experience ? ` · ${f.experience}` : ""}</div>
            </div>))}</div>
        </div>
        {t.length > 0 && <div className="mt-14"><SectionTitle eyebrow="Results" title="हमारे सफल विद्यार्थी" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{t.map((x: any) => <div key={x.id} className="card p-5"><b>{x.name}</b><div className="text-xs text-muted">{x.exam} · {x.result}</div><p className="mt-2 text-sm italic text-muted">“{x.quote}”</p></div>)}</div></div>}
      </Container>
    </>
  );
}
