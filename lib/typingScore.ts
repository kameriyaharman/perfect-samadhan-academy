import { classifyError, normalizeWord } from "./keyboard";

export function splitWords(s: string) {
  return s.trim().split(/\s+/).filter(Boolean);
}

export type Score = {
  typedWords: number; totalWords: number; errors: number; correct: number; deduction: number;
  gross: number; net: number; accuracy: number;
  mistakes: { expected: string; typed: string; type: string }[];
};

/** word-by-word comparison (CPCT style). includePartial = count the last unfinished word too */
export type Penalty = { error?: number; backspace?: number; backspaces?: number };
/** Negative marking (exam pattern): har galti par `error` shabd kate (default 1), har Backspace par `backspace` shabd (default 0) */
export function scoreTyping(passage: string, typed: string, seconds: number, lang: string, includePartial = true, pen: Penalty = {}): Score {
  const pw = splitWords(passage);
  const tw = splitWords(typed);
  const done = includePartial || /\s$/.test(typed) ? tw.length : Math.max(0, tw.length - 1);
  let errors = 0;
  const mistakes: Score["mistakes"] = [];
  for (let i = 0; i < done; i++) {
    const exp = pw[i];
    const got = tw[i];
    if (exp === undefined || normalizeWord(exp) !== normalizeWord(got)) {
      errors++;
      if (mistakes.length < 200) mistakes.push({ expected: exp || "—", typed: got, type: classifyError(exp, got, lang) });
    }
  }
  const minutes = Math.max(seconds, 1) / 60;
  const gross = done / minutes;
  const ep = Number.isFinite(pen.error) ? Math.max(0, Number(pen.error)) : 1;
  const bp = Number.isFinite(pen.backspace) ? Math.max(0, Number(pen.backspace)) : 0;
  const deduction = errors * ep + Math.max(0, pen.backspaces || 0) * bp;
  const net = Math.max(0, (done - deduction) / minutes);
  const accuracy = done ? ((done - errors) / done) * 100 : 0;
  return { deduction: Math.round(deduction * 100) / 100, typedWords: done, totalWords: pw.length, errors, correct: done - errors, gross: Math.round(gross * 10) / 10, net: Math.round(net * 10) / 10, accuracy: Math.round(accuracy * 10) / 10, mistakes };
}

export function qualifySpeed(pattern: string, lang: string) {
  if (pattern === "ssc") return lang === "hindi" ? 30 : 35;
  if (pattern === "highcourt") return lang === "hindi" ? 25 : 30;
  return lang === "hindi" ? 20 : 30;
}
export const PATTERN_NAME: Record<string, string> = { cpct: "CPCT", ssc: "SSC DEST", highcourt: "High Court", practice: "Practice" };
export const LAYOUT_NAME: Record<string, string> = { inscript: "Inscript", remington: "Remington Gail Mangal", "remington-cbi": "Remington CBI", krutidev: "Krutidev", system: "Unicode (System)", english: "English" };
