import * as L from "lucide-react";
export default function Icon({ name, className = "h-5 w-5", strokeWidth = 2 }: { name: string; className?: string; strokeWidth?: number }) {
  const pascal = name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const C = (L as any)[pascal] || (L as any)[name] || L.Circle;
  return <C className={className} strokeWidth={strokeWidth} />;
}
