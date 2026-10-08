"use client";
import { useState } from "react";
import { Download, FileText, Lock, ZoomIn, ZoomOut } from "lucide-react";

export default function DocPreview({ title, pages, html, contents, premium, slug }: { title: string; pages: number | null; html: string | null; contents: string[]; premium: boolean; slug: string }) {
  const [zoom, setZoom] = useState(100);
  const body = html || `<h2>${title}</h2><p>Is PDF me shamil vishay:</p><ul>${contents.map((c) => `<li>${c.replace(/</g, "&lt;")}</li>`).join("")}</ul><p class="tip">Poora material dekhne ke liye download karein.</p>`;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3 text-sm">
        <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Page {pages ? `3 / ${pages}` : "1"} · Preview</span>
        <span className="flex items-center gap-1.5">
          <button onClick={() => setZoom(Math.max(70, zoom - 10))} className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 font-bold text-brand"><ZoomOut className="h-4 w-4" /></button>
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 font-semibold text-brand">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(140, zoom + 10))} className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 font-bold text-brand"><ZoomIn className="h-4 w-4" /></button>
        </span>
      </div>
      <div className="overflow-x-auto bg-[#eceef6] p-4 md:p-8">
        <div className="mx-auto max-w-2xl bg-white p-6 md:p-12 shadow-lift" style={{ zoom: zoom / 100 } as any}>
          <div className="flex items-center justify-between border-b-2 border-brand pb-3"><span className="hi text-lg font-bold text-brand">परफेक्ट समाधान एकेडमी</span><span className="text-xs text-muted">{title.split("—")[0]}</span></div>
          <div className="doc hi mt-6 text-[15px]" dangerouslySetInnerHTML={{ __html: body }} />
          <div className="mt-10 text-center">
            {premium ? <a href={`/checkout?item=material:${slug}`} className="btn-orange"><Lock className="h-4 w-4" />Poora PDF Unlock Karein</a>
              : <a href={`/api/download/material/${slug}`} className="btn-primary"><Download className="h-4 w-4" />Poora PDF Download Karein</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
