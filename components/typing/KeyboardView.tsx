"use client";
import { ROWS, layoutMap, FINGER, FINGER_COLOR, type Layout } from "@/lib/keyboard";

export default function KeyboardView({ layout, target, shift, fingerColors = false, pressed }: { layout: Layout; target?: string | null; shift?: boolean; fingerColors?: boolean; pressed?: string | null }) {
  const map = layoutMap(layout);
  return (
    <div className="overflow-x-auto scrollbar-none rounded-2xl bg-canvas p-2 md:p-3">
      <div className="min-w-[640px] space-y-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map((k) => {
              const isTarget = k.code === target || (shift && (k.code === "ShiftLeft" || k.code === "ShiftRight") && target && target !== "Space");
              const isPressed = pressed === k.code;
              const m = map?.[k.code];
              const f = FINGER[k.code];
              const bg = isTarget ? "#1f35b8" : fingerColors && f ? FINGER_COLOR[f] : "#ffffff";
              return (
                <div key={k.code} style={{ flex: k.w || 1, background: bg }}
                  className={`relative h-11 md:h-12 rounded-lg border shadow-[0_2px_0_#dfe3ef] transition-all duration-100 ${isTarget ? "border-navy text-white -translate-y-0.5 shadow-[0_3px_0_#0e1756]" : "border-line"} ${isPressed ? "scale-95 ring-2 ring-saffron" : ""} ${(k.code === "KeyF" || k.code === "KeyJ") && !isTarget ? "after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:rounded after:bg-saffron" : ""}`}>
                  <span className={`absolute left-1.5 top-1 text-[10px] ${isTarget ? "text-white/80" : "text-muted"}`}>{k.label}</span>
                  {m ? (
                    <span className="hi absolute bottom-1 right-2 text-[15px] md:text-base font-medium">{m[0].startsWith("्") || /^[ािीुूृेैोौंँ़ॅॉॆॊ]/.test(m[0]) ? "◌" + m[0] : m[0]}</span>
                  ) : k.code === "Space" ? <span className={`absolute inset-0 grid place-items-center text-[11px] ${isTarget ? "text-white" : "text-muted"}`}>Space</span> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
