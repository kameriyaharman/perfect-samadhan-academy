import { BadgeCheck, Search, XCircle } from "lucide-react";
import { one } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";

export const metadata = { title: "Certificate Verification" };

export default async function Verify({ searchParams }: { searchParams: { id?: string } }) {
  const id = (searchParams.id || "").trim().toUpperCase();
  const r = id ? await one("SELECT * FROM typing_results WHERE upper(cert_id)=$1", [id]) : null;
  return (
    <>
      <PageHero crumbs={[{ label: "Certificate Verify" }]} title="सर्टिफ़िकेट" highlight="वेरिफ़िकेशन" subtitle="Perfect Samadhan Academy dwara jaari typing certificate ki satyata yahan jaanchein." compact />
      <Container className="py-12">
        <div className="card mx-auto max-w-3xl p-6 md:p-8">
          <form className="flex gap-3">
            <label className="flex flex-1 items-center gap-2 rounded-xl border-2 border-brand/70 px-4"><Search className="h-4 w-4 text-muted" /><input name="id" defaultValue={id} placeholder="PSA-T-260624" className="w-full bg-transparent py-3 outline-none" /></label>
            <button className="btn-primary !px-7">Verify</button>
          </form>
          {id && (r ? (
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-green-600 text-white"><BadgeCheck className="h-7 w-7" /></span>
              <div><div className="text-xl font-bold text-green-700">Certificate Valid hai</div><div className="text-[15px]">{r.name} · {r.language === "hindi" ? `Hindi ${r.layout}` : "English"} · <b>{Math.round(r.net_wpm)} Net WPM</b> · {r.accuracy}% accuracy · {fmtDate(r.created_at)}</div></div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-5"><XCircle className="h-8 w-8 text-red-500" /><div><b className="text-red-700">Certificate nahi mila</b><div className="text-sm text-muted">ID dobara jaanchein.</div></div></div>
          ))}
          <p className="mt-5 text-center text-sm text-muted">Certificate par diya QR code scan karke bhi verify kar sakte hain.</p>
        </div>
      </Container>
    </>
  );
}
