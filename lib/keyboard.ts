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

// Remington Gail Mangal (CPCT / MP govt exams) — characters typed in typewriter order.
// Academy chart: Shift+~ द्य, Shift+1 ।, Shift+3 ः, \ (, Shift+\ ), Shift+A ा (K jaisa), उ+Shift+Q ऊ; ँ aur baaki Alt codes se.
export const REMINGTON: Record<string, [string, string]> = {
  Backquote: ["़", "द्य"], Digit1: ["1", "।"], Digit2: ["2", "/"], Digit3: ["3", "ः"], Digit4: ["4", "*"], Digit5: ["5", "-"],
  Digit6: ["6", "‘"], Digit7: ["7", "’"], Digit8: ["8", "द्ध"], Digit9: ["9", "त्र"], Digit0: ["0", "ऋ"], Minus: [";", "."], Equal: ["ृ", "्"],
  KeyQ: ["ु", "फ"], KeyW: ["ू", "ॅ"], KeyE: ["म", "म्"], KeyR: ["त", "त्"], KeyT: ["ज", "ज्"], KeyY: ["ल", "ल्"], KeyU: ["न", "न्"],
  KeyI: ["प", "प्"], KeyO: ["व", "व्"], KeyP: ["च", "च्"], BracketLeft: ["ख्", "क्ष्"], BracketRight: [",", "द्व"], Backslash: ["(", ")"],
  KeyA: ["ं", "ा"], KeyS: ["े", "ै"], KeyD: ["क", "क्"], KeyF: ["ि", "थ्"], KeyG: ["ह", "ळ"], KeyH: ["ी", "भ्"], KeyJ: ["र", "श्र"],
  KeyK: ["ा", "ज्ञ"], KeyL: ["स", "स्"], Semicolon: ["य", "रू"], Quote: ["श्", "ष्"],
  KeyZ: ["्र", "र्"], KeyX: ["ग", "ग्"], KeyC: ["ब", "ब्"], KeyV: ["अ", "ट"], KeyB: ["इ", "ठ"], KeyN: ["द", "छ"], KeyM: ["उ", "ड"],
  Comma: ["ए", "ढ"], Period: ["ण्", "झ"], Slash: ["ध्", "घ्"],
};

