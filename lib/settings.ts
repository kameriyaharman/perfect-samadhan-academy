import { cache } from "react";
import { q } from "./db";

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await q<{ key: string; value: string }>("SELECT key, value FROM settings");
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  } catch {
    return {};
  }
});
