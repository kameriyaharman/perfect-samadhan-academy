import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      {s.whatsapp && (
        <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="no-print fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lift transition hover:scale-110">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>
        </a>
      )}
    </>
  );
}
