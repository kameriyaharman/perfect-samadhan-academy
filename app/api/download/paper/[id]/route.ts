import { NextResponse } from "next/server";
import { one } from "@/lib/db";
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const p = await one("UPDATE prev_papers SET downloads=downloads+1 WHERE id=$1 RETURNING *", [Number(params.id) || 0]);
  if (!p) return NextResponse.redirect(new URL("/previous-papers", req.url));
  if (p.pdf_url) return NextResponse.redirect(new URL(p.pdf_url, req.url));
  if (p.test_id) return NextResponse.redirect(new URL(`/test/${p.test_id}`, req.url));
  return NextResponse.redirect(new URL(`/previous-papers?exam=${encodeURIComponent(p.exam)}&missing=1`, req.url));
}
