"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, UserPlus, Bell, ChevronDown, Clock, LogOut, Mail, Menu, Phone, Search, ShieldCheck, User, LayoutDashboard, X } from "lucide-react";
import Logo from "./Logo";
import { initials } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/typing-test", label: "Typing Test" },
  { href: "/mock-tests", label: "Mock Tests" },
  { href: "/study-material", label: "Study Material" },
  { href: "/exams", label: "Exams" },
  { href: "/notices", label: "Notices" },
  { href: "/courses", label: "Courses" },
  { href: "/videos", label: "Videos" },
];

export default function HeaderClient({ user, phone, email, hours, ticker }: { user: { name: string; role: string; premium: boolean } | null; phone: string; email: string; hours: string; ticker: string[] }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [qv, setQv] = useState("");
  useEffect(() => { setOpen(false); setMenu(false); setSearch(false); }, [path]);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href) || (href === "/study-material" && /^\/(previous-papers|shortcut-keys|abbreviations)/.test(path)));
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; };
  const tickerText = ticker.join("  ·  ");

  return (
    <header className="sticky top-0 z-40 no-print">
      <div className="bg-navy text-white/85 text-[12.5px]" data-dark>
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 md:px-8 py-1.5">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="hidden sm:flex items-center gap-1.5 hover:text-white"><Phone className="h-3.5 w-3.5" />{phone}</a>
          <a href={`mailto:${email}`} className="hidden lg:flex items-center gap-1.5 hover:text-white"><Mail className="h-3.5 w-3.5" />{email}</a>
          <span className="hidden lg:flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{hours}</span>
          {tickerText && (
            <div className="relative ml-auto flex min-w-0 flex-1 lg:max-w-[50%] items-center gap-1.5 overflow-hidden text-gold">
              <Bell className="h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
                <Link href="/notices" className="inline-block marquee hover:underline">{tickerText}  ·  {tickerText}  ·  </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 sm:px-4 md:px-8 py-2.5">
          <Logo />
          <nav className="ml-auto hidden xl:flex items-center gap-0.5 2xl:gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`relative whitespace-nowrap px-2 2xl:px-3 py-2 text-[14px] 2xl:text-[15px] font-medium transition ${active(n.href) ? "text-brand" : "text-ink hover:text-brand"}`}>
                {n.label}
                {active(n.href) && <span className="absolute left-3 right-3 -bottom-[13px] h-[3px] rounded-full bg-saffron" />}
              </Link>
            ))}
          </nav>
          <div className="ml-auto xl:ml-3 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button onClick={() => setSearch(true)} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-xl border border-line hover:border-brand hover:text-brand"><Search className="h-4 w-4" /></button>
            {user ? (
              <div className="relative">
                <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 rounded-xl pl-1 pr-2 py-1 hover:bg-canvas">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-saffron ring-offset-2">{initials(user.name)}</span>
                  <span className="hidden md:block whitespace-nowrap text-left leading-tight">
                    <span className="block text-sm font-bold">{user.name.split(" ")[0]}</span>
                    <span className="flex items-center text-xs text-muted">My Account <ChevronDown className="h-3 w-3" /></span>
                  </span>
                </button>
                {menu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-lift reveal">
                    <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-canvas"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
                    <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-canvas"><User className="h-4 w-4" />Profile & Certificates</Link>
                    {user.role === "admin" && <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand hover:bg-canvas"><ShieldCheck className="h-4 w-4" />Admin Panel</Link>}
                    <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex btn-ghost !px-4 !py-2"><LogIn className="h-4 w-4" />Login</Link>
                <Link href="/login?tab=register" className="hidden sm:inline-flex btn-primary !px-4 !py-2"><UserPlus className="h-4 w-4" /><span className="xl:hidden 2xl:inline">Free </span>Register</Link>
              </>
            )}
            <button onClick={() => setOpen(true)} aria-label="Menu" className="xl:hidden grid h-10 w-10 place-items-center rounded-xl bg-brand text-white"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl reveal">
            <div className="mb-4 flex items-center justify-between"><Logo compact /><button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-line"><X className="h-5 w-5" /></button></div>
            <nav className="flex flex-col">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={`rounded-xl px-4 py-3 text-base font-semibold ${active(n.href) ? "bg-brand-50 text-brand" : "text-ink"}`}>{n.label}</Link>
              ))}
              <div className="my-3 h-px bg-line" />
              {[["/typing-test/leaderboard", "Leaderboard"], ["/plans", "Premium Plans"], ["/blog", "Blog"], ["/downloads", "Downloads"], ["/verify", "Certificate Verify"], ["/about", "About Us"], ["/contact", "Contact"], ["/faq", "FAQ"]].map(([h, l]) => (
                <Link key={h} href={h} className="rounded-xl px-4 py-2.5 text-[15px] text-muted">{l}</Link>
              ))}
            </nav>
            {!user && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link href="/login" className="btn-ghost"><LogIn className="h-4 w-4" />Login</Link>
                <Link href="/login?tab=register" className="btn-primary"><UserPlus className="h-4 w-4" />Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {search && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-navy/50 p-4 pt-24 backdrop-blur-sm" onClick={() => setSearch(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (qv.trim()) router.push(`/search?q=${encodeURIComponent(qv.trim())}`); }} className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-3 shadow-2xl reveal">
            <div className="flex items-center gap-2">
              <Search className="ml-2 h-5 w-5 text-muted" />
              <input autoFocus value={qv} onChange={(e) => setQv(e.target.value)} placeholder="Exam, notes, test ya topic search karein — jaise 'Excel', 'CPCT'" className="flex-1 bg-transparent px-2 py-3 text-base outline-none" />
              <button className="btn-orange !py-2.5"><Search className="h-4 w-4" />Search</button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
