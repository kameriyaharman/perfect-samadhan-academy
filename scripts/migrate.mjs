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

  // One-time admin reset: set ADMIN_RESET_MOBILE + ADMIN_RESET_PASSWORD, deploy, then clear both variables.
  const rMobile = (process.env.ADMIN_RESET_MOBILE || "").replace(/\D/g, "").slice(-10);
  const rPass = process.env.ADMIN_RESET_PASSWORD || "";
  if (rMobile.length === 10 && rPass.length >= 8) {
    const hash = await bcrypt.hash(rPass, 10);
    const a = await client.query("SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1");
    if (a.rows.length) {
      const taken = await client.query("SELECT id FROM users WHERE mobile=$1 AND id<>$2", [rMobile, a.rows[0].id]);
      if (taken.rows.length) console.log("Admin reset skipped: mobile already used by another account");
      else { await client.query("UPDATE users SET mobile=$1, password=$2, blocked=false WHERE id=$3", [rMobile, hash, a.rows[0].id]); console.log("Admin login reset:", rMobile); }
    } else {
      await client.query("INSERT INTO users (name, mobile, password, role) VALUES ('Admin',$1,$2,'admin') ON CONFLICT (mobile) DO UPDATE SET role='admin', password=$2", [rMobile, hash]);
      console.log("Admin login reset:", rMobile);
    }
  }

  // Academy ke asli contact/social links — sirf tab lagenge jab setting abhi bhi demo/khaali ho (admin ke badlav overwrite nahi honge)
  const REAL = {
    youtube: "https://youtube.com/c/GsguruSk",
    instagram: "https://instagram.com/perfectsamadhan",
    facebook: "https://www.facebook.com/perfectsamadhanEdu/",
    telegram: "https://t.me/gsgurusktest",
    android_app: "https://play.google.com/store/apps/details?id=com.gjimkr.dldxgw",
    whatsapp_group: "https://chat.whatsapp.com/IIek3iKzOrhFu4ymdFaLjA",
    whatsapp: "917987149879",
    phone: "+91 79871 49879",
  };
  const DEMO = ["", "#", "919999999999", "https://chat.whatsapp.com/", "+91 98XXX XXXXX"];
  for (const [k, v] of Object.entries(REAL)) {
    await client.query("INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2 WHERE settings.value = ANY($3)", [k, v, DEMO]);
  }

  // Typing exam patterns — pehli baar default 4 pattern; uske baad admin "Typing Exam Patterns" se add/edit karega
  const tp = await client.query("SELECT count(*)::int AS n FROM typing_patterns");
  if (tp.rows[0].n === 0) {
    const P = [
      ["CPCT", "cpct", "MP State", "both", "remington", 15, "full", "error", 20, 30, "MP CPCT — Hindi Remington Gail Mangal / English", 1],
      ["SSC DEST (CHSL / CGL)", "ssc", "SSC", "both", "remington", 15, "full", "error", 30, 35, "SSC CHSL/CGL Data Entry Skill Test pattern", 2],
      ["High Court", "highcourt", "Court", "both", "remington", 10, "full", "none", 25, 30, "Court typing test — bina highlight", 3],
      ["Free Practice", "practice", "Practice", "both", "any", 5, "full", "error", 20, 30, "Apni speed par practice — koi bhi samay", 4],
    ];
    for (const r of P) await client.query(
      "INSERT INTO typing_patterns (name,slug,category,language,hindi_layout,duration,backspace,highlight,hindi_speed,english_speed,description,sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (slug) DO NOTHING", r);
    console.log("Typing patterns seeded");
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
