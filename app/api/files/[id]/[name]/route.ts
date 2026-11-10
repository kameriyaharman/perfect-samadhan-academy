import { one } from "@/lib/db";
export async function GET(req: Request, { params }: { params: { id: string; name: string } }) {
  const f = await one("SELECT filename, mime, data FROM uploads WHERE id=$1", [Number(params.id) || 0]);
  if (!f) return new Response("Not found", { status: 404 });
  const inline = /^(application\/pdf|image\/|video\/|audio\/|text\/plain)/.test(f.mime);
  const data: Buffer = f.data;
  const base = { "Content-Type": f.mime, "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(f.filename)}"`, "Cache-Control": "public, max-age=31536000, immutable", "Accept-Ranges": "bytes" };
  // video/audio me aage-peeche (seek) ke liye byte range
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") || "");
  if (m && data.length) {
    let start = m[1] ? Number(m[1]) : data.length - Number(m[2] || 0);
    let end = m[1] && m[2] ? Number(m[2]) : data.length - 1;
    start = Math.max(0, start); end = Math.min(end, data.length - 1);
    if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${data.length}` } });
    return new Response(data.subarray(start, end + 1), { status: 206, headers: { ...base, "Content-Range": `bytes ${start}-${end}/${data.length}`, "Content-Length": String(end - start + 1) } });
  }
  return new Response(data, { headers: { ...base, "Content-Length": String(data.length) } });
}
