import Link from "next/link";
import { ArrowRight, FileText, Gauge, GraduationCap, Keyboard, ScanSearch, Trophy, Users, Award, PlayCircle } from "lucide-react";
import { q } from "@/lib/db";
import PageHero from "@/components/PageHero";
import { Container, SectionTitle } from "@/components/Section";

export const metadata = { title: "Hindi & English Typing Test" };

export default async function TypingHub() {
  const [exams, stats] = await Promise.all([
    q(`SELECT * FROM exams WHERE active AND show_in_typing ORDER BY sort`),
    q(`SELECT (SELECT count(*)::int FROM typing_results WHERE created_at > now()-interval '1 day') AS today, (SELECT count(*)::int FROM passages WHERE active) AS passages`),
  ]);
  const st = stats[0] || { today: 0, passages: 0 };
  const cards = [
    { k: "अ", c: "bg-saffron", t: "Hindi Typing Test", d: "Unicode (Mangal) — Inscript, Remington Gail, Remington CBI, Krutidev", chips: ["Inscript", "Remington Gail", "Krutidev", "CPCT Pattern"], href: "/typing-test/setup?lang=hindi", btn: "Hindi Test Shuru Karein" },
    { k: "Aa", c: "bg-brand", t: "English Typing Test", d: "QWERTY layout — easy se exam level tak paragraphs, numbers aur punctuation", chips: ["Easy", "Medium", "Exam Level", "SSC DEST"], href: "/typing-test/setup?lang=english", btn: "English Test Shuru Karein" },
    { k: "", c: "bg-green-600", t: "Typing Seekhein", d: "Zero se shuru — home row, upper row, lower row, finger placement lessons", chips: ["Lessons", "Finger Guide", "Beginner"], href: "/typing-test/learn", btn: "Lessons Dekhein", icon: true },
  ];
  return (
    <>
      <PageHero crumbs={[{ label: "Typing Test" }]} title="हिंदी और English" highlight="टाइपिंग टेस्ट"
        subtitle="CPCT, SSC, High Court, Patwari, MP Police aur sabhi sarkari exams ke pattern par free typing test. Real exam jaisa interface, Net/Gross WPM, accuracy aur certificate."
        chips={[<><Users className="h-4 w-4" />{st.today.toLocaleString("en-IN")} aaj test de chuke</>, <><FileText className="h-4 w-4" />{st.passages}+ passages</>, <><Award className="h-4 w-4" />Free certificate</>]} />
      <Container className="py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.t} className="card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-start justify-between">
                <span className={`grid h-16 w-16 place-items-center rounded-2xl ${c.c} text-3xl font-bold text-white hi`}>{c.icon ? <GraduationCap className="h-8 w-8" /> : c.k}</span>
                <span className="chip bg-green-50 text-green-700 py-2">Free</span>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-navy">{c.t}</h2>
              <p className="mt-1 text-[15px] text-muted">{c.d}</p>
              <div className="mt-4 flex flex-wrap gap-2">{c.chips.map((x) => <span key={x} className="chip bg-brand-50 text-brand">{x}</span>)}</div>
              <Link href={c.href} className="btn-primary mt-auto pt-3 !mt-6">{c.btn} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <SectionTitle eyebrow="Exam-wise Typing" title="अपनी परीक्षा के हिसाब से टेस्ट दें" />
          <div className="card overflow-x-auto">
            <table className="table-x min-w-[760px]">
              <thead><tr><th>Exam</th><th>Language</th><th>Layout</th><th>Time</th><th>Qualifying Speed</th><th></th></tr></thead>
              <tbody>
                {exams.map((e: any) => {
                  const lang = /hindi/i.test(e.typing_language || "") && !/english/i.test(e.typing_language || "") ? "hindi" : /^english/i.test(e.typing_language || "") ? "english" : "hindi";
                  const pattern = e.slug === "high-court" ? "highcourt" : e.slug.startsWith("ssc") || e.slug.startsWith("railway") ? "ssc" : "cpct";
                  const layout = /remington|krutidev/i.test(e.typing_layout || "") && !/inscript/i.test(e.typing_layout || "") ? "remington" : "inscript";
                  const mins = parseInt(e.typing_time) || 10;
                  return (
                    <tr key={e.id}>
                      <td className="font-bold">{e.name}</td><td>{e.typing_language}</td><td>{e.typing_layout}</td><td>{e.typing_time}</td>
                      <td><span className="chip bg-green-50 text-green-700 py-1.5">{e.typing_speed}</span></td>
                      <td className="text-right"><Link href={`/typing-test/setup?lang=${lang}&layout=${layout}&pattern=${pattern}&duration=${Math.min(15, mins)}`} className="btn-primary btn-sm"><PlayCircle className="h-4 w-4" />Start <ArrowRight className="h-3.5 w-3.5" /></Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[Gauge, "Live Speed Meter", "Gross, Net WPM aur accuracy har second", "blue", "/typing-test/setup?lang=hindi"], [Keyboard, "On-screen Keyboard", "Agla key highlight — beginners ke liye", "orange", "/typing-test/learn"], [ScanSearch, "Error Analysis", "Kaunse shabd galat — poori list", "green", "/typing-test/setup?lang=english"], [Trophy, "Leaderboard", "Roz aur hafte ke top typists", "purple", "/typing-test/leaderboard"]].map(([I, t, d, c, h]: any) => (
            <Link key={t} href={h} className="card p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <span className={`mb-5 grid h-12 w-12 place-items-center rounded-xl ${c === "blue" ? "bg-brand-50 text-brand" : c === "orange" ? "bg-orange-50 text-saffron" : c === "green" ? "bg-green-50 text-green-600" : "bg-violet-50 text-violet-600"}`}><I className="h-5 w-5" /></span>
              <div className="text-lg font-bold">{t}</div><div className="mt-1 text-sm text-muted">{d}</div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
