// Admin ke folder description (lamba instruction text) ko step-by-step hisson me todta hai:
// intro paragraph, numbered steps (1. 2. 3. …) aur aakhri "Golden Rule" / dhanyavaad line.
export type Instruction = { heading: string; intro: string; steps: { icon: string; title: string; body: string }[]; rule: string; outro: string };

const clean = (s: string) =>
  s.replace(/^#{1,6}\s*/gm, "").replace(/#{2,6}\s*/g, "").replace(/\*\*|__/g, "").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ").trim();

// Shabd ke aakhir ka emoji / chinh (🧘, 💺, ✅ …) alag karo
const TRAIL = /\s*((?:[\p{Extended_Pictographic}\p{Emoji_Presentation}‍️⃣]|\p{Regional_Indicator})+)\s*$/u;
const LEAD = /^\s*((?:[\p{Extended_Pictographic}\p{Emoji_Presentation}‍️⃣])+)\s*/u;

export function parseInstructions(raw: string | null | undefined): Instruction | null {
  if (!raw || !raw.trim()) return null;
  const text = clean(raw);
  // 1. 2. 3. … kram se dhoondo (beech me aaye random number ko step na maanein)
  const marks: { at: number; end: number }[] = [];
  let n = 1, from = 0;
  for (;;) {
    const re = new RegExp(`(^|[\\s\\p{P}\\p{S}])${n}[.)]\\s`, "gu");
    re.lastIndex = from;
    const m = re.exec(text);
    if (!m) break;
    const at = m.index + m[1].length;
    marks.push({ at, end: at + String(n).length + 2 });
    from = at + 1; n++;
  }
  if (marks.length < 2) return { heading: "", intro: text, steps: [], rule: "", outro: "" };

  let intro = text.slice(0, marks[0].at);
  const steps: Instruction["steps"] = [];
  let icon = "";
  const pullIcon = (s: string) => { const m = TRAIL.exec(s); return m ? { s: s.slice(0, m.index), i: m[1] } : { s, i: "" }; };
  { const p = pullIcon(intro); intro = p.s; icon = p.i; }
  let tail = "";
  marks.forEach((mk, i) => {
    let body = text.slice(mk.end, i + 1 < marks.length ? marks[i + 1].at : text.length).trim();
    let nextIcon = "";
    if (i + 1 < marks.length) { const p = pullIcon(body); body = p.s.trim(); nextIcon = p.i; }
    else {
      // aakhri step ke baad ka "Golden Rule …" / dhanyavaad hissa alag
      const g = body.search(/(?:[^\s]+\s*)?Golden Rule|सुनहरा नियम/i);
      if (g > 0) { tail = body.slice(g); body = body.slice(0, g); }
    }
    let ic = icon;
    const lead = LEAD.exec(body);
    if (!ic && lead) { ic = lead[1]; body = body.slice(lead[0].length); }
    // pehla vaakya = title (agar chhota hai)
    const cut = body.search(/[।!?|:](?=\s|$)/);
    let title = body, rest = "";
    if (cut > 0 && cut < 90) { title = body.slice(0, cut + 1); rest = body.slice(cut + 1).trim(); }
    else if (body.length > 90) { const sp = body.lastIndexOf(" ", 70); title = body.slice(0, sp > 20 ? sp : 70) + "…"; rest = "…" + body.slice(sp > 20 ? sp + 1 : 70); }
    title = title.replace(/[।:]$/, "").replace(TRAIL, "").trim();
    steps.push({ icon: ic, title, body: rest.replace(TRAIL, "").trim() });
    icon = nextIcon;
  });

  // intro me pehla hissa heading (jaise "हिंदी टाइपिंग — ZERO TO HERO LESSON")
  let heading = "";
  const h = /^(.{6,80}?(?:LESSON|SERIES|COURSE|लेसन|कोर्स))\s+/i.exec(intro);
  if (h) { heading = h[1].trim(); intro = intro.slice(h[0].length); }

  let rule = "", outro = "";
  if (tail) {
    const t = tail.search(/धन्यवाद|Thank/i);
    if (t > 0) { rule = tail.slice(0, t); outro = tail.slice(t); } else rule = tail;
    // dhanyavaad aakhri step me bhi ho sakta hai
  } else {
    const last = steps[steps.length - 1];
    const t = last ? `${last.title} ${last.body}`.search(/धन्यवाद/) : -1;
    if (last && t > 0) { const full = `${last.title}${last.body ? " " + last.body : ""}`; outro = full.slice(full.search(/धन्यवाद/)); }
  }
  // dhanyavaad line steps ke andar ho to wahan se hata do
  for (const s of steps) { const i = s.body.search(/धन्यवाद/); if (i >= 0 && outro && outro.startsWith(s.body.slice(i, i + 8))) s.body = s.body.slice(0, i).replace(TRAIL, "").trim(); }
  rule = rule.replace(/^.*?(Golden Rule|सुनहरा नियम)\s*:?\s*/i, "").trim();
  return { heading, intro: intro.trim(), steps, rule, outro: outro.trim() };
}
