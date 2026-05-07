'use client';

import { useMemo } from 'react';
import { CHAPTERS, type Chapter } from '@/lib/chapters';

/**
 * 给定当前章节 slug，返回上一章 / 下一章（仅返回 status='available' 且有 lesson 的）。
 */
export function useChapterNav(currentSlug: string): {
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
} {
  return useMemo(() => {
    const idx = CHAPTERS.findIndex((c) => c.slug === currentSlug);
    if (idx === -1) return { prevChapter: null, nextChapter: null };

    const findUsable = (slice: Chapter[]) =>
      slice.find((c) => c.status === 'available' && c.lessons.length > 0) ?? null;

    return {
      prevChapter: findUsable([...CHAPTERS.slice(0, idx)].reverse()),
      nextChapter: findUsable(CHAPTERS.slice(idx + 1)),
    };
  }, [currentSlug]);
}
