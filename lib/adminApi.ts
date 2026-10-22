import bcrypt from "bcryptjs";
import type { Resource } from "./resources";
import { one } from "./db";

export async function toRow(r: Resource, body: Record<string, any>, isCreate: boolean) {
  const out: Record<string, any> = {};
  for (const f of r.fields) {
    if (f.type === "datetime") continue;
    if (!(f.name in body)) continue;
    let v = body[f.name];
    if (f.type === "number" || f.type === "ref") v = v === "" || v == null || v === "none" ? null : Number(v);
    else if (f.type === "series") v = v == null || !String(v).trim() ? null : String(v).trim().slice(0, 120);
    else if (f.type === "includes") v = v == null || v === "" ? null : typeof v === "string" ? v : JSON.stringify(v);
    else if (f.type === "bool") v = v === true || v === "true" || v === "on" || v === 1;
    else if (f.type === "date") v = v ? String(v).slice(0, 10) : null;
    else if (f.type === "password") { if (!v) { if (isCreate) v = await bcrypt.hash(Math.random().toString(36), 10); else continue; } else v = await bcrypt.hash(String(v), 10); }
    else v = v == null ? null : String(v);
    if (f.required && (v === null || v === "")) throw new Error(`${f.label} zaroori hai`);
    out[f.name] = v;
  }
  if (isCreate) for (const f of r.fields) if (f.required && !(f.name in out) && f.type !== "password") throw new Error(`${f.label} zaroori hai`);
  // lesson ka layout hamesha uske folder jaisa (Hindi folder me Hindi lesson)
  if (r.key === "lessons" && out.folder_id) {
    const fo = await one("SELECT layout FROM lesson_folders WHERE id=$1", [out.folder_id]);
    if (fo) out.layout = fo.layout;
  }
  if (r.key === "lessons" && isCreate && !out.layout) throw new Error("Folder ya Layout chunein");
  return out;
}

/** Admin list ka WHERE (search + filters + test_id) — list aur bulk dono me same */
export function listWhere(r: Resource, sp: URLSearchParams | Record<string, any>) {
  const get = (k: string) => (sp instanceof URLSearchParams ? sp.get(k) : sp[k] != null ? String(sp[k]) : null);
  const where: string[] = []; const args: any[] = [];
  const s = get("q")?.trim();
  if (s && r.search?.length) { args.push(`%${s}%`); where.push("(" + r.search.map((c) => `${c}::text ILIKE $${args.length}`).join(" OR ") + ")"); }
  for (const f of r.filters || []) { const v = get(f.name); if (v) { args.push(v); where.push(`${f.name}=$${args.length}`); } }
  const fid = get("folder_id");
  if (fid && r.key === "lessons") { if (fid === "none") where.push("folder_id IS NULL"); else { args.push(Number(fid)); where.push(`folder_id=$${args.length}`); } }
  const tid = get("test_id");
  if (tid && r.key === "questions") { args.push(Number(tid)); where.push(`test_id=$${args.length}`); }
  return { sql: where.length ? "WHERE " + where.join(" AND ") : "", args };
}
