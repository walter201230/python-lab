'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePyodide } from '@/lib/usePyodide';
import { useProgress } from '@/store/progress';
import { ExerciseCard } from './ExerciseCard';
import { StepCard } from './StepCard';
import { PyodideToast } from './PyodideToast';
import { LessonStickyBar } from './LessonStickyBar';
import { LessonBottomNav } from './LessonBottomNav';
import { CompletionBanner } from './CompletionBanner';
import { Confetti } from './Confetti';
import { LessonNavigation } from './LessonNavigation';
import { continuationTarget, lessonOutline, visibleBlockCount } from '@/lib/lessonNavigation';
import { ShortcutHint } from './ShortcutHint';
import { useChapterNav } from './hooks/useChapterNav';
import { useLessonHotkeys } from './hooks/useLessonHotkeys';
import type { LoadedLesson } from '@/lib/loadLesson';

/**
 * 渐进通关式布局：按 lesson.blocks 顺序从前往后渲染，
 * 遇到第一个未过关的 exercise 即截断（含此 ex），后续 step+ex 全部隐藏。
 * 过关 = 判分通过 OR 查看过答案（与 store 的 unlocked 语义一致）；
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

  // 庆祝动效：仅在本次会话里 allCompleted 从 false 变 true 时触发。
  // 两个坑：① ref 初值若为 false，重访已通关课程会被当成新通关再放一次；
  // ② zustand persist 水合晚于首渲染，必须等水合完成后再建立基线，否则基线记到的
  // 是水合前的 false，效果同坑 ①。所以先等 hydrated，第一次只记录（null→值）不触发。
  const [confettiKey, setConfettiKey] = useState(0);
  const prevAllCompletedRef = useRef<boolean | null>(null);
  // persist 水合完成信号：订阅 onFinishHydration、快照读 hasHydrated（服务端恒 false）。
  // 用 useSyncExternalStore 而非 setState-in-effect，天然覆盖「订阅前已水合完」的竞态。
  const hydrated = useSyncExternalStore(
    (cb) => useProgress.persist.onFinishHydration(cb),
    () => useProgress.persist.hasHydrated(),
    () => false,
  );
  useEffect(() => {
    if (!hydrated) return;
    if (prevAllCompletedRef.current === false && allCompleted) {
      setConfettiKey((k) => k + 1);
    }
    prevAllCompletedRef.current = allCompleted;
  }, [hydrated, allCompleted]);

  const completed = lessonProgress?.completed;
  const viewedSolution = lessonProgress?.viewedSolution;
  const navigationProgress = useMemo(() => ({ completed: completed ?? [], viewedSolution: viewedSolution ?? [] }), [completed, viewedSolution]);
  const visibleBlocks = useMemo(() => blocks.slice(0, visibleBlockCount(blocks, navigationProgress)), [blocks, navigationProgress]);
  const outline = useMemo(() => lessonOutline(blocks, 'practice', navigationProgress), [blocks, navigationProgress]);

  // 从阅读页或外部链接进入时，等进度恢复、目标实际渲染后再定位。
  const positionedHash = useRef('');
  useEffect(() => {
    if (!hydrated || !window.location.hash || positionedHash.current === window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ block: 'start' });
      positionedHash.current = window.location.hash;
    }
  }, [hydrated, visibleBlocks.length]);

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
    <LessonNavigation
      chapter={meta.chapter}
      lessonId={meta.id}
      title={meta.title}
      mode="practice"
      outline={outline}
      exerciseNavigation={<LessonStickyBar items={outline} completedCount={completedCount} />}
    >
      <PyodideToast status={pyStatus} />
      <Confetti key={confettiKey} trigger={confettiKey > 0} />
      <ShortcutHint />

      <article className="min-w-0 py-8 sm:py-10">
        <header className="mb-2">
          <h1 className="text-3xl font-bold text-fg sm:text-4xl">{meta.title}</h1>
          {exercises.length > 0 && (
            <p className="mt-1.5 text-sm text-fg-subtle">
              <span className="text-accent">{exercises.length}</span> 道练习题
              <span className="mx-2 text-fg-faint">·</span>
              预计 <span className="text-accent">{meta.estimatedMinutes}</span> 分钟
              <span className="mx-2 text-fg-faint">·</span>
              做对一题解锁下一段
            </p>
          )}
          {exercises.length === 0 && (
            <p className="mt-1.5 text-sm text-fg-subtle">
              本章为概念阅读 · 预计{' '}
              <span className="text-accent">{meta.estimatedMinutes}</span> 分钟
            </p>
          )}
          <p className="mt-2 text-sm">
            <Link
              href={`/lessons/${meta.chapter}/${meta.id}/read/`}
              className="focus-ring rounded text-fg-subtle underline decoration-fg-faint decoration-1 underline-offset-4 transition hover:text-accent-strong hover:decoration-emerald-500/60"
            >
              完整通读本章 →
            </Link>
          </p>
        </header>

        {visibleBlocks.map((block) => {
          if (block.kind === 'step') {
            return (
              <StepCard
                key={`step-${block.stepIndex}`}
                content={block.content}
                codeModes={block.codeModes}
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
              continuation={continuationTarget(outline, block.exercise.id)}
              pyStatus={pyStatus}
              run={run}
            />
          );
        })}

        {!allCompleted && exercises.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 py-4 text-sm text-fg-subtle">
            <span className="text-base" aria-hidden>
              🔒
            </span>
            做对当前题解锁下一段 ·
            <span className="text-accent">{completedCount}</span>
            <span aria-hidden>/</span>
            <span>{exercises.length}</span>
          </div>
        )}

        <section id="lesson-end" aria-label="本章总结">
        {(allCompleted || readOnlyDone) && (
          <CompletionBanner title={meta.title} nextChapter={nextChapter} />
        )}

        <p className="mt-8 text-center text-sm leading-relaxed text-fg-subtle">
          推荐一个，全网最全最友好的中文 AI 编程指南：{' '}
          <a
            href="https://coding.stormzhang.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent transition hover:text-accent-strong"
          >
            coding.stormzhang.ai
          </a>
        </p>

        <LessonBottomNav
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          currentChapterTitle={meta.title}
        />
        </section>
      </article>
    </LessonNavigation>
  );
}
