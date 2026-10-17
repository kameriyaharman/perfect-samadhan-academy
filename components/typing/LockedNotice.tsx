import Link from "next/link";
import { ArrowLeft, Crown, Lock, LogIn } from "lucide-react";

/** Premium (paid) typing passage / lesson / exam test — free student ko yahi dikhega */
export default function LockedNotice({ title, loggedIn, back, next }: { title: string; loggedIn: boolean; back: string; next: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-canvas p-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-7 text-center shadow-lift">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-saffron"><Lock className="h-8 w-8" /></span>
        <h1 className="mt-4 text-xl font-bold text-navy">Ye Premium hai</h1>
        <p className="hi mt-1 font-semibold text-brand">{title}</p>
        <p className="mt-2 text-[15px] text-muted">Is test / lesson ke liye Premium plan chahiye. Free tests aur lessons bina plan ke chalte rahenge.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/plans" className="btn-primary justify-center"><Crown className="h-4 w-4" />Premium Plan dekhein</Link>
          {!loggedIn && <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn-soft justify-center"><LogIn className="h-4 w-4" />Premium hai? Login karein</Link>}
          <Link href={back} className="btn-ghost justify-center"><ArrowLeft className="h-4 w-4" />Free tests par wapas</Link>
        </div>
      </div>
    </div>
  );
}
