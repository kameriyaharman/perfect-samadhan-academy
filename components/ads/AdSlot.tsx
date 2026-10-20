import { q } from "@/lib/db";
import AdCarousel, { type Ad } from "./AdCarousel";

export type AdPlace = "Blog Post" | "Questions Making" | "Mock Test" | "Upcoming Exams" | "Download" | "Notice";

/** Admin → Ads / Banners se aaye image ads. Koi ad na ho to kuch render nahi hota. */
export default async function AdSlot({ place, pos = "top", className, includeAll = true }: { place: AdPlace; pos?: "top" | "bottom"; className?: string; includeAll?: boolean }) {
  let ads: Ad[] = [];
  try {
    ads = await q<Ad>(
      `SELECT id, title, image_url, mobile_image_url, link, new_tab FROM ads
       WHERE active AND image_url <> ''
         AND (placement = $1 OR ($3 AND placement = 'All Sections'))
         AND (CASE WHEN position = 'bottom' THEN 'bottom' ELSE 'top' END) = $2
         AND (start_date IS NULL OR start_date <= (now() AT TIME ZONE 'Asia/Kolkata')::date)
         AND (end_date IS NULL OR end_date >= (now() AT TIME ZONE 'Asia/Kolkata')::date)
       ORDER BY (placement = $1) DESC, sort, id DESC LIMIT 8`,
      [place, pos, includeAll]
    );
  } catch {
    return null; // ads table na ho / DB error — page normal chale
  }
  if (!ads.length) return null;
  return (
    <div className={className ?? (pos === "top" ? "mb-8" : "mt-10")}>
      <AdCarousel ads={ads} />
    </div>
  );
}
