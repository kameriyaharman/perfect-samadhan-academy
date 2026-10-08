import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Facebook, Youtube, Instagram, Send } from "lucide-react";

const COLS: [string, [string, string][]][] = [
  ["Typing Test", [["Hindi Typing Test", "/typing-test/setup?lang=hindi"], ["English Typing Test", "/typing-test/setup?lang=english"], ["Learn Typing", "/typing-test/learn"], ["CPCT Typing Paragraphs", "/typing-test/paragraphs"], ["Leaderboard", "/typing-test/leaderboard"]]],
  ["Mock Tests", [["CPCT Mock Test", "/mock-tests/cpct"], ["Topic-wise Test", "/mock-tests/topic-wise"], ["PYQ Online Test", "/mock-tests/pyq"], ["Keyword Test", "/mock-tests/keyword"], ["All Exams", "/exams"]]],
  ["Resources", [["Notes PDF", "/study-material"], ["Previous Papers", "/previous-papers"], ["Shortcut Keys", "/shortcut-keys"], ["Abbreviations", "/abbreviations"], ["Downloads", "/downloads"]]],
  ["Academy", [["About Us", "/about"], ["Courses & Batches", "/courses"], ["Contact Us", "/contact"], ["FAQ", "/faq"], ["Blog", "/blog"]]],
];

export default async function Footer() {
  const s = await getSettings();
  const social = [[s.facebook, Facebook], [s.youtube, Youtube], [s.instagram, Instagram], [s.telegram, Send]] as const;
  return (
    <footer className="bg-navy text-white no-print" data-dark>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-14 w-14" />
            <span>
              <span className="hi block text-xl font-bold">{s.site_name || "परफेक्ट समाधान एकेडमी"}</span>
              <span className="hi block text-sm text-gold">{s.tagline || "सफलता की उड़ान – परफेक्ट समाधान"}</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-white/70">{s.footer_about}</p>
          <div className="mt-5 flex gap-2">
            {social.map(([href, I], i) => (
              <a key={i} href={href || "#"} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 hover:bg-saffron transition"><I className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        {COLS.map(([t, links]) => (
          <div key={t}>
            <h4 className="mb-4 text-base font-bold">{t}</h4>
            <ul className="space-y-2.5">
              {links.map(([l, h]) => <li key={h}><Link href={h} className="text-sm text-white/70 hover:text-gold transition">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Perfect Samadhan Academy. All rights reserved.</span>
          <span className="flex flex-wrap gap-x-2 gap-y-1">
            <Link href="/page/privacy-policy" className="hover:text-white">Privacy Policy</Link>·
            <Link href="/page/terms" className="hover:text-white">Terms & Conditions</Link>·
            <Link href="/page/disclaimer" className="hover:text-white">Disclaimer</Link>·
            <Link href="/page/refund-policy" className="hover:text-white">Refund Policy</Link>·
            <Link href="/verify" className="hover:text-white">Certificate Verify</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
