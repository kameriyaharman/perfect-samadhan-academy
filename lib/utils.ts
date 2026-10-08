export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
export function initials(name: string) {
  return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(d: any, withYear = true) {
  if (!d) return "";
  const x = new Date(d);
  if (isNaN(x.getTime())) return String(d);
  return `${String(x.getDate()).padStart(2, "0")} ${MONTHS[x.getMonth()]}${withYear ? " " + x.getFullYear() : ""}`;
}
export function fmtDateTime(d: any) {
  const x = new Date(d);
  let h = x.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${fmtDate(x)}, ${h}:${String(x.getMinutes()).padStart(2, "0")} ${ap}`;
}
export function rupee(n: number | null | undefined) {
  if (n == null) return "";
  return "₹" + Number(n).toLocaleString("en-IN");
}
export function kfmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}
/** "a | b | c" lines -> string[][] */
export function pipeRows(s?: string | null): string[][] {
  if (!s) return [];
  return s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.split("|").map((x) => x.trim()));
}
export function lines(s?: string | null): string[] {
  if (!s) return [];
  return s.split("\n").map((l) => l.trim()).filter(Boolean);
}
/** "## Title | meta" followed by "- item" lines */
export function sections(s?: string | null): { title: string; meta: string; items: string[] }[] {
  const out: { title: string; meta: string; items: string[] }[] = [];
  for (const raw of (s || "").split("\n")) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith("##")) {
      const [t, m] = l.replace(/^#+/, "").split("|").map((x) => x.trim());
      out.push({ title: t, meta: m || "", items: [] });
    } else if (out.length) out[out.length - 1].items.push(l.replace(/^[-*]\s*/, ""));
  }
  return out;
}
export const COLORS: Record<string, { bg: string; text: string; grad: string; soft: string }> = {
  blue: { bg: "bg-brand-50", text: "text-brand", grad: "from-[#1f35b8] to-[#0e1756]", soft: "#eef1fd" },
  navy: { bg: "bg-indigo-50", text: "text-navy", grad: "from-[#121c63] to-[#0a1145]", soft: "#eef0fb" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", grad: "from-[#f28c0f] to-[#0e1756]", soft: "#fff4e5" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", grad: "from-[#c2710c] to-[#2a1d3a]", soft: "#fff7e0" },
  green: { bg: "bg-green-50", text: "text-green-700", grad: "from-[#16a34a] to-[#0e1756]", soft: "#eafaf0" },
  red: { bg: "bg-red-50", text: "text-red-600", grad: "from-[#e14b4b] to-[#2a1640]", soft: "#fdeeee" },
  purple: { bg: "bg-violet-50", text: "text-violet-700", grad: "from-[#7045d8] to-[#1c1a5a]", soft: "#f3eefe" },
  teal: { bg: "bg-cyan-50", text: "text-cyan-700", grad: "from-[#0e8aa8] to-[#0e1756]", soft: "#e8f7fb" },
};
export function color(c?: string | null) {
  return COLORS[c || "blue"] || COLORS.blue;
}
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2">$1</a>');
}
/** tiny markdown: ## headings, - lists, > tip, paragraphs, **bold**, [link](url) */
export function md(src?: string | null) {
  if (!src) return "";
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push("<ul>" + list.map((i) => `<li>${inline(i)}</li>`).join("") + "</ul>"); list = []; } };
  for (const raw of src.split("\n")) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    if (/^[-*]\s+/.test(l)) { list.push(l.replace(/^[-*]\s+/, "")); continue; }
    flush();
    if (l.startsWith("### ")) out.push(`<h3>${inline(l.slice(4))}</h3>`);
    else if (l.startsWith("## ")) out.push(`<h2 id="${encodeURIComponent(l.slice(3))}">${inline(l.slice(3))}</h2>`);
    else if (l.startsWith("# ")) out.push(`<h2>${inline(l.slice(2))}</h2>`);
    else if (l.startsWith("> ")) out.push(`<div class="tip">${inline(l.slice(2))}</div>`);
    else out.push(`<p>${inline(l)}</p>`);
  }
  flush();
  return out.join("\n");
}
export function headings(src?: string | null) {
  return (src || "").split("\n").filter((l) => l.trim().startsWith("## ")).map((l) => l.trim().slice(3));
}
