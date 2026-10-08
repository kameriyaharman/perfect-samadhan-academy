import pg from "pg";
import bcrypt from "bcryptjs";
import { SCHEMA } from "./schema.mjs";
import { seed } from "./seed.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing — skipping migrations");
  process.exit(0);
}
const ssl = /railway\.internal|localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false };
const client = new pg.Client({ connectionString: url, ssl });

async function main() {
  for (let i = 0; i < 10; i++) {
    try { await client.connect(); break; } catch (e) {
      console.log("DB not ready, retrying...", e.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  await client.query(SCHEMA);
  console.log("Schema ready");

  // admin account
  const adminMobile = process.env.ADMIN_MOBILE || "9999999999";
  const adminPass = process.env.ADMIN_PASSWORD || "admin@123";
  const ex = await client.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (!ex.rows.length) {
    const hash = await bcrypt.hash(adminPass, 10);
    await client.query(
      "INSERT INTO users (name, mobile, password, role) VALUES ($1,$2,$3,'admin') ON CONFLICT (mobile) DO UPDATE SET role='admin', password=$3",
      ["Admin", adminMobile, hash]
    );
    console.log("Admin created:", adminMobile);
  }

  const c = await client.query("SELECT count(*)::int AS n FROM exams");
  if (c.rows[0].n === 0) {
    console.log("Seeding demo content...");
    await seed(client);
    console.log("Seed complete");
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
