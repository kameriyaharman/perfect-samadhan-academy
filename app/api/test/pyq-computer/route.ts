import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { canTest, getAccess } from "@/lib/access";
import { createAttempt } from "@/lib/tests";
import { cpctComputerPaper, splitSession } from "@/lib/pyqComputer";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const p = await cpctComputerPaper(Number(b.testId) || 0);
  if (!p) return NextResponse.json({ error: "Paper nahi mila" }, { status: 404 });
  if (!canTest(await getAccess(user), { is_free: p.is_free, exam_slug: (p as any).exam_slug || "cpct", series: (p as any).series })) return NextResponse.json({ error: "premium" }, { status: 402 });
  if (!p.questionIds.length) return NextResponse.json({ error: "Is paper me Computer ke sawal nahi hain" }, { status: 404 });
  const { label, shift } = splitSession(p.session, p.title);
  const id = await createAttempt(user.id, {
    title: `CPCT Computer PYQ — ${label}${shift ? ` · ${shift}` : ""}`,
    kind: "pyq-computer", duration: p.questionIds.length, questionIds: p.questionIds, language: b.language === "en" ? "en" : "hi",
  });
  return NextResponse.json({ attemptId: id });
}
