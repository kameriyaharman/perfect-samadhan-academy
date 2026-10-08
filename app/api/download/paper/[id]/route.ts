import { go } from "@/lib/redirect";
import { NextResponse } from "next/server";
import { one } from "@/lib/db";
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const p = await one("UPDATE prev_papers SET downloads=downloads+1 WHERE id=$1 RETURNING *", [Number(params.id) || 0]);
  if (!p) return go("/previous-papers");
  if (p.pdf_url) return go(p.pdf_url);
  if (p.test_id) return go(`/test/${p.test_id}`);
  return go(`/previous-papers?exam=${encodeURIComponent(p.exam)}&missing=1`);
}
