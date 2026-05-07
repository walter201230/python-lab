'use client';

import type { Exercise } from '@/types/content';
import type { LessonProgress } from '@/store/progress';

interface LessonStickyBarProps {
  title: string;
  exercises: Exercise[];
  progress: LessonProgress | undefined;
  completedCount: number;
}

/**
 * Lesson 页顶部 sticky bar：左侧标题 + 进度徽章，右侧 1..N 题号方块。
 *
 * 移动端策略：
 *   - 标题隐藏，给题号方块腾位置
 *   - 题号方块 40×40（满足 Apple HIG 44pt 接近值，间距 8px 满足 touch-spacing）
 *   - 桌面端 36×36（更紧凑）
 */
export function LessonStickyBar({
  title,
  exercises,
  progress,
  completedCount,
}: LessonStickyBarProps) {
  if (exercises.length === 0) return null;

  return (
    <div className="sticky top-[57px] z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden truncate font-semibold text-slate-100 sm:block">
            {title}
          </span>
          <span className="whitespace-nowrap rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-medium text-emerald-300">
            {completedCount} / {exercises.length}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {exercises.map((ex, i) => {
            const unlocked = progress?.unlocked.includes(ex.id) ?? i === 0;
            const completed = progress?.completed.includes(ex.id) ?? false;
            return (
              // key 切换让 completed 状态变化时重新挂载，触发 mount 动画
              <a
                key={`${ex.id}-${completed ? 'done' : 'todo'}`}
                href={unlocked ? `#exercise-${ex.id}` : undefined}
                title={unlocked ? `跳到 ${ex.title}` : '完成上一题后解锁'}
                aria-label={`第 ${i + 1} 题：${ex.title}${
                  completed ? ' 已通过' : !unlocked ? ' 未解锁' : ''
                }`}
                className={
                  'inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition focus-ring sm:h-9 sm:w-9 ' +
                  (completed
                    ? 'sticky-dot-pop border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : unlocked
                      ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                      : 'pointer-events-none cursor-not-allowed bg-slate-900 text-slate-500')
                }
              >
                {completed ? '✓' : i + 1}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
