"use client";
// Typing ke saath asli keyboard jaisi aawaz (Monkeytype style) — Web Audio se banaye gaye chhote clips,
// pehle se taiyar rehte hain taki har key par bina deri ke bajein. Admin apni mp3 bhi laga sakta hai (custom).

export type SoundKind = "mechanical" | "typewriter" | "soft" | "custom" | "off";
export const SOUND_OPTIONS: [SoundKind, string][] = [
  ["mechanical", "Mechanical keyboard"],
  ["typewriter", "Typewriter"],
  ["soft", "Soft click"],
  ["off", "Band"],
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const banks: Partial<Record<SoundKind, { key: AudioBuffer[]; space: AudioBuffer[]; back: AudioBuffer[] }>> = {};
let customUrl = "";
let customLoading: Promise<void> | null = null;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// chhota deterministic random — har variant thoda alag sunai de
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
}

type Recipe = { len: number; click: number; clickDecay: number; thock: number; thockHz: number; thockDecay: number; ring: number; ringHz: number; ringDecay: number; noiseLP: number };
const RECIPES: Record<"mechanical" | "typewriter" | "soft", { key: Recipe; space: Recipe; back: Recipe }> = {
  mechanical: {
    key: { len: 0.07, click: 0.9, clickDecay: 0.0035, thock: 0.55, thockHz: 210, thockDecay: 0.022, ring: 0.12, ringHz: 2600, ringDecay: 0.01, noiseLP: 0.55 },
    space: { len: 0.1, click: 0.7, clickDecay: 0.005, thock: 0.8, thockHz: 120, thockDecay: 0.04, ring: 0.06, ringHz: 1800, ringDecay: 0.012, noiseLP: 0.75 },
    back: { len: 0.08, click: 0.8, clickDecay: 0.004, thock: 0.6, thockHz: 170, thockDecay: 0.028, ring: 0.08, ringHz: 2200, ringDecay: 0.01, noiseLP: 0.6 },
  },
  typewriter: {
    key: { len: 0.11, click: 1, clickDecay: 0.006, thock: 0.5, thockHz: 140, thockDecay: 0.03, ring: 0.3, ringHz: 3400, ringDecay: 0.025, noiseLP: 0.3 },
    space: { len: 0.14, click: 0.8, clickDecay: 0.008, thock: 0.9, thockHz: 95, thockDecay: 0.05, ring: 0.18, ringHz: 2400, ringDecay: 0.03, noiseLP: 0.5 },
    back: { len: 0.11, click: 0.9, clickDecay: 0.006, thock: 0.6, thockHz: 120, thockDecay: 0.035, ring: 0.22, ringHz: 2900, ringDecay: 0.02, noiseLP: 0.35 },
  },
  soft: {
    key: { len: 0.05, click: 0.35, clickDecay: 0.003, thock: 0.35, thockHz: 260, thockDecay: 0.015, ring: 0, ringHz: 0, ringDecay: 1, noiseLP: 0.85 },
    space: { len: 0.06, click: 0.3, clickDecay: 0.004, thock: 0.5, thockHz: 160, thockDecay: 0.025, ring: 0, ringHz: 0, ringDecay: 1, noiseLP: 0.9 },
    back: { len: 0.05, click: 0.3, clickDecay: 0.003, thock: 0.4, thockHz: 200, thockDecay: 0.02, ring: 0, ringHz: 0, ringDecay: 1, noiseLP: 0.85 },
  },
};

function render(c: AudioContext, r: Recipe, seed: number): AudioBuffer {
  const sr = c.sampleRate;
  const n = Math.floor(r.len * sr);
  const buf = c.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  const rand = rng(seed);
  const detune = 1 + rand() * 0.06;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const noise = rand();
    lp = lp * r.noiseLP + noise * (1 - r.noiseLP); // halka low-pass
    const click = (noise - lp) * r.click * Math.exp(-t / r.clickDecay);
    const thock = Math.sin(2 * Math.PI * r.thockHz * detune * t) * r.thock * Math.exp(-t / r.thockDecay);
    const body = lp * 0.6 * r.thock * Math.exp(-t / (r.thockDecay * 0.7));
    const ring = r.ring ? Math.sin(2 * Math.PI * r.ringHz * detune * t) * r.ring * Math.exp(-t / r.ringDecay) : 0;
    const attack = Math.min(1, i / (sr * 0.0004));
    d[i] = (click + thock + body + ring) * attack * 0.55;
  }
  return buf;
}

function bank(kind: "mechanical" | "typewriter" | "soft") {
  const c = ac();
  if (!c) return null;
  if (!banks[kind]) {
    const R = RECIPES[kind];
    const mk = (r: Recipe, base: number) => [0, 1, 2, 3].map((v) => render(c, r, base + v * 7919));
    banks[kind] = { key: mk(R.key, 11), space: mk(R.space, 101), back: mk(R.back, 211) };
  }
  return banks[kind]!;
}

function loadCustom(url: string) {
  const c = ac();
  if (!c || !url) return;
  if (customUrl === url && (banks.custom || customLoading)) return;
  customUrl = url;
  customLoading = fetch(url)
    .then((r) => r.arrayBuffer())
    .then((a) => new Promise<AudioBuffer>((res, rej) => c.decodeAudioData(a, res, rej)))
    .then((b) => { banks.custom = { key: [b], space: [b], back: [b] }; })
    .catch(() => { banks.custom = undefined; })
    .finally(() => { customLoading = null; });
}

/** Start button / pehli key par bulayein — browser audio tabhi chalu karta hai */
export function warmUp(kind: SoundKind, url?: string) {
  if (kind === "off") return;
  if (kind === "custom") { if (url) loadCustom(url); bank("mechanical"); return; }
  bank(kind);
}

let lastAt = 0;
export function playKey(kind: SoundKind, type: "key" | "space" | "back" = "key", volume = 0.6, url?: string) {
  if (kind === "off") return;
  const c = ac();
  if (!c || !master) return;
  let b = kind === "custom" ? banks.custom : bank(kind);
  if (kind === "custom" && !b) { if (url) loadCustom(url); b = bank("mechanical") || undefined; }
  if (!b) return;
  const list = b[type];
  const src = c.createBufferSource();
  src.buffer = list[Math.floor(Math.random() * list.length)];
  src.playbackRate.value = (type === "space" ? 0.95 : 1) + (Math.random() - 0.5) * 0.08;
  const g = c.createGain();
  // bahut tez typing me aawaz thodi dheemi — kaan par bhaari na lage
  const now = c.currentTime;
  const fast = now - lastAt < 0.05 ? 0.75 : 1;
  lastAt = now;
  g.gain.value = Math.max(0, Math.min(1, volume)) * fast * (kind === "custom" ? 1 : 1.4);
  src.connect(g); g.connect(master);
  src.start(now);
}
