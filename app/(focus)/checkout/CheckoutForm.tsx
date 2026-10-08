"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardCheck, CreditCard, Landmark, Loader2, Lock, QrCode, Receipt, ShieldCheck, Tag, Smartphone, MessageCircle } from "lucide-react";
import { rupee } from "@/lib/utils";

declare global { interface Window { Razorpay: any } }
function loadRzp() {
  return new Promise<boolean>((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = () => res(true); s.onerror = () => res(false); document.body.appendChild(s);
  });
}
export default function CheckoutForm({ item, it, mode, user, upi, whatsapp }: { item: string; it: { name: string; price: number; sub: string }; mode?: string; user: { name: string; mobile: string; email: string }; upi: string; whatsapp: string }) {
  const r = useRouter();
  const [f, setF] = useState({ ...user });
  const [method, setMethod] = useState("UPI");
  const [code, setCode] = useState("");
  const [disc, setDisc] = useState<{ code: string; discount: number } | null>(null);
  const [cmsg, setCmsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [manual, setManual] = useState<{ orderId: number; amount: number } | null>(null);
  const total = Math.max(0, it.price - (disc?.discount || 0));
  const apply = async () => {
    const x = await fetch(`/api/coupon?item=${item}&code=${encodeURIComponent(code)}`); const j = await x.json();
    if (x.ok) { setDisc(j); setCmsg(""); } else { setDisc(null); setCmsg(j.error); }
  };
  const pay = async () => {
    setBusy(true); setErr("");
    const x = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item, ...f, method, coupon: disc?.code, mode }) });
    const j = await x.json();
    if (!x.ok) { setErr(j.error || "Error"); setBusy(false); return; }
    if (j.paid) return r.push("/dashboard?paid=1");
    if (j.manual) { setManual({ orderId: j.orderId, amount: j.amount }); setBusy(false); return; }
    if (!(await loadRzp())) { setErr("Payment gateway load nahi hua"); setBusy(false); return; }
    const rz = new window.Razorpay({
      key: j.razorpay.key, amount: j.razorpay.amount, currency: "INR", order_id: j.razorpay.order_id, name: "Perfect Samadhan Academy", description: it.name,
      prefill: { name: f.name, contact: f.mobile, email: f.email }, theme: { color: "#1f35b8" },
      handler: async (resp: any) => {
        const v = await fetch("/api/order/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: j.orderId, ...resp }) });
        if (v.ok) r.push("/dashboard?paid=1"); else { setErr("Payment verify nahi hua — support se sampark karein"); setBusy(false); }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rz.open();
  };
  const M = [["UPI", "UPI", "PhonePe, Google Pay, Paytm, BHIM", QrCode], ["Card", "Debit / Credit Card", "Visa, Mastercard, RuPay", CreditCard], ["NetBanking", "Net Banking", "Sabhi bade bank", Landmark]] as const;
  if (manual) return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h1 className="mt-3 text-2xl font-bold">Order #{manual.orderId} create ho gaya</h1>
        <p className="mt-2 text-muted">{upi ? <>Kripya <b>{rupee(manual.amount)}</b> UPI ID <b className="text-ink">{upi}</b> par bhejein aur screenshot WhatsApp karein.</> : <>Hamari team aapse payment ke liye jald sampark karegi.</>} Payment confirm hote hi admin aapka access activate kar dega.</p>
        {upi && <a href={`upi://pay?pa=${upi}&pn=Perfect%20Samadhan%20Academy&am=${manual.amount}&cu=INR&tn=Order%20${manual.orderId}`} className="btn-orange mt-5"><Smartphone className="h-4 w-4" />UPI App se Pay Karein</a>}
        {whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Order #${manual.orderId} — ${it.name} — ₹${manual.amount} payment screenshot`)}`} target="_blank" rel="noreferrer" className="btn-ghost mt-3 ml-2"><MessageCircle className="h-4 w-4" />WhatsApp Karein</a>}
        <a href="/dashboard" className="mt-5 block text-sm text-brand underline">Dashboard par jaayein</a>
      </div>
    </div>
  );
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_400px]">
      <div className="card p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-navy">Payment</h1>
        <label className="label mt-5">Naam</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Mobile</label><input className="input" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" /></div>
        </div>
        <label className="label mt-5">Payment method</label>
        <div className="space-y-2.5">
          {M.map(([k, t, d, I]) => (
            <button key={k} onClick={() => setMethod(k)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left ${method === k ? "border-brand bg-brand-50/60 ring-2 ring-brand/10" : "border-line"}`}>
              <I className="h-5 w-5" /><span className="flex-1"><b className="block font-medium">{t}</b><span className="text-xs text-muted">{d}</span></span>
              <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${method === k ? "border-brand" : "border-slate-300"}`}>{method === k && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}</span>
            </button>
          ))}
        </div>
        {err && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}
        <button onClick={pay} disabled={busy} className="btn-orange mt-6 w-full !py-4 text-lg">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}{rupee(total)} Pay Karein</button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck className="h-4 w-4" />100% surakshit payment · Razorpay</p>
      </div>
      <aside className="card self-start p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Receipt className="h-5 w-5" />Order Summary</h2>
        <div className="mt-4 flex items-center gap-3 border-b border-line pb-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand"><ClipboardCheck className="h-5 w-5" /></span><span><b className="block text-lg">{it.name}</b><span className="text-sm text-muted">{mode ? `${mode} · ` : ""}{it.sub}</span></span></div>
        <div className="flex justify-between py-2 pt-4"><span>Price</span><b>{rupee(it.price)}</b></div>
        {disc && <div className="flex justify-between py-2"><span>Coupon {disc.code}</span><b className="text-green-600">- {rupee(disc.discount)}</b></div>}
        <div className="flex justify-between py-2"><span>GST</span><span className="font-semibold text-muted">Included</span></div>
        <div className="mt-2 flex justify-between border-t border-line pt-4 text-xl"><b>Total</b><b>{rupee(total)}</b></div>
        <div className="mt-5 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="input !py-2.5" /><button onClick={apply} className="btn-soft"><Tag className="h-4 w-4" />Apply</button></div>
        {cmsg && <p className="mt-2 text-sm text-red-600">{cmsg}</p>}
      </aside>
    </div>
  );
}
