import bcrypt from "bcryptjs";
import type { Resource } from "./resources";

export async function toRow(r: Resource, body: Record<string, any>, isCreate: boolean) {
  const out: Record<string, any> = {};
  for (const f of r.fields) {
    if (f.type === "datetime") continue;
    if (!(f.name in body)) continue;
    let v = body[f.name];
    if (f.type === "number") v = v === "" || v == null ? null : Number(v);
    else if (f.type === "bool") v = v === true || v === "true" || v === "on" || v === 1;
    else if (f.type === "date") v = v ? String(v).slice(0, 10) : null;
    else if (f.type === "password") { if (!v) { if (isCreate) v = await bcrypt.hash(Math.random().toString(36), 10); else continue; } else v = await bcrypt.hash(String(v), 10); }
    else v = v == null ? null : String(v);
    if (f.required && (v === null || v === "")) throw new Error(`${f.label} zaroori hai`);
    out[f.name] = v;
  }
  if (isCreate) for (const f of r.fields) if (f.required && !(f.name in out) && f.type !== "password") throw new Error(`${f.label} zaroori hai`);
  return out;
}
