import type { Field, Resource } from "./resources";

/** CSV parser — handles quotes, commas/tabs/semicolons inside quotes, Excel UTF-8 BOM, CRLF. */
export function parseCSV(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delim = firstLine.includes("\t") && !firstLine.includes(",") ? "\t" : firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows: string[][] = []; let row: string[] = []; let cur = ""; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
    else if (c === '"') inQ = true;
    else if (c === delim) { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); if (row.some((x) => x.trim())) rows.push(row); row = []; cur = ""; }
    else cur += c;
  }
  row.push(cur); if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const esc = (v: any) => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const toCSV = (rows: any[][]) => rows.map((r) => r.map(esc).join(",")).join("\r\n");

/** Fields that can be filled from CSV (no auto/system fields). */
export const importFields = (r: Resource) => r.fields.filter((f) => f.type !== "datetime");

/** Old template headers → current field names (purane CSV bhi chalte rahein). */
export const ALIASES: Record<string, Record<string, string>> = {
  questions: { question_hi: "text_hi", question_en: "text_en", a_hi: "opt_a_hi", b_hi: "opt_b_hi", c_hi: "opt_c_hi", d_hi: "opt_d_hi", a_en: "opt_a_en", b_en: "opt_b_en", c_en: "opt_c_en", d_en: "opt_d_en" },
};

