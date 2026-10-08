import { BANK } from "./seed-questions.mjs";

async function ins(client, table, rows) {
  if (!rows.length) return [];
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const ids = [];
  const chunk = 200;
  for (let i = 0; i < rows.length; i += chunk) {
    const part = rows.slice(i, i + chunk);
    const vals = [];
    const ph = part.map((r, ri) =>
      "(" + cols.map((c) => { if (r[c] === undefined) return "DEFAULT"; vals.push(r[c]); return "$" + vals.length; }).join(",") + ")"
    );
    const res = await client.query(`INSERT INTO ${table} (${cols.join(",")}) VALUES ${ph.join(",")} RETURNING id`, vals);
    ids.push(...res.rows.map((x) => x.id));
  }
  return ids;
}

const L = (...lines) => lines.join("\n");

function qRow(b, testId, sort) {
  const [section, topic, hi, en, oh, oe, ans, exp, kw] = b;
  const o = oe || oh;
  return {
    test_id: testId, section, topic, text_hi: hi, text_en: en,
    opt_a_hi: oh[0], opt_b_hi: oh[1], opt_c_hi: oh[2], opt_d_hi: oh[3],
    opt_a_en: o[0], opt_b_en: o[1], opt_c_en: o[2], opt_d_en: o[3],
    answer: "ABCD"[ans], explanation: exp, keywords: kw, sort,
  };
}

