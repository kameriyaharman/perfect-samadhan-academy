import { one } from "@/lib/db";
export async function GET(_: Request, { params }: { params: { id: string; name: string } }) {
  const f = await one("SELECT filename, mime, data FROM uploads WHERE id=$1", [Number(params.id) || 0]);
  if (!f) return new Response("Not found", { status: 404 });
  const inline = /^(application\/pdf|image\/|video\/|text\/plain)/.test(f.mime);
  return new Response(f.data, { headers: { "Content-Type": f.mime, "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(f.filename)}"`, "Cache-Control": "public, max-age=31536000, immutable" } });
}
