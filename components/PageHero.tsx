import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PageHero({
  crumbs = [], title, highlight, after, subtitle, chips, children, compact,
}: {
  crumbs?: { label: string; href?: string }[]; title: React.ReactNode; highlight?: string; after?: React.ReactNode;
  subtitle?: React.ReactNode; chips?: React.ReactNode[]; children?: React.ReactNode; compact?: boolean;
}) {
  return (
    <section className="hero-bg text-white relative overflow-hidden" data-dark>
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
      <div className={`mx-auto max-w-7xl px-4 md:px-8 ${compact ? "py-10" : "py-10 md:py-14"} relative`}>
        {crumbs.length > 0 && (
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-white/75">
            <Link href="/" className="hover:text-white">Home</Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="font-semibold text-white">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="hi text-3xl sm:text-4xl md:text-[46px] font-bold leading-tight reveal">
          {title}{highlight && <> <span className="text-gold">{highlight}</span></>}{after}
        </h1>
        {subtitle && <p className="mt-3 max-w-3xl text-[15px] md:text-[17px] text-white/85 reveal">{subtitle}</p>}
        {chips && chips.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {chips.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur">{c}</span>
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
