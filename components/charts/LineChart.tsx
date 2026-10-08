export default function LineChart({ series, labels, min = 0, max, refLine, refLabel, height = 220 }: {
  series: { name?: string; color: string; values: number[] }[]; labels: string[]; min?: number; max?: number; refLine?: number; refLabel?: string; height?: number;
}) {
  const W = 520, H = height, pl = 34, pr = 20, pt = 14, pb = 28;
  const all = series.flatMap((s) => s.values).concat(refLine ? [refLine] : []);
  const top = max ?? Math.max(10, Math.ceil((Math.max(...all, 1) * 1.15) / 5) * 5);
  const n = Math.max(1, labels.length - 1);
  const x = (i: number) => pl + (i / n) * (W - pl - pr);
  const y = (v: number) => pt + (1 - (v - min) / (top - min || 1)) * (H - pt - pb);
  const ticks = [0, 1, 2, 3].map((i) => min + ((top - min) * i) / 3);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {ticks.map((t) => (
        <g key={t}><line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#eceef6" /><text x={pl - 8} y={y(t) + 4} fontSize="10" textAnchor="end" fill="#8a90ad">{Math.round(t)}</text></g>
      ))}
      {labels.map((l, i) => <text key={i} x={x(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="#8a90ad">{l}</text>)}
      {refLine != null && (
        <g><line x1={pl} x2={W - pr} y1={y(refLine)} y2={y(refLine)} stroke="#f28c0f" strokeDasharray="5 4" strokeWidth="1.5" /><text x={W - pr} y={y(refLine) - 5} fontSize="10" textAnchor="end" fill="#de7d06">{refLabel}</text></g>
      )}
      {series.map((s, si) => {
        if (!s.values.length) return null;
        const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        const area = `${x(0)},${y(min)} ${pts} ${x(s.values.length - 1)},${y(min)}`;
        return (
          <g key={si}>
            {series.length === 1 && <polygon points={area} fill={s.color} opacity="0.08" />}
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) => (i === s.values.length - 1 || (series.length === 1 && v === Math.max(...s.values))) ? <circle key={i} cx={x(i)} cy={y(v)} r="4.5" fill="#fff" stroke={s.color} strokeWidth="2" /> : null)}
          </g>
        );
      })}
    </svg>
  );
}
