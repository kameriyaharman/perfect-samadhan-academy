"use client";
import { useEffect, useState } from "react";
import { Flame, Award } from "lucide-react";

const TEXT = "भारत एक विशाल देश है जहाँ अनेक भाषाएँ, धर्म और संस्कृतियाँ एक साथ फलती-फूलती हैं। नियमित अभ्यास ही सफलता की कुंजी है।";
export default function HeroTyping() {
  const chars = Array.from(TEXT);
  const [n, setN] = useState(0);
  const [time, setTime] = useState(522);
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x >= chars.length + 12 ? 0 : x + 1)), 110);
    const c = setInterval(() => setTime((x) => (x <= 1 ? 600 : x - 1)), 1000);
    return () => { clearInterval(t); clearInterval(c); };
  }, [chars.length]);
  const wrongAt = 33;
  const wpm = Math.min(38, 18 + Math.floor(n / 6));
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -top-8 right-0 z-10 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lift float-y">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-saffron"><Flame className="h-4 w-4" /></span>
        <span className="text-xs leading-tight text-ink"><b>7 din streak</b><br /><span className="text-muted">Roz practice!</span></span>
      </div>
      <div className="rounded-3xl bg-white p-5 text-ink shadow-[0_30px_60px_rgba(6,12,60,.35)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold"><span className="h-2 w-2 rounded-sm bg-brand" />Hindi Typing · Inscript</span>
          <span className="chip bg-red-50 text-red-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />LIVE</span>
        </div>
        <div className="hi min-h-[96px] rounded-2xl bg-brand-50/70 p-4 text-[17px] leading-8">
          {chars.map((c, i) => (
            <span key={i} className={i < n ? (i >= wrongAt && i < wrongAt + 6 ? "text-red-500 wavy" : "text-green-600") : i === n ? "rounded bg-orange-200 text-ink" : "text-slate-400"}>{c}</span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-line p-3"><div className="text-[11px] text-muted">Net Speed</div><div className="text-2xl font-bold">{wpm} <span className="text-xs font-medium text-muted">WPM</span></div></div>
          <div className="rounded-xl border border-line p-3"><div className="text-[11px] text-muted">Accuracy</div><div className="text-2xl font-bold text-green-600">96%</div></div>
          <div className="rounded-xl border border-line p-3"><div className="text-[11px] text-muted">Time Left</div><div className="text-2xl font-bold text-saffron">{String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}</div></div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 sm:-left-10 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lift float-y" style={{ animationDelay: "1.2s" }}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-green-100 text-green-600"><Award className="h-4 w-4" /></span>
        <span className="text-xs leading-tight text-ink"><b>Riya ne CPCT clear kiya</b><br /><span className="text-muted">English 38 · Hindi 31 WPM</span></span>
      </div>
    </div>
  );
}
