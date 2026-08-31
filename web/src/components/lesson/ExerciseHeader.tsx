'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { buildExerciseFeedbackUrl } from '@/lib/github';
import type { Exercise } from '@/types/content';
import { ExerciseHints } from './ExerciseHints';

interface ExerciseHeaderProps {
  exercise: Exercise;
  index: number;
  totalExercises: number;
  lessonId: string;
  isUnlocked: boolean;
  isCompleted: boolean;
}

/**
 * 练习题题面区域：编号 + 标题 + 状态标签 + 反馈链接 + 题面 markdown + 提示。
 */
export function ExerciseHeader({
  exercise,
  index,
  totalExercises,
  lessonId,
  isUnlocked,
  isCompleted,
}: ExerciseHeaderProps) {
  const feedbackUrl = buildExerciseFeedbackUrl({
    lessonId,
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    currentUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  return (
    <header className="border-b border-line bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-5 sm:p-6">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5 text-accent-strong">
          <span
            className={
              'inline-block h-1.5 w-1.5 rounded-full ' +
              (isUnlocked && !isCompleted ? 'animate-pulse bg-accent-solid' : 'bg-accent-solid')
            }
          />
          练习 {index + 1} / {totalExercises}
        </span>
        <span className="text-accent-faint" aria-hidden>·</span>
        <span className="font-normal text-accent-strong">{exercise.title}</span>
        {isCompleted && (
          <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] text-accent-stronger">
            已通过 ✓
          </span>
        )}
        {!isUnlocked && (
          <span className="rounded-md border border-line-strong bg-raised px-2 py-0.5 text-[10px] text-fg-muted">
            🔒 完成上一题后解锁
          </span>
        )}
        <a
          href={feedbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[11px] font-normal text-fg-subtle underline decoration-fg-faint underline-offset-2 transition hover:text-fg-body hover:decoration-emerald-500/60"
          title="去 GitHub 反馈这道题的问题"
        >
          题目有问题？
        </a>
      </div>
      <div className="prose prose-sm max-w-none prose-p:text-fg prose-strong:text-accent-strong">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{exercise.prompt}</ReactMarkdown>
      </div>
      {isUnlocked && <ExerciseHints hints={exercise.hints} />}
    </header>
  );
}
