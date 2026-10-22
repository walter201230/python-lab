'use client';

import type { LessonOutlineItem } from '@/lib/lessonNavigation';

interface LessonStickyBarProps {
  items: LessonOutlineItem[];
  completedCount: number;
}

/**
 * 学习工具栏中的题号行，窄屏横向滚动，不撑高常驻导航。
 */
export function LessonStickyBar({
  items,
  completedCount,
}: LessonStickyBarProps) {
  const exercises = items.filter((item) => item.kind === 'exercise');
  if (exercises.length === 0) return null;

  return (
    <nav aria-label="练习进度" className="flex min-w-0 flex-1 items-center gap-2">
        <div className="hidden shrink-0 items-center gap-2 text-sm sm:flex">
          <span className="whitespace-nowrap rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-medium text-accent-strong">
            {completedCount} / {exercises.length}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto overscroll-x-contain py-1">
          {exercises.map((ex, i) => {
            const unlocked = ex.available;
            const completed = ex.completed;
            return (
              // key 切换让 completed 状态变化时重新挂载，触发 mount 动画
              <a
                key={`${ex.id}-${completed ? 'done' : 'todo'}`}
                href={unlocked ? `#${ex.id}` : undefined}
                aria-disabled={!unlocked || undefined}
                title={unlocked ? `跳到 ${ex.title}` : '完成上一题后解锁'}
                aria-label={`第 ${i + 1} 题：${ex.title}${
                  completed ? ' 已通过' : !unlocked ? ' 未解锁' : ''
                }`}
                className={
                  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition focus-ring ' +
                  (completed
                    ? 'sticky-dot-pop border border-emerald-500/40 bg-emerald-500/20 text-accent-strong hover:bg-emerald-500/30'
                    : unlocked
                      ? 'bg-raised text-fg hover:bg-raised-hover'
                      : 'pointer-events-none cursor-not-allowed bg-surface text-fg-subtle')
                }
              >
                {completed ? '✓' : i + 1}
              </a>
            );
          })}
        </div>
    </nav>
  );
}
