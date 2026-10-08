"use client";
import { useState } from "react";
import { Tag, BadgeCheck } from "lucide-react";
export default function CouponBox() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const check = async () => {
    const r = await fetch(`/api/coupon?item=plan:cpct-test-series&code=${encodeURIComponent(code)}`);
    const j = await r.json();
    setMsg(r.ok ? `${j.code} valid hai — checkout par ₹${j.discount} ki chhoot milegi` : j.error);
  };
  return (
    <div className="card p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold"><Tag className="h-5 w-5" />Coupon Code</h3>
      <div className="mt-3 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SAMADHAN50" className="input" /><button onClick={check} className="btn-primary"><Tag className="h-4 w-4" />Apply</button></div>
      {msg && <p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><BadgeCheck className="h-4 w-4 text-green-600" />{msg}</p>}
    </div>
  );
}
