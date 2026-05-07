'use client';

import { useEffect, useState } from 'react';
import type { LoadedBlock } from '@/lib/loadLesson';
import type { LessonProgress } from '@/store/progress';

interface LessonTocProps {
  blocks: LoadedBlock[];
  progress: LessonProgress | undefined;
  lessonTitle: string;
}

/**
 * 桌面端 lesson 右侧 TOC 侧栏（lg 及以上才显示）。
 *
 * - 列出所有 step + exercise，未解锁的练习题置灰
 * - IntersectionObserver 跟踪当前阅读到的 block，左侧 emerald 高亮条
 * - 点击 a 跳转（解锁的）
 */
export function LessonToc({ blocks, progress, lessonTitle }: LessonTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const ids = blocks.map(blockDomId).filter(Boolean) as string[];
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [blocks]);

  return (
    <aside
      aria-label="本章目录"
      className="sticky top-[120px] hidden max-h-[calc(100vh-140px)] w-64 shrink-0 self-start overflow-y-auto pl-6 lg:block"
    >
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        本章目录
      </div>
      <p className="mb-4 truncate text-sm font-medium text-slate-200">{lessonTitle}</p>
      <ol className="space-y-1 border-l border-slate-800">
        {blocks.map((b) => {
          if (b.kind === 'step') {
            const id = `step-${b.stepIndex}`;
            return (
              <TocItem
                key={id}
                href={`#${id}`}
                active={activeId === id}
                kind="step"
                index={b.stepIndex + 1}
                label={b.title}
              />
            );
          }
          const id = `exercise-${b.exercise.id}`;
          const unlocked = progress?.unlocked.includes(b.exercise.id) ?? b.exerciseIndex === 0;
          const completed = progress?.completed.includes(b.exercise.id) ?? false;
          return (
            <TocItem
              key={id}
              href={unlocked ? `#${id}` : undefined}
              active={activeId === id}
              kind="exercise"
              index={b.exerciseIndex + 1}
              label={b.exercise.title}
              unlocked={unlocked}
              completed={completed}
            />
          );
        })}
      </ol>
    </aside>
  );
}

function blockDomId(b: LoadedBlock): string {
  return b.kind === 'step' ? `step-${b.stepIndex}` : `exercise-${b.exercise.id}`;
}

interface TocItemProps {
  href?: string;
  active: boolean;
  kind: 'step' | 'exercise';
  index: number;
  label: string;
  unlocked?: boolean;
  completed?: boolean;
}

function TocItem({ href, active, kind, index, label, unlocked = true, completed }: TocItemProps) {
  const baseColor = !unlocked
    ? 'text-slate-600'
    : completed
      ? 'text-emerald-400'
      : active
        ? 'text-slate-100'
        : 'text-slate-300 hover:text-slate-100';

  const content = (
    <>
      <span
        aria-hidden
        className={
          'absolute -left-px top-0 h-full w-0.5 transition ' +
          (active ? 'bg-emerald-400' : 'bg-transparent')
        }
      />
      <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">
        {kind === 'step' ? `教学 ${String(index).padStart(2, '0')}` : `练习 ${index}`}
        {completed && ' ✓'}
        {!unlocked && ' 🔒'}
      </span>
      <span className="line-clamp-2 leading-snug">{label}</span>
    </>
  );

  return (
    <li className="relative">
      {href ? (
        <a
          href={href}
          className={
            'flex flex-col gap-0.5 px-3 py-1.5 text-xs transition focus-ring rounded ' +
            baseColor
          }
        >
          {content}
        </a>
      ) : (
        <span
          className={
            'flex cursor-not-allowed flex-col gap-0.5 px-3 py-1.5 text-xs ' + baseColor
          }
          title="完成上一题后解锁"
        >
          {content}
        </span>
      )}
    </li>
  );
}
