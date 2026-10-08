import { color } from "@/lib/utils";
export default function Cover({ text, color: c, size = "md" }: { text: string | null; color: string; size?: "md" | "lg" }) {
  const [top, bottom] = (text || "PDF|NOTES").split("|");
  const col = color(c);
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${col.grad} text-white shadow-md ${size === "lg" ? "h-28 w-20" : "h-[96px] w-[74px]"}`}>
      <div className="p-2 text-[9px] font-extrabold leading-tight tracking-wide">{top}</div>
      <div className="absolute bottom-2 left-2 text-[9px] font-extrabold tracking-wide">{bottom}</div>
      <span className="absolute bottom-1.5 right-1 rounded bg-red-500 px-1 text-[7px] font-bold">PDF</span>
    </div>
  );
}
