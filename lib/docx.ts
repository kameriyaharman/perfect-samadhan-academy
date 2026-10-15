import { inflateRawSync } from "zlib";

/** .docx (zip) se word/document.xml nikal kar har paragraph ki text lines deta hai — bina kisi extra package ke */
function unzipEntry(buf: Buffer, name: string): Buffer | null {
  // End of Central Directory
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && p + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const fname = buf.toString("utf8", p + 46, p + 46 + nlen);
    if (fname === name) {
      const lnlen = buf.readUInt16LE(local + 26), lxlen = buf.readUInt16LE(local + 28);
      const start = local + 30 + lnlen + lxlen;
      const data = buf.subarray(start, start + csize);
      return method === 0 ? Buffer.from(data) : inflateRawSync(data);
    }
    p += 46 + nlen + xlen + clen;
  }
  return null;
}

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s: string) => s.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (m, e) => (e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e] ?? m));

export function docxLines(buf: Buffer): string[] | null {
  const xml = unzipEntry(buf, "word/document.xml");
  if (!xml) return null;
  const s = xml.toString("utf8");
  const out: string[] = [];
  const paras = s.match(/<w:p[\s>][\s\S]*?<\/w:p>|<w:p\/>/g) || [];
  for (const p of paras) {
    let t = "";
    const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br(?:\s[^>]*)?\/>|<w:cr\/>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(p))) {
      if (m[1] !== undefined) t += decode(m[1]);
      else if (m[0].startsWith("<w:tab")) t += " ";
      else t += "\n";
    }
    for (const line of t.split("\n")) out.push(line.replace(/ /g, " ").replace(/[ \t]+/g, " ").trim());
  }
  return out;
}
