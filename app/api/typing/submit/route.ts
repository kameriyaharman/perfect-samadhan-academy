import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { qualifySpeed, scoreTyping, splitWords } from "@/lib/typingScore";
import { getPattern, qualifyFor } from "@/lib/patterns";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const passage = await one("SELECT p.*, f.guest AS folder_guest FROM passages p LEFT JOIN folders f ON f.id=p.folder_id WHERE p.id=$1", [Number(b.passageId) || 0]);
  if (!passage) return NextResponse.json({ error: "Passage not found" }, { status: 404 });
  const user = await getUser();
  if (!user && !passage.guest && !passage.folder_guest) return NextResponse.json({ error: "Result save karne ke liye login karein" }, { status: 401 });
  const lang = b.lang === "english" ? "english" : "hindi";
  const seconds = Math.max(60, Math.min(3600, Number(b.seconds) || 60));
  const typed = String(b.typed || "").slice(0, 20000);
  const limit = [100, 150, 200, 250, 300].includes(Number(b.limit)) ? Number(b.limit) : 0;
  const text = limit ? splitWords(passage.text).slice(0, limit).join(" ") : passage.text;
  const pattern = String(b.pattern || "cpct").slice(0, 60);
  const pat = await getPattern(pattern);
  const backspaces = Math.max(0, Math.min(100000, Math.floor(Number(b.backspaces) || 0)));
  const ep = pat ? pat.error_penalty : 1, bp = pat ? pat.backspace_penalty : 0;
  const s = scoreTyping(text, typed, seconds, lang, true, { error: ep, backspace: bp, backspaces });
  const qs = pat ? qualifyFor(pat, lang) : qualifySpeed(pattern, lang);
  const per = Array.isArray(b.perMinute) ? b.perMinute.slice(0, 60).map((x: any) => Math.max(0, Number(x) || 0)) : [];
  let certId = "";
  for (let i = 0; i < 5; i++) {
    certId = "PSA-T-" + Math.floor(100000 + Math.random() * 900000);
    const ex = await one("SELECT 1 FROM typing_results WHERE cert_id=$1", [certId]);
    if (!ex) break;
  }
  await one(
    `INSERT INTO typing_results (cert_id,user_id,name,language,layout,pattern,mode,duration,passage_title,gross_wpm,net_wpm,accuracy,typed_words,total_words,errors,keystrokes,per_minute,mistakes,qualified,qualify_speed,backspaces,error_penalty,backspace_penalty)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING id`,
    [certId, user?.id || null, user?.name || "Guest", lang, String(b.layout || "").slice(0, 40), pattern, b.mode === "practice" ? "practice" : "exam", seconds, passage.title,
      s.gross, s.net, s.accuracy, s.typedWords, s.totalWords, s.errors, Number(b.keystrokes) || 0, JSON.stringify(per), JSON.stringify(s.mistakes), s.net >= qs, qs, backspaces, ep, bp]
  );
  return NextResponse.json({ certId });
}
