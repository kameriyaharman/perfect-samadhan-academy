import Link from "next/link";
import { Clock, MapPin, Users, Video, GraduationCap, Info } from "lucide-react";
import { q } from "@/lib/db";
import { color, rupee } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Courses aur Batch" };

export default async function Courses() {
  const rows = await q(`SELECT * FROM courses WHERE active ORDER BY sort, id`);
  return (
    <>
      <PageHero crumbs={[{ label: "Courses" }]} title="कोर्स और" highlight="बैच" subtitle="Offline classroom + online live classes. Experienced faculty, computer lab, daily test aur doubt session."
        chips={[<><MapPin className="h-4 w-4" />Offline Centre</>, <><Video className="h-4 w-4" />Live Online</>, <><Users className="h-4 w-4" />Chhote batch</>]} />
      <Container className="py-10">
        {!rows.length ? <Empty /> : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((c: any) => (
              <div key={c.id} className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <Link href={`/courses/${c.slug}`} className={`flex h-36 items-end bg-gradient-to-br ${color(c.color).grad} p-5`} data-dark><h3 className="text-2xl font-bold text-white">{c.title}</h3></Link>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">{c.badge && <span className="chip bg-orange-50 text-orange-600">{c.badge}</span>}<span className="chip bg-brand-50 text-brand">{c.mode}</span><span className="chip bg-brand-50 text-brand"><Clock className="h-3 w-3" />{c.duration}</span></div>
                  <div className="mt-3 flex items-end gap-2"><span className="text-3xl font-extrabold">{rupee(c.price)}</span>{c.mrp && <span className="pb-1 text-sm text-muted line-through">{rupee(c.mrp)}</span>}</div>
                  <div className="mt-4 flex gap-2"><Link href={`/checkout?item=course:${c.slug}`} className="btn-primary flex-1"><GraduationCap className="h-4 w-4" />Enroll</Link><Link href={`/courses/${c.slug}`} className="btn-ghost"><Info className="h-4 w-4" />Details</Link></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
