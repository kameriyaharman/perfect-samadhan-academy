"use client";
import Link from "next/link";
import { useState } from "react";
import { Download, Eye, PlayCircle } from "lucide-react";
import Cover from "@/components/Cover";

type M = { slug: string; title: string; type: string; cover_text: string | null; color: string; pages: number | null; downloads: number; test_id?: number | null };
export default function MaterialTabs({ notes, pyq, shortcut }: { notes: M[]; pyq: M[]; shortcut: M[] }) {
  const [tab, setTab] = useState<"notes" | "pyq" | "shortcut">("notes");
  const list = tab === "notes" ? notes : tab === "pyq" ? pyq : shortcut;
  return (
    <div>
      <div className="mb-6 flex justify-start md:justify-end">
        <div className="seg w-full md:w-auto bg-white border border-line">
          {([["notes", "Notes PDF"], ["pyq", "PYQ Papers"], ["shortcut", "Shortcut Keys"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={tab === k ? "on" : ""}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((m) => (
          <div key={m.slug} className="card flex gap-4 p-4 transition hover:-translate-y-1 hover:shadow-lift">
            <Cover text={m.cover_text} color={m.color} />
            <div className="min-w-0 flex-1">
              <Link href={`/study-material/${m.slug}`} className="line-clamp-2 font-bold leading-snug hover:text-brand">{m.title}</Link>
              <div className="mt-1 text-xs text-muted">{m.pages ? `${m.pages} pages · ` : ""}<Download className="inline h-3 w-3" /> {m.downloads >= 1000 ? (m.downloads / 1000).toFixed(1) + "k" : m.downloads}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`/api/download/material/${m.slug}`} className="btn-primary btn-sm"><Download className="h-3.5 w-3.5" />Download</a>
                {m.type === "pyq" ? <Link href="/mock-tests/pyq" className="btn-soft btn-sm"><PlayCircle className="h-3.5 w-3.5" />Online Test</Link> : <Link href={`/study-material/${m.slug}`} className="btn-soft btn-sm"><Eye className="h-3.5 w-3.5" />Preview</Link>}
              </div>
            </div>
          </div>
        ))}
        {!list.length && <div className="text-muted">Jald aa raha hai.</div>}
      </div>
    </div>
  );
}
