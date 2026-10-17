"use client";
// Exam-wise typing test links — upar category tiles (SSC, Court, Bihar State, UP State …), tile dabane par us category ke exams.
// Categories: admin → "Typing Exam Categories"; exams: admin → "Typing Exam Patterns" (category naam se jude).
import Link from "next/link";
import { useMemo, useState } from "react";
import { Briefcase, Building2, ChevronRight, Flag, FolderOpen, Gauge, Gavel, GraduationCap, Keyboard, Landmark, LayoutGrid, Lock, Map, MapPin, Scale, Search, Shield, Stethoscope, TrainFront, X } from "lucide-react";

// admin ke icon options (lucide poora bundle client me na jaye)
const ICONS: Record<string, any> = { landmark: Landmark, gavel: Gavel, "train-front": TrainFront, shield: Shield, "building-2": Building2, "map-pin": MapPin, map: Map, stethoscope: Stethoscope, gauge: Gauge, keyboard: Keyboard, "graduation-cap": GraduationCap, briefcase: Briefcase, scale: Scale, flag: Flag, "folder-open": FolderOpen };
function Icon({ name, className }: { name: string; className?: string }) { const C = ICONS[name] || Landmark; return <C className={className} />; }
import { color } from "@/lib/utils";

type Pat = { slug: string; name: string; category: string; language: string; duration: number; hindi_speed: number; english_speed: number; description: string | null; is_free: boolean };
export type Cat = { name: string; icon: string; image_url: string | null; color: string; description: string | null };

const slugId = (c: string) => "cat-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const norm = (c: string) => c.trim().toLowerCase();

export default function ExamLinks({ patterns, categories = [], premium = false }: { patterns: Pat[]; categories?: Cat[]; premium?: boolean }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  // admin categories + jo category sirf pattern me likhi hai
  const cats = useMemo(() => {
    const out: Cat[] = [...categories];
    for (const p of patterns) {
      const c = p.category || "Other";
      if (!out.some((x) => norm(x.name) === norm(c))) out.push({ name: c, icon: "folder-open", image_url: null, color: "blue", description: null });
    }
    return out;
  }, [categories, patterns]);
  const countOf = (c: string) => patterns.filter((p) => norm(p.category || "Other") === norm(c)).length;

  const list = useMemo(
    () => patterns.filter((p) => (!sel || norm(p.category || "Other") === norm(sel)) && (!q || `${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase()))),
    [patterns, q, sel]
  );
  const groups = useMemo(() => {
    const g: [string, Pat[]][] = [];
    for (const c of cats) {
      const items = list.filter((p) => norm(p.category || "Other") === norm(c.name));
      if (items.length) g.push([c.name, items]);
    }
    return g;
  }, [list, cats]);

  const href = (p: Pat, lang: string) => `/typing-test/start?pattern=${encodeURIComponent(p.slug)}&lang=${lang}`;
  const pick = (c: string) => {
    setSel(sel === c ? null : c);
    setTimeout(() => document.getElementById("exam-list")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="space-y-5">
      <div className="card p-4 md:p-5">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Exam ka naam search karein (SSC, Court, CPCT, Railway…)" className="input !rounded-full !pl-10" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-navy"><LayoutGrid className="h-4 w-4" />Exam Categories</div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {cats.map((c) => {
            const n = countOf(c.name);
            const on = sel && norm(sel) === norm(c.name);
            const col = color(c.color);
            return (
              <button key={c.name} type="button" onClick={() => n && pick(c.name)} disabled={!n}
                className={`group flex flex-col items-center gap-2 rounded-xl border bg-white px-2 py-3.5 text-center transition ${on ? "border-brand ring-2 ring-brand/20" : "border-line hover:-translate-y-0.5 hover:border-brand"} ${n ? "" : "cursor-default opacity-60"}`}>
                {c.image_url
                  ? <img src={c.image_url} alt="" className="h-11 w-11 rounded-full object-contain" />
                  : <span className={`grid h-11 w-11 place-items-center rounded-full ${col.bg} ${col.text}`}><Icon name={c.icon || "landmark"} className="h-5 w-5" /></span>}
                <span className="text-[13px] font-semibold leading-tight text-ink group-hover:text-brand">{c.name}</span>
                <span className="text-[11px] text-muted">{n ? `${n} ${n === 1 ? "test" : "tests"}` : "Jald aa raha"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="exam-list" className="scroll-mt-28" />
      {sel && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Category:</span>
          <button onClick={() => setSel(null)} className="chip bg-brand py-1.5 text-white">{sel}<X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {!groups.length && <div className="card p-8 text-center text-muted">Koi exam nahi mila.</div>}
      {groups.map(([cat, items]) => (
        <div key={cat} id={slugId(cat)} className="card scroll-mt-28 p-4 md:p-5">
          <div className="mb-3 flex items-center gap-2 text-[17px] font-bold text-navy"><FolderOpen className="h-5 w-5 text-brand" />{cat} Typing Test Links</div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => {
              const langs = p.language === "both" ? ["hindi", "english"] : [p.language];
              const locked = !p.is_free && !premium;
              const lockHref = "/plans";
              return (
                <div key={p.slug} className="rounded-xl border border-line px-3.5 py-3 transition hover:border-brand/50 hover:bg-brand-50/40">
                  {langs.length === 1 ? (
                    <Link href={locked ? lockHref : href(p, langs[0])} className="flex items-start gap-1.5 text-[14.5px] font-semibold text-brand hover:underline"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />{p.name}{!p.is_free && <Lock className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-saffron" />}</Link>
                  ) : (
                    <div className="flex items-start gap-1.5 text-[14.5px] font-semibold text-ink"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{p.name}{!p.is_free && <Lock className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-saffron" />}</div>
                  )}
                  <div className="mt-1 pl-5 text-xs text-muted">
                    {p.duration} min · Qualify {langs.map((l) => `${l === "hindi" ? "Hindi" : "English"} ${l === "hindi" ? p.hindi_speed : p.english_speed}`).join(" / ")} NWPM
                    {!p.is_free && <span className="ml-1 font-semibold text-saffron-600">· Premium</span>}
                  </div>
                  {langs.length > 1 && (
                    <div className="mt-2 flex gap-2 pl-5">
                      <Link href={locked ? lockHref : href(p, "hindi")} className="hi chip bg-saffron-50 py-1.5 text-saffron-600 hover:bg-saffron hover:text-white">हिंदी Test</Link>
                      <Link href={locked ? lockHref : href(p, "english")} className="chip bg-brand-50 py-1.5 text-brand hover:bg-brand hover:text-white">English Test</Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
