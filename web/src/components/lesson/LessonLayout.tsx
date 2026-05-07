'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePyodide } from '@/lib/usePyodide';
import { useProgress } from '@/store/progress';
import { ExerciseCard } from './ExerciseCard';
import { StepCard } from './StepCard';
import { PyodideToast } from './PyodideToast';
import { LessonStickyBar } from './LessonStickyBar';
import { LessonBottomNav } from './LessonBottomNav';
import { CompletionBanner } from './CompletionBanner';
import { Confetti } from './Confetti';
import { LessonToc } from './LessonToc';
import { ShortcutHint } from './ShortcutHint';
import { useChapterNav } from './hooks/useChapterNav';
import { useLessonHotkeys } from './hooks/useLessonHotkeys';
import type { LoadedLesson } from '@/lib/loadLesson';

/**
 * 渐进通关式布局：按 lesson.blocks 顺序从前往后渲染，
 * 遇到第一个未通过的 exercise 即截断（含此 ex），后续 step+ex 全部隐藏。
 * 每过一关，下一段教学和练习才会展开。
 */
export function LessonLayout({ meta, blocks, exercises }: LoadedLesson) {
  const { status: pyStatus, run } = usePyodide();
  const ensureLesson = useProgress((s) => s.ensureLesson);
  const markLessonCompleted = useProgress((s) => s.markLessonCompleted);
  const lessonProgress = useProgress((s) => s.byLesson[meta.id]);
  const { prevChapter, nextChapter } = useChapterNav(meta.chapter);

  useLessonHotkeys();

  useEffect(() => {
    if (exercises[0]) ensureLesson(meta.id, exercises[0].id);
  }, [meta.id, exercises, ensureLesson]);

  // read-only 章节（无练习题）：进入页面即标记看完
  useEffect(() => {
    if (exercises.length === 0) markLessonCompleted(meta.id);
  }, [meta.id, exercises.length, markLessonCompleted]);

  const totalSteps = useMemo(
    () => blocks.filter((b) => b.kind === 'step').length,
    [blocks],
  );
  const completedCount = lessonProgress?.completed.length ?? 0;
  const allCompleted = exercises.length > 0 && completedCount === exercises.length;
  const readOnlyDone = exercises.length === 0 && (lessonProgress?.lessonCompleted ?? false);

  // 庆祝动效：仅在 allCompleted 从 false 变 true 时触发，避免重新进入页面也放
  const [confettiKey, setConfettiKey] = useState(0);
  const prevAllCompletedRef = useRef(false);
  useEffect(() => {
    if (!prevAllCompletedRef.current && allCompleted) {
      setConfettiKey((k) => k + 1);
    }
    prevAllCompletedRef.current = allCompleted;
  }, [allCompleted]);

  const visibleBlocks = useMemo(() => {
    const completedSet = new Set(lessonProgress?.completed ?? []);
    let cutoff = blocks.length;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.kind === 'exercise' && !completedSet.has(b.exercise.id)) {
        cutoff = i + 1;
        break;
      }
    }
    return blocks.slice(0, cutoff);
  }, [blocks, lessonProgress?.completed]);

  // 当前打开的 step 索引（最后一个未被截断的 step）— 给 StepCard 上"已读/当前"区分
  const currentStepIndex = useMemo(() => {
    const stepBlocks = visibleBlocks.filter((b) => b.kind === 'step');
    if (stepBlocks.length === 0) return -1;
    const last = stepBlocks[stepBlocks.length - 1];
    return last.kind === 'step' ? last.stepIndex : -1;
  }, [visibleBlocks]);

  const nextExerciseMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (let i = 0; i < exercises.length; i++) {
      map[exercises[i].id] = exercises[i + 1]?.id ?? null;
    }
    return map;
  }, [exercises]);

  return (
    <div className="bg-tech-grid relative min-h-[calc(100vh-57px)] bg-slate-950">
      <PyodideToast status={pyStatus} />
      <Confetti key={confettiKey} trigger={confettiKey > 0} />
      <ShortcutHint />

      <LessonStickyBar
        title={meta.title}
        exercises={exercises}
        progress={lessonProgress}
        completedCount={completedCount}
      />

      {/* 主内容 + 桌面端 TOC */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6">
      <article className="min-w-0 flex-1 max-w-4xl py-8 sm:py-10 lg:mx-auto">
        <header className="mb-2">
          <h1 className="text-3xl font-bold text-slate-100 sm:text-4xl">{meta.title}</h1>
          {exercises.length > 0 && (
            <p className="mt-1.5 text-sm text-slate-400">
              <span className="text-emerald-400">{exercises.length}</span> 道练习题
              <span className="mx-2 text-slate-700">·</span>
              预计 <span className="text-emerald-400">{meta.estimatedMinutes}</span> 分钟
              <span className="mx-2 text-slate-700">·</span>
              做对一题解锁下一段
            </p>
          )}
          {exercises.length === 0 && (
            <p className="mt-1.5 text-sm text-slate-400">
              本章为概念阅读 · 预计{' '}
              <span className="text-emerald-400">{meta.estimatedMinutes}</span> 分钟
            </p>
          )}
        </header>

        {visibleBlocks.map((block) => {
          if (block.kind === 'step') {
            return (
              <StepCard
                key={`step-${block.stepIndex}`}
                content={block.content}
                index={block.stepIndex}
                totalSteps={totalSteps}
                state={
                  block.stepIndex < currentStepIndex
                    ? 'read'
                    : block.stepIndex === currentStepIndex
                      ? 'current'
                      : 'unread'
                }
                pyStatus={pyStatus}
                run={run}
              />
            );
          }
          return (
            <ExerciseCard
              key={`ex-${block.exercise.id}`}
              exercise={block.exercise}
              index={block.exerciseIndex}
              totalExercises={exercises.length}
              lessonId={meta.id}
              nextExerciseId={nextExerciseMap[block.exercise.id] ?? null}
              pyStatus={pyStatus}
              run={run}
            />
          );
        })}

        {!allCompleted && exercises.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
            <span className="text-base" aria-hidden>
              🔒
            </span>
            做对当前题解锁下一段 ·
            <span className="text-emerald-400">{completedCount}</span>
            <span aria-hidden>/</span>
            <span>{exercises.length}</span>
          </div>
        )}

        {(allCompleted || readOnlyDone) && (
          <CompletionBanner title={meta.title} nextChapter={nextChapter} />
        )}
      </article>

      <LessonToc blocks={blocks} progress={lessonProgress} lessonTitle={meta.title} />
      </div>

      <LessonBottomNav
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        currentChapterTitle={meta.title}
      />
    </div>
  );
}
