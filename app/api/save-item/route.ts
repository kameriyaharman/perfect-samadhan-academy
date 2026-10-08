import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getUser } from "@/lib/auth";
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "login" }, { status: 401 });
  const { kind, id } = await req.json();
  const del = await one("DELETE FROM saved_items WHERE user_id=$1 AND kind=$2 AND ref_id=$3 RETURNING id", [u.id, String(kind), Number(id)]);
  if (del) return NextResponse.json({ saved: false });
  await one("INSERT INTO saved_items (user_id, kind, ref_id) VALUES ($1,$2,$3) RETURNING id", [u.id, String(kind), Number(id)]);
  return NextResponse.json({ saved: true });
}
