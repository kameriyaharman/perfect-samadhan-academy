import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { qualifySpeed, scoreTyping } from "@/lib/typingScore";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const passage = await one("SELECT * FROM passages WHERE id=$1", [Number(b.passageId) || 0]);
  if (!passage) return NextResponse.json({ error: "Passage not found" }, { status: 404 });
  const user = await getUser();
  const lang = b.lang === "english" ? "english" : "hindi";
  const seconds = Math.max(60, Math.min(3600, Number(b.seconds) || 60));
  const typed = String(b.typed || "").slice(0, 20000);
  const s = scoreTyping(passage.text, typed, seconds, lang, true);
  const pattern = String(b.pattern || "cpct").slice(0, 20);
  const qs = qualifySpeed(pattern, lang);
  const per = Array.isArray(b.perMinute) ? b.perMinute.slice(0, 60).map((x: any) => Math.max(0, Number(x) || 0)) : [];
  let certId = "";
  for (let i = 0; i < 5; i++) {
    certId = "PSA-T-" + Math.floor(100000 + Math.random() * 900000);
    const ex = await one("SELECT 1 FROM typing_results WHERE cert_id=$1", [certId]);
    if (!ex) break;
  }
  await one(
    `INSERT INTO typing_results (cert_id,user_id,name,language,layout,pattern,mode,duration,passage_title,gross_wpm,net_wpm,accuracy,typed_words,total_words,errors,keystrokes,per_minute,mistakes,qualified,qualify_speed)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING id`,
    [certId, user?.id || null, user?.name || "Guest", lang, String(b.layout || "").slice(0, 40), pattern, b.mode === "practice" ? "practice" : "exam", seconds, passage.title,
      s.gross, s.net, s.accuracy, s.typedWords, s.totalWords, s.errors, Number(b.keystrokes) || 0, JSON.stringify(per), JSON.stringify(s.mistakes), s.net >= qs, qs]
  );
  return NextResponse.json({ certId });
}
