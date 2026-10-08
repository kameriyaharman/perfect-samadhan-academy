import { classifyError, normalizeWord } from "./keyboard";

export function splitWords(s: string) {
  return s.trim().split(/\s+/).filter(Boolean);
}

export type Score = {
  typedWords: number; totalWords: number; errors: number; correct: number;
  gross: number; net: number; accuracy: number;
  mistakes: { expected: string; typed: string; type: string }[];
};

/** word-by-word comparison (CPCT style). includePartial = count the last unfinished word too */
export function scoreTyping(passage: string, typed: string, seconds: number, lang: string, includePartial = true): Score {
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
  const net = Math.max(0, (done - errors) / minutes);
  const accuracy = done ? ((done - errors) / done) * 100 : 0;
  return { typedWords: done, totalWords: pw.length, errors, correct: done - errors, gross: Math.round(gross * 10) / 10, net: Math.round(net * 10) / 10, accuracy: Math.round(accuracy * 10) / 10, mistakes };
}

export function qualifySpeed(pattern: string, lang: string) {
  if (pattern === "ssc") return lang === "hindi" ? 30 : 35;
  if (pattern === "highcourt") return lang === "hindi" ? 25 : 30;
  return lang === "hindi" ? 20 : 30;
}
export const PATTERN_NAME: Record<string, string> = { cpct: "CPCT", ssc: "SSC DEST", highcourt: "High Court", practice: "Practice" };
export const LAYOUT_NAME: Record<string, string> = { inscript: "Inscript", remington: "Remington Gail", "remington-cbi": "Remington CBI", krutidev: "Krutidev", system: "Unicode (System)", english: "English" };
