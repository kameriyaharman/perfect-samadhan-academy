import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import FocusBar from "@/components/FocusBar";
import LessonPlayer from "@/components/typing/LessonPlayer";
import LockedNotice from "@/components/typing/LockedNotice";
import { getUser } from "@/lib/auth";
import { canLesson, getAccess } from "@/lib/access";

export default async function Lesson({ params }: { params: { id: string } }) {
  const l = await one("SELECT l.*, f.is_free AS folder_free FROM lessons l LEFT JOIN lesson_folders f ON f.id=l.folder_id WHERE l.id=$1", [Number(params.id) || 0]);
  if (!l) notFound();
  if (l.is_free === false || l.folder_free === false) {
    const user = await getUser();
    if (!canLesson(await getAccess(user), l)) return <LockedNotice title={`Lesson ${l.number} · ${l.title}`} loggedIn={!!user} back={`/typing-test/learn?layout=${l.layout}`} next={`/typing-test/learn/${l.id}`} />;
  }
  const next = l.folder_id
    ? await one("SELECT id FROM lessons WHERE folder_id=$1 AND number>$2 AND active ORDER BY number LIMIT 1", [l.folder_id, l.number])
    : await one("SELECT id FROM lessons WHERE layout=$1 AND number>$2 AND active ORDER BY number LIMIT 1", [l.layout, l.number]);
  return (
    <>
      <FocusBar crumbs={[{ label: "Learn Typing", href: `/typing-test/learn?layout=${l.layout}` }, { label: `Lesson ${l.number} · ${l.title}` }]} />
      <LessonPlayer lesson={{ id: l.id, number: l.number, title: l.title, subtitle: l.subtitle, content: l.content, layout: l.layout }} nextId={next?.id || null} />
    </>
  );
}
