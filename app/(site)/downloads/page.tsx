import { Download, Info, Clock } from "lucide-react";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { color } from "@/lib/utils";
import Icon from "@/components/Icon";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";

export const metadata = { title: "Downloads — Software, Fonts & App" };

export default async function Downloads() {
  const [rows, s] = await Promise.all([q(`SELECT * FROM downloads ORDER BY sort, id`), getSettings()]);
  return (
    <>
      <PageHero crumbs={[{ label: "Downloads" }]} title={<span className="text-gold">डाउनलोड</span>} after=" — Software, Fonts & App" subtitle="Hindi typing ke liye zaroori software, fonts aur hamari mobile app — sab free." compact />
      <Container className="py-10">
        {!rows.length ? <Empty /> : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((d: any) => (
              <div key={d.id} className="card flex flex-col p-6">
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${color(d.color).bg} ${color(d.color).text}`}><Icon name={d.icon} /></span>
                <h3 className="mt-5 text-lg font-bold">{d.title}</h3>
                <p className="mt-1 text-[15px] text-muted">{d.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-sm text-muted">{d.size}</span>
                  {d.file_url ? <a href={d.file_url} target={d.file_url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="btn-primary"><Download className="h-4 w-4" />Download</a> : <span className="btn-soft opacity-70"><Clock className="h-4 w-4" />Jald aa raha</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {s.install_help && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-6"><h3 className="flex items-center gap-2 text-lg font-bold text-amber-800"><Info className="h-5 w-5" />Installation Help</h3><p className="mt-2 text-[15px] text-muted">{s.install_help}</p></div>}
      </Container>
    </>
  );
}
