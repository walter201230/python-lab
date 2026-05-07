'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useByLesson } from '@/store/useProgressSelector';
import type { LessonProgress } from '@/store/progress';
import type { ChapterStat } from '@/lib/chapterStats';
import type { Chapter } from '@/lib/chapters';

interface SmartHeroCtaProps {
  chapters: Chapter[];
  stats: Record<string, ChapterStat>;
  /** 全新用户用的 fallback */
  fallbackHref: string;
}

interface ResumeTarget {
  state: 'fresh' | 'resume' | 'all-done';
  href: string;
  label: string;
  sublabel?: string;
}

/**
 * 首页主 CTA：根据 progress store 状态切换文案 + 跳转目标。
 *
 * - fresh    新用户 / 没碰过任何 lesson：开始第一节
 * - resume   学过一些：跳到第一个未完成的 lesson
 * - all-done 全部学完：跳第一节作复习入口
 *
 * SSR 阶段（zustand 还没 hydrate）一律按 fresh 渲染，避免 hydration mismatch。
 */
export function SmartHeroCta({ chapters, stats, fallbackHref }: SmartHeroCtaProps) {
  const byLesson = useByLesson();
  const target = useMemo(
    () => computeTarget(chapters, stats, fallbackHref, byLesson),
    [chapters, stats, fallbackHref, byLesson],
  );

  return (
    <Link
      href={target.href}
      className="gradient-tech-green group inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/40 focus-ring"
    >
      <span className="flex flex-col items-start leading-tight">
        <span>{target.label}</span>
        {target.sublabel && (
          <span className="text-xs font-normal text-slate-900/75">{target.sublabel}</span>
        )}
      </span>
      <span
        aria-hidden
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

function computeTarget(
  chapters: Chapter[],
  stats: Record<string, ChapterStat>,
  fallbackHref: string,
  byLesson: Record<string, LessonProgress>,
): ResumeTarget {
  // 用户从未学过任何 lesson
  const hasAnyProgress = Object.values(byLesson).some(
    (p) => p.completed.length > 0 || p.lessonCompleted === true,
  );
  if (!hasAnyProgress) {
    return { state: 'fresh', href: fallbackHref, label: '开始第一节' };
  }

  // 找第一个未完成的章节
  for (const ch of chapters) {
    if (ch.status !== 'available' || ch.lessons.length === 0) continue;
    const stat = stats[ch.slug];
    if (!stat) continue;
    const p = byLesson[stat.lessonId];

    const finished =
      stat.totalExercises === 0
        ? p?.lessonCompleted === true
        : (p?.completed.length ?? 0) >= stat.totalExercises;

    if (!finished) {
      const lesson = ch.lessons[0];
      return {
        state: 'resume',
        href: `/lessons/${ch.slug}/${lesson.id}`,
        label: '继续学习',
        sublabel: `第 ${ch.number} 章 · ${ch.title}`,
      };
    }
  }

  // 所有章节都完成了
  return {
    state: 'all-done',
    href: fallbackHref,
    label: '回顾全部章节',
    sublabel: '你已学完全部 29 章 🎉',
  };
}
