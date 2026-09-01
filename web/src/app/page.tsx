import Link from 'next/link';
import { CHAPTERS, findFirstAvailable, groupChapters, type Chapter } from '@/lib/chapters';
import { getChapterStats, type ChapterStat } from '@/lib/chapterStats';
import { ChapterProgress } from '@/components/ChapterProgress';
import { HomeStats } from '@/components/HomeStats';
import { SmartHeroCta } from '@/components/SmartHeroCta';
import { HeroTerminal } from '@/components/HeroTerminal';
import { PyodideBootstrap } from '@/components/PyodideBootstrap';

export default async function HomePage() {
  const first = findFirstAvailable();
  const startHref = first ? `/lessons/${first.chapter.slug}/${first.lesson.id}` : '#';
  const stats = await getChapterStats();

  return (
    <div className="bg-canvas">
      <PyodideBootstrap />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line/50">
        {/* 网格背景 */}
        <div className="bg-tech-grid absolute inset-0 -z-10" />
        {/* 顶部光晕 */}
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.18),transparent_60%)]" />
        <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(ellipse_at_right,rgba(34,211,238,0.12),transparent_60%)]" />

        <div className="mx-auto max-w-6xl px-4 py-24 md:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="gradient-text-shimmer mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-5xl xl:text-6xl">
                小白学 Python
              </h1>
              <p className="mb-10 text-base leading-relaxed text-fg-body sm:text-lg md:text-xl">
                浏览器里写代码，代码当场跑、判分秒回，<span className="whitespace-nowrap">做对一题解锁下一题。</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <SmartHeroCta chapters={CHAPTERS} stats={stats} fallbackHref={startHref} />
                <a
                  href="https://github.com/walter201230/Python"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted underline decoration-fg-faint decoration-1 underline-offset-4 transition hover:text-fg hover:decoration-emerald-500/60 focus-ring"
                >
                  查看原教程 GitHub
                  <span aria-hidden className="text-xs">↗</span>
                </a>
              </div>
            </div>
            <HeroTerminal />
          </div>
        </div>
      </section>

      {/* 课程目录 */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-fg md:text-3xl">课程目录</h2>
            <p className="mt-1 text-sm text-fg-muted">29 章分三段循序渐进，每章配渐进练习题。</p>
          </div>
          <HomeStats stats={stats} total={CHAPTERS.length} />
        </div>

        <div className="space-y-14">
          {groupChapters().map(({ group, chapters }) => (
            <div key={group.id}>
              <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-line/80 pb-4">
                <h3 className="text-xl font-semibold text-fg md:text-2xl">
                  {group.title}
                </h3>
                <span className="rounded-md border border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 font-mono text-xs font-medium text-accent-strong">
                  {group.subtitle}
                </span>
                <p className="basis-full text-sm text-fg-subtle sm:basis-auto sm:flex-1">
                  {group.description}
                </p>
              </div>
              <div className="grid grid-rows-[auto] gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.map((ch) => (
                  <ChapterCard key={ch.slug} chapter={ch} stat={stats[ch.slug]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function ChapterCard({ chapter, stat }: { chapter: Chapter; stat?: ChapterStat }) {
  const available = chapter.status === 'available';
  const firstLesson = chapter.lessons[0];
  const href = available && firstLesson ? `/lessons/${chapter.slug}/${firstLesson.id}` : null;
  const readHref =
    available && firstLesson ? `/lessons/${chapter.slug}/${firstLesson.id}/read/` : null;

  // 整卡可点（主链接铺满卡片）+「先通读」独立入口叠在上层：
  // Link 不能嵌套 Link，所以主链接改用覆盖层而非包裹整个 article。
  return (
    <article
      className={
        'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-surface/60 p-6 backdrop-blur-sm transition ' +
        (available
          ? 'border-line hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-surface/80 hover:shadow-xl hover:shadow-emerald-500/10'
          : 'cursor-not-allowed border-line/60 opacity-50')
      }
    >
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-0"
          aria-label={`${chapter.title} — 进入闯关模式`}
        />
      )}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-medium text-accent-strong">
          {String(chapter.number).padStart(2, '0')}
        </span>
        {!available && (
          <span className="rounded-full border border-line-strong bg-raised px-2 py-0.5 text-xs text-fg-muted">
            规划中
          </span>
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold leading-snug text-fg">{chapter.title}</h3>
      <p className="text-sm text-fg-muted">{chapter.description}</p>
      {available && stat && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
          {stat.totalExercises > 0 ? (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>📝</span>
              <span>
                <span className="font-medium text-fg-body">{stat.totalExercises}</span> 题
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>📖</span>
              <span>概念阅读</span>
            </span>
          )}
          {stat.estimatedMinutes > 0 && (
            <>
              <span className="text-fg-faint" aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <span aria-hidden>⏱</span>
                <span>
                  <span className="font-medium text-fg-body">{stat.estimatedMinutes}</span> 分钟
                </span>
              </span>
            </>
          )}
        </div>
      )}
      <div className="mt-auto pt-4">
        {available && stat && (
          <ChapterProgress lessonId={stat.lessonId} totalExercises={stat.totalExercises} />
        )}
        {readHref && (
          <div className="relative z-10 mt-3 flex justify-end">
            <Link
              href={readHref}
              className="focus-ring rounded text-xs text-fg-subtle underline decoration-fg-faint decoration-1 underline-offset-4 transition hover:text-accent-strong hover:decoration-emerald-500/60"
            >
              先通读 →
            </Link>
          </div>
        )}
      </div>
      {available && (
        <div className="gradient-tech-green absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
      )}
    </article>
  );
}

