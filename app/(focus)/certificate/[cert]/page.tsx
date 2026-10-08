import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { Download } from "lucide-react";
import { one } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { fmtDate } from "@/lib/utils";
import PrintButton from "@/components/PrintButton";

export const metadata = { title: "Typing Certificate" };

export default async function Cert({ params }: { params: { cert: string } }) {
  const r = await one("SELECT * FROM typing_results WHERE cert_id=$1", [params.cert]);
  if (!r) notFound();
  const s = await getSettings();
  const h = headers();
  const origin = `${h.get("x-forwarded-proto") || "https"}://${h.get("x-forwarded-host") || h.get("host")}`;
  const qr = await QRCode.toDataURL(`${origin}/verify?id=${r.cert_id}`, { margin: 1, width: 180, color: { dark: "#0e1756" } });
  const hindi = r.language === "hindi";
  return (
    <div className="min-h-screen bg-canvas p-4 md:p-10">
      <div className="mx-auto mb-4 flex max-w-4xl justify-end gap-2 no-print">
        <PrintButton className="btn-orange"><Download className="h-4 w-4" />Download / Print PDF</PrintButton>
      </div>
      <style>{`@page { size: A4 landscape; margin: 0 } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact } }`}</style>
      <div className="print-area mx-auto aspect-[1.414] max-w-4xl rounded-2xl bg-white p-3 shadow-lift">
        <div className="relative flex h-full flex-col items-center justify-center rounded-xl border-[6px] border-double border-gold bg-gradient-to-b from-white via-white to-amber-50 px-6 md:px-14 text-center">
          <img src="/logo.png" alt="" className="h-20 w-20 md:h-24 md:w-24" />
          <div className="hi mt-2 text-xl md:text-2xl font-bold text-brand">{s.site_name || "परफेक्ट समाधान एकेडमी"}</div>
          <div className="mt-4 text-xs md:text-sm font-bold tracking-[.35em] text-amber-700">CERTIFICATE OF TYPING SPEED</div>
          <div className="mt-3 text-sm text-muted">Yeh pramanit kiya jaata hai ki</div>
          <div className="mt-2 text-3xl md:text-5xl font-bold text-navy">{r.name === "Guest" ? "________________" : r.name}</div>
          <p className="mt-4 max-w-2xl text-sm md:text-lg text-ink">ne {hindi ? `Hindi (${r.layout})` : "English"} typing test me <b>{Math.round(r.net_wpm)} Net WPM</b> (Gross {Math.round(r.gross_wpm)} WPM) ki gati aur <b>{r.accuracy}%</b> shuddhata prapt ki.</p>
          <div className="mt-6 md:mt-10 grid w-full grid-cols-3 items-end text-xs md:text-sm">
            <div className="text-left"><div className="font-bold">{fmtDate(r.created_at)}</div><div className="text-muted">Date</div></div>
            <div><img src={qr} alt="QR" className="mx-auto h-16 w-16 md:h-24 md:w-24" /><div className="mt-1 text-muted">Cert ID: {r.cert_id}</div></div>
            <div className="text-right"><div className="hi text-lg font-bold text-brand">परफेक्ट समाधान</div><div className="border-t border-ink/30 pt-1 text-muted">Director</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
