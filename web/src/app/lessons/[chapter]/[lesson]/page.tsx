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
  const description = data.meta.description + (
    exerciseCount > 0
      ? `配有 ${exerciseCount} 道在线练习，可在浏览器运行代码并自动判分，做对一题解锁下一段。`
      : '本章为概念阅读，无需提交练习代码。结合示例梳理知识要点，为后续学习和本地实践做好准备。'
  );

  return {
    title: `${data.meta.title} — ${SITE_NAME}`,
    description,
    // 闯关页与阅读页内容同源，但闯关页受渐进解锁影响、静态产物只含前半章，
    // 因此规范版本指向内容完整的阅读页（design.md D2：方向不可反）。
    alternates: { canonical: `/lessons/${chapter}/${lesson}/read/` },
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
