import Link from 'next/link';
import type { LoadedLesson } from '@/lib/loadLesson';
import { ReadExerciseLink } from './ReadExerciseLink';
import { ReadStepCard } from './ReadStepCard';

/**
 * 阅读页布局：无门控地铺开该 lesson 的全部教学段。
 *
 * 与闯关页 LessonLayout 的根本区别是它是 Server Component——不订阅 useProgress、
 * 不调用 usePyodide，因此静态产物即最终内容，爬虫与首次访问者所见完全一致
 * （见 openspec/changes/add-lesson-read-pages/design.md D7）。
 */
export function LessonReadLayout({ meta, blocks, exercises }: LoadedLesson) {
  const practiceHref = `/lessons/${meta.chapter}/${meta.id}/`;
  const totalSteps = blocks.filter((b) => b.kind === 'step').length;

  return (
    <div className="bg-tech-grid relative min-h-[calc(100vh-57px)] bg-slate-950">
      <div className="mx-auto max-w-[59rem] px-4 sm:px-6">
        <article className="py-8 sm:py-10">
          <header className="mb-2">
            <h1 className="text-3xl font-bold text-slate-100 sm:text-4xl">{meta.title}</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              完整讲解 · <span className="text-emerald-400">{totalSteps}</span> 段教学
              {exercises.length > 0 && (
                <>
                  <span className="mx-2 text-slate-700">·</span>
                  配 <span className="text-emerald-400">{exercises.length}</span> 道练习题
                </>
              )}
              <span className="mx-2 text-slate-700">·</span>
              预计 <span className="text-emerald-400">{meta.estimatedMinutes}</span> 分钟
            </p>
            <p className="mt-3 text-sm text-slate-400">
              本页是本章的通读版，可直接读完全部讲解。想动手写代码、跑判分，去{' '}
              <Link
                href={practiceHref}
                className="focus-ring rounded font-medium text-emerald-400 underline decoration-emerald-500/40 underline-offset-4 transition hover:text-emerald-300"
              >
                闯关模式
              </Link>
              。
            </p>
          </header>

          {blocks.map((block) => {
            if (block.kind === 'step') {
              return (
                <ReadStepCard
                  key={`step-${block.stepIndex}`}
                  content={block.content}
                  index={block.stepIndex}
                  totalSteps={totalSteps}
                  practiceHref={practiceHref}
                />
              );
            }
            return (
              <ReadExerciseLink
                key={`ex-${block.exercise.id}`}
                title={block.exercise.title}
                index={block.exerciseIndex}
                totalExercises={exercises.length}
                href={`${practiceHref}#exercise-${block.exercise.id}`}
              />
            );
          })}

          <div className="mt-10 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-6 py-6 text-center">
            <p className="text-slate-200">
              读完了？{exercises.length > 0 ? '动手练一遍才算真会。' : '继续下一章吧。'}
            </p>
            <Link
              href={practiceHref}
              className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-5 py-2.5 font-medium text-emerald-200 transition hover:bg-emerald-500/25"
            >
              去闯关模式练习 →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
