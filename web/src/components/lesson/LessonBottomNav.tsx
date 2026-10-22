'use client';

import Link from 'next/link';
import type { Chapter } from '@/lib/chapters';
import { lessonHref, type LessonMode } from '@/lib/lessonNavigation';

interface LessonBottomNavProps {
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  currentChapterTitle: string;
  mode?: LessonMode;
}

/**
 * Lesson 页底部线性导航：上一章 / 当前章 / 下一章。
 *
 * 设计说明：
 *   - 题与题之间不需要"上一题/下一题"按钮——顶部 sticky bar 的题号方块已经覆盖。
 *   - 章与章之间是核心导航：用户读完一章想直接进下一章，不该被迫回首页。
 *   - 移动端三段式横排（上一章 · 当前 · 下一章），单手拇指可达。
 */
export function LessonBottomNav({
  prevChapter,
  nextChapter,
  currentChapterTitle,
  mode = 'practice',
}: LessonBottomNavProps) {
  if (!prevChapter && !nextChapter) return null;

  return (
    <nav
      aria-label="章节导航"
      className="mt-12 border-t border-line pt-8"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {prevChapter ? (
          <NavCard chapter={prevChapter} direction="prev" mode={mode} />
        ) : (
          <div aria-hidden />
        )}

        <div className="hidden items-center justify-center text-center text-xs text-fg-subtle sm:flex">
          <span className="truncate">{currentChapterTitle}</span>
        </div>

        {nextChapter ? (
          <NavCard chapter={nextChapter} direction="next" mode={mode} />
        ) : (
          <div aria-hidden />
        )}
      </div>
    </nav>
  );
}

function NavCard({
  chapter,
  direction,
  mode,
}: {
  chapter: Chapter;
  direction: 'prev' | 'next';
  mode: LessonMode;
}) {
  const firstLesson = chapter.lessons[0];
  if (!firstLesson) return null;
  const href = lessonHref(chapter.slug, firstLesson.id, mode);
  const isNext = direction === 'next';

  return (
    <Link
      href={href}
      className={
        'group flex flex-col gap-1 rounded-xl border border-line bg-surface/50 px-4 py-3 transition hover:border-emerald-500/40 hover:bg-surface focus-ring ' +
        (isNext ? 'text-right sm:col-start-3' : 'sm:col-start-1')
      }
    >
      <span className="text-xs text-fg-subtle">
        {isNext ? '下一章 →' : '← 上一章'}
      </span>
      <span className="truncate text-sm font-medium text-fg-body group-hover:text-accent-strong">
        {String(chapter.number).padStart(2, '0')} · {chapter.title}
      </span>
    </Link>
  );
}
