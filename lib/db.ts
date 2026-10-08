import { Pool, types } from "pg";

types.setTypeParser(1082, (v: string) => v);

const g = globalThis as unknown as { __pgPool?: Pool };
function makePool() {
  const url = process.env.DATABASE_URL || "";
  const ssl = /railway\.internal|localhost|127\.0\.0\.1/.test(url) || !url ? false : { rejectUnauthorized: false };
  return new Pool({ connectionString: url, ssl, max: 10 });
}
export const pool = g.__pgPool || (g.__pgPool = makePool());

export async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const r = await pool.query(sql, params);
  return r.rows as T[];
}
export async function one<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const r = await pool.query(sql, params);
  return (r.rows[0] as T) || null;
}
