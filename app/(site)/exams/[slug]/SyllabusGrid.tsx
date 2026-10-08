import Link from "next/link";
import { BookOpen, Calculator, Check, Cpu, Globe, Keyboard, Puzzle, PlayCircle, FileText } from "lucide-react";
import { sections } from "@/lib/utils";

const icon = (t: string) => /typing/i.test(t) ? Keyboard : /comput/i.test(t) ? Cpu : /reading|hindi|english/i.test(t) ? BookOpen : /quant|math/i.test(t) ? Calculator : /reason|mental/i.test(t) ? Puzzle : Globe;
export default function SyllabusGrid({ syllabus, slug }: { syllabus: string | null; slug: string }) {
  const secs = sections(syllabus);
  if (!secs.length) return <div className="card p-8 text-muted">Syllabus jald update hoga.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {secs.map((s) => {
        const I = icon(s.title);
        const typing = /typing/i.test(s.title);
        return (
          <div key={s.title} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-2"><h3 className="flex items-center gap-2 font-bold"><I className="h-5 w-5 shrink-0" />{s.title}</h3>{s.meta && <span className="chip bg-brand-50 text-brand">{s.meta}</span>}</div>
            <ul className="mt-3 space-y-1.5 text-[15px]">{s.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-green-600" />{i}</li>)}</ul>
            <div className="mt-auto flex gap-2 pt-4">
              <Link href={`/study-material?q=${encodeURIComponent(s.title.split(" ")[0])}`} className="btn-soft btn-sm"><FileText className="h-4 w-4" />Notes</Link>
              <Link href={typing ? "/typing-test" : `/mock-tests/keyword?q=${encodeURIComponent(s.items[0]?.split(/[ ,]/)[0] || s.title)}`} className="btn-primary btn-sm"><PlayCircle className="h-4 w-4" />Test</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
