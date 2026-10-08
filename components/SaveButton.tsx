"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Star } from "lucide-react";

export default function SaveButton({ kind, id, big = false, initial = false }: { kind: string; id: number; big?: boolean; initial?: boolean }) {
  const [saved, setSaved] = useState(initial);
  const r = useRouter();
  const go = async () => {
    const x = await fetch("/api/save-item", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id }) });
    if (x.status === 401) return r.push("/login");
    const j = await x.json(); setSaved(j.saved);
  };
  if (big) return <button onClick={go} className="btn-ghost w-full"><Bookmark className={`h-4 w-4 ${saved ? "fill-brand text-brand" : ""}`} />{saved ? "Saved" : "Save"}</button>;
  return <button onClick={go} className="btn-soft btn-sm"><Star className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />{saved ? "Saved" : "Save"}</button>;
}
