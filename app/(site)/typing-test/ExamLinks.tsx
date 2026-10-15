"use client";
// Exam-wise typing test links (category ke hisaab se) — admin "Typing Exam Patterns" se aate hain
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, FolderOpen, LayoutGrid, Search } from "lucide-react";

type Pat = { slug: string; name: string; category: string; language: string; duration: number; hindi_speed: number; english_speed: number; description: string | null };

const slugId = (c: string) => "cat-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function ExamLinks({ patterns }: { patterns: Pat[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => patterns.filter((p) => !q || `${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase())), [patterns, q]);
  const groups = useMemo(() => {
    const g: Record<string, Pat[]> = {};
    for (const p of list) (g[p.category || "Other"] ||= []).push(p);
    return Object.entries(g);
  }, [list]);
  const cats = Array.from(new Set(patterns.map((p) => p.category || "Other")));

  const href = (p: Pat, lang: string) => `/typing-test/start?pattern=${encodeURIComponent(p.slug)}&lang=${lang}`;

  return (
    <div className="space-y-5">
      <div className="card p-4 md:p-5">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Exam ka naam search karein (SSC, Court, CPCT, Railway…)" className="input !rounded-full !pl-10" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-navy"><LayoutGrid className="h-4 w-4" />Exam Categories</div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((c) => (
            <a key={c} href={`#${slugId(c)}`} className="rounded-xl border border-line bg-white px-3 py-3 text-center text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand hover:text-brand">
              {c}<span className="block text-xs font-normal text-muted">{(() => { const n = patterns.filter((p) => (p.category || "Other") === c).length; return `${n} ${n === 1 ? "test" : "tests"}`; })()}</span>
            </a>
          ))}
        </div>
      </div>

      {!groups.length && <div className="card p-8 text-center text-muted">Koi exam nahi mila.</div>}
      {groups.map(([cat, items]) => (
        <div key={cat} id={slugId(cat)} className="card scroll-mt-28 p-4 md:p-5">
          <div className="mb-3 flex items-center gap-2 text-[17px] font-bold text-navy"><FolderOpen className="h-5 w-5 text-brand" />{cat} Typing Test Links</div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => {
              const langs = p.language === "both" ? ["hindi", "english"] : [p.language];
              return (
                <div key={p.slug} className="rounded-xl border border-line px-3.5 py-3 transition hover:border-brand/50 hover:bg-brand-50/40">
                  {langs.length === 1 ? (
                    <Link href={href(p, langs[0])} className="flex items-start gap-1.5 text-[14.5px] font-semibold text-brand hover:underline"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />{p.name}</Link>
                  ) : (
                    <div className="flex items-start gap-1.5 text-[14.5px] font-semibold text-ink"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{p.name}</div>
                  )}
                  <div className="mt-1 pl-5 text-xs text-muted">
                    {p.duration} min · Qualify {langs.map((l) => `${l === "hindi" ? "Hindi" : "English"} ${l === "hindi" ? p.hindi_speed : p.english_speed}`).join(" / ")} NWPM
                  </div>
                  {langs.length > 1 && (
                    <div className="mt-2 flex gap-2 pl-5">
                      <Link href={href(p, "hindi")} className="hi chip bg-saffron-50 py-1.5 text-saffron-600 hover:bg-saffron hover:text-white">हिंदी Test</Link>
                      <Link href={href(p, "english")} className="chip bg-brand-50 py-1.5 text-brand hover:bg-brand hover:text-white">English Test</Link>
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
