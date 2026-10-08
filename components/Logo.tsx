import Link from "next/link";
export default function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5 shrink" aria-label="Perfect Samadhan Academy home">
      <img src="/logo.png" alt="" className={compact ? "h-9 w-9" : "h-10 w-10 shrink-0 sm:h-11 sm:w-11 md:h-12 md:w-12"} />
      <span className="whitespace-nowrap leading-tight">
        <span className={`hi block font-bold ${compact ? "text-lg" : "text-[16px] sm:text-lg md:text-[21px] xl:text-[19px] 2xl:text-[21px]"} ${light ? "text-white" : "text-brand"}`}>
          {compact ? "परफेक्ट समाधान" : "परफेक्ट समाधान एकेडमी"}
        </span>
        {!compact && <span className={`block text-[8.5px] sm:text-[9.5px] md:text-[10.5px] font-bold tracking-[.12em] sm:tracking-[.16em] ${light ? "text-gold" : "text-saffron"}`}>PERFECT SAMADHAN ACADEMY</span>}
      </span>
    </Link>
  );
}
