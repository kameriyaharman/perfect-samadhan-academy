"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, GraduationCap, Languages } from "lucide-react";

export default function HeroSearch({ exams }: { exams: { slug: string; name: string }[] }) {
  const r = useRouter();
  const [exam, setExam] = useState(exams[0]?.slug || "cpct");
  const [lang, setLang] = useState("hindi");
  return (
    <form onSubmit={(e) => { e.preventDefault(); r.push(`/mock-tests/${exam}?lang=${lang === "hindi" ? "hi" : "en"}`); }} className="mt-7 flex w-full max-w-xl flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 shadow-lift">
      <label className="flex flex-1 items-center gap-2 rounded-xl bg-canvas px-3">
        <GraduationCap className="h-4 w-4 text-muted" />
        <select value={exam} onChange={(e) => setExam(e.target.value)} className="w-full bg-transparent py-3 text-sm text-ink outline-none">
          {exams.map((x) => <option key={x.slug} value={x.slug}>Apna exam chunein — {x.name}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 rounded-xl bg-canvas px-3 sm:w-40">
        <Languages className="h-4 w-4 text-muted" />
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full bg-transparent py-3 text-sm text-ink outline-none">
          <option value="hindi">हिंदी / English</option>
          <option value="english">English</option>
        </select>
      </label>
      <button aria-label="Go" className="btn-primary !px-4"><ArrowRight className="h-5 w-5" /></button>
    </form>
  );
}
