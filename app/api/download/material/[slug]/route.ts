import { dec } from "@/lib/utils";
import { go } from "@/lib/redirect";
import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { canMaterials, getAccess } from "@/lib/access";
import { ownedMaterialIds } from "@/lib/orders";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const m = await one("SELECT * FROM materials WHERE slug=$1 AND active", [dec(params.slug)]);
  if (!m) return go("/study-material");
  if (m.is_premium) {
    const u = await getUser();
    if (!canMaterials(await getAccess(u))) {
      const owned = (await ownedMaterialIds(u?.id)).has(m.id);
      if (!owned) return go(`/checkout?item=${encodeURIComponent(`material:${m.slug}`)}`);
    }
  }
  await one("UPDATE materials SET downloads=downloads+1 WHERE id=$1 RETURNING id", [m.id]);
  return go(m.file_url || `/notes/${encodeURIComponent(m.slug)}`);
}
