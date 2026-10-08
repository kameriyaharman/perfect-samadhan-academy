"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, Download, Info, Keyboard, PlayCircle } from "lucide-react";

type P = { id: number; title: string; language: string; level: string; exam: string | null; year: number | null; session: string | null; shift: string | null };
const HINDI_LAYOUTS = [
  { v: "inscript", t: "Inscript", d: "CPCT · MP govt exams" },
  { v: "remington", t: "Remington Gail", d: "High Court · Steno" },
  { v: "remington-cbi", t: "Remington CBI", d: "Kuch central exams" },
  { v: "krutidev", t: "Krutidev (Remington)", d: "UP/Rajasthan pattern" },
  { v: "system", t: "Apna system keyboard", d: "Mobile / Indic Input / Google Input Tools" },
];
const EN_LAYOUTS = [{ v: "english", t: "QWERTY (Standard)", d: "Sabhi exams" }];
const PATTERNS = [
  { v: "cpct", t: "CPCT", d: "Backspace allowed · 15 min", dur: 15 },
  { v: "ssc", t: "SSC DEST", d: "Backspace allowed · 15 min", dur: 15 },
  { v: "highcourt", t: "High Court", d: "No highlight · 10 min", dur: 10 },
  { v: "practice", t: "Free Practice", d: "Highlight + guide · koi bhi samay", dur: 5 },
];

