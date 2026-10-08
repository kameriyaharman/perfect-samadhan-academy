import { Home } from "lucide-react";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center">
      <div>
        <img src="/logo.png" alt="" className="mx-auto h-24 w-24" />
        <h1 className="mt-4 text-6xl font-extrabold text-navy">404</h1>
        <p className="hi mt-2 text-lg text-muted">यह पेज नहीं मिला — शायद हटा दिया गया है।</p>
        <Link href="/" className="btn-primary mt-6"><Home className="h-4 w-4" />Home par jaayein</Link>
      </div>
    </div>
  );
}
