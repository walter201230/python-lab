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

  // 共用课程摘要，补充通读页提供的内容；不承诺在阅读页运行代码或判分。
  const title = `${data.meta.title} 完整讲解 — ${SITE_NAME}`;
  const exerciseCount = data.exercises.length;
  const description = data.meta.description + (
    exerciseCount > 0
      ? `本页可完整阅读全部讲解、示例与 ${exerciseCount} 道练习的题面和提示，适合系统学习与复习。`
      : '本页集中展示全部讲解与示例，可按顺序通读，也可随时查阅，适合学习前预习和课后复习。'
  );

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
