import Link from "next/link";
import { PlayCircle, Video } from "lucide-react";
import { q } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import PageHero from "@/components/PageHero";
import { Container, Empty } from "@/components/Section";
import VideoGrid from "./VideoGrid";

export const metadata = { title: "Video Lectures" };
const PER = 8;

export default async function Videos({ searchParams }: { searchParams: { c?: string; page?: string } }) {
  const cats = (await q(`SELECT category, min(sort) s FROM videos WHERE active GROUP BY category ORDER BY s`)).map((r: any) => r.category);
  const c = searchParams.c && cats.includes(searchParams.c) ? searchParams.c : "";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const args = c ? [c] : [];
  const total = (await q(`SELECT count(*)::int n FROM videos WHERE active ${c ? "AND category=$1" : ""}`, args))[0].n;
  const rows = await q(`SELECT * FROM videos WHERE active ${c ? "AND category=$1" : ""} ORDER BY sort, id LIMIT ${PER} OFFSET ${(page - 1) * PER}`, args);
  const s = await getSettings();
  const pages = Math.ceil(total / PER);
  return (
    <>
      <PageHero crumbs={[{ label: "Videos" }]} title="वीडियो" highlight="लेक्चर" subtitle="Computer, typing aur reasoning ki video classes — experienced faculty ke saath, bilkul aasaan Hindi me."
        chips={[<><Video className="h-4 w-4" />{total}+ videos</>, <a key="yt" href={s.youtube || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-2"><PlayCircle className="h-4 w-4" />YouTube par bhi</a>]} />
      <Container className="py-10">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
          <Link href="/videos" className={`tab ${!c ? "active" : ""}`}>Sabhi</Link>
          {cats.map((k) => <Link key={k} href={`/videos?c=${encodeURIComponent(k)}`} className={`tab ${c === k ? "active" : ""}`}>{k}</Link>)}
        </div>
        {!rows.length ? <Empty /> : <VideoGrid videos={rows as any} />}
        {pages > 1 && <div className="mt-8 flex justify-center gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} href={`/videos?${c ? `c=${encodeURIComponent(c)}&` : ""}page=${n}`} className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-bold ${n === page ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>{n}</Link>)}</div>}
      </Container>
    </>
  );
}
