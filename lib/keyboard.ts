// Keyboard layouts & Hindi typing engines (Inscript + Remington Gail / Krutidev style)

export type KeyDef = { code: string; label: string; shiftLabel?: string; w?: number };
export const ROWS: KeyDef[][] = [
  [
    { code: "Backquote", label: "`", shiftLabel: "~" }, { code: "Digit1", label: "1", shiftLabel: "!" }, { code: "Digit2", label: "2", shiftLabel: "@" },
    { code: "Digit3", label: "3", shiftLabel: "#" }, { code: "Digit4", label: "4", shiftLabel: "$" }, { code: "Digit5", label: "5", shiftLabel: "%" },
    { code: "Digit6", label: "6", shiftLabel: "^" }, { code: "Digit7", label: "7", shiftLabel: "&" }, { code: "Digit8", label: "8", shiftLabel: "*" },
    { code: "Digit9", label: "9", shiftLabel: "(" }, { code: "Digit0", label: "0", shiftLabel: ")" }, { code: "Minus", label: "-", shiftLabel: "_" },
    { code: "Equal", label: "=", shiftLabel: "+" }, { code: "Backspace", label: "Backspace", w: 2 },
  ],
  [
    { code: "Tab", label: "Tab", w: 1.5 }, { code: "KeyQ", label: "Q" }, { code: "KeyW", label: "W" }, { code: "KeyE", label: "E" }, { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" }, { code: "KeyY", label: "Y" }, { code: "KeyU", label: "U" }, { code: "KeyI", label: "I" }, { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" }, { code: "BracketLeft", label: "[", shiftLabel: "{" }, { code: "BracketRight", label: "]", shiftLabel: "}" }, { code: "Backslash", label: "\\", shiftLabel: "|", w: 1.5 },
  ],
  [
    { code: "CapsLock", label: "Caps", w: 1.8 }, { code: "KeyA", label: "A" }, { code: "KeyS", label: "S" }, { code: "KeyD", label: "D" }, { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" }, { code: "KeyH", label: "H" }, { code: "KeyJ", label: "J" }, { code: "KeyK", label: "K" }, { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";", shiftLabel: ":" }, { code: "Quote", label: "'", shiftLabel: '"' }, { code: "Enter", label: "Enter", w: 2.2 },
  ],
  [
    { code: "ShiftLeft", label: "Shift", w: 2.4 }, { code: "KeyZ", label: "Z" }, { code: "KeyX", label: "X" }, { code: "KeyC", label: "C" }, { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" }, { code: "KeyN", label: "N" }, { code: "KeyM", label: "M" }, { code: "Comma", label: ",", shiftLabel: "<" },
    { code: "Period", label: ".", shiftLabel: ">" }, { code: "Slash", label: "/", shiftLabel: "?" }, { code: "ShiftRight", label: "Shift", w: 2.6 },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", w: 1.6 }, { code: "AltLeft", label: "Alt", w: 1.6 }, { code: "Space", label: "Space", w: 7 },
    { code: "AltRight", label: "Alt", w: 1.6 }, { code: "ControlRight", label: "Ctrl", w: 1.6 },
  ],
];

// [normal, shift]
export const INSCRIPT: Record<string, [string, string]> = {
  Backquote: ["ॊ", "ऒ"], Digit1: ["१", "ऍ"], Digit2: ["२", "ॅ"], Digit3: ["३", "्र"], Digit4: ["४", "र्"], Digit5: ["५", "ज्ञ"],
  Digit6: ["६", "त्र"], Digit7: ["७", "क्ष"], Digit8: ["८", "श्र"], Digit9: ["९", "("], Digit0: ["०", ")"], Minus: ["-", "ः"], Equal: ["ृ", "ऋ"],
  KeyQ: ["ौ", "औ"], KeyW: ["ै", "ऐ"], KeyE: ["ा", "आ"], KeyR: ["ी", "ई"], KeyT: ["ू", "ऊ"], KeyY: ["ब", "भ"], KeyU: ["ह", "ङ"],
  KeyI: ["ग", "घ"], KeyO: ["द", "ध"], KeyP: ["ज", "झ"], BracketLeft: ["ड", "ढ"], BracketRight: ["़", "ञ"], Backslash: ["ॉ", "ऑ"],
  KeyA: ["ो", "ओ"], KeyS: ["े", "ए"], KeyD: ["्", "अ"], KeyF: ["ि", "इ"], KeyG: ["ु", "उ"], KeyH: ["प", "फ"], KeyJ: ["र", "ऱ"],
  KeyK: ["क", "ख"], KeyL: ["त", "थ"], Semicolon: ["च", "छ"], Quote: ["ट", "ठ"],
  KeyZ: ["ॆ", "ऎ"], KeyX: ["ं", "ँ"], KeyC: ["म", "ण"], KeyV: ["न", "ऩ"], KeyB: ["व", "ऴ"], KeyN: ["ल", "ळ"], KeyM: ["स", "श"],
  Comma: [",", "ष"], Period: [".", "।"], Slash: ["य", "य़"],
};

// Remington Gail (Krutidev 010 compatible) — characters typed in typewriter order
export const REMINGTON: Record<string, [string, string]> = {
  Backquote: ["़", "ँ"], Digit1: ["1", "!"], Digit2: ["2", "/"], Digit3: ["3", ":"], Digit4: ["4", "*"], Digit5: ["5", "-"],
  Digit6: ["6", "‘"], Digit7: ["7", "’"], Digit8: ["8", "द्ध"], Digit9: ["9", "त्र"], Digit0: ["0", "ऋ"], Minus: [";", "."], Equal: ["ृ", "्"],
  KeyQ: ["ु", "फ"], KeyW: ["ू", "ॅ"], KeyE: ["म", "म्"], KeyR: ["त", "त्"], KeyT: ["ज", "ज्"], KeyY: ["ल", "ल्"], KeyU: ["न", "न्"],
  KeyI: ["प", "प्"], KeyO: ["व", "व्"], KeyP: ["च", "च्"], BracketLeft: ["ख्", "क्ष्"], BracketRight: [",", "द्व"], Backslash: ["?", "ः"],
  KeyA: ["ं", "।"], KeyS: ["े", "ै"], KeyD: ["क", "क्"], KeyF: ["ि", "थ्"], KeyG: ["ह", "ळ"], KeyH: ["ी", "भ्"], KeyJ: ["र", "श्र"],
  KeyK: ["ा", "ज्ञ"], KeyL: ["स", "स्"], Semicolon: ["य", "रू"], Quote: ["श्", "ष्"],
  KeyZ: ["्र", "र्"], KeyX: ["ग", "ग्"], KeyC: ["ब", "ब्"], KeyV: ["अ", "ट"], KeyB: ["इ", "ठ"], KeyN: ["द", "छ"], KeyM: ["उ", "ड"],
  Comma: ["ए", "ढ"], Period: ["ण्", "झ"], Slash: ["ध्", "घ्"],
};

export const FINGER: Record<string, "little" | "ring" | "middle" | "index" | "thumb"> = {};
const fingerGroups: [string, string[]][] = [
  ["little", ["Backquote", "Digit1", "Digit0", "Minus", "Equal", "KeyQ", "KeyP", "BracketLeft", "BracketRight", "KeyA", "Semicolon", "Quote", "KeyZ", "Slash"]],
  ["ring", ["Digit2", "Digit9", "KeyW", "KeyO", "KeyS", "KeyL", "KeyX", "Period"]],
  ["middle", ["Digit3", "Digit8", "KeyE", "KeyI", "KeyD", "KeyK", "KeyC", "Comma"]],
  ["index", ["Digit4", "Digit5", "Digit6", "Digit7", "KeyR", "KeyT", "KeyY", "KeyU", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyV", "KeyB", "KeyN", "KeyM"]],
  ["thumb", ["Space"]],
];
for (const [f, codes] of fingerGroups) for (const c of codes) FINGER[c] = f as any;
export const LEFT_HAND = new Set(["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"]);
export const FINGER_COLOR: Record<string, string> = { little: "#fde2e2", ring: "#fff0d6", middle: "#dcf5e5", index: "#e3e8fb", thumb: "#efe6fd" };
export const FINGER_NAME: Record<string, string> = { little: "Chhoti ungli (Little)", ring: "Anamika (Ring)", middle: "Madhyama (Middle)", index: "Tarjani (Index)", thumb: "Anguutha (Space)" };

export type Layout = "inscript" | "remington" | "english" | "system";
export function layoutMap(layout: Layout) {
  return layout === "inscript" ? INSCRIPT : layout === "remington" ? REMINGTON : null;
}

const MATRA = "ािीुूृॄेैोौॅॉॆॊंँः़्";
const CONSONANT = /[\u0915-\u0939\u0958-\u095F]/;
const isCons = (c: string) => CONSONANT.test(c);
const isMatra = (c: string) => MATRA.includes(c);

export type EngineState = { text: string; pendingI: boolean };

/** Apply one typed Remington key output to the buffer, handling typewriter-order rules. */
export function remingtonApply(st: EngineState, out: string): EngineState {
  let { text, pendingI } = st;
  if (out === "ि") return { text, pendingI: true };
  // half letter + ा  => full letter (e.g. श् + ा = श)
  if (out === "ा" && text.endsWith("्") && isCons(text.slice(-2, -1))) return { text: text.slice(0, -1), pendingI };
  // vowel / matra combos
  const last = text.slice(-1);
  if (out === "े" && last === "ा") return { text: text.slice(0, -1) + "ो", pendingI };
  if (out === "ै" && last === "ा") return { text: text.slice(0, -1) + "ौ", pendingI };
  if (out === "ॅ" && last === "ा") return { text: text.slice(0, -1) + "ॉ", pendingI };
  if (out === "ा" && last === "अ") return { text: text.slice(0, -1) + "आ", pendingI };
  if (out === "े" && last === "आ") return { text: text.slice(0, -1) + "ओ", pendingI };
  if (out === "ै" && last === "आ") return { text: text.slice(0, -1) + "औ", pendingI };
  if (out === "े" && last === "ए") return { text: text.slice(0, -1) + "ऐ", pendingI };
  if (out === "ू" && last === "उ") return { text: text.slice(0, -1) + "ऊ", pendingI };
  // reph: र् placed before the current syllable
  if (out === "र्") {
    if (last === "इ") return { text: text.slice(0, -1) + "ई", pendingI };
    let i = text.length;
    while (i > 0 && isMatra(text[i - 1]) && text[i - 1] !== "्") i--;
    if (i > 0 && isCons(text[i - 1])) {
      i--;
      while (i >= 2 && text[i - 1] === "्" && isCons(text[i - 2])) i -= 2;
      return { text: text.slice(0, i) + "र्" + text.slice(i), pendingI };
    }
    return { text: text + "र्", pendingI };
  }
  // nukta / ्र after a just-placed ि should go before it
  if ((out === "्र" || out === "़") && last === "ि") return { text: text.slice(0, -1) + out + "ि", pendingI };
  if (pendingI) {
    const first = out[0];
    if (isCons(first)) {
      if (out.endsWith("्")) return { text: text + out, pendingI: true }; // half letter, keep waiting
      return { text: text + out + "ि", pendingI: false };
    }
    if (out === " ") return { text: text + "ि ", pendingI: false };
    return { text: text + "ि" + out, pendingI: false };
  }
  return { text: text + out, pendingI };
}

export function engineKey(layout: Layout, st: EngineState, code: string, shift: boolean): EngineState | null {
  const map = layoutMap(layout);
  if (!map) return null;
  if (code === "Space") return layout === "remington" ? remingtonApply(st, " ") : { ...st, text: st.text + " " };
  if (code === "Enter" || code === "NumpadEnter") return { ...st, text: st.text + " " };
  const m = map[code];
  if (!m) return null;
  const out = shift ? m[1] : m[0];
  if (layout === "remington") return remingtonApply(st, out);
  return { ...st, text: st.text + out };
}

export function engineBackspace(st: EngineState): EngineState {
  if (st.pendingI) return { ...st, pendingI: false };
  const arr = Array.from(st.text);
  arr.pop();
  return { text: arr.join(""), pendingI: false };
}

/** Find which key (and shift) produces a character, for on-screen guidance */
export function findKey(layout: Layout, ch: string): { code: string; shift: boolean } | null {
  if (!ch) return null;
  if (ch === " ") return { code: "Space", shift: false };
  if (layout === "english" || layout === "system") {
    const lower = ch.toLowerCase();
    for (const row of ROWS) for (const k of row) {
      if (k.label.length === 1 && k.label.toLowerCase() === lower) return { code: k.code, shift: ch !== lower || false };
      if (k.shiftLabel === ch) return { code: k.code, shift: true };
    }
    return null;
  }
  const map = layoutMap(layout)!;
  for (const [code, [n, s]] of Object.entries(map)) {
    if (n === ch) return { code, shift: false };
    if (s === ch) return { code, shift: true };
  }
  if (layout === "remington") {
    // full letter typed as half + ा
    for (const [code, [n, s]] of Object.entries(map)) {
      if (n === ch + "्") return { code, shift: false };
      if (s === ch + "्") return { code, shift: true };
    }
    if (ch === "ो" || ch === "ौ" || ch === "आ") return { code: "KeyK", shift: false };
  }
  return null;
}

const DEV_DIGITS = "०१२३४५६७८९";
export function normalizeWord(w: string) {
  return w
    .normalize("NFC")
    .replace(/[०-९]/g, (d) => String(DEV_DIGITS.indexOf(d)))
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

export function classifyError(expected: string | undefined, typed: string | undefined, lang: string): string {
  if (!typed) return "Chhoot gaya";
  if (!expected) return "Extra shabd";
  if (lang === "english") {
    if (expected.toLowerCase() === typed.toLowerCase()) return "Capital letter";
    if (expected.replace(/[^\w]/g, "") === typed.replace(/[^\w]/g, "")) return "Punctuation";
    return "Spelling";
  }
  const strip = (s: string, re: RegExp) => s.replace(re, "");
  if (strip(expected, /़/g) === strip(typed, /़/g)) return "Nukta";
  if (strip(expected, /्/g) === strip(typed, /्/g)) return "Halant";
  if (strip(expected, /[ािीुूृेैोौंँॅॉ]/g) === strip(typed, /[ािीुूृेैोौंँॅॉ]/g)) return "Matra";
  return "Spelling";
}
