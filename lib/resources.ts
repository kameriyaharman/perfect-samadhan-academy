export type FieldType = "text" | "textarea" | "number" | "bool" | "select" | "date" | "file" | "html" | "password" | "datetime";
export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: string[];
  required?: boolean;
  list?: boolean; // show in table
  help?: string;
  rows?: number;
  full?: boolean; // full width in form
};
export type Resource = {
  key: string;
  table: string;
  label: string;
  group: string;
  icon: string;
  fields: Field[];
  order: string;
  search?: string[];
  filters?: { name: string; options: string[] }[];
  readonly?: boolean;
  noCreate?: boolean;
};

const COLOR_OPTS = ["blue", "navy", "orange", "amber", "green", "red", "purple", "teal"];
const EXAM_KIND = ["full", "subject", "topic", "pyq", "quiz"];

export const RESOURCES: Resource[] = [
  {
    key: "exams", table: "exams", label: "Exams", group: "Content", icon: "GraduationCap", order: "sort, id", search: ["name", "slug", "code"],
    fields: [
      { name: "name", label: "Exam name", required: true, list: true },
      { name: "slug", label: "URL slug (e.g. cpct)", required: true, list: true },
      { name: "code", label: "Badge code (CPCT, SSC…)", required: true, list: true },
      { name: "body", label: "Conducting body (MAP_IT, SSC…)" },
      { name: "category", label: "Category", type: "select", options: ["MP", "Central", "Rajasthan", "Typing"], list: true },
      { name: "color", label: "Colour", type: "select", options: COLOR_OPTS },
      { name: "tag", label: "Tag (Popular / New / Free / Soon)" },
      { name: "students", label: "Students count", type: "number" },
      { name: "description", label: "Short description", type: "textarea", full: true },
      { name: "overview", label: "Overview (kya hai?)", type: "textarea", full: true },
      { name: "pattern", label: "Exam pattern — one row per line: Part | Questions | Time | Qualifying", type: "textarea", full: true, rows: 5 },
      { name: "syllabus", label: "Syllabus — '## Section | 52 Q' then '- topic' lines", type: "textarea", full: true, rows: 10 },
      { name: "eligibility", label: "Eligibility", type: "textarea", full: true },
      { name: "how_to_apply", label: "How to apply — Step title | description (one per line)", type: "textarea", full: true },
      { name: "admit_card", label: "Admit card info", type: "textarea", full: true },
      { name: "result_info", label: "Result info", type: "textarea", full: true },
      { name: "important_dates", label: "Important dates — Label | Date (one per line)", type: "textarea", full: true },
      { name: "guide", label: "Free guide — '## Week 1 | Title' then '- item' lines", type: "textarea", full: true, rows: 8 },
      { name: "fee", label: "Fee" }, { name: "next_exam", label: "Next exam date" }, { name: "validity", label: "Validity" },
      { name: "official_url", label: "Official website URL" },
      { name: "typing_language", label: "Typing: language" }, { name: "typing_layout", label: "Typing: layout" },
      { name: "typing_time", label: "Typing: time" }, { name: "typing_speed", label: "Typing: qualifying speed" },
      { name: "show_on_home", label: "Show on home", type: "bool" }, { name: "show_in_typing", label: "Show in typing exam table", type: "bool" },
      { name: "sort", label: "Sort order", type: "number" }, { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "mock_tests", table: "mock_tests", label: "Mock Tests", group: "Tests", icon: "ClipboardCheck", order: "exam_slug, kind, sort, id", search: ["title", "subject", "topic", "session"],
    filters: [{ name: "kind", options: EXAM_KIND }],
    fields: [
      { name: "title", label: "Title", required: true, list: true },
      { name: "exam_slug", label: "Exam slug (cpct, ssc-chsl…)", required: true, list: true },
      { name: "kind", label: "Type", type: "select", options: EXAM_KIND, list: true },
      { name: "subject", label: "Subject (subject/topic tests)" },
      { name: "topic", label: "Topic (topic tests)" },
      { name: "year", label: "Year (PYQ)", type: "number" },
      { name: "session", label: "Session (PYQ, e.g. Nov 2025 · Shift 1)" },
      { name: "duration", label: "Duration (minutes)", type: "number", list: true },
      { name: "marks_per_q", label: "Marks per question", type: "number" },
      { name: "negative", label: "Negative marks per wrong", type: "number" },
      { name: "pass_marks", label: "Pass marks", type: "number" },
      { name: "is_free", label: "Free", type: "bool", list: true },
      { name: "pdf_url", label: "PDF (for PYQ download)", type: "file" },
      { name: "instructions", label: "Instructions (one per line)", type: "textarea", full: true },
      { name: "sort", label: "Sort", type: "number" }, { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "questions", table: "questions", label: "Questions", group: "Tests", icon: "HelpCircle", order: "test_id, sort, id", search: ["text_hi", "text_en", "topic", "keywords"],
    fields: [
      { name: "test_id", label: "Mock test ID", type: "number", list: true, help: "Mock Tests list me ID dekhein" },
      { name: "section", label: "Section", type: "select", options: ["Computer", "Reading Comprehension", "Maths", "Reasoning", "General Awareness", "Hindi", "English", "GK"], list: true },
      { name: "topic", label: "Topic", list: true },
      { name: "text_hi", label: "Question (Hindi)", type: "textarea", required: true, list: true, full: true },
      { name: "text_en", label: "Question (English)", type: "textarea", full: true },
      { name: "opt_a_hi", label: "Option A (Hindi)", required: true }, { name: "opt_a_en", label: "Option A (English)" },
      { name: "opt_b_hi", label: "Option B (Hindi)", required: true }, { name: "opt_b_en", label: "Option B (English)" },
      { name: "opt_c_hi", label: "Option C (Hindi)", required: true }, { name: "opt_c_en", label: "Option C (English)" },
      { name: "opt_d_hi", label: "Option D (Hindi)", required: true }, { name: "opt_d_en", label: "Option D (English)" },
      { name: "answer", label: "Correct answer", type: "select", options: ["A", "B", "C", "D"], required: true, list: true },
      { name: "explanation", label: "Explanation (vyakhya)", type: "textarea", full: true },
      { name: "source", label: "Source (e.g. CPCT 2024 · Shift 1)" },
      { name: "keywords", label: "Keywords (keyword test search)" },
      { name: "sort", label: "Sort", type: "number" },
    ],
  },
  {
    key: "passages", table: "passages", label: "Typing Passages", group: "Typing", icon: "Keyboard", order: "language, year DESC NULLS FIRST, id", search: ["title", "text", "session"],
    filters: [{ name: "language", options: ["hindi", "english"] }],
    fields: [
      { name: "title", label: "Title", required: true, list: true },
      { name: "language", label: "Language", type: "select", options: ["hindi", "english"], list: true },
      { name: "level", label: "Level", type: "select", options: ["easy", "medium", "exam"], list: true },
      { name: "exam", label: "Exam (CPCT etc. — for paragraphs page)", list: true },
      { name: "year", label: "Year", type: "number" }, { name: "session", label: "Session (e.g. Nov 2025)" }, { name: "shift", label: "Shift" },
      { name: "text", label: "Passage text (Hindi in Unicode/Mangal)", type: "textarea", required: true, full: true, rows: 8 },
      { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "lessons", table: "lessons", label: "Typing Lessons", group: "Typing", icon: "BookOpen", order: "layout, number",
    filters: [{ name: "layout", options: ["remington", "inscript", "english"] }],
    fields: [
      { name: "layout", label: "Layout", type: "select", options: ["remington", "inscript", "english"], list: true },
      { name: "number", label: "Lesson number", type: "number", list: true },
      { name: "title", label: "Title", required: true, list: true },
      { name: "subtitle", label: "Subtitle" },
      { name: "content", label: "Practice text (space separated)", type: "textarea", required: true, full: true },
      { name: "active", label: "Active", type: "bool" },
    ],
  },
  {
    key: "typing_results", table: "typing_results", label: "Typing Results", group: "Typing", icon: "Gauge", order: "created_at DESC", search: ["name", "cert_id"], noCreate: true,
    fields: [
      { name: "cert_id", label: "Certificate ID", list: true }, { name: "name", label: "Name", list: true },
      { name: "language", label: "Language", list: true }, { name: "layout", label: "Layout" },
      { name: "net_wpm", label: "Net WPM", type: "number", list: true }, { name: "gross_wpm", label: "Gross WPM", type: "number" },
      { name: "accuracy", label: "Accuracy", type: "number", list: true }, { name: "qualified", label: "Qualified", type: "bool", list: true },
      { name: "created_at", label: "Date", type: "datetime", list: true },
    ],
  },
  {
    key: "materials", table: "materials", label: "Study Material / PDFs", group: "Content", icon: "FileText", order: "sort, id", search: ["title", "exam", "subject"],
    fields: [
      { name: "title", label: "Title", required: true, list: true },
      { name: "slug", label: "URL slug", required: true },
      { name: "type", label: "Type", type: "select", options: ["notes", "pyq", "shortcut", "syllabus"], list: true },
      { name: "exam", label: "Exam (CPCT, SSC, Patwari, Police, Court, Railway)", list: true },
      { name: "subject", label: "Subject", type: "select", options: ["Computer", "Maths", "Reasoning", "GK / GS", "Hindi / English"] },
      { name: "language", label: "Language", type: "select", options: ["hindi", "english", "bilingual"] },
      { name: "file_url", label: "PDF file", type: "file", full: true },
      { name: "cover_text", label: "Cover text (TOP|BOTTOM)" }, { name: "color", label: "Cover colour", type: "select", options: COLOR_OPTS },
      { name: "pages", label: "Pages", type: "number" }, { name: "size_mb", label: "Size (MB)", type: "number" },
      { name: "downloads", label: "Downloads", type: "number", list: true }, { name: "rating", label: "Rating", type: "number" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "contents", label: "Contents (one per line)", type: "textarea", full: true },
      { name: "preview_html", label: "Preview page content (HTML allowed)", type: "html", full: true, rows: 8 },
      { name: "related_test_id", label: "Related test ID", type: "number" },
      { name: "is_premium", label: "Premium (paid)", type: "bool", list: true }, { name: "price", label: "Unlock price (₹)", type: "number" },
      { name: "popular", label: "Popular badge", type: "bool" },
      { name: "sort", label: "Sort", type: "number" }, { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "prev_papers", table: "prev_papers", label: "Previous Papers", group: "Content", icon: "Files", order: "exam, year DESC, sort", search: ["title", "exam"],
    fields: [
      { name: "exam", label: "Exam tab (CPCT, MP Patwari…)", required: true, list: true },
      { name: "title", label: "Title / session", required: true, list: true },
      { name: "year", label: "Year", type: "number", required: true, list: true },
      { name: "shifts", label: "Shifts" }, { name: "language", label: "Language" },
      { name: "pdf_url", label: "PDF file", type: "file", full: true },
      { name: "test_id", label: "Online test ID (optional)", type: "number" },
      { name: "downloads", label: "Downloads", type: "number", list: true },
      { name: "sort", label: "Sort", type: "number" },
    ],
  },
  {
    key: "shortcuts", table: "shortcuts", label: "Shortcut Keys", group: "Content", icon: "Command", order: "category, sort, id", search: ["keys", "action", "hindi"],
    filters: [{ name: "category", options: ["MS Word", "MS Excel", "PowerPoint", "Windows", "Browser", "Tally"] }],
    fields: [
      { name: "category", label: "Category", type: "select", options: ["MS Word", "MS Excel", "PowerPoint", "Windows", "Browser", "Tally"], list: true },
      { name: "keys", label: "Keys (e.g. Ctrl+Shift+;)", required: true, list: true },
      { name: "action", label: "Kaam (English)", required: true, list: true },
      { name: "hindi", label: "Hindi", list: true }, { name: "sort", label: "Sort", type: "number" },
    ],
  },
  {
    key: "abbreviations", table: "abbreviations", label: "Abbreviations", group: "Content", icon: "CaseSensitive", order: "short", search: ["short", "full_form", "hindi"],
    fields: [
      { name: "short", label: "Short", required: true, list: true },
      { name: "full_form", label: "Full form", required: true, list: true },
      { name: "hindi", label: "Hindi", list: true },
    ],
  },
  {
    key: "notices", table: "notices", label: "Notices", group: "Content", icon: "Bell", order: "date DESC, id DESC", search: ["title", "category"],
    fields: [
      { name: "title", label: "Title", required: true, list: true },
      { name: "category", label: "Category", type: "select", options: ["Admit Card", "Result", "Vacancy", "Answer Key", "Application", "Objection", "Notification", "Old Paper"], list: true },
      { name: "exam", label: "Exam" }, { name: "date", label: "Date", type: "date", list: true },
      { name: "link", label: "Button link (URL or uploaded file)", type: "file" }, { name: "link_label", label: "Button label" },
      { name: "content", label: "Details", type: "textarea", full: true },
      { name: "show_in_ticker", label: "Show in top ticker", type: "bool", list: true }, { name: "show_on_home", label: "Show on home", type: "bool" },
      { name: "active", label: "Active", type: "bool" },
    ],
  },
  {
    key: "upcoming_exams", table: "upcoming_exams", label: "Upcoming Exams", group: "Content", icon: "CalendarDays", order: "sort, id",
    fields: [{ name: "name", label: "Exam", required: true, list: true }, { name: "date", label: "Date text", required: true, list: true }, { name: "sort", label: "Sort", type: "number" }],
  },
  {
    key: "courses", table: "courses", label: "Courses & Batches", group: "Academy", icon: "School", order: "sort, id", search: ["title"],
    fields: [
      { name: "title", label: "Title", required: true, list: true }, { name: "slug", label: "URL slug", required: true },
      { name: "subtitle", label: "Subtitle", type: "textarea", full: true },
      { name: "mode", label: "Mode (Offline / Online live…)", list: true }, { name: "duration", label: "Duration" },
      { name: "price", label: "Price (₹)", type: "number", list: true }, { name: "mrp", label: "MRP (₹)", type: "number" },
      { name: "offer_text", label: "Offer text" }, { name: "badge", label: "Badge (Bestseller…)" },
      { name: "color", label: "Colour", type: "select", options: COLOR_OPTS },
      { name: "start_date", label: "Start date" }, { name: "timing", label: "Timing" }, { name: "seats", label: "Seats", type: "number" },
      { name: "features", label: "Features (one per line)", type: "textarea", full: true },
      { name: "plan", label: "Course plan — Label | Title | Description (one per line)", type: "textarea", full: true },
      { name: "syllabus", label: "Syllabus (markdown)", type: "textarea", full: true },
      { name: "faculty", label: "Faculty name" }, { name: "centre", label: "Centre / address" },
      { name: "sort", label: "Sort", type: "number" }, { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "faculty", table: "faculty", label: "Faculty", group: "Academy", icon: "Users", order: "sort, id",
    fields: [
      { name: "name", label: "Name", required: true, list: true }, { name: "subject", label: "Subject", required: true, list: true },
      { name: "experience", label: "Experience" }, { name: "bio", label: "Bio" }, { name: "photo_url", label: "Photo", type: "file" },
      { name: "color", label: "Colour", type: "select", options: COLOR_OPTS }, { name: "sort", label: "Sort", type: "number" },
    ],
  },
  {
    key: "videos", table: "videos", label: "Videos", group: "Academy", icon: "PlayCircle", order: "sort, id", search: ["title"],
    fields: [
      { name: "title", label: "Title", required: true, list: true },
      { name: "category", label: "Category", type: "select", options: ["Computer", "Typing", "Maths", "Reasoning", "GK", "Live Class"], list: true },
      { name: "youtube_url", label: "YouTube URL", required: true, full: true },
      { name: "duration", label: "Duration" }, { name: "faculty", label: "Faculty" }, { name: "views", label: "Views text" },
      { name: "color", label: "Thumbnail colour", type: "select", options: COLOR_OPTS }, { name: "sort", label: "Sort", type: "number" },
      { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "posts", table: "posts", label: "Blog Posts", group: "Content", icon: "Newspaper", order: "date DESC, id DESC", search: ["title"],
    fields: [
      { name: "title", label: "Title", required: true, list: true }, { name: "slug", label: "URL slug", required: true },
      { name: "category", label: "Category", type: "select", options: ["Exam News", "Typing Tips", "Strategy", "Computer Notes"], list: true },
      { name: "excerpt", label: "Excerpt", full: true },
      { name: "content", label: "Content (## heading, - list, > tip, **bold**)", type: "textarea", full: true, rows: 14 },
      { name: "author", label: "Author" }, { name: "read_time", label: "Read time (min)", type: "number" },
      { name: "color", label: "Cover colour", type: "select", options: COLOR_OPTS }, { name: "cover_text", label: "Cover big text" },
      { name: "date", label: "Date", type: "date", list: true }, { name: "published", label: "Published", type: "bool", list: true },
    ],
  },
  {
    key: "downloads", table: "downloads", label: "Downloads", group: "Content", icon: "Download", order: "sort, id",
    fields: [
      { name: "title", label: "Title", required: true, list: true }, { name: "description", label: "Description" },
      { name: "file_url", label: "File or link", type: "file", full: true }, { name: "size", label: "Size text (12 MB · Free)" },
      { name: "icon", label: "Icon", type: "select", options: ["keyboard", "type", "smartphone", "monitor", "file-text", "file-check"] },
      { name: "color", label: "Colour", type: "select", options: COLOR_OPTS }, { name: "sort", label: "Sort", type: "number" },
    ],
  },
  {
    key: "faqs", table: "faqs", label: "FAQ", group: "Content", icon: "MessageCircleQuestion", order: "category, sort",
    fields: [
      { name: "category", label: "Category", type: "select", options: ["CPCT Exam", "Typing Test", "Mock Test", "Payment", "Course"], list: true },
      { name: "question", label: "Question", required: true, list: true, full: true },
      { name: "answer", label: "Answer", type: "textarea", required: true, full: true },
      { name: "sort", label: "Sort", type: "number" },
    ],
  },
  {
    key: "testimonials", table: "testimonials", label: "Toppers / Testimonials", group: "Content", icon: "Award", order: "sort, id",
    fields: [
      { name: "name", label: "Name", required: true, list: true }, { name: "exam", label: "Exam · session", list: true },
      { name: "result", label: "Result badge (Selected / Score 62/75)", list: true }, { name: "quote", label: "Quote", type: "textarea", full: true },
      { name: "city", label: "City" }, { name: "color", label: "Colour", type: "select", options: COLOR_OPTS }, { name: "sort", label: "Sort", type: "number" },
    ],
  },
  {
    key: "plans", table: "plans", label: "Premium Plans", group: "Sales", icon: "Crown", order: "sort",
    fields: [
      { name: "name", label: "Name", required: true, list: true }, { name: "slug", label: "Slug", required: true },
      { name: "price", label: "Price (₹)", type: "number", list: true }, { name: "mrp", label: "MRP (₹)", type: "number" },
      { name: "subtitle", label: "Subtitle" }, { name: "validity_days", label: "Validity (days)", type: "number", list: true },
      { name: "features", label: "Features: '+included' or '-not included', one per line", type: "textarea", full: true },
      { name: "popular", label: "Most popular", type: "bool" }, { name: "sort", label: "Sort", type: "number" }, { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "coupons", table: "coupons", label: "Coupons", group: "Sales", icon: "Ticket", order: "id",
    fields: [
      { name: "code", label: "Code", required: true, list: true }, { name: "discount", label: "Discount", type: "number", list: true },
      { name: "is_percent", label: "Discount is %", type: "bool", list: true }, { name: "active", label: "Active", type: "bool", list: true },
    ],
  },
  {
    key: "orders", table: "orders", label: "Orders / Payments", group: "Sales", icon: "Receipt", order: "created_at DESC", search: ["name", "mobile", "item_name"],
    filters: [{ name: "status", options: ["pending", "paid", "failed"] }],
    fields: [
      { name: "item_name", label: "Item", list: true }, { name: "item", label: "Item key (plan:slug / course:slug / material:slug)" },
      { name: "name", label: "Name", list: true }, { name: "mobile", label: "Mobile", list: true }, { name: "email", label: "Email" },
      { name: "amount", label: "Amount (₹)", type: "number", list: true }, { name: "coupon", label: "Coupon" }, { name: "method", label: "Method" },
      { name: "status", label: "Status (set 'paid' to activate premium)", type: "select", options: ["pending", "paid", "failed"], list: true },
      { name: "gateway_payment_id", label: "Payment ref / UTR" },
      { name: "created_at", label: "Date", type: "datetime", list: true },
    ],
  },
  {
    key: "enquiries", table: "enquiries", label: "Enquiries", group: "Sales", icon: "Inbox", order: "created_at DESC", search: ["name", "mobile", "course"], noCreate: true,
    filters: [{ name: "status", options: ["new", "contacted", "closed"] }],
    fields: [
      { name: "name", label: "Name", list: true }, { name: "mobile", label: "Mobile", list: true }, { name: "course", label: "Course", list: true },
      { name: "type", label: "Type", list: true }, { name: "message", label: "Message", type: "textarea", full: true },
      { name: "status", label: "Status", type: "select", options: ["new", "contacted", "closed"], list: true },
      { name: "created_at", label: "Date", type: "datetime", list: true },
    ],
  },
  {
    key: "users", table: "users", label: "Students / Users", group: "Users", icon: "UserRound", order: "created_at DESC", search: ["name", "mobile", "email", "city"],
    filters: [{ name: "role", options: ["student", "admin"] }],
    fields: [
      { name: "name", label: "Name", required: true, list: true }, { name: "mobile", label: "Mobile", required: true, list: true },
      { name: "email", label: "Email" }, { name: "city", label: "City", list: true },
      { name: "password", label: "Password (blank = unchanged)", type: "password" },
      { name: "role", label: "Role", type: "select", options: ["student", "admin"], list: true },
      { name: "target_exam", label: "Target exam" }, { name: "exam_date", label: "Exam date" },
      { name: "premium_plan", label: "Premium plan", list: true }, { name: "premium_till", label: "Premium till", type: "date", list: true },
      { name: "blocked", label: "Blocked", type: "bool" },
      { name: "created_at", label: "Joined", type: "datetime", list: true },
    ],
  },
];

export function getResource(key: string) {
  return RESOURCES.find((r) => r.key === key) || null;
}

export const SETTING_GROUPS: { title: string; keys: [string, string, ("text" | "textarea")?][] }[] = [
  { title: "Contact & Brand", keys: [["site_name", "Site name (Hindi)"], ["site_name_en", "Site name (English)"], ["tagline", "Tagline"], ["phone", "Phone"], ["whatsapp", "WhatsApp number (with 91, digits only)"], ["whatsapp_group", "WhatsApp group link"], ["email", "Email"], ["hours", "Hours (top bar)"], ["hours_full", "Hours (contact page)"], ["address", "Address", "textarea"], ["map_embed", "Google Map embed URL (src of iframe)", "textarea"], ["upi_id", "UPI ID for manual payment (optional)"]] },
  { title: "Social & App", keys: [["facebook", "Facebook URL"], ["youtube", "YouTube URL"], ["instagram", "Instagram URL"], ["telegram", "Telegram URL"], ["android_app", "Android app URL"]] },
  { title: "Home page", keys: [["hero_badge", "Hero badge"], ["hero_title_1", "Hero title line 1"], ["hero_title_2", "Hero title line 2 (white)"], ["hero_title_3", "Hero title line 2 (orange)"], ["hero_subtitle", "Hero subtitle", "textarea"], ["stat_1", "Stat 1 (value|label)"], ["stat_2", "Stat 2"], ["stat_3", "Stat 3"], ["stat_4", "Stat 4"], ["cta_title", "Bottom CTA title"], ["cta_subtitle", "Bottom CTA subtitle"], ["footer_about", "Footer about", "textarea"]] },
  { title: "About page", keys: [["about_story", "Our story", "textarea"], ["about_students", "Students stat"], ["about_selections", "Selections stat"], ["about_years", "Experience stat"], ["mission", "Mission"], ["vision", "Vision"], ["values", "Values"]] },
  { title: "Misc", keys: [["weekly_rewards", "Leaderboard weekly rewards text", "textarea"], ["install_help", "Downloads installation help", "textarea"], ["payment_note", "Payment options text", "textarea"]] },
  { title: "Policies (markdown)", keys: [["privacy_policy", "Privacy Policy", "textarea"], ["terms", "Terms & Conditions", "textarea"], ["disclaimer", "Disclaimer", "textarea"], ["refund_policy", "Refund Policy", "textarea"]] },
];