// Kruti Dev 010 keyboard (UP/Rajasthan/SSC exams) — har key wahi akshar deti hai jo Kruti Dev font me us ASCII key par hota hai,
// output Unicode (Mangal) me banta hai taki passage se sahi milan ho. Remington Gail se farak: ` = ृ, ~ = ्, = = त्र, + = ़,
// - = . , _ = ऋ, Shift+A = ।, # = रु, : = रू, % = ः, \ = ?, | = द्य, ] = , , } = द्व, ( = ; , ) = द्ध …
export const KRUTIDEV: Record<string, [string, string]> = {
  Backquote: ["ृ", "्"], Digit1: ["1", "!"], Digit2: ["2", "/"], Digit3: ["3", "रु"], Digit4: ["4", "+"], Digit5: ["5", "ः"],
  Digit6: ["6", "‘"], Digit7: ["7", "-"], Digit8: ["8", "’"], Digit9: ["9", ";"], Digit0: ["0", "द्ध"], Minus: [".", "ऋ"], Equal: ["त्र", "़"],
  KeyQ: ["ु", "फ"], KeyW: ["ू", "ॅ"], KeyE: ["म", "म्"], KeyR: ["त", "त्"], KeyT: ["ज", "ज्"], KeyY: ["ल", "ल्"], KeyU: ["न", "न्"],
  KeyI: ["प", "प्"], KeyO: ["व", "व्"], KeyP: ["च", "च्"], BracketLeft: ["ख्", "क्ष्"], BracketRight: [",", "द्व"], Backslash: ["?", "द्य"],
  KeyA: ["ं", "।"], KeyS: ["े", "ै"], KeyD: ["क", "क्"], KeyF: ["ि", "थ्"], KeyG: ["ह", "ळ"], KeyH: ["ी", "भ्"], KeyJ: ["र", "श्र"],
  KeyK: ["ा", "ज्ञ"], KeyL: ["स", "स्"], Semicolon: ["य", "रू"], Quote: ["श्", "ष्"],
  KeyZ: ["्र", "र्"], KeyX: ["ग", "ग्"], KeyC: ["ब", "ब्"], KeyV: ["अ", "ट"], KeyB: ["इ", "ठ"], KeyN: ["द", "छ"], KeyM: ["उ", "ड"],
  Comma: ["ए", "ढ"], Period: ["ण्", "झ"], Slash: ["ध्", "घ्"],
};
// Kruti Dev me Alt-code se aane wale khaas akshar (Alt+0161 = ँ chandrabindu, Alt+0130 = ॉ …)
const KRUTI_ALT: Record<string, string> = {
  "¡": "ँ", "‚": "ॉ", "Å": "ऊ", "Ã": "ई", "Ø": "क्र", "Ý": "फ्र", "ç": "प्र", "Á": "प्र", "Ù": "त्त्", "ä": "क्त", "–": "दृ", "—": "कृ",
  "é": "न्न", "™": "न्न्", "à": "ह्न", "á": "ह्य", "â": "हृ", "ã": "ह्म", "º": "ह्", "í": "द्द", "«": "त्र्", "ô": "क्क", "Ä": "घ", "÷": "झ्",
  "ê": "ट्ट", "ë": "ट्ठ", "ì": "ड्ड", "ï": "ड्ढ", "ñ": "॰", "•": "ऽ", "¼": "(", "½": ")", "¿": "{", "À": "}", "¶": "फ्", "³": "ङ", "¥": "ञ",
  "å": "०", "ƒ": "१", "„": "२", "…": "३", "†": "४", "‡": "५", "ˆ": "६", "‰": "७", "Š": "८", "‹": "९",
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

export type Layout = "inscript" | "remington" | "krutidev" | "english" | "system";
export function layoutMap(layout: Layout) {
  return layout === "inscript" ? INSCRIPT : layout === "remington" ? REMINGTON : layout === "krutidev" ? KRUTIDEV : null;
}
/** Typewriter-style layouts (ि pehle, aadha akshar + ा, reph baad me) */
export const isTypewriter = (layout: Layout) => layout === "remington" || layout === "krutidev";

const MATRA = "ािीुूृॄेैोौॅॉॆॊंँः़्";
const CONSONANT = /[\u0915-\u0939\u0958-\u095F]/;
const isCons = (c: string) => CONSONANT.test(c);
const isMatra = (c: string) => MATRA.includes(c);

export type EngineState = { text: string; pendingI: boolean; iAt?: number };

/** Apply one typed Remington key output to the buffer, handling typewriter-order rules. */
export function remingtonApply(st: EngineState, out: string): EngineState {
  const r = remingtonRaw(st, out);
  // ि pending ho to uski jagah (jahan ि dabaya tha) yaad rakhein — screen par wahi dikhegi
  if (r.pendingI) return { ...r, iAt: out === "ि" && !st.pendingI ? st.text.length : st.iAt ?? st.text.length };
  return { text: r.text, pendingI: false };
}

function remingtonRaw(st: EngineState, out: string): EngineState {
  let { text, pendingI } = st;
  if (out === "ि") return { text, pendingI: true };
  // half letter + ा  => full letter (e.g. श् + ा = श); pending ि ho to ab lag jayegi (शि, थि, भि, खि …)
  if (out === "ा" && text.endsWith("्") && isCons(text.slice(-2, -1))) {
    return pendingI ? { text: text.slice(0, -1) + "ि", pendingI: false } : { text: text.slice(0, -1), pendingI };
  }
  // vowel / matra combos
  const last = text.slice(-1);
  if (out === "े" && last === "ा") return { text: text.slice(0, -1) + "ो", pendingI };
  if (out === "ै" && last === "ा") return { text: text.slice(0, -1) + "ौ", pendingI };
  if (out === "ॅ" && last === "ा") return { text: text.slice(0, -1) + "ॉ", pendingI };
  if (out === "ॅ" && last === "आ") return { text: text.slice(0, -1) + "ऑ", pendingI };
  // chandrabindu: Shift+W (ॅ) + A (ं) = ँ  →  हाँ, हँसी, आँख, माँ, जहाँ
  if (out === "ं" || out === "ँ") {
    if (last === "ॅ") return { text: text.slice(0, -1) + "ँ", pendingI };
    if (last === "ॉ") return { text: text.slice(0, -1) + "ाँ", pendingI };
    if (last === "ऑ") return { text: text.slice(0, -1) + "आँ", pendingI };
  }
  if (out === "ा" && last === "अ") return { text: text.slice(0, -1) + "आ", pendingI };
  if (out === "े" && last === "आ") return { text: text.slice(0, -1) + "ओ", pendingI };
  if (out === "ै" && last === "आ") return { text: text.slice(0, -1) + "औ", pendingI };
  if (out === "े" && last === "ए") return { text: text.slice(0, -1) + "ऐ", pendingI };
  if (out === "ू" && last === "उ") return { text: text.slice(0, -1) + "ऊ", pendingI };
  if (out === "फ" && last === "उ") return { text: text.slice(0, -1) + "ऊ", pendingI }; // उ + Shift+Q = ऊ
  // reph: र् placed before the current syllable
  if (out === "र्") {
    if (last === "इ") return { text: text.slice(0, -1) + "ई", pendingI };
    // aadhe akshar (थ्, ण्, श् …) ke baad Z — reph us akshar se pehle lagega, ा baad me poora akshar banayega (अथ् + Z + ा = अर्थ)
    if (last === "्" && isCons(text.slice(-2, -1))) {
      let j = text.length - 2;
      while (j >= 2 && text[j - 1] === "्" && isCons(text[j - 2])) j -= 2;
      return { text: text.slice(0, j) + "र्" + text.slice(j), pendingI };
    }
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
  const tw = isTypewriter(layout);
  if (code === "Space") return tw ? remingtonApply(st, " ") : { ...st, text: st.text + " " };
  if (code === "Enter" || code === "NumpadEnter") return { ...st, text: st.text + " " };
  const m = map[code];
  if (!m) return null;
  const out = shift ? m[1] : m[0];
  if (tw) return remingtonApply(st, out);
  return { ...st, text: st.text + out };
}

/** Insert a ready character (e.g. from an Alt code) through the layout engine */
export function engineInsert(layout: Layout, st: EngineState, ch: string): EngineState {
  if (layout === "krutidev" && KRUTI_ALT[ch]) ch = KRUTI_ALT[ch];
  return isTypewriter(layout) ? remingtonApply(st, ch) : { ...st, text: st.text + ch };
}

// Windows-1252 characters for Alt+0128 … Alt+0159
const CP1252: Record<number, string> = { 128: "€", 130: "‚", 131: "ƒ", 132: "„", 133: "…", 134: "†", 135: "‡", 136: "ˆ", 137: "‰", 138: "Š", 139: "‹", 140: "Œ", 142: "Ž", 145: "‘", 146: "’", 147: "“", 148: "”", 149: "•", 150: "–", 151: "—", 152: "˜", 153: "™", 154: "š", 155: "›", 156: "œ", 158: "ž", 159: "Ÿ" };

/** Alt + number code (Windows style): Alt+0151 = —, Alt+063 = ?, Alt+2384 = ॐ (Unicode decimal) */
export function altCodeChar(digits: string): string | null {
  if (!/^\d{2,5}$/.test(digits)) return null;
  const n = parseInt(digits, 10);
  if (!n) return null;
  if (n < 256) {
    if (n >= 128 && n < 160) return CP1252[n] || null;
    if (n < 32) return null;
    return String.fromCharCode(n);
  }
  if (n > 0x10ffff) return null;
  return String.fromCodePoint(n);
}

export function engineBackspace(st: EngineState): EngineState {
  if (st.pendingI) {
    const at = st.iAt ?? st.text.length;
    if (st.text.length <= at) return { text: st.text, pendingI: false };
    // ि ke baad type kiya aadha akshar hatao, ि pending rahe
    const cut = st.text.endsWith("्") && st.text.length - 2 >= at ? 2 : 1;
    return { text: st.text.slice(0, -cut), pendingI: true, iAt: at };
  }
  const arr = Array.from(st.text);
  arr.pop();
  return { text: arr.join(""), pendingI: false };
}

/** Text as it should appear on screen (pending ि shown where it was typed, like a typewriter) */
export function displayText(st: EngineState): string {
  if (!st.pendingI) return st.text;
  const at = Math.min(st.iAt ?? st.text.length, st.text.length);
  return st.text.slice(0, at) + "ि" + st.text.slice(at);
}

/** Is `partial` a valid in-progress prefix of `exp`? Remington me aadha akshar (श्) + ा = श hota hai, isliye श् bhi sahi maana jayega */
export function isTypingPrefix(exp: string, partial: string, layout: Layout): boolean {
  exp = normalizeWord(exp); partial = normalizeWord(partial);
  if (exp.startsWith(partial)) return true;
  if (!isTypewriter(layout)) return false;
  if (partial.endsWith("्") && exp.startsWith(partial.slice(0, -1))) return true;
  // chandrabindu adhoora (ॅ dabaya, ं abhi baaki): हॉ → हाँ, हॅ → हँ
  if (/[ॅॉऑ]$/.test(partial)) {
    const base = partial.slice(0, -1) + ({ "ॅ": "", "ॉ": "ा", "ऑ": "आ" } as Record<string, string>)[partial.slice(-1)];
    if (exp.startsWith(base) && /^[ँं]/.test(exp.slice(base.length)) && !exp.startsWith(partial)) return true;
  }
  // reph (र्) typewriter me akshar ke BAAD dabate hain — "काय" abhi "कार्य" ka sahi adhoora roop hai
  if (exp.includes("र्")) {
    const noReph = (w: string) => w.replace(/र्(?=[\u0915-\u0939])/g, "");
    const p = noReph(partial);
    if (noReph(exp).startsWith(p.endsWith("्") ? p.slice(0, -1) : p)) return true;
  }
  return false;
}

/** Typewriter order me expected shabd: reph (र्) apne akshar ke BAAD aata hai — "कार्य" ko "काय" + "र्" ki tarah type karte hain.
 * Sirf pehla adhoora reph khiska kar lautata hai, taki guide/hint agli sahi key bata sake. */
export function typewriterOrder(exp: string, partial: string): string {
  for (let idx = exp.indexOf("र्"); idx >= 0; idx = exp.indexOf("र्", idx + 1)) {
    if (!isCons(exp[idx + 2] || "")) continue;
    if (partial.startsWith(exp.slice(0, idx + 3))) continue; // ye reph lag chuka
    let k = idx + 3;
    if (exp[k] === "़") k++;
    while (exp[k] === "्" && isCons(exp[k + 1] || "")) { k += 2; if (exp[k] === "़") k++; }
    while (k < exp.length && isMatra(exp[k]) && exp[k] !== "्") k++; // matra ke baad Z
    return exp.slice(0, idx) + exp.slice(idx + 2, k) + "र्" + exp.slice(k);
  }
  return exp;
}

/** Guide / keyboard-highlight ke liye agla akshar (ya " " = space). null = galti hai, Backspace dabana hai. */
export function guideNextChar(layout: Layout, exp: string, partial: string, pendingI: boolean): string | null {
  if (partial && !isTypingPrefix(exp, partial, layout)) return null;
  if (normalizeWord(partial) === normalizeWord(exp)) return " ";
  if (!isTypewriter(layout)) return Array.from(exp.slice(partial.length))[0] ?? " ";
  if (/[ॅॉऑ]$/.test(partial) && !exp.startsWith(partial)) return "ं";
  if (partial.endsWith("्") && !exp.startsWith(partial)) return "ा";
  const ord = typewriterOrder(exp, partial);
  const base = ord.startsWith(partial) ? ord : exp;
  const rest = Array.from(base.slice(partial.length));
  if (base !== exp && rest[0] === "र" && rest[1] === "्") return "र्";
  if (pendingI && rest[0]) return rest[0];
  if (remingtonNextIsI(rest)) return "ि";
  return rest[0] ?? " ";
}

/** Remington: agla syllable chhoti ि wala hai (कि, स्थि, क्षि …) to pehle ि dabani hai */
export function remingtonNextIsI(rest: string[]): boolean {
  let i = 0;
  if (!isCons(rest[0] || "")) return false;
  while (rest[i + 1] === "्" && isCons(rest[i + 2] || "")) i += 2;
  if (rest[i + 1] === "़") i++;
  return rest[i + 1] === "ि";
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
  // bina Shift wali key pehle (ा = K, Shift+A nahi)
  for (const [code, [n]] of Object.entries(map)) if (n === ch) return { code, shift: false };
  for (const [code, [, s]] of Object.entries(map)) if (s === ch) return { code, shift: true };
  if (isTypewriter(layout)) {
    if (ch === "ँ") return { code: "KeyW", shift: true }; // Shift+W (ॅ) phir A (ं)
    // full letter typed as half + ा
    for (const [code, [n, s]] of Object.entries(map)) {
      if (n === ch + "्") return { code, shift: false };
      if (s === ch + "्") return { code, shift: true };
    }
    if (ch === "ो" || ch === "ौ" || ch === "आ") return { code: "KeyK", shift: false };
  }
  return null;
}

const KEY_LABEL: Record<string, string> = {};
for (const row of ROWS) for (const k of row) KEY_LABEL[k.code] = k.label.length === 1 ? k.label : k.label;

/** Hint mode: ek akshar (grapheme) ke liye kaun si keys dabani hain — jaise "क्षि" → ["F (ि)", "Shift+[ (क्ष्)", "K (ा)"] */
export function keyHint(layout: Layout, cluster: string): string[] {
  const out: string[] = [];
  const name = (r: { code: string; shift: boolean }) => (r.shift ? "Shift + " : "") + (KEY_LABEL[r.code] || r.code);
  let chars = Array.from(cluster);
  if (isTypewriter(layout) && chars.includes("ि")) {
    // typewriter order: ि pehle
    out.push("F (ि)");
    chars = chars.filter((c) => c !== "ि");
  }
  const map = layoutMap(layout);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (map && isTypewriter(layout)) {
      if (c === "्" && chars[i + 1] === "र") { out.push("Z (्र)"); i++; continue; }
      if (c === "ँ") { out.push("Shift + W (ॅ)", "A (ं) → ँ"); continue; }
      if (c === "र" && chars[i + 1] === "्" && chars[i + 2] && CONSONANT.test(chars[i + 2])) { out.push("(agla akshar type karke) Shift + Z (र्)"); i++; continue; }
      // conjunct as a single key (क्ष्, त्र, द्ध, रू …)
      let done = false;
      for (const len of [3, 2]) {
        const two = chars.slice(i, i + len).join("");
        if (Array.from(two).length !== len) continue;
        const hit = Object.entries(map).find(([, [n, s]]) => (n.length > 1 && (n === two || n === two + "्")) || (s.length > 1 && (s === two || s === two + "्")));
        if (!hit) continue;
        const [code, [n, s]] = hit;
        const shift = !(n === two || n === two + "्");
        out.push(name({ code, shift }) + ` (${two})`);
        if ((shift ? s : n) === two + "्") out.push("K (ा)");
        i += len - 1; done = true; break;
      }
      if (done) continue;
    }
    const r = findKey(layout, c);
    if (!r) { out.push(`Alt + ${c.codePointAt(0)} (${c})`); continue; }
    const val = map ? (r.shift ? map[r.code]?.[1] : map[r.code]?.[0]) : c;
    out.push(name(r) + ` (${c})`);
    if (isTypewriter(layout) && val && val === c + "्") out.push("K (ा)");
  }
  return out;
}

const DEV_DIGITS = "०१२३४५६७८९";
export function normalizeWord(w: string) {
  return w
    .normalize("NFC")
    .replace(/[\u200b-\u200d\u00ad\ufeff]/g, "") // zero-width / soft hyphen (copy-paste passages me chhupe rehte hain)
    .replace(/ॅं/g, "ँ").replace(/ॉं/g, "ाँ").replace(/ऑं/g, "आँ") // Shift+W + A = chandrabindu
    .replace(/[०-९]/g, (d) => String(DEV_DIGITS.indexOf(d)))
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/:/g, "ः")
    .replace(/\|/g, "।");
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
