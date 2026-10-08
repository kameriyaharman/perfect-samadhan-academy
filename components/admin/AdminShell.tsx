"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LayoutDashboard, LogOut, Menu, Settings, Upload, X } from "lucide-react";
import Icon from "@/components/Icon";

type N = { key: string; label: string; group: string; icon: string };
export default function AdminShell({ nav, name, children }: { nav: N[]; name: string; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const groups = Array.from(new Set(nav.map((n) => n.group)));
  const Item = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
    <Link href={href} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition ${path === href ? "bg-white/15 font-semibold text-white" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>{icon}{label}</Link>
  );
  const Side = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="mb-5 flex items-center gap-2 px-2"><img src="/logo.png" className="h-10 w-10" alt="" /><span><span className="hi block font-bold leading-tight">परफेक्ट समाधान</span><span className="text-[11px] text-gold">Admin Panel</span></span></Link>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-none">
        <div className="space-y-0.5">
          <Item href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <Item href="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Site Settings" />
          <Item href="/admin/import" icon={<Upload className="h-4 w-4" />} label="Bulk Import" />
        </div>
        {groups.map((g) => (
          <div key={g}>
            <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">{g}</div>
            <div className="space-y-0.5">{nav.filter((n) => n.group === g).map((n) => <Item key={n.key} href={`/admin/r/${n.key}`} icon={<Icon name={n.icon} className="h-4 w-4" />} label={n.label} />)}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1 border-t border-white/10 pt-3">
        <a href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/5"><ExternalLink className="h-4 w-4" />Website dekhein</a>
        <a href="/api/auth/logout" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-white/5"><LogOut className="h-4 w-4" />Logout ({name})</a>
      </div>
    </div>
  );
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-navy p-4 text-white lg:block" data-dark>{Side}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} /><aside className="absolute left-0 top-0 h-full w-72 bg-navy p-4 text-white" data-dark><button onClick={() => setOpen(false)} className="absolute right-3 top-3"><X className="h-5 w-5" /></button>{Side}</aside></div>}
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden"><button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white"><Menu className="h-5 w-5" /></button><b>Admin Panel</b></div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
