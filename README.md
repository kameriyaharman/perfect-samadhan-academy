# Perfect Samadhan Academy — Website

Next.js 14 (App Router) + PostgreSQL. Government-exam prep platform: Hindi (Inscript / Remington Gail / Krutidev) & English typing test, CBT mock tests, study material, notices, courses, premium plans and a full admin panel.

## Run locally
```
npm install
DATABASE_URL=postgres://... JWT_SECRET=xyz npm run build && npm start
```
`npm start` creates tables and seeds demo content automatically on first run.

## Environment variables
| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `JWT_SECRET` | Login cookie signing secret (required) |
| `ADMIN_MOBILE` / `ADMIN_PASSWORD` | First admin account (default 9999999999 / admin@123) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional — enables online payments. Without them orders are created as *pending* and admin marks them paid. |

## Admin panel
`/admin` — manage exams, mock tests, questions (CSV bulk import), typing passages & lessons, study material/PDF uploads, previous papers, shortcut keys, abbreviations, notices, courses, faculty, videos, blog, downloads, FAQ, toppers, plans, coupons, orders, enquiries, users and all site text/contact settings.
