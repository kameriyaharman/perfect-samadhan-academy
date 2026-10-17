import Link from "next/link";
import { q } from "@/lib/db";
import AttendanceManager from "./AttendanceManager";

export const metadata = { title: "Attendance" };
export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  let batches: { name: string; timing: string | null; n: number }[] = [];
  try {
    batches = await q(
      "SELECT b.name, b.timing, (SELECT count(*)::int FROM users u WHERE u.batch=b.name AND NOT u.blocked) AS n FROM batches b WHERE b.active ORDER BY b.sort, b.id"
    );
  } catch {}
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Attendance</h1>
          <p className="text-muted">Batch aur date chunein, har student ko Present / Absent / Leave lagayein. Mahine ki report aur CSV bhi yahin se.</p>
        </div>
        <Link href="/admin/r/batches" className="btn-soft">Batches manage karein</Link>
      </div>
      {batches.length ? (
        <AttendanceManager batches={batches} />
      ) : (
        <div className="card mt-6 p-8 text-center">
          <p className="text-muted">Abhi koi batch nahi hai. Pehle batch banayein (jaise "CPCT Morning 8 AM"), phir students ko us batch me jodein.</p>
          <Link href="/admin/r/batches" className="btn-primary mt-4 inline-flex">Pehla batch banayein</Link>
        </div>
      )}
    </div>
  );
}