function shuffle(arr, seed) {
  const a = arr.slice();
  let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SECTION_ORDER = ["Computer", "Reading Comprehension", "Maths", "Reasoning", "General Awareness"];
function fullPaper(seed, filter) {
  const pool = filter ? BANK.filter(filter) : BANK;
  const out = [];
  for (const sec of SECTION_ORDER) {
    const items = pool.filter((b) => b[0] === sec);
    out.push(...(sec === "Reading Comprehension" ? items : shuffle(items, seed)));
  }
  return out;
}

export async function seed(client) {
  // ---------------- SETTINGS ----------------
  const settings = {
    site_name: "परफेक्ट समाधान एकेडमी",
    site_name_en: "PERFECT SAMADHAN ACADEMY",
    tagline: "सफलता की उड़ान – परफेक्ट समाधान",
    phone: "+91 98XXX XXXXX",
    whatsapp: "919999999999",
    whatsapp_group: "https://chat.whatsapp.com/",
    email: "info@perfectsamadhanacademy.in",
    hours: "8 AM – 8 PM",
    hours_full: "Mon–Sat · 8 AM – 8 PM",
    address: "Perfect Samadhan Academy, Main Road (poora pata admin panel se badlein)",
    map_embed: "",
    facebook: "#", youtube: "#", instagram: "#", telegram: "#",
    android_app: "#",
    footer_about: "Sarkari pariksha ki tayari ke liye Mock Tests, Typing Test aur Study Material ka bharosemand platform.",
    hero_badge: "MP ke 12,000+ students ka bharosa",
    hero_title_1: "सरकारी परीक्षा की",
    hero_title_2: "पूरी तैयारी,",
    hero_title_3: "एक ही जगह",
    hero_subtitle: "CPCT, SSC, Patwari, Police, Court & Steno — Mock Tests, Hindi/English Typing Test, Notes PDF aur Previous Year Papers. Real exam jaisa practice, instant result.",
    stat_1: "150+|Mock Tests", stat_2: "500+|Notes & PDFs", stat_3: "10 साल|PYQ Papers", stat_4: "4.8★|Student Rating",
    cta_title: "आज से तैयारी शुरू करें — बिल्कुल Free",
    cta_subtitle: "Register karein aur paayein 10 free mock tests + unlimited typing practice",
    about_story: "Perfect Samadhan Academy ki shuruaat is soch se hui ki chhote shahron ke vidyarthiyon ko bhi bade shahron jaisi achhi coaching aur practice mile. Aaj hum offline classroom, computer lab aur online platform — teeno ke zariye CPCT, typing aur sarkari exams ki tayari karwate hain.",
    about_students: "12,000+", about_selections: "2,500+", about_years: "8 saal",
    mission: "Har vidyarthi tak sasti aur behtar tayari pahunchana.",
    vision: "Pradesh ka sabse bharosemand exam preparation platform banna.",
    values: "Imaandari, mehnat aur har student par vyaktigat dhyan.",
    weekly_rewards: "Har hafte top 3 ko free Premium Test Series aur digital certificate.",
    install_help: "Android app install karte waqt phone \"Allow from this source\" pooch sakta hai — ise allow karein. Indic Input install ke baad Language bar se Hindi chunein.",
    privacy_policy: "## Privacy Policy\n\nHum aapka naam, mobile number aur email sirf account, result aur sevaon ke liye istemal karte hain. Aapki jaankari kisi teesre paksh ko bechi nahi jaati.\n\n## Cookies\n\nLogin banaye rakhne ke liye ek suraksit cookie ka upyog hota hai.",
    terms: "## Terms & Conditions\n\nWebsite ki saamagri sirf vyaktigat adhyayan ke liye hai. Premium content ko share ya resell karna mana hai.",
    disclaimer: "## Disclaimer\n\nExam se judi jaankari official notification par aadharit hai. Antim jaankari ke liye sambandhit vibhag ki official website dekhein.",
    refund_policy: "## Refund Policy\n\nCourse fees par 7 din ke andar refund request kiya ja sakta hai. Digital test series activate hone ke baad refund nahi hota.",
    payment_note: "UPI (PhonePe, GPay, Paytm) · Debit/Credit Card · Net Banking · Razorpay se surakshit payment",
    upi_id: "",
  };
  for (const [k, v] of Object.entries(settings)) {
    await client.query("INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING", [k, v]);
  }

  // ---------------- EXAMS ----------------
  const cpctSyllabus = L(
    "## Computer Proficiency & IT Skills | 52 Q",
    "- Computer basics, hardware, software", "- Windows & file management", "- MS Word, Excel, PowerPoint", "- Internet, Email, Networking", "- Cyber security, e-Governance",
    "## Reading Comprehension | 5 Q", "- Passage padh kar sawal", "- Hindi / English dono",
    "## Quantitative Aptitude | 6 Q", "- Number system, BODMAS", "- Percentage, Ratio, Average", "- Probability, Time & Work",
    "## General Mental Ability & Reasoning | 6 Q", "- Series, Analogy", "- Coding-Decoding", "- Blood relation, Direction",
    "## General Awareness | 6 Q", "- MP GK, Bharat GK", "- Current affairs", "- Computer awareness",
    "## Typing Test | 0 Q", "- English typing — 15 min", "- Hindi typing — 15 min", "- Min: Eng 30 NWPM · Hindi 20 NWPM"
  );
  const exams = [
    { slug: "cpct", code: "CPCT", name: "MP CPCT", body: "MAP_IT", category: "MP", color: "blue", tag: "Most Popular",
      description: "Computer Proficiency Certification Test — MP sarkari naukri (clerk, DEO, steno, etc.) ke liye zaroori. Pattern, fee, eligibility aur apply karne ke steps.",
      overview: "CPCT Madhya Pradesh sarkar ka computer proficiency test hai. Ise MAP_IT conduct karta hai. Iska scorecard MP ke kai sarkari padon par bharti ke liye anivarya hai.",
      pattern: L("MCQ (Computer, RC, Maths, Reasoning, GK) | 75 | 75 min | Score card (no pass/fail)", "English Typing | — | 15 min | 30 NWPM", "Hindi Typing | — | 15 min | 20 NWPM"),
      syllabus: cpctSyllabus,
      eligibility: "Kisi bhi manyata prapt board se 12vi pass ya samkaksh. Koi upper age limit nahi. MP ke sthaniya nivasi aur anya rajyon ke ummidvar dono apply kar sakte hain.",
      how_to_apply: L("Official site par register karein | cpct.mp.gov.in par jaakar naya registration", "Documents upload karein | Photo, signature, marksheet", "Fee bharein | ₹660 (GST sahit) — online ya MP Online kiosk", "Exam centre chunein aur submit karein | Confirmation page print kar lein"),
      admit_card: "Admit card exam se lagbhag 7–10 din pehle cpct.mp.gov.in par jaari hota hai. Application number aur janm tithi se download karein.",
      result_info: "Result/scorecard exam ke lagbhag 3–4 hafte baad jaari hota hai. Scorecard 7 saal tak valid rehta hai.",
      guide: L("## Week 1 | Computer Basics", "- Computer Basics Test", "- Input–Output Devices", "- Hardware–Software", "## Week 2 | MS Office", "- MS Word & Excel", "- Shortcut Keys", "- Topic tests roz", "## Week 3 | Internet + Baaki Sections", "- Internet & Email", "- Maths, Reasoning, GK", "- PYQ papers", "## Week 4 | Full Mocks + Typing", "- Roz 1 full mock", "- 15+15 min typing test", "- Weak topic revision"),
      important_dates: L("Application start | 18 Oct 2026", "Last date | 01 Nov 2026", "Admit card | 05 Nov 2026", "Exam | 21–23 Nov 2026", "Result | Dec 2026"),
      fee: "₹660", next_exam: "21–23 Nov 2026", validity: "7 saal", official_url: "https://cpct.mp.gov.in",
      typing_language: "Hindi + English", typing_layout: "Inscript / Remington", typing_time: "15 + 15 min", typing_speed: "Eng 30 · Hindi 20 NWPM",
      show_in_typing: true, students: 4200, sort: 1 },
    { slug: "ssc-chsl", code: "SSC", name: "SSC CHSL", body: "SSC", category: "Central", color: "orange", tag: "Typing", description: "Staff Selection Commission — Combined Higher Secondary Level (LDC, JSA, DEO).", typing_language: "English / Hindi", typing_layout: "Any", typing_time: "15 min", typing_speed: "35 / 30 WPM", show_in_typing: true, students: 2100, sort: 2,
      pattern: L("Tier 1 (CBT) | 100 | 60 min | Qualifying + merit", "Tier 2 (CBT + Skill) | — | — | Merit", "Typing / DEST | — | 15 min | 35 Eng / 30 Hindi WPM") },
    { slug: "ssc-cgl", code: "SSC", name: "SSC CGL", body: "SSC", category: "Central", color: "orange", description: "Combined Graduate Level exam — graduate level posts.", students: 1900, sort: 3 },
    { slug: "mp-patwari", code: "PAT", name: "MP Patwari", body: "MPESB", category: "MP", color: "green", tag: "New", description: "MP Patwari bharti — CPCT based selection.", typing_language: "Hindi", typing_layout: "Inscript", typing_time: "15 min", typing_speed: "CPCT score", show_in_typing: true, students: 1850, sort: 4 },
    { slug: "mp-police", code: "POL", name: "MP Police Constable", body: "MPESB", category: "MP", color: "red", tag: "Free", description: "MP Police Constable bharti pariksha.", students: 1500, sort: 5 },
    { slug: "high-court", code: "HC", name: "MP High Court Asst.", body: "MPHC", category: "MP", color: "purple", tag: "Typing", description: "High Court Assistant / Steno — Hindi & English typing.", typing_language: "Hindi + English", typing_layout: "Remington Gail", typing_time: "10 min", typing_speed: "As per notification", show_in_typing: true, students: 960, sort: 6 },
    { slug: "steno", code: "STN", name: "Stenographer", body: "MPESB / SSC", category: "Typing", color: "teal", description: "Stenographer exams — shorthand + typing.", students: 600, sort: 7 },
    { slug: "railway-ntpc", code: "RLY", name: "Railway NTPC", body: "RRB", category: "Central", color: "blue", tag: "New", description: "RRB NTPC — JA / Clerk posts with typing skill test.", typing_language: "English / Hindi", typing_layout: "Any", typing_time: "10 min", typing_speed: "35 / 30 WPM", show_in_typing: true, students: 1200, sort: 8 },
    { slug: "railway-group-d", code: "RLY", name: "Railway Group D", body: "RRB", category: "Central", color: "blue", description: "RRB Group D bharti.", students: 1100, sort: 9 },
    { slug: "lekha-prashikshan", code: "LEKHA", name: "Lekha Prashikshan", body: "MP Govt", category: "MP", color: "orange", description: "MP Lekha Prashikshan pariksha.", students: 400, sort: 10 },
    { slug: "ibps-clerk", code: "BANK", name: "IBPS Clerk", body: "IBPS", category: "Central", color: "green", tag: "Soon", description: "Bank Clerk (IBPS).", students: 800, sort: 11 },
    { slug: "rajasthan-ldc", code: "RSMSSB", name: "Rajasthan LDC", body: "RSMSSB", category: "Rajasthan", color: "red", description: "Rajasthan LDC / Clerk — Krutidev / Remington Hindi typing.", typing_language: "Hindi", typing_layout: "Krutidev / Remington", typing_time: "10 min", typing_speed: "25 WPM", show_in_typing: true, students: 700, sort: 12 },
  ];
  for (const e of exams) {
    if (!e.pattern) e.pattern = L("MCQ | 100 | 90 min | Merit");
    if (!e.syllabus) e.syllabus = L("## General Knowledge | 25 Q", "- Bharat & Rajya GK", "- Current affairs", "## Computer | 25 Q", "- Computer basics, MS Office", "## Maths | 25 Q", "- Arithmetic", "## Reasoning | 25 Q", "- Series, Coding, Analogy");
  }
  await ins(client, "exams", exams);

  // ---------------- MOCK TESTS ----------------
  const cpctInstr = L("Screen ke upar-daayein kone par timer dikhega. Samay khatam hone par test apne aap submit ho jayega.", "Question palette me rang question ki sthiti batate hain — Answered (hara), Not Answered (laal), Marked (baingani).", "Kisi bhi samay Hindi / English bhasha badal sakte hain.", "\"Save & Next\" dabane par hi uttar save hoga.", "Section tabs se ek section se doosre section me ja sakte hain.");
  async function makeTest(t, qs) {
    const [id] = await ins(client, "mock_tests", [t]);
    await ins(client, "questions", qs.map((b, i) => qRow(b, id, i)));
    return id;
  }
  for (let n = 1; n <= 15; n++) {
    await makeTest({ title: `CPCT Full Mock Test ${String(n).padStart(2, "0")}`, exam_slug: "cpct", kind: "full", duration: 75, pass_marks: 38, is_free: n <= 10, instructions: cpctInstr, sort: n }, fullPaper(n));
  }
  const others = [["ssc-chsl", "SSC CHSL Mock Test", 4, 60], ["ssc-cgl", "SSC CGL Mock Test", 2, 60], ["mp-patwari", "MP Patwari Mock Test", 4, 120], ["mp-police", "MP Police Mock Test", 3, 120], ["high-court", "High Court Assistant Mock", 3, 90], ["railway-ntpc", "Railway NTPC Mock", 3, 90], ["railway-group-d", "Railway Group D Mock", 2, 90], ["lekha-prashikshan", "Lekha Prashikshan Mock", 2, 90], ["ibps-clerk", "IBPS Clerk Mock", 2, 60], ["rajasthan-ldc", "Rajasthan LDC Mock", 2, 90], ["steno", "Steno Mock", 2, 60]];
  for (const [slug, title, cnt, dur] of others) {
    for (let n = 1; n <= cnt; n++) await makeTest({ title: `${title} ${String(n).padStart(2, "0")}`, exam_slug: slug, kind: "full", duration: dur, is_free: n <= 2, instructions: cpctInstr, sort: n }, fullPaper(n + 20));
  }
  // subject-wise
  const subjects = [["Computer", "Computer"], ["Reading Comprehension", "Reading Comprehension"], ["Maths", "Maths"], ["Reasoning", "Reasoning"], ["General Awareness", "General Awareness"]];
  let s = 1;
  for (const [title, sec] of subjects) {
    await makeTest({ title: `CPCT ${title} — Subject Test`, exam_slug: "cpct", kind: "subject", subject: title, duration: 30, is_free: true, sort: s++ }, BANK.filter((b) => b[0] === sec));
  }
  // topic-wise
  const topicMap = [
    ["Computer Fundamentals", [["History & Generations", ["History"]], ["Hardware & Software", ["Hardware Software"]], ["Input / Output Devices", ["Input Output"]], ["Memory", ["Memory"]], ["Number System", ["Number System"]]]],
    ["Operating System", [["Windows Basics", ["Operating System"]], ["File Management", ["Operating System"]], ["Shortcut Keys", ["Operating System", "MS Word"]]]],
    ["MS Word", [["Formatting & Shortcuts", ["MS Word"]], ["Mail Merge & Tools", ["MS Word"]]]],
    ["MS Excel", [["Formulas", ["MS Excel"]], ["Functions", ["MS Excel"]], ["Shortcuts", ["MS Excel"]]]],
    ["MS PowerPoint", [["Slides & Design", ["MS PowerPoint"]], ["Slide Show", ["MS PowerPoint"]]]],
    ["Internet & Email", [["Browsers & URL", ["Internet"]], ["Email", ["Email"]], ["Cyber Security", ["Cyber Security"]], ["e-Governance", ["e-Governance", "Internet"]]]],
    ["Networking", [["Types of Network", ["Networking"]], ["Topology & Devices", ["Networking"]]]],
    ["Maths · Reasoning · GK", [["Ratio & %", ["Ratio", "Percentage"]], ["BODMAS & Average", ["BODMAS", "Average"]], ["Probability & Time-Work", ["Probability", "Time Work", "Number System"]], ["Series", ["Series"]], ["Coding-Decoding & Analogy", ["Coding-Decoding", "Analogy"]], ["Blood Relation & Direction", ["Blood Relation", "Direction"]], ["MP GK", ["MP GK", "Bharat GK", "Computer Awareness"]]]],
  ];
  let t = 1;
  for (const [subject, topics] of topicMap) {
    for (const [topic, keys] of topics) {
      let qs = BANK.filter((b) => keys.includes(b[1]) && (subject !== "Computer Fundamentals" || b[0] === "Computer" || keys.includes("Number System")));
      if (subject === "Maths · Reasoning · GK") qs = BANK.filter((b) => keys.includes(b[1]) && b[0] !== "Computer");
      if (!qs.length) continue;
      await makeTest({ title: `${topic} — Topic Test`, exam_slug: "cpct", kind: "topic", subject, topic, duration: Math.max(5, qs.length), is_free: true, sort: t++ }, qs);
    }
  }
  // PYQ online tests
  const pyqSessions = [[2025, ["Nov", "Sep", "Jun", "Mar"]], [2024, ["Dec", "Aug", "May", "Feb"]], [2023, ["Nov", "Jul", "Mar"]]];
  let p = 1;
  const pyqIds = {};
  for (const [year, months] of pyqSessions) {
    for (const m of months) {
      for (const sh of [1, 2]) {
        const id = await makeTest({ title: `CPCT ${m} ${year} · Shift ${sh}`, exam_slug: "cpct", kind: "pyq", year, session: `${m} ${year} · Shift ${sh}`, duration: 75, is_free: year < 2025 || sh === 1, instructions: cpctInstr, sort: p++ }, fullPaper(year + sh + m.length));
        if (sh === 1) pyqIds[`${m} ${year}`] = id;
      }
    }
  }
  for (const slug of ["mp-patwari", "mp-police", "ssc-chsl", "high-court"]) {
    for (const [year, sess] of [[2025, "Jan 2025"], [2023, "Mar 2023"]]) {
      await makeTest({ title: `${slug.toUpperCase().replace("-", " ")} ${sess} Paper`, exam_slug: slug, kind: "pyq", year, session: sess, duration: 90, is_free: true, sort: p++ }, fullPaper(year));
    }
  }

  // ---------------- PASSAGES ----------------
  const hiTexts = [
    ["भारत की विविधता", "भारत एक विशाल देश है जहाँ अनेक भाषाएँ, धर्म और संस्कृतियाँ एक साथ फलती-फूलती हैं। सरकारी परीक्षाओं की तैयारी करने वाले विद्यार्थियों के लिए नियमित अभ्यास ही सफलता की कुंजी है। प्रतिदिन कम से कम तीस मिनट टाइपिंग का अभ्यास करने से गति और शुद्धता दोनों में सुधार होता है। परीक्षा के समय शांत मन से काम करना और समय का सही उपयोग करना भी उतना ही ज़रूरी है। जो विद्यार्थी धैर्य के साथ प्रतिदिन अभ्यास करते हैं, वे निश्चित रूप से अपने लक्ष्य को प्राप्त करते हैं।"],
    ["डिजिटल साक्षरता", "मध्यप्रदेश सरकार ने ग्रामीण क्षेत्रों में डिजिटल साक्षरता बढ़ाने के लिए अनेक योजनाएँ शुरू की हैं। इन योजनाओं के माध्यम से युवाओं को कंप्यूटर का बुनियादी ज्ञान दिया जा रहा है। आज के समय में कंप्यूटर का ज्ञान हर क्षेत्र में आवश्यक हो गया है। बैंक, कार्यालय, विद्यालय और अस्पताल सभी जगह कंप्यूटर का उपयोग हो रहा है। डिजिटल भुगतान और ऑनलाइन सेवाओं ने आम नागरिक के जीवन को सरल बना दिया है।"],
    ["पर्यावरण संरक्षण", "पर्यावरण की रक्षा करना हम सभी का कर्तव्य है। बढ़ते प्रदूषण के कारण वायु, जल और भूमि तीनों प्रभावित हो रहे हैं। वृक्षारोपण, जल संरक्षण और प्लास्टिक का कम उपयोग करके हम प्रकृति को बचा सकते हैं। सरकार ने स्वच्छ भारत अभियान के द्वारा लोगों को स्वच्छता के प्रति जागरूक किया है। यदि प्रत्येक नागरिक अपनी ज़िम्मेदारी समझे तो आने वाली पीढ़ियों को स्वस्थ वातावरण मिल सकेगा।"],
    ["किसान और कृषि", "भारत एक कृषि प्रधान देश है और यहाँ की अधिकांश जनसंख्या खेती पर निर्भर है। आधुनिक तकनीक और उन्नत बीजों के उपयोग से फसलों की पैदावार में वृद्धि हुई है। सरकार किसानों को सम्मान निधि, फसल बीमा और सिंचाई सुविधाएँ प्रदान कर रही है। मृदा परीक्षण से किसान यह जान पाते हैं कि उनकी भूमि के लिए कौन-सी खाद उपयुक्त है। किसान की समृद्धि ही देश की समृद्धि का आधार है।"],
    ["शिक्षा का महत्व", "शिक्षा मनुष्य के जीवन का सबसे महत्वपूर्ण आधार है। शिक्षित व्यक्ति न केवल अपना बल्कि पूरे समाज का विकास करता है। नई शिक्षा नीति में कौशल विकास और व्यावहारिक ज्ञान पर विशेष ज़ोर दिया गया है। ऑनलाइन कक्षाओं ने दूर-दराज़ के विद्यार्थियों तक गुणवत्तापूर्ण शिक्षा पहुँचाई है। हमें शिक्षा को केवल नौकरी पाने का साधन नहीं बल्कि अच्छा नागरिक बनने का माध्यम मानना चाहिए।"],
    ["स्वास्थ्य और योग", "स्वस्थ शरीर में ही स्वस्थ मन का निवास होता है। नियमित योग और व्यायाम से शरीर ऊर्जावान और मन प्रसन्न रहता है। संतुलित आहार, पर्याप्त नींद और स्वच्छ पानी अच्छे स्वास्थ्य के लिए आवश्यक हैं। अंतरराष्ट्रीय योग दिवस ने पूरे विश्व में भारत की इस प्राचीन विद्या को लोकप्रिय बनाया है। विद्यार्थियों को पढ़ाई के साथ-साथ अपने स्वास्थ्य का भी ध्यान रखना चाहिए।"],
  ];
  const enTexts = [
    ["Indian Economy", "easy", "The Indian economy has shown remarkable resilience over the last decade. Digital payments, improved road networks and a growing manufacturing sector have created new jobs for young people. However, skill development remains the biggest challenge, and candidates preparing for government examinations must focus on accuracy as much as speed."],
    ["Digital Services", "medium", "Technology has changed the way citizens interact with the government. Online services for certificates, land records and bill payments have reduced the need to visit offices. Every district now has common service centres where trained operators help people fill forms, pay fees and download important documents within minutes."],
    ["Importance of Practice", "easy", "Typing is a skill that improves only with regular practice. Sit straight, keep your fingers on the home row and look at the screen instead of the keyboard. In the beginning, focus on accuracy and do not worry about speed. Within a few weeks, your speed will increase naturally and your errors will reduce."],
    ["Water Conservation", "medium", "Water is one of the most precious natural resources on our planet. Rapid urbanisation and careless use have put enormous pressure on rivers, lakes and groundwater. Rainwater harvesting, drip irrigation and the repair of leaking pipes are simple steps that can save millions of litres every year if communities act together."],
    ["Public Health", "exam", "A healthy population is the foundation of a productive nation. The government has expanded primary health centres, launched insurance schemes for poor families and promoted vaccination campaigns across the country. Awareness about hygiene, balanced diet and regular exercise is equally important, because prevention is always better and cheaper than cure."],
    ["Role of Youth", "exam", "The youth of a country are its greatest strength. With energy, fresh ideas and the willingness to learn, young people can transform society. Start-ups, innovation in agriculture and participation in social service show that Indian youth are ready to take responsibility. Proper guidance, quality education and employment opportunities will help them achieve their full potential."],
  ];
  const passages = [];
  hiTexts.forEach(([title, text], i) => passages.push({ title, language: "hindi", level: i < 2 ? "exam" : i < 4 ? "medium" : "easy", text }));
  enTexts.forEach(([title, level, text]) => passages.push({ title, language: "english", level, text }));
  const sessions = [[2026, "Sep 2026"], [2025, "Nov 2025"], [2025, "Sep 2025"], [2025, "Jun 2025"], [2024, "Dec 2024"], [2024, "Aug 2024"], [2023, "Nov 2023"], [2023, "Mar 2023"], [2022, "Dec 2022"]];
  let k = 0;
  for (const [year, sess] of sessions) {
    for (const sh of ["Shift 1", "Shift 2", "Shift 3"]) {
      const h = hiTexts[k % hiTexts.length], e = enTexts[k % enTexts.length];
      passages.push({ title: `CPCT ${sess} · ${sh} (Hindi)`, language: "hindi", level: "exam", exam: "CPCT", year, session: sess, shift: sh, text: h[1] });
      passages.push({ title: `CPCT ${sess} · ${sh} (English)`, language: "english", level: "exam", exam: "CPCT", year, session: sess, shift: sh, text: e[2] });
      k++;
    }
  }
  await ins(client, "passages", passages);

  // ---------------- LESSONS ----------------
  const lessons = [];
  const rem = [
    ["Home Row — बाएँ हाथ", "ं े क ि — finger position seekhein", "ं े क ं े क क े ं कं के कि"],
    ["Home Row — दाएँ हाथ", "र क त च — J par index finger", "ह ी र ा स य हर सर यह रास"],
    ["Home Row — पूरे शब्द", "कर, तक, चल, पर...", "कर सका हार सार राह यार कहा रहा"],
    ["Upper Row — बाएँ हाथ", "ु ू म त ज", "म त ज मत जम तम मजा तमाम"],
    ["Upper Row — दाएँ हाथ", "ब ह ग द ज ड", "ल न प व च लव नल पल चल वन"],
    ["Lower Row", "ग ब अ इ द उ ए", "ग ब अ इ द उ ए गब अब दब उद"],
    ["Number Row & Shift", "१ २ ३ ... आधे अक्षर", "1 2 3 4 5 6 7 8 9 0 म् त् ज् ल्"],
    ["मात्राएँ और संयुक्ताक्षर", "क्ष त्र ज्ञ श्र", "क्ष त्र ज्ञ श्र कक्षा पत्र ज्ञान श्रम"],
    ["छोटे वाक्य", "5 min practice", "राम घर जा रहा है। सीता पढ़ रही है।"],
    ["पैराग्राफ अभ्यास", "CPCT level", "भारत एक विशाल देश है। नियमित अभ्यास ही सफलता की कुंजी है।"],
  ];
  const ins_ = [
    ["Home Row — बाएँ हाथ", "ो े ् ि", "ो े ् ि ो े ् ि ि े ो"],
    ["Home Row — दाएँ हाथ", "प र क त", "प र क त पर कर तर तक"],
    ["Home Row — पूरे शब्द", "कर, तक, चल, पर...", "कर तक पर चल रत कप"],
    ["Upper Row — बाएँ हाथ", "ौ ै ा ी ू", "ौ ै ा ी ू का की कू कै कौ"],
    ["Upper Row — दाएँ हाथ", "ब ह ग द ज ड", "ब ह ग द ज ड बहन गदा जड़"],
    ["Lower Row", "ं म न व ल स य", "ं म न व ल स य मन वन लय सब"],
    ["Number Row", "१ २ ३ ४ ५", "१ २ ३ ४ ५ ६ ७ ८ ९ ०"],
    ["संयुक्ताक्षर", "क्ष त्र ज्ञ श्र", "क्ष त्र ज्ञ श्र कक्षा पत्र"],
    ["छोटे वाक्य", "5 min practice", "मैं रोज़ टाइपिंग का अभ्यास करता हूँ।"],
    ["पैराग्राफ अभ्यास", "CPCT level", "प्रतिदिन अभ्यास करने से गति और शुद्धता दोनों में सुधार होता है।"],
  ];
  const eng = [
    ["Home Row — Left Hand", "a s d f", "a s d f asdf fdsa sad fad dad"],
    ["Home Row — Right Hand", "j k l ;", "j k l ; jkl lkj ;lk jk"],
    ["Home Row — Words", "ask, lad, flask", "ask lad flask fall dash glass"],
    ["Upper Row — Left", "q w e r t", "we wet tree rest west were"],
    ["Upper Row — Right", "y u i o p", "you pout your quiet route"],
    ["Lower Row", "z x c v b n m", "can van man box zinc numb"],
    ["Numbers & Shift", "1 2 3 Capitals", "Delhi 2026 Bhopal 1947 India"],
    ["Punctuation", ", . ; ' ?", "Yes, it is. Is it? It's fine; okay."],
    ["Short Sentences", "5 min practice", "Practice every day. Keep your eyes on the screen."],
    ["Paragraph Practice", "Exam level", "Typing is a skill that improves only with regular practice and patience."],
  ];
  rem.forEach(([title, sub, content], i) => lessons.push({ layout: "remington", number: i + 1, title, subtitle: sub, content }));
  ins_.forEach(([title, sub, content], i) => lessons.push({ layout: "inscript", number: i + 1, title, subtitle: sub, content }));
  eng.forEach(([title, sub, content], i) => lessons.push({ layout: "english", number: i + 1, title, subtitle: sub, content }));
  await ins(client, "lessons", lessons);

  // ---------------- MATERIALS ----------------
  const excelPreview = `<h2>अध्याय 2 : महत्वपूर्ण फंक्शन</h2><table><thead><tr><th>Function</th><th>उपयोग</th><th>उदाहरण</th></tr></thead><tbody><tr><td>SUM</td><td>संख्याओं का योग</td><td>=SUM(A1:A5)</td></tr><tr><td>AVERAGE</td><td>औसत</td><td>=AVERAGE(B1:B9)</td></tr><tr><td>COUNTIF</td><td>शर्त अनुसार गिनती</td><td>=COUNTIF(C:C,"Pass")</td></tr><tr><td>VLOOKUP</td><td>टेबल में खोज</td><td>=VLOOKUP(E2,A:C,3,0)</td></tr><tr><td>IF</td><td>शर्त जाँच</td><td>=IF(D2&gt;=38,"Pass","Fail")</td></tr></tbody></table><p class="tip">परीक्षा टिप: CPCT में हर साल 2–3 प्रश्न Excel फंक्शन से आते हैं।</p>`;
  const materials = [
    { slug: "ms-excel-formulas-functions-shortcuts", title: "MS Excel — Formulas, Functions & Shortcuts", type: "notes", exam: "CPCT", subject: "Computer", language: "hindi", cover_text: "MS EXCEL|NOTES", color: "blue", description: "CPCT, Patwari aur sabhi computer-based exams ke liye Hindi me short notes.", contents: L("Excel Introduction", "Important Functions", "Formulas & Cell Reference", "Charts", "Shortcut Keys (60+)", "Previous Year MCQ (50)"), preview_html: excelPreview, pages: 42, size_mb: 2.4, downloads: 3240, rating: 4.8, popular: true, sort: 1 },
    { slug: "cpct-nov-2025-solved", title: "CPCT 21–23 Nov 2025 — All Shifts Solved", type: "pyq", exam: "CPCT", subject: "Computer", language: "bilingual", cover_text: "CPCT NOV 25|PYQ", color: "orange", description: "Sabhi shifts ke solved papers answer key ke saath.", contents: L("Shift 1 — 75 Q", "Shift 2 — 75 Q", "Shift 3 — 75 Q", "Answer Key"), pages: 60, size_mb: 5.1, downloads: 5800, sort: 2 },
    { slug: "computer-gk-1000-mcq", title: "Computer GK — 1000 Important MCQ", type: "notes", exam: "CPCT", subject: "Computer", language: "english", cover_text: "COMP GK|1000", color: "green", description: "1000 most important computer MCQs for all exams.", contents: L("Fundamentals", "MS Office", "Internet", "Networking", "Security"), pages: 88, size_mb: 3.9, downloads: 7100, sort: 3 },
    { slug: "top-300-shortcut-keys", title: "Top 300 Shortcut Keys — Word, Excel, Windows", type: "shortcut", exam: "CPCT", subject: "Computer", language: "hindi", cover_text: "SHORT CUT|KEYS", color: "purple", description: "Sabse zyada poochhi jaane wali shortcut keys.", contents: L("Windows", "MS Word", "MS Excel", "PowerPoint", "Browser"), pages: 12, size_mb: 0.8, downloads: 9400, popular: true, sort: 4 },
    { slug: "internet-email-networking-notes", title: "Internet, Email & Networking — Short Notes", type: "notes", exam: "CPCT", subject: "Computer", language: "bilingual", cover_text: "INTER NET|NOTES", color: "teal", description: "Internet, email aur networking ke short notes.", contents: L("Internet basics", "Email", "Networking types", "Topology", "Protocols"), pages: 28, size_mb: 1.6, downloads: 2700, sort: 5 },
    { slug: "cpct-10-saal-papers-bundle", title: "CPCT 10 Saal ke Papers — Complete Bundle", type: "pyq", exam: "CPCT", subject: "Computer", language: "bilingual", cover_text: "CPCT 2015–25|PYQ", color: "red", description: "2015 se 2025 tak ke 40+ papers.", contents: L("2015–2018", "2019–2021", "2022–2025"), pages: 400, size_mb: 22, downloads: 1200, is_premium: true, price: 99, sort: 6 },
    { slug: "maths-quick-revision", title: "Maths Quick Revision — Formulas", type: "notes", exam: "SSC", subject: "Maths", language: "hindi", cover_text: "MATHS|FORMULA", color: "orange", description: "Percentage, ratio, average, time-work ke sabhi formulas.", contents: L("Percentage", "Ratio", "Average", "Time & Work"), pages: 20, size_mb: 1.1, downloads: 1900, sort: 7 },
    { slug: "mp-gk-2026", title: "MP GK 2026 — One Liner", type: "notes", exam: "Patwari", subject: "GK / GS", language: "hindi", cover_text: "MP GK|2026", color: "green", description: "Madhya Pradesh GK one-liner questions.", contents: L("Itihas", "Bhugol", "Rajvyavastha", "Yojnayen"), pages: 34, size_mb: 1.8, downloads: 2300, sort: 8 },
    { slug: "cpct-syllabus-2026", title: "CPCT Syllabus 2026 (Official)", type: "syllabus", exam: "CPCT", subject: "Computer", language: "bilingual", cover_text: "CPCT|SYLLABUS", color: "blue", description: "Official CPCT syllabus.", pages: 4, size_mb: 0.5, downloads: 4100, sort: 9 },
    { slug: "reasoning-tricks", title: "Reasoning Tricks — Series & Coding", type: "notes", exam: "Police", subject: "Reasoning", language: "hindi", cover_text: "REASON|TRICKS", color: "purple", description: "Series, coding-decoding, blood relation ki tricks.", contents: L("Series", "Coding-Decoding", "Blood Relation", "Direction"), pages: 26, size_mb: 1.3, downloads: 1500, sort: 10 },
  ];
  await ins(client, "materials", materials.map((m) => ({ ...m, related_test_id: null })));

  // ---------------- PREVIOUS PAPERS ----------------
  const pp = [];
  const ppList = [["CPCT 21–23 Nov 2025", 2025, 5800, "Nov 2025"], ["CPCT 26–28 Sep 2025", 2025, 4900, "Sep 2025"], ["CPCT Jun 2025", 2025, 4100, "Jun 2025"], ["CPCT Mar 2025", 2025, 3600, "Mar 2025"], ["CPCT Dec 2024", 2024, 3300, "Dec 2024"], ["CPCT Aug 2024", 2024, 3000, "Aug 2024"], ["CPCT May 2024", 2024, 2700, "May 2024"], ["CPCT Feb 2024", 2024, 2400, "Feb 2024"], ["CPCT Nov 2023", 2023, 2100, "Nov 2023"], ["CPCT 2015–2022 Bundle", 2022, 9200, null]];
  ppList.forEach(([title, year, dl, key], i) => pp.push({ exam: "CPCT", title, year, downloads: dl, test_id: key ? pyqIds[key] || null : null, sort: i }));
  for (const ex of ["MP Patwari", "MP Police", "SSC CHSL", "High Court", "Lekha Prashikshan", "Railway"]) {
    pp.push({ exam: ex, title: `${ex} 2025 Paper`, year: 2025, downloads: 1200, sort: 1 });
    pp.push({ exam: ex, title: `${ex} 2023 Paper`, year: 2023, downloads: 900, sort: 2 });
  }
  await ins(client, "prev_papers", pp);

  // ---------------- SHORTCUTS ----------------
  const sc = {
    "MS Word": [["Ctrl+C", "Copy", "कॉपी करना"], ["Ctrl+V", "Paste", "पेस्ट करना"], ["Ctrl+X", "Cut", "कट करना"], ["Ctrl+Z", "Undo", "पिछला कार्य वापस"], ["Ctrl+Y", "Redo", "दोबारा करना"], ["Ctrl+B", "Bold", "बोल्ड"], ["Ctrl+I", "Italic", "इटैलिक"], ["Ctrl+U", "Underline", "अंडरलाइन"], ["Ctrl+E", "Center Align", "बीच में"], ["Ctrl+L", "Left Align", "बाएँ"], ["Ctrl+R", "Right Align", "दाएँ"], ["Ctrl+J", "Justify", "दोनों ओर"], ["Ctrl+H", "Replace", "बदलें"], ["F7", "Spelling Check", "वर्तनी जाँच"], ["Ctrl+Enter", "Page Break", "नया पेज"], ["Ctrl+P", "Print", "प्रिंट"]],
    "MS Excel": [["Ctrl+;", "Current Date", "आज की तारीख"], ["Ctrl+Shift+;", "Current Time", "वर्तमान समय"], ["F2", "Edit Cell", "सेल एडिट"], ["Shift+F11", "New Worksheet", "नई वर्कशीट"], ["Alt+=", "AutoSum", "ऑटो योग"], ["Ctrl+1", "Format Cells", "सेल फॉर्मेट"], ["F4", "Absolute Reference", "निरपेक्ष संदर्भ"], ["Ctrl+Space", "Select Column", "कॉलम चुनें"], ["Shift+Space", "Select Row", "पंक्ति चुनें"], ["Ctrl+Page Down", "Next Sheet", "अगली शीट"]],
    "PowerPoint": [["F5", "Slide Show (start)", "शुरू से स्लाइड शो"], ["Shift+F5", "Slide Show (current)", "वर्तमान स्लाइड से"], ["Ctrl+M", "New Slide", "नई स्लाइड"], ["Ctrl+D", "Duplicate", "डुप्लिकेट"], ["Esc", "End Show", "शो समाप्त"], ["B", "Black Screen", "काली स्क्रीन"]],
    "Windows": [["Win+D", "Show Desktop", "डेस्कटॉप"], ["Win+E", "File Explorer", "फ़ाइल एक्सप्लोरर"], ["Win+L", "Lock PC", "लॉक करें"], ["Alt+F4", "Close Window", "विंडो बंद"], ["Alt+Tab", "Switch Window", "विंडो बदलें"], ["Ctrl+Shift+Esc", "Task Manager", "टास्क मैनेजर"], ["F2", "Rename", "नाम बदलें"], ["Shift+Delete", "Permanent Delete", "स्थायी डिलीट"]],
    "Browser": [["Ctrl+T", "New Tab", "नया टैब"], ["Ctrl+W", "Close Tab", "टैब बंद"], ["Ctrl+Shift+T", "Reopen Tab", "बंद टैब खोलें"], ["Ctrl+H", "History", "इतिहास"], ["Ctrl+D", "Bookmark", "बुकमार्क"], ["F5", "Refresh", "रिफ्रेश"]],
    "Tally": [["F1", "Select Company", "कंपनी चुनें"], ["Alt+F3", "Company Info", "कंपनी जानकारी"], ["F4", "Contra Voucher", "कॉन्ट्रा"], ["F5", "Payment Voucher", "भुगतान"], ["F6", "Receipt Voucher", "रसीद"], ["F7", "Journal Voucher", "जर्नल"], ["F8", "Sales Voucher", "बिक्री"], ["F9", "Purchase Voucher", "खरीद"]],
  };
  const scRows = [];
  for (const [cat, list] of Object.entries(sc)) list.forEach(([keys, action, hindi], i) => scRows.push({ category: cat, keys, action, hindi, sort: i }));
  await ins(client, "shortcuts", scRows);

  // ---------------- ABBREVIATIONS ----------------
  const ab = [["CPU", "Central Processing Unit", "केंद्रीय प्रसंस्करण इकाई"], ["RAM", "Random Access Memory", "यादृच्छिक अभिगम स्मृति"], ["ROM", "Read Only Memory", "केवल पठन स्मृति"], ["ALU", "Arithmetic Logic Unit", "अंकगणितीय तर्क इकाई"], ["BIOS", "Basic Input Output System", "मूल इनपुट आउटपुट प्रणाली"], ["URL", "Uniform Resource Locator", "एकसमान संसाधन पता"], ["HTML", "HyperText Markup Language", "हाइपरटेक्स्ट मार्कअप भाषा"], ["HTTP", "HyperText Transfer Protocol", "हाइपरटेक्स्ट स्थानांतरण प्रोटोकॉल"], ["LAN", "Local Area Network", "स्थानीय क्षेत्र नेटवर्क"], ["WAN", "Wide Area Network", "विस्तृत क्षेत्र नेटवर्क"], ["MAN", "Metropolitan Area Network", "महानगरीय क्षेत्र नेटवर्क"], ["ISP", "Internet Service Provider", "इंटरनेट सेवा प्रदाता"], ["SMTP", "Simple Mail Transfer Protocol", "सरल मेल स्थानांतरण प्रोटोकॉल"], ["FTP", "File Transfer Protocol", "फ़ाइल स्थानांतरण प्रोटोकॉल"], ["PDF", "Portable Document Format", "पोर्टेबल दस्तावेज़ प्रारूप"], ["USB", "Universal Serial Bus", "सार्वभौमिक सीरियल बस"], ["GUI", "Graphical User Interface", "ग्राफिकल यूज़र इंटरफ़ेस"], ["OCR", "Optical Character Recognition", "प्रकाशीय अक्षर पहचान"], ["IP", "Internet Protocol", "इंटरनेट प्रोटोकॉल"], ["DNS", "Domain Name System", "डोमेन नाम प्रणाली"], ["MICR", "Magnetic Ink Character Recognition", "चुंबकीय स्याही अक्षर पहचान"], ["OMR", "Optical Mark Reader", "प्रकाशीय चिह्न पाठक"], ["LED", "Light Emitting Diode", "प्रकाश उत्सर्जक डायोड"], ["LCD", "Liquid Crystal Display", "द्रव क्रिस्टल प्रदर्शन"], ["SSD", "Solid State Drive", "सॉलिड स्टेट ड्राइव"], ["HDD", "Hard Disk Drive", "हार्ड डिस्क ड्राइव"], ["DVD", "Digital Versatile Disc", "डिजिटल बहुमुखी डिस्क"], ["Wi-Fi", "Wireless Fidelity", "वायरलेस फिडेलिटी"], ["VIRUS", "Vital Information Resources Under Siege", "महत्वपूर्ण सूचना संसाधन घेराबंदी में"], ["AI", "Artificial Intelligence", "कृत्रिम बुद्धिमत्ता"], ["IoT", "Internet of Things", "वस्तुओं का इंटरनेट"], ["UPS", "Uninterruptible Power Supply", "निर्बाध विद्युत आपूर्ति"], ["VDU", "Visual Display Unit", "दृश्य प्रदर्शन इकाई"], ["WWW", "World Wide Web", "विश्वव्यापी वेब"], ["XML", "Extensible Markup Language", "विस्तार योग्य मार्कअप भाषा"], ["ZIP", "Zone Information Protocol", "ज़ोन सूचना प्रोटोकॉल"], ["KB", "Kilobyte", "किलोबाइट"], ["GB", "Gigabyte", "गीगाबाइट"], ["MODEM", "Modulator Demodulator", "मॉड्यूलेटर डिमॉड्यूलेटर"], ["NIC", "Network Interface Card", "नेटवर्क इंटरफ़ेस कार्ड"]];
  await ins(client, "abbreviations", ab.map(([short, full_form, hindi]) => ({ short, full_form, hindi })));

  // ---------------- NOTICES ----------------
  const notices = [
    ["CPCT Nov 2026 ke admit card jaari", "Admit Card", "2026-11-05", "Download", true],
    ["CPCT Sep 2026 answer key par objection — last date 03 Oct", "Objection", "2026-10-03", "Details", false],
    ["CPCT 26–28 Sep 2026 ka scorecard jaari", "Result", "2026-10-01", "Scorecard", false],
    ["CPCT Nov 2026 — registration 18 Oct se shuru", "Application", "2026-09-18", "Apply", true],
    ["SSC CHSL 2026 Skill Test (DEST) schedule", "Notification", "2026-09-12", "PDF", true],
    ["CPCT Jun 2026 papers PDF upload", "Old Paper", "2026-09-02", "Download", false],
    ["MP High Court Assistant Grade-3 — 1,200 pad", "Vacancy", "2026-08-28", "Details", false],
  ];
  await ins(client, "notices", notices.map(([title, category, date, link_label, tick]) => ({ title, category, date, link_label, link: "/notices", exam: "CPCT", show_in_ticker: tick, content: title + ". Poori jaankari ke liye official website dekhein." })));
  await ins(client, "upcoming_exams", [["CPCT", "21 Nov"], ["SSC CHSL DEST", "12 Dec"], ["MP Police", "Jan 2027"], ["Patwari", "Feb 2027"]].map(([name, date], i) => ({ name, date, sort: i })));

  // ---------------- COURSES ----------------
  const cfeat = L("72 live / offline classes", "Computer lab me typing practice", "60 full mock tests", "Printed notes + PDF", "Weekly test + rank", "Doubt session har Sunday", "Typing speed certificate", "Exam form bharne me help");
  const cplan = L("Mahina 1 | Computer Fundamentals + Typing basics | Hardware, OS, home row typing", "Mahina 2 | MS Office + Internet | Word, Excel, PPT, Email · 20 WPM target", "Mahina 3 | Full Mocks + Speed Building | Daily mock, 30+ WPM target, revision");
  const courses = [
    { slug: "cpct-complete-course", title: "CPCT Complete Course", subtitle: "MCQ + Hindi/English typing — dono ki poori tayari, 3 mahine me. Offline aur online dono mode.", mode: "Offline + Online", duration: "3 maah", price: 2999, mrp: 4999, offer_text: "40% OFF — Diwali offer", badge: "Bestseller", color: "blue", start_date: "15 Oct 2026", timing: "Subah 8–10 / Shaam 5–7", seats: 40, features: cfeat, plan: cplan, faculty: "Atul Sir", centre: "Academy address yahan · Lab: 30 computers", sort: 1 },
    { slug: "hindi-english-typing", title: "Hindi + English Typing", subtitle: "Zero se 35+ WPM tak — Inscript, Remington aur English.", mode: "Offline lab", duration: "2 maah", price: 1499, mrp: 2500, color: "orange", start_date: "20 Oct 2026", timing: "Har ghante batch", seats: 30, features: L("Daily 1 ghanta lab practice", "Remington + Inscript dono", "Weekly speed test", "Typing certificate"), plan: L("Mahina 1 | Accuracy | Home row, finger placement, 20 WPM", "Mahina 2 | Speed | Paragraph practice, 35 WPM"), faculty: "Neha Ma'am", centre: "Academy address yahan", sort: 2 },
    { slug: "mp-patwari-police-batch", title: "MP Patwari / Police Batch", subtitle: "Patwari aur Police dono ki complete tayari.", mode: "Online live", duration: "4 maah", price: 3499, mrp: 5999, color: "green", start_date: "1 Nov 2026", timing: "Shaam 6–8", seats: 100, features: L("Live classes", "Mock tests", "PDF notes", "Doubt sessions"), plan: L("Mahina 1-2 | GK + Hindi | MP GK, Hindi grammar", "Mahina 3-4 | Maths + Reasoning + Mocks | Full syllabus"), faculty: "Rakesh Sir", sort: 3 },
    { slug: "steno-high-court", title: "Steno / High Court", subtitle: "Shorthand + typing for High Court and Steno exams.", mode: "Offline", duration: "6 maah", price: 5999, mrp: 8999, color: "purple", features: L("Shorthand dictation", "Remington Gail typing", "Mock skill tests"), plan: L("Mahina 1-3 | Shorthand basics | 60 WPM", "Mahina 4-6 | Speed | 80-100 WPM"), faculty: "Sunita Ma'am", sort: 4 },
    { slug: "computer-basics-beginners", title: "Computer Basics (Beginners)", subtitle: "Computer chalana seekhein — bilkul shuruaat se.", mode: "Offline", duration: "1 maah", price: 999, mrp: 1500, color: "teal", features: L("Computer basics", "MS Office", "Internet & Email"), plan: L("Hafta 1-4 | Fundamentals to MS Office | Practical lab"), faculty: "Atul Sir", sort: 5 },
    { slug: "ssc-chsl-foundation", title: "SSC CHSL Foundation", subtitle: "Tier 1 + Tier 2 + DEST typing.", mode: "Online live", duration: "4 maah", price: 3999, mrp: 6999, color: "red", features: L("Live classes", "SSC pattern mocks", "DEST typing practice"), plan: L("Mahina 1-2 | Concepts | All subjects", "Mahina 3-4 | Practice | Mocks + typing"), faculty: "Rakesh Sir", sort: 6 },
  ];
  await ins(client, "courses", courses);
  await ins(client, "faculty", [
    { name: "Atul Sir", subject: "Computer", experience: "12 saal", bio: "Computer faculty · 12 saal ka anubhav · 5,000+ students", color: "blue", sort: 1 },
    { name: "Neha Ma'am", subject: "Typing", experience: "8 saal", bio: "Typing expert · Hindi & English", color: "orange", sort: 2 },
    { name: "Rakesh Sir", subject: "Maths & Reasoning", experience: "10 saal", color: "green", sort: 3 },
    { name: "Sunita Ma'am", subject: "GK & Hindi", experience: "9 saal", color: "purple", sort: 4 },
  ]);

  // ---------------- VIDEOS ----------------
  const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
  const videos = [["MS Excel — Top 20 Functions", "Computer", "42:10", "Atul Sir", "blue"], ["Computer Fundamentals — Part 1", "Computer", "35:22", "Atul Sir", "navy"], ["Networking Basics in Hindi", "Computer", "28:45", "Atul Sir", "green"], ["CPCT Typing Tips — 30 WPM kaise", "Typing", "18:30", "Typing Faculty", "orange"], ["MS Word Complete", "Computer", "51:05", "Atul Sir", "purple"], ["Internet & Email", "Computer", "24:40", "Atul Sir", "teal"], ["CPCT Reasoning Tricks", "Reasoning", "33:12", "Maths Faculty", "red"], ["Shortcut Keys — Yaad karne ki trick", "Computer", "15:50", "Atul Sir", "amber"], ["Percentage Short Tricks", "Maths", "22:10", "Rakesh Sir", "blue"], ["MP GK Marathon", "GK", "58:00", "Sunita Ma'am", "green"], ["Remington Gail Keyboard Guide", "Typing", "20:15", "Neha Ma'am", "orange"], ["Live Doubt Class — CPCT", "Live Class", "1:02:00", "Atul Sir", "purple"]];
  await ins(client, "videos", videos.map(([title, category, duration, faculty, color], i) => ({ title, category, duration, faculty, color, views: "12k", youtube_url: yt(title + " CPCT Hindi"), sort: i })));

  // ---------------- PLANS / COUPONS ----------------
  await ins(client, "plans", [
    { slug: "free", name: "Free", price: 0, subtitle: "Hamesha free", features: L("+Free mock tests (10)", "+Unlimited typing practice", "-All 60 CPCT mocks", "-PYQ online tests", "-Detailed analysis + rank", "-Premium PDFs", "-Live doubt classes"), sort: 1 },
    { slug: "cpct-test-series", name: "CPCT Test Series", price: 299, mrp: 999, subtitle: "₹999 ki jagah", popular: true, features: L("+Free mock tests (10)", "+Unlimited typing practice", "+All 60 CPCT mocks", "+PYQ online tests", "+Detailed analysis + rank", "-Premium PDFs", "-Live doubt classes"), sort: 2 },
    { slug: "all-exams-pass", name: "All Exams Pass", price: 599, subtitle: "Sabhi exams ki test series", features: L("+Free mock tests (10)", "+Unlimited typing practice", "+All 60 CPCT mocks", "+PYQ online tests", "+Detailed analysis + rank", "+Premium PDFs", "-Live doubt classes"), sort: 3 },
    { slug: "pass-live-class", name: "Pass + Live Class", price: 1499, subtitle: "Test + live doubt classes", features: L("+Free mock tests (10)", "+Unlimited typing practice", "+All 60 CPCT mocks", "+PYQ online tests", "+Detailed analysis + rank", "+Premium PDFs", "+Live doubt classes"), sort: 4 },
  ]);
  await ins(client, "coupons", [{ code: "SAMADHAN50", discount: 50 }, { code: "DIWALI20", discount: 20, is_percent: true }]);

  // ---------------- BLOG ----------------
  const typingPost = L("CPCT में हिंदी टाइपिंग के लिए कम से कम 20 NWPM चाहिए, लेकिन अच्छी नौकरियों के लिए 30+ स्पीड ज़रूरी है। नीचे दिए तरीके रोज़ अपनाइए।", "", "## 1. सही उंगली, सही की", "सबसे पहले होम रो पर उंगलियाँ रखना सीखें। F और J पर बने उभार को महसूस करें।", "", "> टिप: पहले 2 हफ्ते स्पीड पर नहीं, सिर्फ़ शुद्धता पर ध्यान दें।", "", "## 2. रोज़ 30 मिनट का अभ्यास", "एक दिन में 3 घंटे के बजाय रोज़ 30 मिनट का नियमित अभ्यास ज़्यादा असरदार है।", "", "## 3. मात्रा और हलंत", "ज़्यादातर गलतियाँ मात्राओं और हलंत में होती हैं। इनका अलग से अभ्यास करें।", "", "## 4. संयुक्ताक्षर", "क्ष, त्र, ज्ञ, श्र जैसे अक्षरों के लिए अलग अभ्यास सेट बनाइए।", "", "## 5. मॉक टाइपिंग टेस्ट", "हफ्ते में कम से कम 3 बार पूरा 15 मिनट का टेस्ट दें।", "", "## 6. गलती विश्लेषण", "हर टेस्ट के बाद अपनी गलतियों की सूची देखें और उन्हीं शब्दों को दोहराएँ।", "", "## 7. परीक्षा के दिन की टिप्स", "शांत रहें, कीबोर्ड पहले जाँच लें और शुरुआत में जल्दबाज़ी न करें।");
  const posts = [
    { slug: "cpct-nov-2026-admit-card", title: "CPCT Nov 2026: Admit Card kaise download karein", category: "Exam News", excerpt: "Step-by-step tarika CPCT admit card download karne ka.", content: L("CPCT Nov 2026 ke admit card jaari ho chuke hain.", "", "## Steps", "- cpct.mp.gov.in par jaayein", "- Admit Card link par click karein", "- Application number aur DOB daalein", "- Download karke print le lein", "", "> Admit card par photo aur exam centre zaroor jaanch lein."), color: "blue", date: "2026-11-05", read_time: 5 },
    { slug: "hindi-typing-speed-20-se-35-wpm", title: "हिंदी टाइपिंग स्पीड 20 से 35 WPM कैसे बढ़ाएँ — 7 आसान तरीके", category: "Typing Tips", excerpt: "Hindi typing speed 20 se 35 WPM kaise badhayein", content: typingPost, color: "orange", cover_text: "35 WPM", date: "2026-11-02", read_time: 6 },
    { slug: "cpct-50-plus-score-analysis", title: "CPCT me 50+ score: 10,000 sawalon ka analysis", category: "Strategy", excerpt: "Kaunse topics se sabse zyada sawal aate hain.", content: L("10,000+ purane sawalon ke analysis se pata chalta hai ki Computer section sabse mahatvapurn hai.", "", "## Top topics", "- MS Excel functions", "- Shortcut keys", "- Networking & Internet", "", "> Roz ek full mock dein aur weak topics par topic test lagayein."), color: "green", date: "2026-10-28", read_time: 5 },
    { slug: "inscript-vs-remington", title: "Inscript vs Remington — kaunsa layout seekhein?", category: "Typing Tips", excerpt: "Dono layouts ki tulna.", content: L("Inscript Unicode ka standard layout hai aur CPCT me iska upyog hota hai. Remington Gail purane typewriter jaisa layout hai jo High Court aur kai exams me chalta hai.", "", "## Kaunsa chunein?", "- Naye ho to Inscript", "- Typewriter ka anubhav hai to Remington", "", "> Apne target exam ka notification zaroor padhein."), color: "purple", date: "2026-10-24", read_time: 5 },
    { slug: "mp-patwari-2026-syllabus", title: "MP Patwari 2026 syllabus aur exam pattern", category: "Exam News", excerpt: "Patwari syllabus ki poori jaankari.", content: L("MP Patwari pariksha me GK, Hindi, English, Maths, Reasoning aur Computer ke sawal aate hain.", "", "## Pattern", "- 100 prashn", "- 3 ghante", "- CPCT anivarya"), color: "teal", date: "2026-10-20", read_time: 5 },
    { slug: "top-50-excel-sawal", title: "Top 50 Excel sawal jo CPCT me baar-baar aate hain", category: "Computer Notes", excerpt: "Excel ke sabse important sawal.", content: L("Excel CPCT ka sabse scoring topic hai.", "", "## Zaroori functions", "- SUM, AVERAGE, COUNTIF", "- VLOOKUP, IF", "", "## Shortcuts", "- Ctrl + ; — date", "- F2 — edit cell"), color: "red", date: "2026-10-15", read_time: 5 },
  ];
  await ins(client, "posts", posts);

  // ---------------- DOWNLOADS / FAQ / TESTIMONIALS ----------------
  await ins(client, "downloads", [
    { title: "Indic Input 3 — Hindi Typing Tool", description: "Windows 7/8/10/11 · 32 & 64 bit · Inscript + Remington", size: "12 MB · Free", icon: "keyboard", color: "blue", file_url: "https://www.google.com/inputtools/windows/", sort: 1 },
    { title: "Mangal & Krutidev Fonts", description: "Unicode Mangal, Krutidev 010 — typing practice ke liye", size: "3 MB · Free", icon: "type", color: "orange", sort: 2 },
    { title: "Perfect Samadhan Android App", description: "Mock test, typing, PDF — mobile par", size: "18 MB · Free", icon: "smartphone", color: "green", sort: 3 },
    { title: "Offline Typing Tutor (Windows)", description: "Bina internet typing practice", size: "25 MB · Free", icon: "monitor", color: "red", sort: 4 },
    { title: "CPCT Syllabus PDF", description: "Official syllabus — Hindi/English", size: "0.5 MB · Free", icon: "file-text", color: "purple", file_url: "/study-material/cpct-syllabus-2026", sort: 5 },
    { title: "Exam Form Checklist", description: "Form bharne se pehle zaroori documents", size: "0.3 MB · Free", icon: "file-check", color: "teal", sort: 6 },
  ]);
  const faqs = [
    ["CPCT Exam", "CPCT exam me kitne parts hote hain?", "Teen: MCQ test (75 Q, 75 min), English typing (15 min) aur Hindi typing (15 min)."],
    ["CPCT Exam", "CPCT me minimum typing speed kitni chahiye?", "English me 30 NWPM aur Hindi me 20 NWPM (Inscript ya Remington)."],
    ["CPCT Exam", "CPCT scorecard kitne saal valid hai?", "Jaari hone ki tareekh se 7 saal tak."],
    ["CPCT Exam", "CPCT form fee kitni hai?", "₹660 (GST sahit)."],
    ["Mock Test", "Kya mock tests free hain?", "Haan, 10 mock tests aur unlimited typing practice bilkul free hai. Poori series ke liye Premium plan."],
    ["Typing Test", "Mobile par typing test de sakte hain?", "Practice mode me haan. Real exam jaisa abhyas ke liye keyboard ya desktop behtar hai."],
    ["Typing Test", "Certificate kaise milega?", "Typing test ke result page se certificate PDF download karein — QR code se verify hota hai."],
    ["Typing Test", "Kya system me Hindi keyboard install karna zaroori hai?", "Nahi. Hamara typing test Inscript aur Remington Gail layout khud convert karta hai — bas English keyboard se type karein."],
    ["Course", "Offline batch me admission kaise lein?", "Courses page se enquiry bhejein ya call/WhatsApp karein."],
    ["Payment", "Payment ke kaun se tarike hain?", "UPI, Debit/Credit card aur Net Banking — sab surakshit payment gateway se."],
    ["Payment", "Premium kab activate hota hai?", "Payment confirm hote hi aapke account me premium activate ho jaata hai."],
  ];
  await ins(client, "faqs", faqs.map(([category, question, answer], i) => ({ category, question, answer, sort: i })));
  await ins(client, "testimonials", [
    { name: "Riya Sharma", exam: "CPCT · Sep 2026", result: "Score 62 / 75", quote: "Typing test bilkul real exam jaisa tha, isliye exam me ghabrahat nahi hui.", city: "Ajmer", color: "blue", sort: 1 },
    { name: "Aman Kushwah", exam: "MP Patwari 2026", result: "Selected", quote: "Topic-wise tests se weak chapters jaldi strong ho gaye.", city: "Ajmer", color: "orange", sort: 2 },
    { name: "Pooja Verma", exam: "High Court Steno", result: "Selected", quote: "Hindi Remington practice roz ki — 44 WPM tak pahunchi.", city: "Bhopal", color: "green", sort: 3 },
    { name: "Rahul Yadav", exam: "SSC CHSL 2025", result: "DEST Qualified", quote: "Notes PDF short aur to-the-point hain, revision fast hota hai.", city: "Indore", color: "purple", sort: 4 },
  ]);
}
