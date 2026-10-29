// Practice test: sahi / galat jawab par chhoti awaaz (WebAudio se — koi file download nahi)
let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  try {
    ctx ||= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}
function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(c.destination);
  o.start(start); o.stop(start + dur + 0.02);
}
/** sahi jawab — do khushi wali "ting-ting" */
export function playCorrect(vol = 0.35) {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  tone(c, 880, t, 0.14, "sine", vol);
  tone(c, 1318.5, t + 0.11, 0.26, "sine", vol);
  tone(c, 2637, t + 0.11, 0.2, "sine", vol * 0.15);
}
/** galat jawab — neeche girti "buzz" */
export function playWrong(vol = 0.3) {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900; f.connect(c.destination);
  for (const [fr, d] of [[210, 0], [200, 0.16]] as const) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "square"; o.frequency.setValueAtTime(fr, t + d); o.frequency.exponentialRampToValueAtTime(fr * 0.7, t + d + 0.16);
    g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(vol * 0.6, t + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
    o.connect(g).connect(f); o.start(t + d); o.stop(t + d + 0.18);
  }
}
/** test poora — chhoti dhun */
export function playFinish(vol = 0.3) {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((fr, i) => tone(c, fr, t + i * 0.1, 0.22, "triangle", vol));
}
