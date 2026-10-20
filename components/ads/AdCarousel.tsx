"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Ad = { id: number; title: string; image_url: string; mobile_image_url?: string | null; link?: string | null; new_tab?: boolean };

function Banner({ ad, eager }: { ad: Ad; eager: boolean }) {
  const img = (
    <picture>
      {ad.mobile_image_url && <source media="(max-width: 640px)" srcSet={ad.mobile_image_url} />}
      <img src={ad.image_url} alt={ad.title} loading={eager ? "eager" : "lazy"} className="block h-auto w-full max-h-[420px] object-contain" />
    </picture>
  );
  if (!ad.link) return img;
  const ext = /^https?:\/\//.test(ad.link);
  return (
    <a href={ad.link} target={ad.new_tab !== false ? "_blank" : undefined} rel={ext ? "noopener noreferrer sponsored" : undefined} className="block" aria-label={ad.title}>
      {img}
    </a>
  );
}

export default function AdCarousel({ ads }: { ads: Ad[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = ads.length;
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n, paused]);

  if (n === 1) return <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><Banner ad={ads[0]} eager /></div>;

  const go = (d: number) => setI((x) => (x + d + n) % n);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-sm" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {ads.map((a, k) => <div key={a.id} className="w-full shrink-0 self-center" aria-hidden={k !== i}><Banner ad={a} eager={k === 0} /></div>)}
      </div>
      <button type="button" onClick={() => go(-1)} aria-label="Pichla ad" className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100"><ChevronLeft className="h-4 w-4" /></button>
      <button type="button" onClick={() => go(1)} aria-label="Agla ad" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100"><ChevronRight className="h-4 w-4" /></button>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2 py-1">
        {ads.map((a, k) => <button key={a.id} type="button" onClick={() => setI(k)} aria-label={`Ad ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} />)}
      </div>
    </div>
  );
}
