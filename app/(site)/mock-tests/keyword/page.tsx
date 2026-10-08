import { History } from "lucide-react";
import { q } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import { Container } from "@/components/Section";
import KeywordSearch from "./KeywordSearch";

export const metadata = { title: "Keyword Mock Test" };

export default async function Keyword({ searchParams }: { searchParams: { q?: string } }) {
  const user = await getUser();
  const past = user ? await q(`SELECT id, keyword, score, total, status, started_at FROM attempts WHERE user_id=$1 AND kind='keyword' ORDER BY id DESC LIMIT 8`, [user.id]) : [];
  return (
    <>
      <PageHero crumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Keyword Mock Test" }]} title="कीवर्ड से" highlight="टेस्ट बनाएँ" subtitle={`Koi bhi topic ya keyword likhiye — jaise "Excel", "RAM", "Shortcut" — aur usi par bane sawalon ka test turant dijiye.`} compact />
      <Container className="py-10">
        <KeywordSearch loggedIn={!!user} initial={searchParams.q}>
          <div className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><History className="h-5 w-5" />Aapke pichhle keyword tests</h3>
            {past.length ? (
              <table className="table-x"><thead><tr><th>Keyword</th><th>Score</th><th>Date</th></tr></thead><tbody>
                {past.map((p: any) => (
                  <tr key={p.id}><td><a href={p.status === "submitted" ? `/test/result/${p.id}` : `/test/attempt/${p.id}`} className="hover:text-brand">{p.keyword}</a></td>
                    <td>{p.status === "submitted" ? <span className={`chip ${p.score / p.total >= 0.6 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{p.score}/{p.total}</span> : <span className="chip bg-orange-50 text-orange-600">Pending</span>}</td>
                    <td>{fmtDate(p.started_at, false)}</td></tr>
                ))}</tbody></table>
            ) : <p className="text-sm text-muted">{user ? "Abhi koi keyword test nahi diya." : "Login karke apne tests ka record dekhein."}</p>}
          </div>
        </KeywordSearch>
      </Container>
    </>
  );
}
