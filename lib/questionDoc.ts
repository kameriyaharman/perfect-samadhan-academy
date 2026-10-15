// Word file (Perfect Samadhan format) → questions
//
//   1. What is the capital of Bihar?          ← number + English sawal
//   बिहार की राजधानी क्या है?                   ← Hindi sawal (agli line)
//   A. Patna        (ya "A. English / हिंदी", ya "A. English हिंदी")
//   B. ...  C. ...  D. ...  (E. optional)
//   Answer A
//   Solution.
//   ...vyakhya ki lines (agle number tak)

export type ParsedQ = {
  no: number; text_hi: string; text_en: string | null;
  opts: { hi: string; en: string | null }[]; answer: string; explanation: string | null;
};

const DEV = /[ऀ-ॿ]/;
const devRatio = (s: string) => { const l = s.replace(/[\s\d\p{P}\p{S}]/gu, ""); if (!l) return 0; return (l.match(/[ऀ-ॿ]/g) || []).length / l.length; };

const Q_START = /^(?:Q(?:ue(?:stion)?)?\.?\s*|प्रश्न\s*)?(\d{1,4})\s*[.)\]:]\s*(.*)$/i;
const OPT = /^\(?([A-Ea-e])\s*[.)\]:]\s*(.*)$/;
const ANS = /^(?:Answer|Ans|Correct\s*Answer|उत्तर|सही\s*उत्तर)\s*[:.\-–]?\s*\(?\s*([A-Ea-e])\s*\)?\.?\s*$/i;
const SOL = /^(?:Solution|Explanation|Sol|व्याख्या|हल|स्पष्टीकरण)\s*[.:\-–]?\s*(.*)$/i;

/** "English / हिंदी" ya "English हिंदी" ko alag karo */
export function splitBilingual(s: string): { hi: string; en: string | null } {
  const t = s.trim();
  if (!DEV.test(t)) return { hi: t, en: null };
  const slash = t.split(/\s+\/\s+|\s*\|\s*/);
  if (slash.length === 2) {
    const [a, b] = slash.map((x) => x.trim());
    if (devRatio(a) < 0.3 && devRatio(b) >= 0.3) return { hi: b, en: a };
    if (devRatio(b) < 0.3 && devRatio(a) >= 0.3) return { hi: a, en: b };
  }
  const i = t.search(DEV);
  const before = t.slice(0, i).trim();
  // English shuru me, phir Hindi (e.g. "Hindu Marriage Bill हिंदू विवाह विधेयक")
  if (i > 0 && /[A-Za-z]{2,}/.test(before) && devRatio(t.slice(i)) >= 0.5) return { hi: t.slice(i).trim(), en: before.replace(/[\/|,-]\s*$/, "").trim() };
  return { hi: t, en: null };
}

export function parseQuestionDoc(lines: string[]): { questions: ParsedQ[]; warnings: string[] } {
  const L = lines.map((x) => x.trim());
  const warnings: string[] = [];
  const questions: ParsedQ[] = [];

  // Sawal ki shuruaat: number wali line jiske baad (Answer/Solution se pehle) kam se kam 2 option lines hon.
  // Numbering 1,2,3… ke kram me dekhi jaati hai, taaki sawal ke andar ke "1. 2." statements ya vyakhya ke
  // numbered points galti se naya sawal na ban jayein.
  const ansAfter = (i: number) => { for (let j = i + 1; j < L.length; j++) if (ANS.test(L[j])) return j; return L.length; };
  const cands: { i: number; no: number }[] = [];
  for (let i = 0; i < L.length; i++) {
    const m = L[i] ? Q_START.exec(L[i]) : null;
    if (!m) continue;
    let opts = 0;
    for (let j = i + 1; j < L.length && j < i + 60; j++) {
      if (ANS.test(L[j]) || SOL.test(L[j])) break;
      if (OPT.test(L[j])) opts++;
    }
    if (opts >= 2) cands.push({ i, no: Number(m[1]) });
  }
  const starts: number[] = [];
  let pos = 0, expected: number | null = null;
  while (true) {
    const rest = cands.filter((c) => c.i >= pos);
    if (!rest.length) break;
    const first = rest[0];
    const end = ansAfter(first.i);
    const exact = expected === null ? null : rest.find((c) => c.no === expected && c.i <= end);
    const pick = exact || first;
    starts.push(pick.i);
    expected = pick.no + 1;
    pos = ansAfter(pick.i) + 1;
  }
  if (!starts.length) return { questions, warnings: ["File me koi sawal nahi mila. Har sawal '1.' '2.' number se shuru hona chahiye aur uske neeche A. B. C. D. options + 'Answer A' line honi chahiye."] };

  starts.forEach((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1] : L.length;
    const block = L.slice(s, end);
    const m = Q_START.exec(block[0])!;
    const no = Number(m[1]);
    const qLines: string[] = m[2] ? [m[2]] : [];
    const opts: string[] = [];
    let answer = "";
    const sol: string[] = [];
    let stage: "q" | "o" | "a" | "s" = "q";
    for (let j = 1; j < block.length; j++) {
      const line = block[j];
      if (!line) continue;
      if (stage !== "s" && ANS.test(line)) { answer = ANS.exec(line)![1].toUpperCase(); stage = "a"; continue; }
      const sm = SOL.exec(line);
      if ((stage === "a" || stage === "o") && sm) { stage = "s"; if (sm[1]) sol.push(sm[1]); continue; }
      if (stage === "s" || stage === "a") { sol.push(line); continue; }
      const om = OPT.exec(line);
      const expected = "ABCDE"[opts.length];
      if (om && om[1].toUpperCase() === expected) { opts.push(om[2].trim()); stage = "o"; continue; }
      if (stage === "o") { opts[opts.length - 1] += " " + line; continue; } // option ki agli line
      qLines.push(line);
    }
    if (opts.length < 2) { warnings.push(`Q${no}: options nahi mile — chhod diya`); return; }
    if (!answer) { warnings.push(`Q${no}: "Answer" line nahi mili — chhod diya`); return; }
    if ("ABCDE".indexOf(answer) >= opts.length) { warnings.push(`Q${no}: Answer ${answer} hai par option ${answer} nahi hai — chhod diya`); return; }
    if (opts.length > 5) warnings.push(`Q${no}: 5 se zyada options — sirf A–E liye`);

    // sawal: Hindi lines aur English lines alag
    const hi: string[] = [], en: string[] = [];
    for (const ql of qLines) {
      if (devRatio(ql) >= 0.3) {
        const b = splitBilingual(ql);
        hi.push(b.hi); if (b.en) en.push(b.en);
      } else en.push(ql);
    }
    const text_en = en.join("\n").trim() || null;
    const text_hi = hi.join("\n").trim() || text_en || "";
    if (!text_hi) { warnings.push(`Q${no}: sawal ka text khali hai — chhod diya`); return; }
    if (!hi.length) warnings.push(`Q${no}: Hindi sawal nahi mila — English hi dono jagah`);

    questions.push({
      no, text_hi, text_en: text_en && text_en !== text_hi ? text_en : null,
      opts: opts.slice(0, 5).map(splitBilingual), answer,
      explanation: sol.join("\n").trim() || null,
    });
  });
  return { questions, warnings };
}
