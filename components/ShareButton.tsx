"use client";
import { Share2 } from "lucide-react";
export default function ShareButton({ title }: { title: string }) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); alert("Link copy ho gaya!"); }
  };
  return <button onClick={share} className="btn-ghost w-full"><Share2 className="h-4 w-4" />Share</button>;
}
