export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 md:px-8 ${className}`}>{children}</div>;
}
export function SectionTitle({ eyebrow, title, sub, right }: { eyebrow?: string; title: React.ReactNode; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="hi text-2xl md:text-[32px] font-bold text-navy leading-tight">{title}</h2>
        {sub && <p className="mt-1.5 text-sm text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
export function Empty({ text = "Abhi yahan kuch nahi hai." }: { text?: string }) {
  return <div className="card p-10 text-center text-muted">{text}</div>;
}
