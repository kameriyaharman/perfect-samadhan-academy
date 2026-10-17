"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, CheckCheck, ChevronLeft, ChevronRight, Download, Loader2, Save, Trash2, UserPlus, Users } from "lucide-react";

type Batch = { name: string; timing: string | null; n: number };
type Student = { id: number; name: string; mobile: string; roll_no: string | null };
type Status = "present" | "absent" | "leave" | "late" | "";

const ST: { k: Status; l: string; short: string; on: string }[] = [
  { k: "present", l: "Present", short: "P", on: "bg-green-600 text-white border-green-600" },
  { k: "absent", l: "Absent", short: "A", on: "bg-red-600 text-white border-red-600" },
  { k: "leave", l: "Leave", short: "L", on: "bg-amber-500 text-white border-amber-500" },
  { k: "late", l: "Late", short: "LT", on: "bg-violet-600 text-white border-violet-600" },
];
const CELL: Record<string, string> = { present: "bg-green-100 text-green-800", absent: "bg-red-100 text-red-700", leave: "bg-amber-100 text-amber-800", late: "bg-violet-100 text-violet-800" };

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shiftDay = (s: string, by: number) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + by); return ymd(d); };

export default function AttendanceManager({ batches }: { batches: Batch[] }) {
  const [tab, setTab] = useState<"mark" | "report">("mark");
  const [batch, setBatch] = useState(batches[0].name);
  const [date, setDate] = useState(ymd(new Date()));
  const [month, setMonth] = useState(ymd(new Date()).slice(0, 7));
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<number, Status>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [report, setReport] = useState<{ students: Student[]; days: string[]; rows: { user_id: number; date: string; status: string }[] } | null>(null);
  const [add, setAdd] = useState({ mobile: "", roll: "" });

  const load = useCallback(async () => {
    setBusy(true); setMsg(null);
    const r = await fetch(`/api/admin/attendance?batch=${encodeURIComponent(batch)}&date=${date}`).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (!r || r.error) { setMsg({ ok: false, t: r?.error || "Load nahi hua" }); return; }
    setStudents(r.students);
    const m: Record<number, Status> = {}, n: Record<number, string> = {};
    for (const x of r.marks) { m[x.user_id] = x.status; if (x.note) n[x.user_id] = x.note; }
    setMarks(m); setNotes(n); setDirty(false);
  }, [batch, date]);

  const loadReport = useCallback(async () => {
    setBusy(true);
    const r = await fetch(`/api/admin/attendance?batch=${encodeURIComponent(batch)}&month=${month}`).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r && !r.error) setReport(r);
  }, [batch, month]);

  useEffect(() => { if (tab === "mark") load(); else loadReport(); }, [tab, load, loadReport]);

  const set = (id: number, s: Status) => { setMarks((m) => ({ ...m, [id]: m[id] === s ? "" : s })); setDirty(true); };
  const all = (s: Status) => { const m: Record<number, Status> = {}; for (const x of students) m[x.id] = s; setMarks(m); setDirty(true); };
  const counts = useMemo(() => {
    const c: Record<string, number> = { present: 0, absent: 0, leave: 0, late: 0, none: 0 };
    for (const s of students) c[marks[s.id] || "none"]++;
    return c;
  }, [students, marks]);

  const save = async () => {
    setBusy(true); setMsg(null);
    const rows = students.map((s) => ({ user_id: s.id, status: marks[s.id] || "", note: notes[s.id] || "" }));
    const r = await fetch("/api/admin/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batch, date, rows }) }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.ok) { setDirty(false); setMsg({ ok: true, t: `${r.saved} students ki attendance save ho gayi` }); }
    else setMsg({ ok: false, t: r?.error || "Save nahi hua" });
  };

  const assign = async () => {
    setMsg(null);
    const r = await fetch("/api/admin/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "assign", batch, mobile: add.mobile, rollNo: add.roll }) }).then((x) => x.json()).catch(() => null);
    if (r?.ok) { setAdd({ mobile: "", roll: "" }); setMsg({ ok: true, t: `${r.name} batch me jud gaye` }); load(); }
    else setMsg({ ok: false, t: r?.error || "Nahi jud paya" });
  };
  const remove = async (s: Student) => {
    if (!confirm(`${s.name} ko "${batch}" batch se hatana hai? (Purani attendance bani rahegi)`)) return;
    await fetch("/api/admin/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove", batch, userId: s.id }) });
    load();
  };

  // ---------- report ----------
  const grid = useMemo(() => {
    if (!report) return null;
    const map = new Map<string, string>();
    for (const r of report.rows) map.set(`${r.user_id}|${r.date}`, r.status);
    const lines = report.students.map((s) => {
      const c = { present: 0, absent: 0, leave: 0, late: 0 } as Record<string, number>;
      for (const d of report.days) { const st = map.get(`${s.id}|${d}`); if (st) c[st]++; }
      const held = c.present + c.absent + c.late + c.leave;
      const pct = held ? Math.round(((c.present + c.late) / held) * 100) : null;
      return { s, c, pct };
    });
    return { map, lines };
  }, [report]);

  const csv = () => {
    if (!report || !grid) return;
    const head = ["Roll", "Name", "Mobile", ...report.days.map((d) => d.slice(8)), "Present", "Absent", "Leave", "Late", "%"];
    const body = grid.lines.map(({ s, c, pct }) => [s.roll_no || "", s.name, s.mobile, ...report.days.map((d) => (grid.map.get(`${s.id}|${d}`) || "").slice(0, 1).toUpperCase()), c.present, c.absent, c.leave, c.late, pct ?? ""]);
    const text = [head, ...body].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
    a.download = `attendance-${batch.replace(/\W+/g, "-")}-${month}.csv`;
    a.click();
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="min-w-[220px] flex-1"><span className="label">Batch</span>
          <select className="input" value={batch} onChange={(e) => setBatch(e.target.value)}>
            {batches.map((b) => <option key={b.name} value={b.name}>{b.name}{b.timing ? ` · ${b.timing}` : ""} ({b.n})</option>)}
          </select>
        </label>
        <div className="flex rounded-xl bg-canvas p-1">
          <button onClick={() => setTab("mark")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "mark" ? "bg-white text-brand shadow" : "text-muted"}`}><CalendarCheck className="mr-1 inline h-4 w-4" />Haaziri lagayein</button>
          <button onClick={() => setTab("report")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "report" ? "bg-white text-brand shadow" : "text-muted"}`}>Monthly report</button>
        </div>
      </div>

      {msg && <div className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.t}</div>}

      {tab === "mark" && (
        <div className="card p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setDate(shiftDay(date, -1))} className="grid h-10 w-10 place-items-center rounded-lg border border-line hover:border-brand" aria-label="Pichhla din"><ChevronLeft className="h-4 w-4" /></button>
            <input type="date" className="input !w-auto" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
            <button onClick={() => setDate(shiftDay(date, 1))} className="grid h-10 w-10 place-items-center rounded-lg border border-line hover:border-brand" aria-label="Agla din"><ChevronRight className="h-4 w-4" /></button>
            <span className="ml-1 text-sm text-muted">{new Date(date + "T12:00:00").toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button onClick={() => all("present")} className="btn-soft btn-sm"><CheckCheck className="h-4 w-4" />Sab Present</button>
              <button onClick={() => all("absent")} className="btn-ghost btn-sm">Sab Absent</button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="chip bg-green-50 text-green-700">Present {counts.present}</span>
            <span className="chip bg-red-50 text-red-600">Absent {counts.absent}</span>
            <span className="chip bg-amber-50 text-amber-700">Leave {counts.leave}</span>
            <span className="chip bg-violet-50 text-violet-700">Late {counts.late}</span>
            {counts.none > 0 && <span className="chip bg-slate-100 text-slate-600">Baaki {counts.none}</span>}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="table-x min-w-[640px]">
              <thead><tr><th className="w-16">Roll</th><th>Student</th><th>Status</th><th>Note</th><th className="w-10"></th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="text-muted">{s.roll_no || "—"}</td>
                    <td><b>{s.name}</b><div className="text-xs text-muted">{s.mobile}</div></td>
                    <td>
                      <div className="flex gap-1.5">
                        {ST.map((x) => (
                          <button key={x.k} onClick={() => set(s.id, x.k)} title={x.l}
                            className={`h-9 min-w-[40px] rounded-lg border px-2 text-sm font-bold transition ${marks[s.id] === x.k ? x.on : "border-line bg-white text-muted hover:border-brand"}`}>{x.short}</button>
                        ))}
                      </div>
                    </td>
                    <td><input className="input !py-1.5 text-sm" value={notes[s.id] || ""} placeholder="—" onChange={(e) => { setNotes({ ...notes, [s.id]: e.target.value }); setDirty(true); }} /></td>
                    <td><button onClick={() => remove(s)} className="grid h-8 w-8 place-items-center rounded text-red-500 hover:bg-red-50" aria-label="Batch se hatayein"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!students.length && !busy && <p className="py-6 text-center text-sm text-muted">Is batch me abhi koi student nahi hai — neeche mobile number se jodein.</p>}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
            <span className="flex items-center gap-1.5 text-sm font-semibold"><UserPlus className="h-4 w-4" />Student jodein</span>
            <input className="input !w-44" placeholder="Registered mobile" value={add.mobile} onChange={(e) => setAdd({ ...add, mobile: e.target.value })} />
            <input className="input !w-28" placeholder="Roll no." value={add.roll} onChange={(e) => setAdd({ ...add, roll: e.target.value })} />
            <button onClick={assign} className="btn-soft">Jodein</button>
            <button onClick={save} disabled={busy || !students.length} className="btn-primary ml-auto">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Attendance Save{dirty ? " *" : ""}</button>
          </div>
        </div>
      )}

      {tab === "report" && (
        <div className="card p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <input type="month" className="input !w-auto" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
            {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
            <button onClick={csv} disabled={!report?.students.length} className="btn-soft ml-auto"><Download className="h-4 w-4" />Excel / CSV</button>
          </div>
          {report && grid && (
            report.days.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-xs text-muted">
                      <th className="sticky left-0 bg-white p-2 text-left">Student</th>
                      {report.days.map((d) => <th key={d} className="p-1 text-center font-semibold">{d.slice(8)}</th>)}
                      <th className="p-2">P</th><th className="p-2">A</th><th className="p-2">L</th><th className="p-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grid.lines.map(({ s, c, pct }) => (
                      <tr key={s.id} className="border-t border-line">
                        <td className="sticky left-0 whitespace-nowrap bg-white p-2"><b>{s.name}</b>{s.roll_no && <span className="ml-1 text-xs text-muted">#{s.roll_no}</span>}</td>
                        {report.days.map((d) => { const st = grid.map.get(`${s.id}|${d}`); return <td key={d} className="p-0.5 text-center"><span className={`inline-grid h-6 w-6 place-items-center rounded text-[11px] font-bold ${st ? CELL[st] : "text-slate-300"}`}>{st ? st[0].toUpperCase() : "·"}</span></td>; })}
                        <td className="p-2 text-center text-green-700">{c.present + c.late}</td><td className="p-2 text-center text-red-600">{c.absent}</td><td className="p-2 text-center text-amber-700">{c.leave}</td>
                        <td className={`p-2 text-center font-bold ${pct == null ? "text-muted" : pct >= 75 ? "text-green-700" : "text-red-600"}`}>{pct == null ? "—" : `${pct}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Users className="h-3.5 w-3.5" />Late ko present me gina gaya hai. 75% se kam wale lal rang me.</p>
              </div>
            ) : <p className="py-8 text-center text-sm text-muted">Is mahine abhi koi attendance nahi lagi.</p>
          )}
        </div>
      )}
    </div>
  );
}
