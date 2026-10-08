import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getUser } from "@/lib/auth";
import { initials } from "@/lib/utils";

export default async function FocusBar({ crumbs, right }: { crumbs: { label: string; href?: string }[]; right?: React.ReactNode }) {
  const user = await getUser();
  return (
    <div className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur no-print">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 md:px-10 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="" className="h-9 w-9" />
          <span className="hi hidden sm:block text-lg font-bold text-brand">परफेक्ट समाधान</span>
        </Link>
        <nav className="ml-2 md:ml-6 flex min-w-0 items-center gap-1.5 text-sm text-muted overflow-hidden">
          {crumbs.map((c, i) => (
            <span key={i} className={`flex items-center gap-1.5 ${i < crumbs.length - 1 ? "hidden md:flex" : "min-w-0"}`}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              {c.href ? <Link href={c.href} className="hover:text-brand whitespace-nowrap">{c.label}</Link> : <span className="truncate font-semibold text-ink">{c.label}</span>}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {right}
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-saffron ring-offset-2">{initials(user.name)}</span>
              <span className="hidden md:block leading-tight"><span className="block text-sm font-bold">{user.name}</span><span className="block text-xs text-muted">{user.target_exam ? `${user.target_exam} Aspirant` : "Student"}</span></span>
            </Link>
          ) : (
            <Link href="/login" className="btn-primary btn-sm">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}
