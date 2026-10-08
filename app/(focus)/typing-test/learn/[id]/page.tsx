import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import FocusBar from "@/components/FocusBar";
import LessonPlayer from "@/components/typing/LessonPlayer";

export default async function Lesson({ params }: { params: { id: string } }) {
  const l = await one("SELECT * FROM lessons WHERE id=$1", [Number(params.id) || 0]);
  if (!l) notFound();
  const next = await one("SELECT id FROM lessons WHERE layout=$1 AND number>$2 AND active ORDER BY number LIMIT 1", [l.layout, l.number]);
  return (
    <>
      <FocusBar crumbs={[{ label: "Learn Typing", href: `/typing-test/learn?layout=${l.layout}` }, { label: `Lesson ${l.number} · ${l.title}` }]} />
      <LessonPlayer lesson={{ id: l.id, number: l.number, title: l.title, subtitle: l.subtitle, content: l.content, layout: l.layout }} nextId={next?.id || null} />
    </>
  );
}
