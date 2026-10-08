"use client";
import { useState } from "react";
import { Play, X } from "lucide-react";
import { color } from "@/lib/utils";

function ytId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}
export default function VideoGrid({ videos }: { videos: { id: number; title: string; youtube_url: string; duration: string; faculty: string; views: string; color: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((v) => {
          const id = ytId(v.youtube_url);
          const onClick = () => (id ? setOpen(id) : window.open(v.youtube_url, "_blank"));
          return (
            <button key={v.id} onClick={onClick} className="card group overflow-hidden text-left transition hover:-translate-y-1 hover:shadow-lift">
              <div className={`relative aspect-video bg-gradient-to-br ${color(v.color).grad}`}>
                {id && <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />}
                <span className="absolute inset-0 grid place-items-center"><span className="grid h-14 w-14 place-items-center rounded-full bg-white text-brand shadow-lift transition group-hover:scale-110"><Play className="h-6 w-6 fill-current" /></span></span>
                {v.duration && <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs text-white">{v.duration}</span>}
              </div>
              <div className="p-4"><div className="font-bold leading-snug">{v.title}</div><div className="mt-1 text-xs text-muted">{v.faculty}{v.views ? ` · ${v.views} views` : ""}</div></div>
            </button>
          );
        })}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(null)} className="absolute -top-11 right-0 grid h-9 w-9 place-items-center rounded-full bg-white"><X className="h-5 w-5" /></button>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={`https://www.youtube.com/embed/${open}?autoplay=1`} className="h-full w-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen title="video" /></div>
          </div>
        </div>
      )}
    </>
  );
}
