"use client";
// Exam-style typing interface (CPCT / Remington GAIL jaisa) — passage upar, typing box neeche,
// right side me live counts + instructions, aur "Practice Tools" settings drawer.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle, ArrowLeft, BookMarked, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Delete, EyeOff, Highlighter, Keyboard,
  Lightbulb, Loader2, Moon, MoveVertical, Play, Plus, RotateCcw, Search, Send, Settings2, Trash2, User, Volume2, X,
} from "lucide-react";
import KeyboardView from "./KeyboardView";
import {
  altCodeChar, displayText, engineBackspace, engineInsert, engineKey, findKey, guideNextChar, isTypewriter, isTypingPrefix, keyHint, normalizeWord,
  type EngineState, type Layout,
} from "@/lib/keyboard";
import { scoreTyping, splitWords, type Score } from "@/lib/typingScore";
import { playKey, warmUp, SOUND_OPTIONS, type SoundKind } from "@/lib/keySound";

type PassageLite = { id: number; title: string; level?: string | null; exam?: string | null; session?: string | null; year?: number | null };
type Props = {
  passage: { id: number; title: string; text: string; session?: string | null; level?: string | null };
  passages: PassageLite[];
  userName: string | null;
  lang: "hindi" | "english"; layout: Layout; layoutName: string; pattern: string; duration: number; mode: "practice" | "exam"; limit: number;
  rules?: { name: string; backspace: "full" | "word" | "prev" | "off"; highlight: "word" | "error" | "none"; locked: boolean; qualify: number; errPen?: number; bsPen?: number };
};
type BsMode = "full" | "word" | "prev" | "off";
type HlMode = "word" | "error" | "none";
type Prefs = { night: boolean; hint: boolean; hideArea: boolean; autoScroll: boolean; backspace: BsMode; highlight: HlMode; guide: boolean; keySound: SoundKind; vol: number; font: number };
type MyPassage = { id: string; title: string; text: string; lang: "hindi" | "english" };

