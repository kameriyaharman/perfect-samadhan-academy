"use client";

import { useState } from "react";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export default function DemoLockForm({ next }: { next: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Galat code");
        setCode("");
        setLoading(false);
        return;
      }
      window.location.href = data.next || "/";
    } catch {
      setError("Network error. Dobara try karein.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Access code"
          aria-label="Access code"
          className="w-full rounded-xl border border-line bg-canvas pl-10 pr-4 py-3 text-center text-lg tracking-[0.4em] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-saffron hover:bg-saffron-600 disabled:opacity-60 text-white font-semibold py-3 transition"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {loading ? "Checking…" : "Demo Dekhein"}
      </button>
    </form>
  );
}
