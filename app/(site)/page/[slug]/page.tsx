import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { md } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";

const MAP: Record<string, [string, string]> = { "privacy-policy": ["privacy_policy", "Privacy Policy"], terms: ["terms", "Terms & Conditions"], disclaimer: ["disclaimer", "Disclaimer"], "refund-policy": ["refund_policy", "Refund Policy"] };
export async function generateMetadata({ params }: { params: { slug: string } }) { return { title: MAP[params.slug]?.[1] || "Page" }; }
export default async function Page({ params }: { params: { slug: string } }) {
  const m = MAP[params.slug];
  if (!m) notFound();
  const s = await getSettings();
  return (
    <>
      <PageHero crumbs={[{ label: m[1] }]} title={m[1]} compact />
      <Container className="py-10"><div className="card prose-psa p-6 md:p-10" dangerouslySetInnerHTML={{ __html: md(s[m[0]] || "Jald update hoga.") }} /></Container>
    </>
  );
}
