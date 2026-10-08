import { notFound } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
import { one } from "@/lib/db";
import { lines } from "@/lib/utils";
import PrintButton from "@/components/PrintButton";

export default async function Notes({ params }: { params: { slug: string } }) {
  const m = await one("SELECT * FROM materials WHERE slug=$1 AND active AND NOT is_premium", [params.slug]);
  if (!m) notFound();
  return (
    <div className="min-h-screen bg-canvas py-6">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between px-4 no-print">
        <a href={`/study-material/${m.slug}`} className="flex items-center gap-1 text-sm text-brand"><ArrowLeft className="h-4 w-4" />Wapas</a>
        <PrintButton className="btn-orange"><Download className="h-4 w-4" />Save as PDF</PrintButton>
      </div>
      <div className="print-area mx-auto max-w-3xl bg-white p-8 md:p-14 shadow-lift">
        <div className="flex items-center gap-3 border-b-2 border-brand pb-4"><img src="/logo.png" alt="" className="h-14 w-14" /><div><div className="hi text-xl font-bold text-brand">परफेक्ट समाधान एकेडमी</div><div className="text-xs text-muted">www — Study Material</div></div></div>
        <h1 className="mt-6 text-3xl font-bold text-navy">{m.title}</h1>
        {m.description && <p className="mt-2 text-muted">{m.description}</p>}
        {lines(m.contents).length > 0 && <><h2 className="mt-6 text-xl font-bold">Vishay Suchi</h2><ol className="mt-2 list-decimal pl-6">{lines(m.contents).map((c) => <li key={c}>{c}</li>)}</ol></>}
        {m.preview_html && <div className="doc hi mt-8" dangerouslySetInnerHTML={{ __html: m.preview_html }} />}
        <p className="mt-10 border-t border-line pt-4 text-center text-xs text-muted">© Perfect Samadhan Academy — Sirf vyaktigat adhyayan ke liye</p>
      </div>
    </div>
  );
}