export default function SetupForm({ initial, passages }: { initial: Record<string, string | undefined>; passages: P[] }) {
  const r = useRouter();
  const [lang, setLang] = useState<"hindi" | "english">((initial.lang as any) || "hindi");
  const [layout, setLayout] = useState(initial.layout || (lang === "hindi" ? "inscript" : "english"));
  const [pattern, setPattern] = useState(initial.pattern || "cpct");
  const [duration, setDuration] = useState(Number(initial.duration) || 10);
  const [pmode, setPmode] = useState<"random" | "exam" | "choose">(initial.passage ? "choose" : "random");
  const [passage, setPassage] = useState<string>(initial.passage || "");
  const [mode, setMode] = useState<"practice" | "exam">("exam");
  const [agree, setAgree] = useState(true);

  useEffect(() => {
    if (lang === "english" && layout !== "english") setLayout("english");
    if (lang === "hindi" && layout === "english") setLayout("inscript");
  }, [lang]); // eslint-disable-line
  useEffect(() => {
    if (/Android|iPhone|iPad/i.test(navigator.userAgent) && lang === "hindi" && !initial.layout) setLayout("system");
  }, []); // eslint-disable-line

  const list = useMemo(() => passages.filter((p) => p.language === lang), [passages, lang]);
  const examList = list.filter((p) => p.exam);
  const latestLabel = examList[0]?.session ? `${examList[0].exam} ${examList[0].session?.split(" ")[1] || ""}` : "Exam paper";

  const start = () => {
    let pid = passage;
    const pool = pmode === "exam" ? examList : pmode === "choose" ? list.filter((p) => String(p.id) === passage) : list;
    if (pmode !== "choose" || !pid) {
      const pick = pool[Math.floor(Math.random() * pool.length)] || list[0];
      pid = String(pick?.id || "");
    }
    const lay = layout === "remington-cbi" || layout === "krutidev" ? "remington" : layout;
    const params = new URLSearchParams({ lang, layout: lay, layoutName: layout, pattern, duration: String(duration), passage: pid, mode });
    r.push(`/typing-test/start?${params.toString()}`);
  };

  const Radio = ({ on, t, d, onClick }: { on: boolean; t: string; d: string; onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${on ? "border-brand bg-brand-50/60 ring-2 ring-brand/10" : "border-line hover:border-brand/40"}`}>
      <span><span className="block text-[15px] font-medium">{t}</span><span className="block text-xs text-muted">{d}</span></span>
      <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${on ? "border-brand" : "border-slate-300"}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}</span>
    </button>
  );
  const H = ({ n, t }: { n: number; t: string }) => <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted">{n}. {t}</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card p-5 md:p-7">
        <div className="grid gap-7 md:grid-cols-2">
          <div className="space-y-7">
            <div>
              <H n={1} t="Language" />
              <div className="seg">
                <button className={lang === "hindi" ? "on hi" : "hi"} onClick={() => setLang("hindi")}>हिंदी</button>
                <button className={lang === "english" ? "on" : ""} onClick={() => setLang("english")}>English</button>
              </div>
            </div>
            <div>
              <H n={2} t="Keyboard Layout" />
              <div className="space-y-2.5">
                {(lang === "hindi" ? HINDI_LAYOUTS : EN_LAYOUTS).map((l) => <Radio key={l.v} on={layout === l.v} t={l.t} d={l.d} onClick={() => setLayout(l.v)} />)}
              </div>
            </div>
          </div>
          <div className="space-y-7">
            <div>
              <H n={3} t="Exam Pattern" />
              <div className="space-y-2.5">
                {PATTERNS.map((p) => <Radio key={p.v} on={pattern === p.v} t={p.t} d={p.d} onClick={() => { setPattern(p.v); setDuration(p.dur); if (p.v === "practice") setMode("practice"); }} />)}
              </div>
            </div>
            <div>
              <H n={4} t="Duration" />
              <div className="seg">{[2, 5, 10, 15].map((d) => <button key={d} className={duration === d ? "on" : ""} onClick={() => setDuration(d)}>{d} min</button>)}</div>
            </div>
            <div>
              <H n={5} t="Passage" />
              <div className="seg">
                <button className={pmode === "random" ? "on" : ""} onClick={() => setPmode("random")}>Random</button>
                <button className={pmode === "exam" ? "on" : ""} onClick={() => setPmode("exam")}>{latestLabel}</button>
                <button className={pmode === "choose" ? "on" : ""} onClick={() => setPmode("choose")}>Choose</button>
              </div>
              {pmode === "choose" && (
                <select value={passage} onChange={(e) => setPassage(e.target.value)} className="input mt-2.5">
                  <option value="">— Passage chunein —</option>
                  {list.map((p) => <option key={p.id} value={p.id}>{p.title} {p.level ? `(${p.level})` : ""}</option>)}
                </select>
              )}
            </div>
            <div>
              <H n={6} t="Mode" />
              <div className="seg">
                <button className={mode === "practice" ? "on" : ""} onClick={() => setMode("practice")}>Practice</button>
                <button className={mode === "exam" ? "on" : ""} onClick={() => setMode("exam")}>Exam</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-4 w-4 accent-[#1f35b8]" />Maine sabhi nirdesh padh liye hain</label>
          <button disabled={!agree || !list.length} onClick={start} className="btn-orange !py-3.5 !px-7 text-base"><PlayCircle className="h-5 w-5" />Test Shuru Karein</button>
        </div>
      </div>
      <aside className="space-y-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
          <div className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-800"><Info className="h-5 w-5" />Test ke Nirdesh</div>
          <ul className="space-y-2.5 text-[15px] text-ink">
            {["Pehla key dabate hi timer shuru hoga.", "Passage me jo shabd highlight hai wahi type karein.", "Galat shabd red me dikhega, sahi green me.", "Exam mode me keyboard guide band rahega.", "Samay khatam hote hi test apne aap submit hoga.", "Net WPM = (Typed shabd − Galtiyan) ÷ Minute", "Copy-paste band hai."].map((x) => <li key={x} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-green-600" />{x}</li>)}
          </ul>
        </div>
        {lang === "hindi" && (
          <div className="card p-6">
            <div className="mb-2 flex items-center gap-2 text-lg font-bold text-navy"><Keyboard className="h-5 w-5" />{layout === "inscript" ? "Inscript" : layout === "system" ? "System keyboard" : "Remington"} Layout Help</div>
            <p className="text-[15px] text-muted">
              {layout === "system"
                ? "Is mode me aapke phone/computer ka Hindi keyboard (Gboard, Indic Input, Google Input Tools) use hoga."
                : <>Koi software install karne ki zaroorat nahi — bas normal English keyboard se type karein, website khud <b>{layout === "inscript" ? "Inscript" : "Remington Gail"}</b> layout me Hindi bana degi. System me Hindi keyboard ON ho to use OFF (English) kar dein.</>}
            </p>
            <Link href="/downloads" className="btn-soft btn-sm mt-3"><Download className="h-4 w-4" />Downloads page</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
