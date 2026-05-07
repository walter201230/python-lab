import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CHAPTERS } from '@/lib/chapters';
import { loadLesson } from '@/lib/loadLesson';
import { LessonLayout } from '@/components/lesson/LessonLayout';

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

  const exerciseCount = data.exercises.length;
  const description =
    exerciseCount > 0
      ? `${data.meta.title} · ${exerciseCount} 道渐进练习题，预计 ${data.meta.estimatedMinutes} 分钟。在浏览器里写 Python，自动判分，做对一题解锁下一题。`
      : `${data.meta.title} · 概念阅读章节，预计 ${data.meta.estimatedMinutes} 分钟。`;

  return {
    title: `${data.meta.title} — ${SITE_NAME}`,
    description,
    openGraph: {
      title: `${data.meta.title} — ${SITE_NAME}`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.meta.title} — ${SITE_NAME}`,
      description,
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}) {
  const { chapter, lesson } = await params;
  const data = await loadLesson(chapter, lesson);
  if (!data) notFound();
  return <LessonLayout meta={data.meta} blocks={data.blocks} exercises={data.exercises} />;
}