/** Hand-written realistic examples for each section. Missing sections fall back to auto-generated rows. */
const SAMPLES: Record<string, Record<string, any>[]> = {
  exams: [
    { name: "CPCT", slug: "cpct", code: "CPCT", body: "MAP_IT", category: "MP", color: "blue", tag: "Popular", students: 12000, description: "Computer Proficiency Certification Test — MP govt jobs ke liye zaroori", overview: "CPCT MP sarkar ki computer dakshata pariksha hai.", pattern: "Computer Proficiency | 52 | 75 min | Yes\nEnglish Typing | 1 | 15 min | 30 WPM", syllabus: "## Computer | 52 Q\n- Computer basics\n- MS Office", eligibility: "12th pass", fee: "₹560", next_exam: "Dec 2026", official_url: "https://www.cpct.mp.gov.in", show_on_home: "yes", show_in_typing: "yes", sort: 1, active: "yes" },
  ],
  mock_tests: [
    { title: "CPCT Full Mock Test 1", exam_slug: "cpct", kind: "full", duration: 75, marks_per_q: 1, negative: 0, pass_marks: 26, is_free: "yes", instructions: "Sabhi prashn anivarya hain\nNegative marking nahi hai", sort: 1, active: "yes" },
    { title: "Computer Memory — Topic Test", exam_slug: "cpct", kind: "topic", subject: "Computer", topic: "Memory", duration: 15, marks_per_q: 1, is_free: "no", sort: 2, active: "yes" },
  ],
  questions: [
    { test_id: "", section: "Computer", topic: "Memory", text_hi: "RAM का पूर्ण रूप क्या है?", text_en: "What is the full form of RAM?", opt_a_hi: "रैंडम एक्सेस मेमोरी", opt_a_en: "Random Access Memory", opt_b_hi: "रीड एक्सेस मेमोरी", opt_b_en: "Read Access Memory", opt_c_hi: "रैपिड एक्शन मेमोरी", opt_c_en: "Rapid Action Memory", opt_d_hi: "इनमें से कोई नहीं", opt_d_en: "None of these", answer: "A", explanation: "RAM एक volatile memory है।", source: "CPCT 2024 · Shift 1", keywords: "ram memory" },
    { test_id: "", section: "Maths", topic: "Percentage", text_hi: "200 का 15% कितना है?", text_en: "What is 15% of 200?", opt_a_hi: "20", opt_b_hi: "25", opt_c_hi: "30", opt_d_hi: "35", answer: "C", explanation: "200 × 15/100 = 30" },
  ],
  passages: [
    { title: "CPCT Nov 2025 Shift 1 (Hindi)", language: "hindi", level: "exam", exam: "CPCT", year: 2025, session: "Nov 2025", shift: "Shift 1", text: "भारत एक विशाल देश है। यहाँ अनेक भाषाएँ बोली जाती हैं।", active: "yes" },
    { title: "Practice English 1", language: "english", level: "easy", text: "Typing is a skill that improves with daily practice.", active: "yes" },
  ],
  lessons: [
    { layout: "remington", number: 1, title: "Home Row — Part 1", subtitle: "क ि ह ी", content: "कि हि की ही कि हि", active: "yes" },
    { layout: "english", number: 1, title: "Home Row", subtitle: "a s d f j k l ;", content: "asdf jkl; asdf jkl;", active: "yes" },
  ],
  materials: [
    { title: "CPCT Computer Notes (Hindi)", slug: "cpct-computer-notes", type: "notes", exam: "CPCT", subject: "Computer", language: "hindi", file_url: "", pages: 120, size_mb: 4.5, description: "Pura computer syllabus ek PDF me", contents: "Computer basics\nMS Word\nMS Excel", is_premium: "no", price: 0, popular: "yes", sort: 1, active: "yes" },
  ],
  prev_papers: [{ exam: "CPCT", title: "CPCT Nov 2025 · All Shifts", year: 2025, shifts: "Shift 1, 2", language: "Hindi + English", pdf_url: "", sort: 1 }],
  shortcuts: [
    { category: "MS Word", keys: "Ctrl+B", action: "Bold text", hindi: "टेक्स्ट को बोल्ड करना", sort: 1 },
    { category: "MS Excel", keys: "Ctrl+;", action: "Insert current date", hindi: "आज की तारीख डालना", sort: 1 },
  ],
  abbreviations: [
    { short: "CPU", full_form: "Central Processing Unit", hindi: "सेंट्रल प्रोसेसिंग यूनिट" },
    { short: "URL", full_form: "Uniform Resource Locator", hindi: "यूनिफॉर्म रिसोर्स लोकेटर" },
  ],
  notices: [{ title: "CPCT Dec 2026 Admit Card जारी", category: "Admit Card", exam: "CPCT", date: "2026-11-25", link: "https://www.cpct.mp.gov.in", link_label: "Download करें", content: "Admit card official site se download karein.", show_in_ticker: "yes", show_on_home: "yes", active: "yes" }],
  upcoming_exams: [{ name: "CPCT Dec 2026", date: "15 Dec 2026", sort: 1 }],
  courses: [{ title: "CPCT Complete Batch", slug: "cpct-complete-batch", subtitle: "Computer + Typing — offline batch", mode: "Offline", duration: "3 months", price: 2999, mrp: 4999, offer_text: "40% OFF", badge: "Bestseller", color: "blue", start_date: "1 Dec 2026", timing: "10 AM – 12 PM", seats: 40, features: "Daily typing practice\nWeekly mock test", faculty: "Ramesh Sir", centre: "Ajmer", sort: 1, active: "yes" }],
  faculty: [{ name: "Ramesh Sharma", subject: "Computer", experience: "10 saal", bio: "CPCT expert", photo_url: "", color: "blue", sort: 1 }],
  videos: [{ title: "CPCT Computer Class 1", category: "Computer", youtube_url: "https://www.youtube.com/watch?v=XXXXXXXXXXX", duration: "45 min", faculty: "Ramesh Sir", views: "12K views", color: "blue", sort: 1, active: "yes" }],
  posts: [{ title: "CPCT ki taiyari kaise karein", slug: "cpct-ki-taiyari", category: "Strategy", excerpt: "30 din ka plan", content: "## Week 1\n- Typing roz 30 min\n> Tip: accuracy pe dhyan dein", author: "Admin", read_time: 5, color: "blue", cover_text: "CPCT", date: "2026-10-13", published: "yes" }],
  downloads: [{ title: "Hindi Typing Font (Mangal)", description: "Remington layout ke liye", file_url: "", size: "2 MB · Free", icon: "keyboard", color: "blue", sort: 1 }],
  faqs: [{ category: "CPCT Exam", question: "CPCT ka certificate kitne saal valid hai?", answer: "CPCT score card 7 saal tak valid hai.", sort: 1 }],
  testimonials: [{ name: "Priya Verma", exam: "CPCT · Nov 2025", result: "Score 62/75", quote: "Mock tests se bahut madad mili.", city: "Ajmer", color: "orange", sort: 1 }],
  plans: [{ name: "Premium 3 Months", slug: "premium-3m", price: 299, mrp: 499, subtitle: "Sabhi mock tests", validity_days: 90, features: "+All mock tests\n+Typing certificate\n-Live classes", popular: "yes", sort: 1, active: "yes" }],
  coupons: [{ code: "WELCOME50", discount: 50, is_percent: "no", active: "yes" }, { code: "DIWALI20", discount: 20, is_percent: "yes", active: "yes" }],
  orders: [{ item_name: "Premium 3 Months", item: "plan:premium-3m", name: "Rahul Kumar", mobile: "9876543210", email: "", amount: 299, coupon: "", method: "UPI", status: "paid", gateway_payment_id: "UTR123456" }],
  users: [{ name: "Rahul Kumar", mobile: "9876543210", email: "rahul@example.com", city: "Ajmer", password: "rahul@123", role: "student", target_exam: "CPCT", exam_date: "Dec 2026", premium_plan: "", premium_till: "", blocked: "no" }],
};

function autoValue(f: Field, i: number): any {
  if (f.type === "bool") return "yes";
  if (f.type === "number") return f.name === "sort" ? i + 1 : 1;
  if (f.type === "date") return "2026-11-01";
  if (f.type === "select") return f.options?.[0] ?? "";
  if (f.type === "file") return "";
  if (f.type === "password") return "";
  return f.required ? `${f.label.split("(")[0].split("—")[0].trim()} ${i + 1}` : "";
}

/** Sample CSV for a section: header row (field names) + example rows. BOM added so Excel shows Hindi correctly. */
export function sampleCSV(r: Resource) {
  const fields = importFields(r);
  const rows = SAMPLES[r.key] || [0, 1].map((i) => Object.fromEntries(fields.map((f) => [f.name, autoValue(f, i)])));
  return "﻿" + toCSV([fields.map((f) => f.name), ...rows.map((row) => fields.map((f) => row[f.name] ?? ""))]);
}
