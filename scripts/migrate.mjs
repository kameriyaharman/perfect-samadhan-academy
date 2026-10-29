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

  // v2 seeds — sirf pehli baar (khaali table); uske baad admin panel se add/edit
  const cnt = async (t) => (await client.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;
  if ((await cnt("typing_categories")) === 0) {
    const C = [
      ["SSC", "landmark", "blue"], ["Court", "gavel", "navy"], ["RRB NTPC / GDCE", "train-front", "red"], ["CAPF HCM", "shield", "green"],
      ["Delhi NCR", "building-2", "purple"], ["MP State", "map-pin", "orange"], ["Bihar State", "map-pin", "teal"], ["UP State", "map-pin", "amber"],
      ["Rajasthan", "map-pin", "orange"], ["Jharkhand", "map-pin", "green"], ["Other States", "map", "blue"], ["AIIMS Tests", "stethoscope", "red"],
      ["Speed Booster", "gauge", "purple"], ["Practice", "keyboard", "navy"],
    ];
    for (let i = 0; i < C.length; i++) await client.query("INSERT INTO typing_categories (name, icon, color, sort) VALUES ($1,$2,$3,$4) ON CONFLICT (name) DO NOTHING", [...C[i], i + 1]);
    console.log("Typing categories seeded");
  }
  if ((await cnt("keywords")) === 0) {
    const T = [
      ["संख्या पद्धति / Number System", "Number System|संख्या पद्धति|Binary|Octal|Hexadecimal|बाइनरी"],
      ["कम्प्यूटर का परिचय / Introduction of Computers", "Introduction|परिचय|Generation|पीढ़ी|Father of Computer"],
      ["कम्प्यूटर मेमोरी / Computer Memory", "Memory|मेमोरी|RAM|ROM|Cache"],
      ["मेमोरी इकाई / Memory Units", "Memory Unit|इकाई|Byte|बाइट|KB|MB|GB|Nibble"],
      ["कम्प्यूटर हार्डवेयर / Computer Hardware", "Hardware|हार्डवेयर|Input|Output|CPU|Printer|Mouse|Keyboard"],
      ["कम्प्यूटर सॉफ्टवेयर एण्ड ओएस / Computer Software & OS", "Software|सॉफ्टवेयर|Operating System|ऑपरेटिंग सिस्टम|Linux"],
      ["कम्प्यूटर भाषा / Computer Language", "Language|भाषा|Compiler|Interpreter|Assembler|कंपाइलर"],
      ["कम्प्यूटर नेटवर्किंग / Computer Networking", "Network|नेटवर्क|LAN|WAN|MAN|Topology|टोपोलॉजी"],
      ["डाटा संचार / Data Communication", "Data Communication|संचार|Modem|Bandwidth|Transmission"],
      ["माइक्रोसॉफ्ट विंडोज / Microsoft Windows", "Windows|विंडोज|Desktop|Taskbar|Control Panel"],
      ["इंटरनेट / Internet", "Internet|इंटरनेट|Email|ईमेल|Browser|URL|WWW|HTTP"],
      ["नेटवर्क एवं साइबर सुरक्षा / Network & Cyber Security", "Security|सुरक्षा|Cyber|साइबर|Firewall|Hacking|Phishing"],
      ["कम्प्यूटर वायरस / Computer Virus", "Virus|वायरस|Antivirus|Malware|Worm|Trojan"],
      ["माइक्रोसॉफ्ट ऑफिस (एम एस वर्ड) / Microsoft Office (MS Word)", "MS Word|Word|वर्ड"],
      ["एम एस एक्सेल / MS Excel", "Excel|एक्सेल"],
      ["एम एस पावर पॉइंट / MS Power Point", "PowerPoint|Power Point|पावर पॉइंट|Slide|स्लाइड"],
      ["आईटी टेक्नोलॉजी / IT Technology", "IT|Technology|टेक्नोलॉजी|E-Governance|ई-गवर्नेंस"],
      ["एचटीएमएल / HTML", "HTML|एचटीएमएल|Tag|टैग"],
      ["मल्टीमीडिया / Multimedia", "Multimedia|मल्टीमीडिया|Audio|Video|Animation"],
      ["एम एस डॉस / MS-DOS", "DOS|डॉस"],
      ["लॉजिक गेट / Logic Gate", "Logic Gate|लॉजिक|गेट|AND|NAND|NOR|XOR"],
      ["ओपन ऑफिस राइटर / Open Office Writer", "Open Office|ओपन ऑफिस|Writer|राइटर|LibreOffice"],
      ["क्लाउड कम्प्यूटिंग / Cloud Computing", "Cloud|क्लाउड"],
      ["विविध / Miscellaneous", "Miscellaneous|विविध|Full Form|पूर्ण रूप|Abbreviation"],
    ];
    for (let i = 0; i < T.length; i++) await client.query("INSERT INTO keywords (label, terms, kind, sort) VALUES ($1,$2,'topic',$3)", [T[i][0], T[i][1], i + 1]);
    const P = ["Excel", "Word", "PowerPoint", "Network", "Printer", "Memory", "Windows", "Input", "Shortcut", "Email", "Virus", "Full Form"];
    for (let i = 0; i < P.length; i++) await client.query("INSERT INTO keywords (label, terms, kind, sort) VALUES ($1,$1,'popular',$2)", [P[i], i + 1]);
    console.log("Keywords seeded");
  }
  // v4: lesson folders — pehli baar har layout ka ek folder, purane lessons usme
  if ((await cnt("lesson_folders")) === 0) {
    const F = [["हिंदी Remington Gail — Basic Lessons", "remington", 1], ["हिंदी Inscript — Basic Lessons", "inscript", 2], ["English Typing — Basic Lessons", "english", 3]];
    for (const [name, layout, sort] of F) {
      const r = await client.query("INSERT INTO lesson_folders (name, layout, sort) VALUES ($1,$2,$3) RETURNING id", [name, layout, sort]);
      await client.query("UPDATE lessons SET folder_id=$1 WHERE folder_id IS NULL AND layout=$2", [r.rows[0].id, layout]);
    }
    console.log("Lesson folders seeded");
  }
  // v5: test / passage folders — pehli baar purane tests (subject / saal) aur passages (bhasha + exam) ke hisaab se
  if (!(await client.query("SELECT 1 FROM settings WHERE key='seed_v5_folders'")).rows.length) {
    const mk = async (scope, name, extra = {}) => {
      const r = await client.query("INSERT INTO folders (scope, name, exam_slug, language, sort) VALUES ($1,$2,$3,$4,$5) RETURNING id", [scope, name, extra.exam || null, extra.lang || null, extra.sort || 0]);
      return r.rows[0].id;
    };
    const topic = await client.query("SELECT exam_slug, COALESCE(NULLIF(subject,''),'Others') sub, min(sort) s FROM mock_tests WHERE kind='topic' AND folder_id IS NULL GROUP BY 1,2 ORDER BY 1, 3");
    for (const [i, t] of topic.rows.entries()) {
      const id = await mk("test:syllabus", t.sub, { exam: t.exam_slug, sort: i + 1 });
      await client.query("UPDATE mock_tests SET folder_id=$1 WHERE kind='topic' AND folder_id IS NULL AND exam_slug=$2 AND COALESCE(NULLIF(subject,''),'Others')=$3", [id, t.exam_slug, t.sub]);
    }
    const pyq = await client.query("SELECT m.exam_slug, m.year, COALESCE(max(e.code), upper(m.exam_slug)) code FROM mock_tests m LEFT JOIN exams e ON e.slug=m.exam_slug WHERE m.kind='pyq' AND m.folder_id IS NULL GROUP BY 1,2 ORDER BY 1, 2 DESC NULLS LAST");
    for (const [i, t] of pyq.rows.entries()) {
      const id = await mk("test:old", `${t.code} ${t.year || ""} Old Paper Tests`.replace(/\s+/g, " "), { exam: t.exam_slug, sort: i + 1 });
      await client.query("UPDATE mock_tests SET folder_id=$1 WHERE kind='pyq' AND folder_id IS NULL AND exam_slug=$2 AND year IS NOT DISTINCT FROM $3", [id, t.exam_slug, t.year]);
    }
    const pas = await client.query("SELECT language, COALESCE(NULLIF(exam,''),'General') ex FROM passages WHERE folder_id IS NULL GROUP BY 1,2 ORDER BY 1,2");
    for (const [i, p] of pas.rows.entries()) {
      const id = await mk("passage", `${p.language === "english" ? "English" : "हिंदी"} — ${p.ex} Passages`, { lang: p.language, sort: i + 1 });
      await client.query("UPDATE passages SET folder_id=$1 WHERE folder_id IS NULL AND language=$2 AND COALESCE(NULLIF(exam,''),'General')=$3", [id, p.language, p.ex]);
    }
    await client.query("INSERT INTO settings (key, value) VALUES ('seed_v5_folders','1') ON CONFLICT (key) DO NOTHING");
    console.log("Test / passage folders seeded");
  }
  // Software downloads (client list) — naam se check, dobara nahi judega
  const SW = [
    ["Microsoft Indic Input 2 — Hindi", "Windows XP / 7 ke liye Hindi Remington Gail & Inscript typing tool", "Software", "keyboard", "orange", "32 bit", null],
    ["Microsoft Indic Input 3 — Hindi (32 bit)", "Windows 7 / 8 / 10 / 11 (32 bit) — CPCT Remington Gail Mangal typing", "Software", "keyboard", "blue", "32 bit", null],
    ["Microsoft Indic Input 3 — Hindi (64 bit)", "Windows 7 / 8 / 10 / 11 (64 bit) — CPCT Remington Gail Mangal typing", "Software", "keyboard", "navy", "64 bit", null],
    ["Google Input Tools — Hindi", "Offline Google Hindi Input Tool (phonetic typing) — Windows", "Software", "type", "green", "Windows", "https://drive.google.com/file/d/1Q62GMMRhonFoK9a4hzl9sx3AfLRcTu4q/view"],
  ];
  const swDone = (await client.query("SELECT 1 FROM settings WHERE key='seed_v2_downloads'")).rows.length;
  for (let i = 0; !swDone && i < SW.length; i++) {
    const [title, description, category, icon, color, version, url] = SW[i];
    const ex = await client.query("SELECT id FROM downloads WHERE title=$1", [title]);
    if (!ex.rows.length) await client.query("INSERT INTO downloads (title, description, category, icon, color, version, file_url, size, sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [title, description, category, icon, color, version, url, url ? "Free" : "", 100 + i]);
  }
  if (!swDone) await client.query("INSERT INTO settings (key, value) VALUES ('seed_v2_downloads','1') ON CONFLICT (key) DO NOTHING");

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
