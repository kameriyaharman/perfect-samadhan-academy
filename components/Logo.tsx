import Link from "next/link";
export default function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Perfect Samadhan Academy home">
      <img src="/logo.png" alt="" className={compact ? "h-9 w-9" : "h-11 w-11 md:h-12 md:w-12"} />
      <span className="leading-tight">
        <span className={`hi block font-bold ${compact ? "text-lg" : "text-lg md:text-[21px]"} ${light ? "text-white" : "text-brand"}`}>
          {compact ? "परफेक्ट समाधान" : "परफेक्ट समाधान एकेडमी"}
        </span>
        {!compact && <span className={`block text-[9.5px] md:text-[10.5px] font-bold tracking-[.16em] ${light ? "text-gold" : "text-saffron"}`}>PERFECT SAMADHAN ACADEMY</span>}
      </span>
    </Link>
  );
}
