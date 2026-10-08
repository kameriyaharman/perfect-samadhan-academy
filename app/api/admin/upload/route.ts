import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "File nahi mili" }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "File 25MB se badi hai" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const r = await one("INSERT INTO uploads (filename, mime, size, data) VALUES ($1,$2,$3,$4) RETURNING id", [file.name.slice(0, 200), file.type || "application/octet-stream", file.size, buf]);
  const safe = encodeURIComponent(file.name.replace(/[^\w.\-]+/g, "_"));
  return NextResponse.json({ url: `/api/files/${r.id}/${safe}`, id: r.id });
}
