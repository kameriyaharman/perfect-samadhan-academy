import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser, isPremium } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const m = await one("SELECT * FROM materials WHERE slug=$1 AND active", [params.slug]);
  if (!m) return NextResponse.redirect(new URL("/study-material", req.url));
  if (m.is_premium) {
    const u = await getUser();
    if (!isPremium(u)) {
      const owned = u ? await one("SELECT 1 FROM orders WHERE user_id=$1 AND item=$2 AND status='paid'", [u.id, `material:${m.slug}`]) : null;
      if (!owned) return NextResponse.redirect(new URL(`/checkout?item=material:${m.slug}`, req.url));
    }
  }
  await one("UPDATE materials SET downloads=downloads+1 WHERE id=$1 RETURNING id", [m.id]);
  return NextResponse.redirect(new URL(m.file_url || `/notes/${m.slug}`, req.url));
}
