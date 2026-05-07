'use client';

import { useByLesson } from '@/store/useProgressSelector';
import type { ChapterStat } from '@/lib/chapterStats';

/**
 * 首页顶部进度统计：已学完 N / 29 章（client，读 localStorage progress）
 */
export function HomeStats({
  stats,
  total,
}: {
  stats: Record<string, ChapterStat>;
  total: number;
}) {
  const byLesson = useByLesson();

  const done = Object.values(stats).filter(({ lessonId, totalExercises }) => {
    const p = byLesson[lessonId];
    if (!p) return false;
    if (totalExercises === 0) return p.lessonCompleted === true;
    return p.completed.length >= totalExercises;
  }).length;

  if (done === 0) return null;

  return (
    <span className="text-sm text-slate-400">
      已学完{' '}
      <span className="font-semibold text-emerald-400">{done}</span>
      {' / '}
      {total} 章
    </span>
  );
}
