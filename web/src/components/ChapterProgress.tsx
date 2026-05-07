'use client';

import { useProgressSelector } from '@/store/useProgressSelector';

/**
 * 首页章节卡片角落的进度条 + 计数。
 *
 * read-only 章节（totalExercises === 0）显示"内容章节"占位，不画进度条。
 * SSR 阶段 zustand 还没 hydrate，统一显示 0/N，hydrate 后由 useSyncExternalStore 自动 re-render，
 * 避免 hydration mismatch 警告。
 */
export function ChapterProgress({
  lessonId,
  totalExercises,
}: {
  lessonId: string;
  totalExercises: number;
}) {
  const done = useProgressSelector(
    (s) => s.byLesson[lessonId]?.completed.length ?? 0,
    0,
  );
  const lessonCompleted = useProgressSelector(
    (s) => s.byLesson[lessonId]?.lessonCompleted ?? false,
    false,
  );

  if (totalExercises === 0) {
    return (
      <ProgressBar
        label={lessonCompleted ? '已学完' : '内容章节 · 无练习题'}
        finished={lessonCompleted}
        pct={lessonCompleted ? 100 : 0}
      />
    );
  }

  const pct = Math.min(100, Math.round((done / totalExercises) * 100));
  const finished = done >= totalExercises;

  return (
    <ProgressBar
      label={finished ? '已学完' : `进度 ${done} / ${totalExercises}`}
      finished={finished}
      pct={pct}
    />
  );
}

interface ProgressBarProps {
  label: string;
  pct: number;
  finished: boolean;
}

function ProgressBar({ label, pct, finished }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className={finished ? 'font-medium text-emerald-300' : 'text-slate-400'}>
          {label}
        </span>
        <span className={'font-mono ' + (finished ? 'text-emerald-300' : 'text-slate-400')}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="gradient-tech-green h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
