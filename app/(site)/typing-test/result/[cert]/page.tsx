import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BarChart3, CheckCircle2, Download, RotateCcw, ShieldCheck, XCircle, LogIn } from "lucide-react";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { fmtDate, fmtDateTime } from "@/lib/utils";
import { PATTERN_NAME } from "@/lib/typingScore";
import LineChart from "@/components/charts/LineChart";
import PrintButton from "@/components/PrintButton";
import { Container } from "@/components/Section";

export const metadata = { title: "Typing Result" };

export default async function Result({ params }: { params: { cert: string } }) {
  const r = await one("SELECT * FROM typing_results WHERE cert_id=$1", [params.cert]);
  if (!r) notFound();
  const user = await getUser();
  const rank = await one(`SELECT (SELECT count(*)::int FROM typing_results WHERE language=$1 AND created_at > now()-interval '1 day' AND net_wpm > $2) + 1 AS rank, (SELECT count(*)::int FROM typing_results WHERE language=$1 AND created_at > now()-interval '1 day') AS total`, [r.language, r.net_wpm]);
  const per: number[] = JSON.parse(r.per_minute || "[]");
  const mistakes: { expected: string; typed: string; type: string }[] = JSON.parse(r.mistakes || "[]");
  const name = r.name === "Guest" ? "" : r.name.split(" ")[0];
  const hindi = r.language === "hindi";
  const worst = per.length > 2 ? per.indexOf(Math.min(...per)) : -1;
  const typeColor: Record<string, string> = { Spelling: "bg-red-50 text-red-600", Matra: "bg-red-50 text-red-600", Halant: "bg-orange-50 text-orange-600", Nukta: "bg-orange-50 text-orange-600", "Chhoot gaya": "bg-slate-100 text-slate-600", Punctuation: "bg-violet-50 text-violet-700", "Capital letter": "bg-violet-50 text-violet-700" };
  const isMine = !r.user_id || (user && user.id === r.user_id);
  return (
    <Container className="py-8 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="hero-bg relative overflow-hidden rounded-[24px] p-6 md:p-8 text-white" data-dark>
          <div className="absolute right-10 top-0 h-40 w-40 rounded-full bg-saffron/30 blur-3xl" />
          <span className={`chip ${r.qualified ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"} py-1.5`}>{r.qualified ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{r.qualified ? "QUALIFIED" : "NOT QUALIFIED"} — {PATTERN_NAME[r.pattern] || r.pattern} {hindi ? "Hindi" : "English"} ({r.qualify_speed} NWPM)</span>
          <h1 className="hi mt-4 text-4xl md:text-5xl font-bold">{r.qualified ? "शाबाश" : "अच्छा प्रयास"}{name ? ` ${name}` : ""}! {r.qualified ? "🎉" : "💪"}</h1>
          <p className="mt-2 text-white/80">{hindi ? `Hindi ${r.layout}` : "English"} · {Math.round(r.duration / 60) || 1} min · {r.mode === "exam" ? "Exam" : "Practice"} Mode · {fmtDateTime(r.created_at)}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Net Speed", Math.round(r.net_wpm), "WPM", "text-gold"], ["Gross Speed", Math.round(r.gross_wpm), "WPM", ""], ["Accuracy", `${r.accuracy}%`, `${r.typed_words - r.errors} / ${r.typed_words} words`, ""], ["Rank", `#${rank?.rank || 1}`, `of ${rank?.total || 1} today`, ""]].map(([l, v, s, c]) => (
              <div key={l as string} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-sm text-white/70">{l}</div>
                <div className={`mt-1 text-3xl md:text-4xl font-bold ${c}`}>{v}</div>
                <div className="mt-1 text-xs text-white/60">{s}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 no-print">
            <PrintButton className="btn-orange"><Download className="h-4 w-4" />Result PDF</PrintButton>
            <Link href={`/certificate/${r.cert_id}`} className="btn border border-white/30 bg-white/10 px-5 py-2.5 text-white hover:bg-white/20"><Award className="h-4 w-4" />Certificate</Link>
            <Link href={`/typing-test/setup?lang=${r.language}`} className="btn border border-white/30 bg-white/10 px-5 py-2.5 text-white hover:bg-white/20"><RotateCcw className="h-4 w-4" />Dobara Test</Link>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><BarChart3 className="h-5 w-5" />Speed — har minute</h2>
          {per.length >= 2 ? (
            <LineChart series={[{ color: "#1f35b8", values: per }]} labels={per.map((_, i) => String(i + 1))} refLine={r.qualify_speed} refLabel={`${PATTERN_NAME[r.pattern] || ""} min ${r.qualify_speed}`} />
          ) : <div className="grid h-48 place-items-center rounded-xl bg-canvas text-sm text-muted">Minute-wise chart 2+ minute ke test me dikhega.</div>}
          <p className="mt-3 text-sm text-muted">
            {worst >= 0 ? <>Minute {worst + 1} par speed sabse kam rahi ({per[worst]} WPM). {hindi ? <>Wahan <b className="hi">संयुक्ताक्षर</b> aur matraon ka alag abhyas karein.</> : "Wahan lambe shabd ya punctuation ka abhyas karein."}</> : `Total ${r.typed_words} shabd type kiye, ${r.errors} galtiyan.`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><RotateCcw className="h-5 w-5" />Aapki Galtiyan ({mistakes.length})</h2>
          {mistakes.length ? (
            <div className="max-h-[420px] overflow-auto">
              <table className="table-x">
                <thead><tr><th>Sahi Shabd</th><th>Aapne Likha</th><th>Galti ka Prakar</th></tr></thead>
                <tbody>{mistakes.map((m, i) => (
                  <tr key={i}><td className={hindi ? "hi text-base" : ""}>{m.expected}</td><td className={`${hindi ? "hi text-base" : ""} text-red-500`}>{m.typed}</td><td><span className={`chip ${typeColor[m.type] || "bg-red-50 text-red-600"}`}>{m.type}</span></td></tr>
                ))}</tbody>
              </table>
            </div>
          ) : <div className="rounded-xl bg-green-50 p-6 text-center text-green-700">Ek bhi galti nahi — shandaar! 🎯</div>}
        </div>
        <div className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><Award className="h-5 w-5" />Certificate Preview</h2>
          <div className="rounded-2xl border-2 border-gold bg-gradient-to-b from-white to-amber-50 p-6 text-center">
            <img src="/logo.png" alt="" className="mx-auto h-16 w-16" />
            <div className="mt-3 text-xs font-bold tracking-[.2em] text-amber-700">CERTIFICATE OF TYPING SPEED</div>
            <div className="mt-2 text-3xl font-bold text-navy">{r.name === "Guest" ? "Aapka Naam" : r.name}</div>
            <p className="mt-2 text-sm text-muted">ne {hindi ? `Hindi (${r.layout})` : "English"} typing me <b className="text-ink">{Math.round(r.net_wpm)} Net WPM</b> aur <b className="text-ink">{r.accuracy}% accuracy</b> prapt ki.</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted"><span>Cert ID: {r.cert_id}</span><span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />Verify online</span><span>{fmtDate(r.created_at)}</span></div>
          </div>
          {r.name === "Guest" && isMine && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-4 text-sm">
              <span>Certificate par apna naam aur leaderboard me jagah ke liye login karein.</span>
              <Link href={`/login?next=/typing-test/setup?lang=${r.language}`} className="btn-primary btn-sm"><LogIn className="h-4 w-4" />Login / Register</Link>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