const DURATIONS = [2, 5, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
const LIMITS = [0, 100, 150, 200, 250, 300];
const PREFS_KEY = "psa_typing_prefs";
const MY_KEY = "psa_my_passages";

const store = {
  get<T>(k: string): T | null { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};


/** backspace option ke hisaab se: is index se pehle ka text delete nahi ho sakta */
function lockAt(text: string, mode: BsMode): number {
  if (mode === "full") return 0;
  if (mode === "off") return text.length;
  const starts = Array.from(text.matchAll(/\S+/g)).map((m) => m.index || 0);
  const endsSpace = /\s$/.test(text) || text === "";
  if (mode === "word") return endsSpace ? text.length : starts[starts.length - 1] ?? 0;
  // current + previous word
  if (endsSpace) return starts[starts.length - 1] ?? 0;
  return starts[starts.length - 2] ?? 0;
}

function graphemes(w: string): string[] {
  try {
    const Seg = (Intl as any).Segmenter;
    if (Seg) return Array.from(new Seg("hi", { granularity: "grapheme" }).segment(w), (s: any) => s.segment as string);
  } catch {}
  return Array.from(w);
}

export default function TypingTest(p: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  // ---------- preferences ----------
  // backspace/highlight hamesha exam pattern (admin) ke hisaab se shuru; baaki tools student ki pasand se yaad rehte hain
  const R = p.rules || { name: "", backspace: "full" as BsMode, highlight: (p.pattern === "highcourt" ? "none" : "error") as HlMode, locked: false, qualify: 0 };
  const defaults: Prefs = { night: false, hint: false, hideArea: false, autoScroll: true, backspace: R.backspace, highlight: R.highlight, guide: false, keySound: "mechanical" as SoundKind, vol: 60, font: 22 };
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  useEffect(() => {
    const s = store.get<Partial<Prefs> & { sound?: boolean }>(PREFS_KEY);
    if (s) { delete s.sound; if ((s.keySound as string) === "custom") s.keySound = "mechanical"; setPrefs((d) => ({ ...d, ...s, backspace: R.backspace, highlight: R.highlight })); }
  }, []); // eslint-disable-line
  const snd = (type: "key" | "space" | "back" = "key") => playKey(prefs.keySound, type, prefs.vol / 100);
  const setPref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((o) => {
    if (R.locked && (k === "backspace" || k === "highlight")) return o;
    const n = { ...o, [k]: v }; store.set(PREFS_KEY, n); return n;
  });

  // ---------- passage (server ya "My passages") ----------
  const [custom, setCustom] = useState<MyPassage | null>(null);
  const [myList, setMyList] = useState<MyPassage[]>([]);
  useEffect(() => { setMyList(store.get<MyPassage[]>(MY_KEY) || []); }, []);
  const [limit, setLimit] = useState(p.limit);
  const [duration, setDuration] = useState(p.duration);
  const fullText = custom ? custom.text : p.passage.text;
  const text = useMemo(() => (limit ? splitWords(fullText).slice(0, limit).join(" ") : fullText), [fullText, limit]);
  const title = custom ? custom.title : p.passage.title;

  // ---------- test state ----------
  const total = duration * 60;
  const [st, setSt] = useState<EngineState>({ text: "", pendingI: false });
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false); // start modal close ho chuka
  const [elapsed, setElapsed] = useState(0);
  const [keys, setKeys] = useState(0);
  const [backs, setBacks] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [localResult, setLocalResult] = useState<Score | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [browser, setBrowser] = useState(false);
  const [myOpen, setMyOpen] = useState(false);
  const [tip, setTip] = useState<{ x: number; y: number; ch: string; keys: string[] } | null>(null);

  const perMin = useRef<number[]>([]);
  const startAt = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const altDigits = useRef<string | null>(null);
  const isEngine = p.layout === "inscript" || isTypewriter(p.layout);

  useEffect(() => { if (window.innerWidth < 1024) setSideOpen(false); }, []);

  const pw = useMemo(() => splitWords(text), [text]);
  const typed = st.text;
  const tw = useMemo(() => splitWords(typed), [typed]);
  const endsSpace = /\s$/.test(typed) || typed === "";
  const doneCount = endsSpace ? tw.length : Math.max(0, tw.length - 1);
  const curIdx = endsSpace ? tw.length : tw.length - 1;
  const partial = endsSpace ? "" : tw[tw.length - 1] || "";
  const pen = { error: p.rules?.errPen ?? 1, backspace: p.rules?.bsPen ?? 0, backspaces: backs };
  const live = useMemo(() => scoreTyping(text, typed, Math.max(elapsed, 15), p.lang, false, pen), [typed, elapsed, text, p.lang, backs]); // eslint-disable-line
  const nonSpace = useMemo(() => Array.from(text.replace(/\s+/g, "")).length, [text]);
  const wordLen = pw.length ? (nonSpace / pw.length).toFixed(2) : "0";
  const timeLeft = Math.max(0, total - elapsed);

  // timer
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - (startAt.current || Date.now())) / 1000)), 250);
    return () => clearInterval(t);
  }, [started]);

  useEffect(() => {
    const m = Math.floor(elapsed / 60);
    while (perMin.current.length < m) perMin.current.push(live.correct);
  }, [elapsed, live.correct]);

  const submit = useCallback(async () => {
    if (finished.current) return;
    finished.current = true;
    setSubmitting(true);
    const secs = Math.max(1, Math.min(total, startAt.current ? Math.floor((Date.now() - startAt.current) / 1000) : elapsed));
    if (custom) {
      setLocalResult(scoreTyping(text, st.text, Math.max(secs, 15), p.lang, true, pen));
      setSubmitting(false);
      return;
    }
    const cum = [...perMin.current];
    const finalCorrect = scoreTyping(text, st.text, secs, p.lang, true).correct;
    if (secs % 60 > 5 || !cum.length) cum.push(finalCorrect);
    const speeds = cum.map((c, i) => c - (i ? cum[i - 1] : 0));
    try {
      const r = await fetch("/api/typing/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passageId: p.passage.id, limit, lang: p.lang, layout: p.layoutName, pattern: p.pattern, mode: p.mode, seconds: secs, typed: st.text, perMinute: speeds, keystrokes: keys, backspaces: backs }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Submit failed");
      try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
      router.push(`/typing-test/result/${j.certId}`);
    } catch (e: any) {
      setErr(e.message); setSubmitting(false); finished.current = false;
    }
  }, [custom, elapsed, keys, limit, p, router, st.text, text, total, backs]); // eslint-disable-line

  useEffect(() => { if (started && elapsed >= total) submit(); }, [elapsed, started, submit, total]);
  useEffect(() => { if (started && doneCount >= pw.length && pw.length > 0) submit(); }, [doneCount, pw.length, started, submit]);

  // auto-scroll: current word ko passage box me doosri line par rakho
  useEffect(() => {
    const ta = inputRef.current;
    if (ta) ta.scrollTop = ta.scrollHeight;
    if (!prefs.autoScroll) return;
    const box = passRef.current;
    const el = box?.querySelector<HTMLElement>("[data-cur='1']");
    if (box && el) {
      const line = parseFloat(getComputedStyle(box).lineHeight) || 40;
      const pad = parseFloat(getComputedStyle(box).paddingTop) || 0;
      const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
      if (top + line > box.scrollTop + box.clientHeight - pad || top < box.scrollTop) box.scrollTo({ top: Math.max(0, top - line - pad), behavior: "smooth" });
    }
  }, [curIdx, typed, prefs.autoScroll, prefs.font]);

  const begin = () => {
    if (!started) { setStarted(true); startAt.current = Date.now(); }
  };
  const locked = !ready || submitting || !!localResult;

  const tryBackspace = (): boolean => {
    if (st.pendingI) return true;
    return st.text.length > lockAt(st.text, prefs.backspace);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (locked) { e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && ["v", "V", "a", "A", "z", "Z", "x", "X"].includes(e.key)) { e.preventDefault(); return; }
    if (e.key === "Tab") { e.preventDefault(); return; }
    setPressed(e.code); setTimeout(() => setPressed(null), 120);
    if (isEngine) {
      if (e.key === "Alt") { e.preventDefault(); if (!e.repeat) altDigits.current = ""; return; }
      if (e.altKey && !e.metaKey) {
        const d = /^(?:Numpad|Digit)(\d)$/.exec(e.code);
        if (d && altDigits.current !== null) { e.preventDefault(); altDigits.current += d[1]; return; }
        e.preventDefault(); return;
      }
      if (e.ctrlKey || e.metaKey) return;
      if (!e.code || e.key === "Unidentified" || e.key === "Process") return; // mobile IME
      if (e.code === "Backspace") {
        e.preventDefault();
        if (!tryBackspace()) return;
        snd("back"); begin(); setSt((s) => engineBackspace(s)); setKeys((k) => k + 1); setBacks((b) => b + 1); return;
      }
      const next = engineKey(p.layout, st, e.code, e.shiftKey);
      if (next) { e.preventDefault(); snd(e.code === "Space" ? "space" : "key"); begin(); setSt(next); setKeys((k) => k + 1); }
      else if (e.key.length === 1) e.preventDefault();
      return;
    }
    // English / system keyboard
    if (e.key === "Backspace" || e.key === "Delete") {
      const ta = e.currentTarget;
      const bound = lockAt(st.text, prefs.backspace);
      const s0 = ta.selectionStart, s1 = ta.selectionEnd;
      const bad = e.key === "Delete" ? prefs.backspace !== "full" : s0 === s1 ? s0 <= bound : s0 < bound;
      if (bad) { e.preventDefault(); return; }
      snd("back"); begin(); setKeys((k) => k + 1); setBacks((b) => b + 1);
      return;
    }
    if (e.key.length === 1 || e.key === "Enter") { snd(e.key === " " ? "space" : "key"); begin(); setKeys((k) => k + 1); }
  };
  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Alt" || altDigits.current === null) return;
    e.preventDefault();
    const digits = altDigits.current; altDigits.current = null;
    if (locked || !digits) return;
    const ch = altCodeChar(digits);
    if (!ch) return;
    snd(); begin(); setSt((s) => engineInsert(p.layout, s, ch)); setKeys((k) => k + 1);
  };
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (locked || isEngine) return;
    const v = e.target.value.replace(/\n/g, " ");
    const bound = lockAt(st.text, prefs.backspace);
    if (!v.startsWith(st.text.slice(0, bound))) return; // locked hisse me edit allowed nahi
    begin();
    setSt({ text: v, pendingI: false });
  };

  const reset = () => {
    finished.current = false; perMin.current = []; startAt.current = null;
    setSt({ text: "", pendingI: false }); setStarted(false); setElapsed(0); setKeys(0); setBacks(0); setErr(""); setLocalResult(null); setSubmitting(false);
    passRef.current?.scrollTo({ top: 0 });
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const startTest = () => {
    setReady(true);
    warmUp(prefs.keySound);
    try { if (window.innerWidth >= 1024 && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); } catch {}
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const goPassage = (id: number) => {
    const q = new URLSearchParams(sp?.toString() || "");
    q.set("passage", String(id)); q.set("duration", String(duration)); q.set("limit", String(limit));
    setCustom(null);
    router.push(`/typing-test/start?${q.toString()}`);
  };
  const pickCustom = (m: MyPassage) => { setCustom(m); setMyOpen(false); setBrowser(false); reset(); setReady(false); };

  const confirmSubmit = () => {
    if (!started || submitting) return;
    if (doneCount < pw.length && !window.confirm("Abhi passage poora nahi hua hai. Kya aap test submit karna chahte hain?")) return;
    submit();
  };

  // practice keyboard guide
  const target = useMemo(() => {
    if (!prefs.guide) return null;
    const exp = pw[curIdx];
    if (exp === undefined) return null;
    const ch = guideNextChar(p.layout, exp, partial, st.pendingI);
    if (ch === null) return { code: "Backspace", shift: false };
    return findKey(p.layout, ch);
  }, [prefs.guide, pw, curIdx, partial, p.layout, st.pendingI]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const n = prefs.night;
  const T = {
    root: n ? "bg-[#0d1220] text-slate-100" : "bg-[#eef0f4] text-ink",
    panel: n ? "bg-[#131a2b] border-white/10" : "bg-white border-[#d7dbe6]",
    soft: n ? "text-slate-400" : "text-[#4b5270]",
    box: n ? "bg-[#161e33] border-white/15 text-slate-100" : "bg-white border-[#c9cedb] text-[#111]",
    side: n ? "bg-[#111727] border-white/10" : "bg-white border-[#d7dbe6]",
    row: n ? "border-white/5" : "border-[#eef0f4]",
  };
  const hiFont = p.lang === "hindi" ? "hi typing-hi" : "";
  const layoutLabel = p.lang === "hindi" ? `${p.layoutName} Hindi Typing` : "English Typing";
  const sectionLabel = p.lang === "hindi" ? "Hindi actual Test" : "English actual Test";

  const showTip = (e: React.MouseEvent, g: string) => {
    if (!prefs.hint || p.layout === "system") return;
    const r = (e.target as HTMLElement).getBoundingClientRect();
    setTip({ x: r.left + r.width / 2, y: r.top, ch: g, keys: keyHint(p.layout, g) });
  };

  return (
    <div className={`flex h-[100dvh] flex-col overflow-hidden ${T.root}`}>
      {/* ---------- top bar ---------- */}
      <header className="shrink-0 bg-[#1c2333] text-white" data-dark>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none]">
          <Link href="/typing-test" aria-label="Back" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="shrink-0 whitespace-nowrap pr-1 text-[15px] font-bold md:text-[17px]">{layoutLabel}</h1>

          <div className="relative shrink-0">
            <select value={custom ? `my:${custom.id}` : String(p.passage.id)} onChange={(e) => {
              const v = e.target.value;
              if (v.startsWith("my:")) { const m = myList.find((x) => `my:${x.id}` === v); if (m) pickCustom(m); }
              else goPassage(Number(v));
            }} className={`h-9 max-w-[150px] md:max-w-[200px] appearance-none truncate rounded-lg border border-white/20 bg-white/5 pl-3 pr-8 text-sm outline-none hover:border-white/40 ${hiFont}`}>
              {p.passages.map((x, i) => <option key={x.id} value={x.id} className="text-ink">{`S ${i + 1}. ${x.title}`}</option>)}
              {myList.filter((m) => m.lang === p.lang).map((m) => <option key={m.id} value={`my:${m.id}`} className="text-ink">★ {m.title}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-white/70" />
          </div>
          <button onClick={() => setBrowser(true)} aria-label="Search passages" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/20 hover:border-white/40"><Search className="h-4 w-4" /></button>
          <div className="hidden shrink-0 text-[11px] leading-tight text-white/80 xl:block">
            <div>Word Length: {wordLen}</div><div>Total Keys: {nonSpace}</div>
          </div>
          <div className="relative shrink-0">
            <select value={limit} disabled={started} onChange={(e) => setLimit(Number(e.target.value))} className="h-9 appearance-none rounded-lg border border-white/20 bg-white/5 pl-3 pr-8 text-sm outline-none hover:border-white/40 disabled:opacity-60">
              {LIMITS.map((l) => <option key={l} value={l} className="text-ink">{l ? `${l} words` : "Full passage"}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-white/70" />
          </div>
          <button onClick={() => setBrowser(true)} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/20 px-3 text-sm hover:border-white/40"><BookOpen className="h-4 w-4" /><span className="hidden xl:inline">More passages</span><ChevronDown className="h-4 w-4 text-white/70" /></button>
          <button onClick={() => setMyOpen(true)} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-400/60 bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25"><BookMarked className="h-4 w-4" /><span className="hidden lg:inline">My passages</span></button>
          <div className="flex h-9 shrink-0 items-center rounded-lg border border-white/20 text-sm">
            <button onClick={() => setPref("font", Math.max(14, prefs.font - 2))} className="h-full px-2 font-semibold hover:bg-white/10" aria-label="Font chhota">A-</button>
            <span className="w-7 text-center text-white/80">{prefs.font}</span>
            <button onClick={() => setPref("font", Math.min(40, prefs.font + 2))} className="h-full px-2 font-semibold hover:bg-white/10" aria-label="Font bada">A+</button>
          </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pl-1">
            <button onClick={reset} aria-label="Restart" title="Restart" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10"><RotateCcw className="h-[18px] w-[18px]" /></button>
            <button onClick={() => setSettingsOpen(true)} className="flex h-9 items-center gap-1.5 rounded-lg border border-white/25 px-3 text-sm font-semibold hover:bg-white/10"><Settings2 className="h-4 w-4" /><span className="hidden sm:inline">Settings</span></button>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* ---------- main exam area ---------- */}
        <main className="relative min-w-0 flex-1 overflow-y-auto">
          <div className={`flex items-center justify-between border-b px-3 py-2.5 md:px-4 ${T.panel}`}>
            <span className={`text-sm font-semibold ${T.soft}`}>Sections</span>
            <label className="flex items-center gap-2 text-sm">
              <span className={T.soft}>Duration:</span>
              <select value={duration} disabled={started} onChange={(e) => setDuration(Number(e.target.value))} className={`h-8 rounded-md border px-2 text-sm font-semibold outline-none disabled:opacity-70 ${T.box}`}>
                {Array.from(new Set([...DURATIONS, p.duration])).sort((a, b) => a - b).map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            </label>
          </div>
          <div className={`border-b px-3 py-2 md:px-4 ${T.panel}`}>
            <span className="inline-block rounded bg-[#1f4fb5] px-3 py-1.5 text-sm font-semibold text-white">{sectionLabel}</span>
          </div>
          <div className={`flex items-center justify-between border-b px-3 py-2 text-sm md:px-4 ${T.panel}`}>
            <span className={T.soft}>Question Type: <b className="font-semibold">Typing</b></span>
            <span className={T.soft}>{pw.length} words</span>
          </div>
          <div className="relative flex h-8 items-center justify-between bg-[#1f4fb5] px-3 text-sm font-semibold text-white md:px-4">
            <span className={`truncate ${hiFont}`}>{title}</span>
            <span className="shrink-0 tabular-nums">Time Left: <span className={timeLeft <= 60 && started ? "text-yellow-300" : ""}>{mm}:{ss}</span></span>
            <span className="absolute bottom-0 left-0 h-[3px] bg-yellow-300 transition-[width] duration-300" style={{ width: `${(elapsed / total) * 100}%` }} />
          </div>

          <div className="max-w-[900px] px-3 py-4 md:px-6 md:py-5">
            {/* passage */}
            <div ref={passRef} onCopy={(e) => e.preventDefault()} onMouseLeave={() => setTip(null)}
              className={`select-none overflow-y-auto rounded-sm border px-3 py-2 md:px-4 ${T.box} ${hiFont}`}
              style={{ fontSize: prefs.font, lineHeight: 1.6, maxHeight: `calc(${prefs.font * 1.6 * 5}px + 1rem)` }}>
              {pw.map((w, i) => {
                let cls = "";
                const hl = prefs.highlight;
                if (i === curIdx && hl !== "none") {
                  const wrong = hl === "error" && partial && !isTypingPrefix(w, partial, p.layout);
                  cls = wrong ? "bg-red-200 text-red-800 rounded-sm" : "bg-[#ffd93b] text-[#111] rounded-sm";
                } else if (i < doneCount && hl === "error") {
                  cls = normalizeWord(w) === normalizeWord(tw[i] || "") ? (n ? "text-emerald-400" : "text-green-700") : (n ? "text-red-400 wavy" : "text-red-600 wavy");
                }
                return (
                  <span key={i}>
                    <span data-cur={i === curIdx ? "1" : "0"} className={`px-[2px] ${cls}`}>
                      {prefs.hint && p.layout !== "system"
                        ? graphemes(w).map((g, j) => <span key={j} onMouseEnter={(e) => showTip(e, g)} className="cursor-help hover:bg-brand/15 rounded-sm">{g}</span>)
                        : w}
                    </span>{" "}
                  </span>
                );
              })}
            </div>

            {/* typing box */}
            <div className="relative mt-3">
              <textarea
                ref={inputRef} value={displayText(st)} onKeyDown={onKeyDown} onKeyUp={onKeyUp} onChange={onChange}
                onPaste={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}
                spellCheck={false} autoCorrect="off" autoCapitalize="off" autoComplete="off" disabled={submitting || !!localResult}
                placeholder={prefs.hideArea ? "" : started ? "" : isEngine ? "Yahan type karna shuru karein — English keyboard se, Hindi apne aap banegi…" : p.lang === "hindi" ? "Yahan apne Hindi keyboard se type karein…" : "Start typing here…"}
                className={`h-[190px] w-full resize-none rounded-sm border px-3 py-2 outline-none focus:border-[#1f4fb5] md:h-[200px] md:px-4 ${T.box} ${hiFont} ${prefs.hideArea ? "!text-transparent caret-transparent selection:bg-transparent" : ""}`}
                style={{ fontSize: prefs.font, lineHeight: 1.6 }}
              />
              {prefs.hideArea && <div className={`pointer-events-none absolute left-3 top-2 italic md:left-4 ${T.soft} opacity-70`} style={{ fontSize: prefs.font }}>Typing area hidden, keep typing from memory</div>}
              {st.pendingI && !prefs.hideArea && <span className="hi absolute right-3 top-2 chip bg-orange-100 text-orange-700">ि pending — agla akshar type karein</span>}
            </div>

            {err && <div className="mt-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />{err}</div>}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`hidden text-xs lg:inline ${T.soft}`}>Esc dabakar full screen se bahar aa sakte hain.</span>
              <button onClick={confirmSubmit} disabled={!started || submitting} className="ml-auto inline-flex items-center gap-2 rounded-md bg-[#1f4fb5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a43a0] disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Submit
              </button>
            </div>

            {prefs.guide && (p.layout !== "system") && (
              <div className="mt-5 hidden sm:block"><KeyboardView layout={p.layout} target={target?.code} shift={target?.shift} pressed={pressed} /></div>
            )}
          </div>

          {/* start modal */}
          {!ready && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-[#0b1020]/60 p-4 backdrop-blur-[2px]">
              <div className="w-full max-w-[400px] rounded-xl bg-white p-6 text-center text-ink shadow-2xl">
                <div className={`text-xl font-bold ${hiFont}`}>{layoutLabel}</div>
                <p className="mt-2 text-[15px] text-muted">Click Start when you are ready, the timer begins on your first keystroke.</p>
                {R.name && <div className="mt-3 inline-block rounded-full bg-saffron-50 px-3 py-1 text-xs font-bold text-saffron-600">{R.name} pattern{R.qualify ? ` · Qualify: ${R.qualify} NWPM` : ""}</div>}
                <div className={`mt-2 text-sm font-semibold text-brand ${hiFont}`}>{title} · {pw.length} words · {duration} min</div>
                {prefs.backspace !== "full" && <div className="mt-1 text-xs text-muted">{prefs.backspace === "off" ? "Is test me Backspace band hai." : prefs.backspace === "word" ? "Backspace sirf current word me chalega." : "Backspace current aur pichle word tak chalega."}</div>}
                <button onClick={startTest} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f4fb5] py-3 text-[15px] font-semibold text-white hover:bg-[#1a43a0]"><Play className="h-4 w-4" />Start Test</button>
              </div>
            </div>
          )}
        </main>

        {/* sidebar collapse handle */}
        <button onClick={() => setSideOpen(!sideOpen)} aria-label="Toggle panel"
          className={`absolute top-1/2 z-20 grid h-12 w-5 -translate-y-1/2 place-items-center rounded-l-md bg-[#5b8def] text-white shadow transition-all ${sideOpen ? "right-[300px]" : "right-0"}`}>
          {sideOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* ---------- right panel ---------- */}
        <aside className={`${sideOpen ? "flex" : "hidden"} absolute inset-y-0 right-0 z-10 w-[300px] shrink-0 flex-col overflow-y-auto border-l lg:static ${T.side}`}>
          <div className="relative flex items-center gap-3 px-4 py-4">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-200 text-slate-500"><User className="h-6 w-6" /></span>
            <span className="text-[15px] font-bold">{p.userName || "Guest"}</span>
            <button onClick={() => setStatsOpen(!statsOpen)} aria-label="Collapse" className={`absolute right-2 top-1 grid h-6 w-8 place-items-center rounded ${n ? "bg-white/10" : "bg-[#1c2333] text-white"}`}>{statsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
          </div>
          {statsOpen && (
            <>
              <div className="px-4 pb-2 text-sm"><span className="font-semibold text-[#1f4fb5]">You are viewing</span> <b>{sectionLabel}</b></div>
              <dl className="px-4 text-[13.5px]">
                {([
                  ["Keystrokes Count", keys], ["Error Count", live.errors], ["Backspace Count", backs], ["Total Word Count", pw.length],
                  ["Typed Word Count", doneCount], ["Pending Word Count", Math.max(0, pw.length - doneCount)], ["Current WPM", started ? Math.round(live.net) : "–"],
                  ["Accuracy", started && live.typedWords ? `${live.accuracy.toFixed(1)}%` : "–"],
                ] as [string, string | number][]).map(([k, v]) => (
                  <div key={k} className={`flex items-center justify-between border-b py-1.5 ${T.row}`}><dt className={T.soft}>{k}</dt><dd className="font-bold tabular-nums">{v}</dd></div>
                ))}
              </dl>
            </>
          )}
          <div className="px-4 pb-6 pt-4">
            <div className="mb-2 text-sm font-bold">Instructions</div>
            <ul className={`list-disc space-y-2 pl-4 text-[12.5px] leading-snug ${T.soft}`}>
              <li>Kindly type the highlighted word to proceed further.</li>
              <li>{prefs.backspace === "off" ? "Backspace is disabled in this test." : "Kindly note, you can edit the text contents that you have typed."}</li>
              {prefs.highlight === "error" && <li>Correct/Wrong words turn Green/Red respectively.</li>}
              <li>Kindly note, it is mandatory for you to type the entire text contents to submit.</li>
              <li>Upon timeout, the system will automatically submit your response.</li>
              {isEngine && <li>System me Hindi keyboard OFF (English) rakhein — website khud {p.layoutName} layout me Hindi banayegi.</li>}
              {isTypewriter(p.layout) && <li className="hi">Chandrabindu (ँ): Shift + W (ॅ) phir A (ं) — jaise हाँ, हँसी{p.layout === "krutidev" ? " · ya Alt + 0161" : ""}. Reph (र्): akshar type karke Shift + Z — jaise कार्य, धर्म.</li>}
              {isTypewriter(p.layout) && <li>Alt dabaye rakh kar number type karein (jaise Alt + 0151 = —), phir Alt chhod dein.</li>}
            </ul>
          </div>
        </aside>
      </div>

      {/* ---------- hint tooltip ---------- */}
      {tip && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-[#1c2333] px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ left: tip.x, top: tip.y - 6 }}>
          <div className="hi mb-0.5 text-base font-bold">{tip.ch}</div>
          {tip.keys.map((k, i) => <div key={i} className="hi whitespace-nowrap">{i + 1}. {k}</div>)}
        </div>
      )}

      {/* ---------- settings drawer ---------- */}
      {settingsOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div onClick={(e) => e.stopPropagation()} className={`absolute inset-y-0 right-0 flex w-full max-w-[370px] flex-col border-l shadow-2xl ${n ? "bg-[#131a2b] border-white/10 text-slate-100" : "bg-white border-line text-ink"}`}>
            <div className="flex items-center gap-2 border-b border-inherit px-4 py-3">
              <Settings2 className="h-5 w-5" /><span className="text-[16px] font-bold">Exam Settings: Practice Tools</span>
              <button onClick={() => setSettingsOpen(false)} className="ml-auto grid h-8 w-8 place-items-center rounded hover:bg-black/5" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className={`rounded-md p-3 text-[13px] leading-snug ${n ? "bg-white/5 text-slate-300" : "bg-canvas text-[#3c4360]"}`}><b>Note:</b> Ye features aapko effectively practice karne me help karte hain, lekin actual {p.lang === "hindi" ? p.layoutName : "English"} typing exam me shayad na ho. Confidence aur skill build karne ke liye humne inhe add kiya hai.</p>
              <div className="mt-2 space-y-1">
                <Toggle icon={<Moon className="h-5 w-5" />} t="Night Mode" d="Easy on eyes during long practice" on={prefs.night} set={(v) => setPref("night", v)} night={n} />
                <Toggle icon={<Lightbulb className="h-5 w-5" />} t="Hint Mode" d="Hover a character to see its key" on={prefs.hint} set={(v) => setPref("hint", v)} night={n} disabled={p.layout === "system"} />
                <Toggle icon={<EyeOff className="h-5 w-5" />} t="Hide Typing Area" d="Advanced memory-typing practice" on={prefs.hideArea} set={(v) => setPref("hideArea", v)} night={n} />
                <Toggle icon={<MoveVertical className="h-5 w-5" />} t="Auto-Scroll" d="Passage scrolls as you type" on={prefs.autoScroll} set={(v) => setPref("autoScroll", v)} night={n} />
                <Toggle icon={<Keyboard className="h-5 w-5" />} t="Keyboard Guide" d="Agli key on-screen keyboard par dikhe" on={prefs.guide} set={(v) => setPref("guide", v)} night={n} disabled={p.layout === "system"} />
              </div>
              <div className="mt-4 px-2">
                <div className="mb-1.5 flex items-center gap-3 text-[14.5px] font-semibold"><span className="opacity-60"><Volume2 className="h-5 w-5" /></span>Key Sound</div>
                <div className="space-y-2 pl-8">
                  <select value={prefs.keySound} onChange={(e) => { const v = e.target.value as SoundKind; setPref("keySound", v); warmUp(v); playKey(v, "key", prefs.vol / 100); }}
                    className={`h-9 w-full rounded-md border px-2 text-sm outline-none ${n ? "border-white/15 bg-[#161e33]" : "border-line bg-white"}`}>
                    {SOUND_OPTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  {prefs.keySound !== "off" && (
                    <label className="flex items-center gap-2 text-xs opacity-80">Volume
                      <input type="range" min={5} max={100} value={prefs.vol} onChange={(e) => setPref("vol", Number(e.target.value))} onMouseUp={() => playKey(prefs.keySound, "key", prefs.vol / 100)} className="flex-1 accent-[#1f4fb5]" />
                      <span className="w-8 text-right tabular-nums">{prefs.vol}</span>
                    </label>
                  )}
                </div>
              </div>
              {R.locked && <p className="mt-4 rounded-md bg-amber-50 p-2.5 text-xs text-amber-800">{R.name} exam pattern me Backspace aur Highlight admin ne fix kiye hain — inhe badla nahi ja sakta.</p>}
              <Group disabled={R.locked} icon={<Delete className="h-5 w-5" />} t="Backspace Options" value={prefs.backspace} set={(v) => setPref("backspace", v as BsMode)}
                opts={[["full", "Full Backspace"], ["word", "One Word Backspace"], ["prev", "Current + Previous Word"], ["off", "Deactivate Backspace"]]} />
              <Group disabled={R.locked} icon={<Highlighter className="h-5 w-5" />} t="Highlight Options" value={prefs.highlight} set={(v) => setPref("highlight", v as HlMode)}
                opts={[["word", "Word Highlight"], ["error", "Word + Error Highlight"], ["none", "No Highlight"]]} />
            </div>
            <div className="m-3 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />Ye tools sirf study aids hain. Actual exam me ye options available nahi honge.</div>
          </div>
        </div>
      )}

      {browser && <PassageBrowser passages={p.passages} current={custom ? null : p.passage.id} lang={p.lang} onPick={(id) => { setBrowser(false); goPassage(id); }} onClose={() => setBrowser(false)} />}
      {myOpen && <MyPassages lang={p.lang} list={myList} onChange={(l) => { setMyList(l); store.set(MY_KEY, l); }} onUse={pickCustom} onClose={() => setMyOpen(false)} />}

      {/* local result (My passages) */}
      {localResult && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-[420px] rounded-xl bg-white p-6 text-ink shadow-2xl">
            <div className="text-lg font-bold">Result — <span className={hiFont}>{title}</span></div>
            <p className="text-sm text-muted">My passage practice (server par save nahi hota)</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {([["Net WPM", Math.round(localResult.net)], ["Gross WPM", Math.round(localResult.gross)], ["Accuracy", `${localResult.accuracy}%`], ["Errors", localResult.errors], ["Typed Words", localResult.typedWords], ["Backspace", backs]] as [string, string | number][]).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-canvas p-3"><div className="text-xs text-muted">{k}</div><div className="text-2xl font-bold">{v}</div></div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { reset(); setReady(false); }} className="btn-primary flex-1"><RotateCcw className="h-4 w-4" />Dobara Try</button>
              <button onClick={() => { setLocalResult(null); setCustom(null); reset(); setReady(false); }} className="btn-ghost flex-1">Academy passage</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ icon, t, d, on, set, night, disabled }: { icon: React.ReactNode; t: string; d: string; on: boolean; set: (v: boolean) => void; night: boolean; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => set(!on)} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition disabled:opacity-40 ${night ? "hover:bg-white/5" : "hover:bg-canvas"}`}>
      <span className="opacity-60">{icon}</span>
      <span className="flex-1"><span className="block text-[14.5px] font-semibold">{t}</span><span className="block text-xs opacity-60">{d}</span></span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-[#1f4fb5]" : night ? "bg-white/20" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} /></span>
    </button>
  );
}

function Group({ icon, t, value, set, opts, disabled }: { icon: React.ReactNode; t: string; value: string; set: (v: string) => void; opts: [string, string][]; disabled?: boolean }) {
  return (
    <div className={`mt-4 px-2 ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      <div className="mb-1.5 flex items-center gap-3 text-[14.5px] font-semibold"><span className="opacity-60">{icon}</span>{t}</div>
      <div className="space-y-1 pl-8">
        {opts.map(([v, l]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px]">
            <input type="radio" disabled={disabled} checked={value === v} onChange={() => set(v)} className="h-4 w-4 accent-[#1f4fb5]" />{l}
          </label>
        ))}
      </div>
    </div>
  );
}

function PassageBrowser({ passages, current, lang, onPick, onClose }: { passages: PassageLite[]; current: number | null; lang: string; onPick: (id: number) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const list = passages.filter((x) => !q || `${x.title} ${x.exam || ""} ${x.session || ""} ${x.level || ""}`.toLowerCase().includes(q.toLowerCase()));
  const groups: Record<string, PassageLite[]> = {};
  for (const x of list) (groups[x.exam ? `${x.exam}${x.year ? " " + x.year : ""}` : x.level ? `Practice · ${x.level}` : "Practice passages"] ||= []).push(x);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[80vh] w-full max-w-[560px] flex-col rounded-xl bg-white text-ink shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line p-4">
          <BookOpen className="h-5 w-5 text-brand" /><span className="font-bold">More passages · {lang === "hindi" ? "Hindi" : "English"}</span>
          <button onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded hover:bg-canvas" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 pb-2">
          <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Passage, exam ya session search karein…" className="input !pl-9" /></div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {!list.length && <div className="py-8 text-center text-sm text-muted">Koi passage nahi mila.</div>}
          {Object.entries(groups).map(([g, items]) => (
            <div key={g} className="mt-3">
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">{g}</div>
              {items.map((x) => (
                <button key={x.id} onClick={() => onPick(x.id)} className={`hi flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] hover:bg-brand-50 ${x.id === current ? "bg-brand-50 font-semibold text-brand" : ""}`}>
                  <span className="truncate">{x.title}</span>{x.session && <span className="ml-2 shrink-0 text-xs text-muted">{x.session}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyPassages({ lang, list, onChange, onUse, onClose }: { lang: "hindi" | "english"; list: MyPassage[]; onChange: (l: MyPassage[]) => void; onUse: (m: MyPassage) => void; onClose: () => void }) {
  const [t, setT] = useState("");
  const [body, setBody] = useState("");
  const mine = list.filter((m) => m.lang === lang);
  const add = () => {
    const text = body.replace(/\s+/g, " ").trim();
    if (splitWords(text).length < 5) return;
    const m: MyPassage = { id: Date.now().toString(36), title: t.trim() || `My passage ${mine.length + 1}`, text, lang };
    onChange([m, ...list].slice(0, 30));
    onUse(m);
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-full max-w-[600px] flex-col rounded-xl bg-white text-ink shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line p-4">
          <BookMarked className="h-5 w-5 text-emerald-600" /><span className="font-bold">My passages</span>
          <button onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded hover:bg-canvas" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted">Apna khud ka paragraph paste karke practice karein. Ye sirf aapke browser me save hota hai.</p>
          <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Title (optional)" className="input mt-3" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={lang === "hindi" ? "Yahan Hindi (Unicode / Mangal) paragraph paste karein…" : "Paste your English paragraph here…"} className={`input mt-2 h-36 resize-none ${lang === "hindi" ? "hi" : ""}`} />
          <button onClick={add} disabled={splitWords(body).length < 5} className="btn-primary mt-2"><Plus className="h-4 w-4" />Save &amp; Practice</button>
          {!!mine.length && (
            <div className="mt-5">
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">Saved</div>
              {mine.map((m) => (
                <div key={m.id} className="flex items-center gap-2 border-b border-line py-2 last:border-0">
                  <button onClick={() => onUse(m)} className="hi min-w-0 flex-1 truncate text-left text-[15px] hover:text-brand">{m.title} <span className="text-xs text-muted">· {splitWords(m.text).length} words</span></button>
                  <button onClick={() => onUse(m)} className="btn-soft btn-sm"><Play className="h-3.5 w-3.5" />Start</button>
                  <button onClick={() => onChange(list.filter((x) => x.id !== m.id))} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
