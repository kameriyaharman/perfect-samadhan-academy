import { Download } from "lucide-react";
import { q } from "@/lib/db";
import PrintButton from "@/components/PrintButton";
export default async function P() {
  const rows = await q(`SELECT * FROM abbreviations ORDER BY short`);
  return (
    <div className="min-h-screen bg-canvas py-6">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end px-4 no-print"><PrintButton className="btn-orange"><Download className="h-4 w-4" />Save as PDF</PrintButton></div>
      <div className="print-area mx-auto max-w-3xl bg-white p-8 shadow-lift">
        <div className="flex items-center gap-3 border-b-2 border-brand pb-3"><img src="/logo.png" className="h-12 w-12" alt="" /><b className="hi text-xl text-brand">परफेक्ट समाधान एकेडमी — Computer Abbreviations</b></div>
        <table className="table-x mt-4"><thead><tr><th>Short</th><th>Full Form</th><th>हिंदी</th></tr></thead><tbody>{rows.map((r: any) => <tr key={r.id}><td className="font-bold">{r.short}</td><td>{r.full_form}</td><td className="hi">{r.hindi}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
