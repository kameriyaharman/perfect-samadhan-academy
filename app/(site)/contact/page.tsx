import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import ContactForm from "./ContactForm";

export const metadata = { title: "Contact Us" };

export default async function Contact() {
  const [s, courses] = await Promise.all([getSettings(), q("SELECT title FROM courses WHERE active ORDER BY sort")]);
  const cards = [[Phone, "Call", s.phone, `tel:${(s.phone || "").replace(/\s/g, "")}`, "bg-brand-50 text-brand"], [MessageCircle, "WhatsApp", s.phone, `https://wa.me/${s.whatsapp}`, "bg-green-50 text-green-600"], [Mail, "Email", s.email, `mailto:${s.email}`, "bg-orange-50 text-saffron"], [Clock, "Samay", s.hours_full, null, "bg-violet-50 text-violet-600"]] as const;
  return (
    <>
      <PageHero crumbs={[{ label: "Contact Us" }]} title="हमसे" highlight="संपर्क करें" subtitle="Admission, course ya website se jude kisi bhi sawal ke liye — call, WhatsApp ya form bharein." compact />
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <ContactForm courses={courses.map((c: any) => c.title)} />
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map(([I, t, v, h, c]) => {
                const inner = <><span className={`grid h-12 w-12 place-items-center rounded-xl ${c}`}><I className="h-5 w-5" /></span><div className="mt-5 text-lg font-bold">{t}</div><div className="text-sm text-muted break-all">{v}</div></>;
                return h ? <a key={t} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="card p-5 hover:shadow-lift">{inner}</a> : <div key={t} className="card p-5">{inner}</div>;
              })}
            </div>
            <div className="card overflow-hidden">
              {s.map_embed ? <iframe src={s.map_embed} className="h-64 w-full border-0" loading="lazy" title="map" /> : (
                <div className="grid h-64 place-items-center" style={{ background: "repeating-linear-gradient(45deg,#eef1fd,#eef1fd 14px,#fff 14px,#fff 28px)" }}>
                  <span className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold shadow-lift"><MapPin className="h-5 w-5 text-red-500" />Perfect Samadhan Academy</span>
                </div>
              )}
              <div className="flex items-center gap-2 p-4 text-[15px]"><MapPin className="h-4 w-4 shrink-0" />{s.address}</div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
