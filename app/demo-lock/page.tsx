import type { Metadata } from "next";
import DemoLockForm from "./DemoLockForm";

export const metadata: Metadata = {
  title: "Demo Access",
  robots: { index: false, follow: false },
};

export default function DemoLockPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-brand flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-xl2 shadow-lift p-7 sm:p-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Perfect Samadhan Academy" className="h-16 w-auto mx-auto mb-4 object-contain" />
        <h1 className="text-xl font-bold text-ink">Demo Preview</h1>
        <p className="text-sm text-muted mt-1.5 mb-6">
          Website dekhne ke liye access code dalein
          <span className="block font-hindi">वेबसाइट देखने के लिए एक्सेस कोड डालें</span>
        </p>
        <DemoLockForm next={searchParams?.next || "/"} />
        <p className="text-xs text-muted mt-6">Perfect Samadhan Academy · Private demo</p>
      </div>
    </main>
  );
}
