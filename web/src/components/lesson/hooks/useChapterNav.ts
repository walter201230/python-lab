'use client';

import { useMemo } from 'react';
import type { Chapter } from '@/lib/chapters';
import { chapterNeighbors } from '@/lib/lessonNavigation';

/**
 * 给定当前章节 slug，返回上一章 / 下一章（仅返回 status='available' 且有 lesson 的）。
 */
export function useChapterNav(currentSlug: string): {
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
} {
  return useMemo(() => chapterNeighbors(currentSlug), [currentSlug]);
}
