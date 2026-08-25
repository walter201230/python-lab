import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CHAPTERS } from '@/lib/chapters';
import { loadLesson } from '@/lib/loadLesson';
import { LessonReadLayout } from '@/components/lesson/LessonReadLayout';

const SITE_NAME = '小白学 Python';

export function generateStaticParams() {
  return CHAPTERS
    .filter((ch) => ch.status === 'available')
    .flatMap((ch) => ch.lessons.map((l) => ({ chapter: ch.slug, lesson: l.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}): Promise<Metadata> {
  const { chapter, lesson } = await params;
  const data = await loadLesson(chapter, lesson);
  if (!data) {
    return { title: `课程未找到 — ${SITE_NAME}` };
  }

  // 标题与 description 偏「教程正文」语义，与闯关页的「练习/闯关」语义区分开，
  // 让搜索结果更贴近通读意图。description 优先取章节自身的描述而非模板句。
  const chapterMeta = CHAPTERS.find((ch) => ch.slug === chapter);
  const title = `${data.meta.title} 完整讲解 — ${SITE_NAME}`;
  const description = chapterMeta
    ? `${chapterMeta.description} 本页是完整教程正文，${data.meta.title}的全部讲解一次读完。`
    : `${data.meta.title}的完整教程正文，全部讲解一次读完。`;

  return {
    title,
    description,
    alternates: { canonical: `/lessons/${chapter}/${lesson}/read/` },
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function LessonReadPage({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}) {
  const { chapter, lesson } = await params;
  const data = await loadLesson(chapter, lesson);
  if (!data) notFound();
  return <LessonReadLayout meta={data.meta} blocks={data.blocks} exercises={data.exercises} />;
}
