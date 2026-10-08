import Link from "next/link";
import { ArrowRight, Bell, BookOpenCheck, ClipboardCheck, FileText, Keyboard, Languages, LineChart, Medal, PlayCircle, QrCode, ShieldCheck, Smartphone, Trophy, Users, GraduationCap, CheckCircle2, MessageCircle, Command } from "lucide-react";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { leaderboard } from "@/lib/queries";
import { color, initials, MONTHS } from "@/lib/utils";
import { Container, SectionTitle } from "@/components/Section";
import HeroTyping from "@/components/home/HeroTyping";
import HeroSearch from "@/components/home/HeroSearch";
import MaterialTabs from "@/components/home/MaterialTabs";

export default async function Home() {
  const s = await getSettings();
  const [exams, allExams, notes, pyq, shortcut, notices, testimonials, leaders, counts] = await Promise.all([
    q(`SELECT e.*, (SELECT count(*)::int FROM mock_tests m WHERE m.exam_slug=e.slug AND m.kind='full' AND m.active) AS mocks FROM exams e WHERE active AND show_on_home ORDER BY sort LIMIT 4`),
    q(`SELECT slug, name FROM exams WHERE active ORDER BY sort`),
    q(`SELECT * FROM materials WHERE active AND type='notes' ORDER BY popular DESC, downloads DESC LIMIT 3`),
    q(`SELECT * FROM materials WHERE active AND type='pyq' ORDER BY downloads DESC LIMIT 3`),
    q(`SELECT * FROM materials WHERE active AND type IN ('shortcut','syllabus') ORDER BY downloads DESC LIMIT 3`),
    q(`SELECT * FROM notices WHERE active AND show_on_home ORDER BY date DESC LIMIT 4`),
    q(`SELECT * FROM testimonials ORDER BY sort LIMIT 4`),
    leaderboard("week", 3),
    q(`SELECT (SELECT count(*)::int FROM typing_results WHERE created_at > now() - interval '1 day') AS today`),
  ]);
  const stats = [s.stat_1, s.stat_2, s.stat_3, s.stat_4].filter(Boolean).map((x) => x.split("|"));
  const quick = [
    { icon: Keyboard, t: "Hindi Typing", d: "Inscript · Remington · Krutidev", href: "/typing-test/setup?lang=hindi", c: "orange" },
    { icon: Languages, t: "English Typing", d: "Exam & practice mode", href: "/typing-test/setup?lang=english", c: "blue" },
    { icon: ClipboardCheck, t: "Mock Tests", d: "Full · Subject · Topic", href: "/mock-tests", c: "green" },
    { icon: FileText, t: "PYQ Papers", d: "2015–2026 with answers", href: "/previous-papers", c: "red" },
    { icon: BookOpenCheck, t: "Notes PDF", d: "Hindi & English", href: "/study-material", c: "purple" },
    { icon: Command, t: "Shortcut Keys", d: "MS Office, Windows", href: "/shortcut-keys", c: "teal" },
  ];
  const tagStyle: Record<string, string> = { "Most Popular": "bg-orange-50 text-orange-600", Popular: "bg-orange-50 text-orange-600", New: "bg-green-50 text-green-700", Typing: "bg-brand-50 text-brand", Free: "bg-green-50 text-green-700", Soon: "bg-slate-100 text-slate-600" };
  const barColor = ["bg-brand", "bg-saffron", "bg-green-600", "bg-violet-600"];
  const maxStudents = Math.max(1, ...exams.map((e: any) => e.students || 0));

  return (
    <>
      {/* HERO */}
      <section className="hero-bg relative overflow-hidden text-white" data-dark>
        <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        <Container className="relative grid items-center gap-14 pb-28 pt-12 md:pt-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {s.hero_badge && <span className="chip mb-5 border border-gold/40 bg-gold/15 text-gold reveal"><Medal className="h-3.5 w-3.5" />{s.hero_badge}</span>}
            <h1 className="hi text-[40px] sm:text-5xl md:text-[60px] font-bold leading-[1.12] reveal">
              {s.hero_title_1}<br />{s.hero_title_2} <span className="text-gold">{s.hero_title_3}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15.5px] md:text-[17px] text-white/85 reveal">{s.hero_subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3 reveal">
              <Link href="/typing-test" className="btn-orange !py-3.5 !px-6"><Keyboard className="h-5 w-5" />Typing Test Shuru Karein</Link>
              <Link href="/mock-tests" className="btn !py-3.5 !px-6 border border-white/30 bg-white/10 text-white hover:bg-white/20"><PlayCircle className="h-5 w-5" />Free Mock Test</Link>
            </div>
            <HeroSearch exams={allExams as any} />
            <div className="mt-8 grid max-w-xl grid-cols-2 sm:grid-cols-4 gap-5">
              {stats.map(([v, l], i) => (
                <div key={i}><div className="text-2xl md:text-[28px] font-bold">{v}</div><div className="text-xs text-white/70">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hidden sm:block py-8"><HeroTyping /></div>
        </Container>
      </section>

      {/* QUICK CARDS */}
      <Container className="relative -mt-16 z-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
          {quick.map((x) => (
            <Link key={x.t} href={x.href} className="card group p-4 md:p-5 transition hover:-translate-y-1 hover:shadow-lift">
              <span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${color(x.c).bg} ${color(x.c).text} transition group-hover:scale-110`}><x.icon className="h-5 w-5" /></span>
              <div className="font-bold">{x.t}</div>
              <div className="mt-0.5 text-xs text-muted">{x.d}</div>
            </Link>
          ))}
        </div>
      </Container>

      {/* POPULAR EXAMS */}
      <Container className="py-16">
        <SectionTitle eyebrow="Popular Exams" title="अपनी परीक्षा चुनें" sub="Har exam ke liye alag mock tests, typing pattern aur study material"
          right={<Link href="/exams" className="flex items-center gap-1 text-sm font-semibold text-brand">Sabhi exams dekhein <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exams.map((e: any, i: number) => (
            <div key={e.id} className="card p-5 transition hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-start justify-between">
                <span className={`grid h-11 min-w-[44px] place-items-center rounded-xl px-2 text-[11px] font-extrabold ${color(e.color).bg} ${color(e.color).text}`}>{e.code}</span>
                {e.tag && <span className={`chip ${tagStyle[e.tag] || "bg-brand-50 text-brand"}`}>{e.tag}</span>}
              </div>
              <div className="mt-4 text-lg font-bold">{e.name}</div>
              <div className="mt-1 flex gap-3 text-xs text-muted"><span>{e.mocks} Mocks</span>{e.typing_language && <span>{e.typing_language}</span>}</div>
              <div className="mt-4 h-1.5 rounded-full bg-canvas"><div className={`h-1.5 rounded-full ${barColor[i % 4]}`} style={{ width: `${Math.max(15, ((e.students || 0) / maxStudents) * 100)}%` }} /></div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted">{(e.students || 0).toLocaleString("en-IN")} students</span>
                <Link href={`/mock-tests/${e.slug}`} className="flex items-center gap-1 font-bold text-brand">Start <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* TYPING BANNER */}
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-navy to-[#1a2a8a] p-6 md:p-10 text-white" data-dark>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/40 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <span className="chip border border-gold/40 bg-gold/10 text-gold"><Keyboard className="h-3.5 w-3.5" />Typing Test Platform</span>
              <h2 className="hi mt-4 text-3xl md:text-[40px] font-bold leading-tight">हिंदी और English<br />टाइपिंग — <span className="text-gold">Real Exam जैसा</span></h2>
              <ul className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-2">
                {["Gross / Net WPM & accuracy", "Galti par live highlight", "2, 5, 10, 15 min tests", "On-screen keyboard guide", "CPCT / SSC / Court exam mode", "Result PDF + certificate"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-gold" />{f}</li>
                ))}
              </ul>
              <Link href="/typing-test" className="btn-orange mt-7">Abhi Typing Test Dein <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/typing-test/setup?lang=hindi" className="rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:bg-white/10">
                  <div className="hi text-4xl font-bold text-gold">अ</div>
                  <div className="mt-2 font-bold">Hindi Typing</div>
                  <div className="text-xs text-white/70">Unicode based, Mangal font — sarkari exam pattern</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">{["Inscript", "Remington Gail", "Remington CBI", "Krutidev"].map((x) => <span key={x} className="chip bg-white/10 text-white/85 font-medium">{x}</span>)}</div>
                </Link>
                <Link href="/typing-test/setup?lang=english" className="rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:bg-white/10">
                  <div className="text-4xl font-bold text-gold">Aa</div>
                  <div className="mt-2 font-bold">English Typing</div>
                  <div className="text-xs text-white/70">QWERTY layout, punctuation & numbers ke saath</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">{["Easy", "Medium", "Exam Level", "Paragraph"].map((x) => <span key={x} className="chip bg-white/10 text-white/85 font-medium">{x}</span>)}</div>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-5">
                <div>
                  <div className="font-bold">Typing Leaderboard — Is hafte ke top</div>
                  <div className="text-xs text-white/70">{leaders.length ? leaders.map((l, i) => `${i + 1}. ${l.name.split(" ")[0]} · ${l.best} WPM`).join("  ·  ") : `Aaj ${counts[0]?.today || 0} tests diye gaye — pehle number par aap aa sakte hain!`}</div>
                </div>
                <Link href="/typing-test/leaderboard" className="btn btn-sm border border-white/25 bg-white/10 text-white hover:bg-white/20"><Trophy className="h-4 w-4" />Leaderboard</Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* STUDY MATERIAL */}
      <section className="mt-16 bg-white py-16">
        <Container>
          <SectionTitle eyebrow="Study Material" title="Notes, PDF aur Previous Papers" sub="Syllabus ke hisaab se, Hindi aur English dono me — free download" />
          <MaterialTabs notes={notes as any} pyq={pyq as any} shortcut={shortcut as any} />
        </Container>
      </section>

      {/* WHY + NOTICES */}
      <Container className="grid gap-8 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionTitle eyebrow="Kyun Perfect Samadhan?" title="तैयारी जो रिज़ल्ट दे" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[[ShieldCheck, "Official Syllabus Aligned", "Har test aur note exam ke latest official syllabus aur pattern ke hisaab se.", "blue"], [Languages, "Hindi + English Dono", "Har question aur explanation dono bhashaon me — ek click me switch.", "orange"], [LineChart, "Detailed Analysis", "Har test ke baad weak topics, accuracy aur all-India rank.", "green"], [GraduationCap, "Expert Faculty", "Offline + online batches, doubt session aur video lectures.", "purple"]].map(([I, t, d, c]: any) => (
              <div key={t} className="card p-5">
                <span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${color(c).bg} ${color(c).text}`}><I className="h-5 w-5" /></span>
                <div className="font-bold">{t}</div>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card overflow-hidden self-start">
          <div className="flex items-center justify-between bg-saffron px-5 py-3.5 text-white">
            <span className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4" />Notice Board & Important Dates</span>
            <Link href="/notices" className="text-xs font-semibold">View all</Link>
          </div>
          <div className="divide-y divide-line">
            {notices.map((n: any) => {
              const d = new Date(n.date);
              return (
                <Link key={n.id} href={n.link || "/notices"} className="flex gap-4 px-5 py-4 hover:bg-canvas">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-center leading-none text-brand"><span><b className="block text-lg">{String(d.getDate()).padStart(2, "0")}</b><span className="text-[10px] font-semibold uppercase">{MONTHS[d.getMonth()]}</span></span></span>
                  <span className="min-w-0"><span className="block text-sm font-bold">{n.title}</span><span className="mt-1 inline-block chip bg-green-50 text-green-700">{n.category}</span></span>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>

      {/* TOPPERS */}
      <section className="bg-white py-16">
        <Container>
          <SectionTitle eyebrow="Hamare Toppers" title="सफलता की उड़ान भरने वाले" right={<Link href="/about" className="flex items-center gap-1 text-sm font-semibold text-brand">Sabhi results <ArrowRight className="h-4 w-4" /></Link>} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t: any) => (
              <div key={t.id} className="card p-6 text-center transition hover:-translate-y-1 hover:shadow-lift">
                <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-lg font-bold text-white ring-4 ring-gold/50 bg-gradient-to-br ${color(t.color).grad}`}>{initials(t.name)}</span>
                <div className="mt-3 font-bold">{t.name}</div>
                <div className="text-xs text-muted">{t.exam}</div>
                <span className="chip mt-2 bg-green-50 text-green-700"><Medal className="h-3 w-3" />{t.result}</span>
                <p className="mt-3 text-sm italic text-muted">“{t.quote}”</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* APP + QUIZ */}
      <Container className="py-16">
        <div className="card grid gap-6 p-6 md:p-8 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] items-center">
          <div>
            <h3 className="text-2xl font-bold text-navy">Mobile App bhi available</h3>
            <p className="mt-1 text-sm text-muted">Mock test aur typing practice ab phone par — offline PDF ke saath.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={s.android_app || "#"} className="btn-primary btn-sm"><Smartphone className="h-4 w-4" />Android App</a>
              <Link href="/downloads" className="btn-ghost btn-sm"><QrCode className="h-4 w-4" />QR Scan</Link>
            </div>
          </div>
          <Link href="/mock-tests/quiz" className="rounded-2xl border border-line p-4 hover:border-brand"><div className="text-xs text-muted">Daily Quiz</div><div className="text-2xl font-bold">10 Q</div><div className="text-xs text-muted">roz subah naya quiz</div></Link>
          <Link href="/notices" className="rounded-2xl border border-line p-4 hover:border-brand"><div className="text-xs text-muted">Current Affairs</div><div className="text-2xl font-bold">Daily</div><div className="text-xs text-muted">Notices & updates</div></Link>
          <div className="rounded-2xl bg-navy p-5 text-white" data-dark>
            <div className="flex items-center gap-2 font-bold text-gold"><MessageCircle className="h-4 w-4" />WhatsApp Group Join karein</div>
            <p className="mt-1 text-sm text-white/75">Notice, admit card aur free PDF sabse pehle aapke phone par.</p>
            <a href={s.whatsapp_group || "#"} target="_blank" rel="noreferrer" className="btn-orange btn-sm mt-3">Join Now</a>
          </div>
        </div>
      </Container>

      {/* CTA */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-navy" />
        <Container className="relative">
          <div className="flex flex-col items-start justify-between gap-5 rounded-[24px] bg-gradient-to-r from-saffron to-gold p-7 md:flex-row md:items-center md:p-9 shadow-lift">
            <div>
              <h3 className="hi text-2xl md:text-[32px] font-bold text-navy">{s.cta_title}</h3>
              <p className="mt-1 text-sm text-navy/80">{s.cta_subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/login?tab=register" className="btn-primary"><Users className="h-4 w-4" />Free Register</Link>
              <a href={s.android_app || "/downloads"} className="btn bg-white px-5 py-2.5 text-navy"><Smartphone className="h-4 w-4" />Download App</a>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
