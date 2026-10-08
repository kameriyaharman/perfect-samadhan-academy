export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  city TEXT,
  target_exam TEXT,
  exam_date TEXT,
  premium_plan TEXT,
  premium_till TIMESTAMPTZ,
  blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'MP',
  color TEXT NOT NULL DEFAULT 'blue',
  tag TEXT,
  description TEXT,
  overview TEXT,
  pattern TEXT,
  syllabus TEXT,
  eligibility TEXT,
  how_to_apply TEXT,
  admit_card TEXT,
  result_info TEXT,
  guide TEXT,
  important_dates TEXT,
  fee TEXT,
  next_exam TEXT,
  validity TEXT,
  official_url TEXT,
  typing_language TEXT,
  typing_layout TEXT,
  typing_time TEXT,
  typing_speed TEXT,
  show_on_home BOOLEAN NOT NULL DEFAULT true,
  show_in_typing BOOLEAN NOT NULL DEFAULT false,
  students INT NOT NULL DEFAULT 0,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mock_tests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  exam_slug TEXT NOT NULL DEFAULT 'cpct',
  kind TEXT NOT NULL DEFAULT 'full',
  subject TEXT,
  topic TEXT,
  year INT,
  session TEXT,
  duration INT NOT NULL DEFAULT 75,
  marks_per_q REAL NOT NULL DEFAULT 1,
  negative REAL NOT NULL DEFAULT 0,
  pass_marks INT,
  is_free BOOLEAN NOT NULL DEFAULT true,
  pdf_url TEXT,
  instructions TEXT,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id INT REFERENCES mock_tests(id) ON DELETE CASCADE,
  section TEXT NOT NULL DEFAULT 'Computer',
  topic TEXT,
  text_hi TEXT NOT NULL,
  text_en TEXT,
  opt_a_hi TEXT NOT NULL, opt_b_hi TEXT NOT NULL, opt_c_hi TEXT NOT NULL, opt_d_hi TEXT NOT NULL,
  opt_a_en TEXT, opt_b_en TEXT, opt_c_en TEXT, opt_d_en TEXT,
  answer TEXT NOT NULL DEFAULT 'A',
  explanation TEXT,
  source TEXT,
  keywords TEXT,
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS questions_test_idx ON questions(test_id);
CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id INT REFERENCES mock_tests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'full',
  duration INT NOT NULL DEFAULT 75,
  question_ids TEXT NOT NULL,
  answers TEXT NOT NULL DEFAULT '{}',
  marked TEXT NOT NULL DEFAULT '[]',
  visited TEXT NOT NULL DEFAULT '[]',
  language TEXT NOT NULL DEFAULT 'hi',
  status TEXT NOT NULL DEFAULT 'in_progress',
  score REAL, correct INT, wrong INT, skipped INT, total INT,
  time_taken INT,
  section_stats TEXT,
  keyword TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS passages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hindi',
  level TEXT NOT NULL DEFAULT 'exam',
  exam TEXT,
  year INT,
  session TEXT,
  shift TEXT,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS typing_results (
  id SERIAL PRIMARY KEY,
  cert_id TEXT UNIQUE NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  layout TEXT NOT NULL,
  pattern TEXT NOT NULL,
  mode TEXT NOT NULL,
  duration INT NOT NULL,
  passage_title TEXT,
  gross_wpm REAL NOT NULL,
  net_wpm REAL NOT NULL,
  accuracy REAL NOT NULL,
  typed_words INT NOT NULL,
  total_words INT NOT NULL,
  errors INT NOT NULL,
  keystrokes INT NOT NULL DEFAULT 0,
  per_minute TEXT NOT NULL DEFAULT '[]',
  mistakes TEXT NOT NULL DEFAULT '[]',
  qualified BOOLEAN NOT NULL DEFAULT false,
  qualify_speed INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  layout TEXT NOT NULL,
  number INT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  accuracy REAL NOT NULL,
  wpm REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'notes',
  exam TEXT NOT NULL DEFAULT 'CPCT',
  subject TEXT NOT NULL DEFAULT 'Computer',
  language TEXT NOT NULL DEFAULT 'hindi',
  cover_text TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  description TEXT,
  contents TEXT,
  preview_html TEXT,
  file_url TEXT,
  pages INT,
  size_mb REAL,
  downloads INT NOT NULL DEFAULT 0,
  rating REAL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  price INT,
  popular BOOLEAN NOT NULL DEFAULT false,
  related_test_id INT,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS prev_papers (
  id SERIAL PRIMARY KEY,
  exam TEXT NOT NULL DEFAULT 'CPCT',
  title TEXT NOT NULL,
  year INT NOT NULL,
  shifts TEXT NOT NULL DEFAULT 'Shift 1 · 2 · 3',
  language TEXT NOT NULL DEFAULT 'Bilingual',
  pdf_url TEXT,
  test_id INT,
  downloads INT NOT NULL DEFAULT 0,
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS shortcuts (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'MS Word',
  keys TEXT NOT NULL,
  action TEXT NOT NULL,
  hindi TEXT,
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS abbreviations (
  id SERIAL PRIMARY KEY,
  short TEXT NOT NULL,
  full_form TEXT NOT NULL,
  hindi TEXT
);
CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Notification',
  exam TEXT DEFAULT 'CPCT',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  link TEXT,
  link_label TEXT DEFAULT 'Details',
  content TEXT,
  show_in_ticker BOOLEAN NOT NULL DEFAULT false,
  show_on_home BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS upcoming_exams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  mode TEXT NOT NULL DEFAULT 'Offline + Online',
  duration TEXT NOT NULL DEFAULT '3 maah',
  price INT NOT NULL DEFAULT 0,
  mrp INT,
  offer_text TEXT,
  badge TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  start_date TEXT,
  timing TEXT,
  seats INT,
  features TEXT,
  plan TEXT,
  syllabus TEXT,
  faculty TEXT,
  centre TEXT,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  experience TEXT,
  bio TEXT,
  photo_url TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Computer',
  youtube_url TEXT NOT NULL,
  duration TEXT,
  faculty TEXT,
  views TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price INT NOT NULL DEFAULT 0,
  mrp INT,
  subtitle TEXT,
  features TEXT NOT NULL DEFAULT '',
  popular BOOLEAN NOT NULL DEFAULT false,
  validity_days INT NOT NULL DEFAULT 365,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount INT NOT NULL DEFAULT 0,
  is_percent BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  item_name TEXT NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  amount INT NOT NULL,
  coupon TEXT,
  method TEXT NOT NULL DEFAULT 'UPI',
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Exam News',
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Atul Sir',
  read_time INT NOT NULL DEFAULT 5,
  color TEXT NOT NULL DEFAULT 'blue',
  cover_text TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  size TEXT,
  icon TEXT NOT NULL DEFAULT 'keyboard',
  color TEXT NOT NULL DEFAULT 'blue',
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'CPCT Exam',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  exam TEXT NOT NULL,
  result TEXT NOT NULL,
  quote TEXT NOT NULL,
  city TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  sort INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  course TEXT,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'enquiry',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS saved_items (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  ref_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, kind, ref_id)
);
CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;
