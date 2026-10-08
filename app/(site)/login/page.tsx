import { redirect } from "next/navigation";
import { CheckCircle2, Trophy } from "lucide-react";
import { getUser } from "@/lib/auth";
import { q, one } from "@/lib/db";
import LoginForm from "./LoginForm";

export const metadata = { title: "Login / Register" };

export default async function Login({ searchParams }: { searchParams: { tab?: string; next?: string } }) {
  const u = await getUser();
  const next = searchParams.next && searchParams.next.startsWith("/") ? searchParams.next : "/dashboard";
  if (u) redirect(next);
  const [exams, t, c] = await Promise.all([
    q("SELECT name FROM exams WHERE active ORDER BY sort"),
    one("SELECT * FROM testimonials ORDER BY sort LIMIT 1"),
    one("SELECT count(*)::int n FROM users WHERE created_at > now() - interval '7 days'"),
  ]);
  return (
    <div className="grid min-h-[calc(100vh-120px)] lg:grid-cols-2">
      <div className="hero-bg relative hidden overflow-hidden p-12 text-white lg:block" data-dark>
        <img src="/logo.png" alt="" className="h-32 w-32 rounded-full bg-white p-1" />
        <h1 className="hi mt-10 text-5xl font-bold leading-tight">सफलता की उड़ान<br /><span className="text-gold">यहीं से शुरू</span></h1>
        <ul className="mt-8 space-y-3 text-lg text-white/90">
          {["10 free mock tests", "Unlimited Hindi & English typing", "Free PDFs aur previous papers", "Progress dashboard aur rank"].map((x) => <li key={x} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-400" />{x}</li>)}
        </ul>
        {t && (
          <div className="mt-10 max-w-md rounded-3xl bg-white p-6 text-ink shadow-lift float-y">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold"><Trophy className="h-4 w-4" />Is hafte</span><span className="chip bg-green-50 text-green-700">+{(c?.n || 0) + 600} naye students</span></div>
            <p className="mt-3 text-sm text-muted">“{t.quote}” — {t.name.split(" ")[0]}, {t.exam.split(" ")[0]}</p>
          </div>
        )}
      </div>
      <div className="flex items-start justify-center bg-white px-4 py-10 md:py-16">
        <LoginForm initialTab={searchParams.tab === "register" ? "register" : "login"} next={next} exams={exams.map((e: any) => e.name)} />
      </div>
    </div>
  );
}
