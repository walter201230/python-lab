import Link from 'next/link';
import { CHAPTERS, findFirstAvailable, groupChapters, type Chapter } from '@/lib/chapters';
import { getChapterStats, type ChapterStat } from '@/lib/chapterStats';
import { ChapterProgress } from '@/components/ChapterProgress';
import { HomeStats } from '@/components/HomeStats';
import { SmartHeroCta } from '@/components/SmartHeroCta';
import { PyodideBootstrap } from '@/components/PyodideBootstrap';

export default async function HomePage() {
  const first = findFirstAvailable();
  const startHref = first ? `/lessons/${first.chapter.slug}/${first.lesson.id}` : '#';
  const stats = await getChapterStats();

  return (
    <div className="bg-slate-950">
      <PyodideBootstrap />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/50">
        {/* 网格背景 */}
        <div className="bg-tech-grid absolute inset-0 -z-10" />
        {/* 顶部光晕 */}
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.18),transparent_60%)]" />
        <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(ellipse_at_right,rgba(34,211,238,0.12),transparent_60%)]" />

        <div className="mx-auto max-w-6xl px-4 py-24 md:py-36">
          <h1 className="gradient-text-shimmer mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            学 Python，从零到能用
          </h1>
          <p className="mb-10 text-base leading-relaxed text-slate-200 sm:text-lg md:whitespace-nowrap md:text-xl">
            在浏览器里写代码，一题一题练。代码当场跑、判分秒回，做对一题解锁下一题。
          </p>
          {/* 数据背书 */}
          <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>⭐</span>
              <span className="font-semibold text-slate-100">25k+</span>
              <span>GitHub Star</span>
            </span>
            <span className="text-slate-700" aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>🍴</span>
              <span className="font-semibold text-slate-100">5.4k+</span>
              <span>Fork</span>
            </span>
            <span className="text-slate-700" aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>📚</span>
              <span className="font-semibold text-slate-100">29 章</span>
              <span>免费</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <SmartHeroCta chapters={CHAPTERS} stats={stats} fallbackHref={startHref} />
            <a
              href="https://github.com/walter201230/Python"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 underline decoration-slate-700 decoration-1 underline-offset-4 transition hover:text-slate-100 hover:decoration-emerald-500/60 focus-ring"
            >
              查看原教程 GitHub
              <span aria-hidden className="text-xs">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* 课程目录 */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">课程目录</h2>
            <p className="mt-1 text-sm text-slate-300">29 章分三段循序渐进，每章配渐进练习题。</p>
          </div>
          <HomeStats stats={stats} total={CHAPTERS.length} />
        </div>

        <div className="space-y-14">
          {groupChapters().map(({ group, chapters }) => (
            <div key={group.id}>
              <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-slate-800/80 pb-4">
                <h3 className="text-xl font-semibold text-slate-100 md:text-2xl">
                  {group.title}
                </h3>
                <span className="rounded-md border border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 font-mono text-xs font-medium text-emerald-300">
                  {group.subtitle}
                </span>
                <p className="basis-full text-sm text-slate-400 sm:basis-auto sm:flex-1">
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

  const card = (
    <article
      className={
        'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-slate-900/60 p-6 backdrop-blur-sm transition ' +
        (available
          ? 'border-slate-800 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-emerald-500/10'
          : 'cursor-not-allowed border-slate-800/60 opacity-50')
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-medium text-emerald-300">
          {String(chapter.number).padStart(2, '0')}
        </span>
        {!available && (
          <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
            规划中
          </span>
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold leading-snug text-slate-100">{chapter.title}</h3>
      <p className="text-sm text-slate-300">{chapter.description}</p>
      {available && stat && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          {stat.totalExercises > 0 ? (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>📝</span>
              <span>
                <span className="font-medium text-slate-200">{stat.totalExercises}</span> 题
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
              <span className="text-slate-700" aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <span aria-hidden>⏱</span>
                <span>
                  <span className="font-medium text-slate-200">{stat.estimatedMinutes}</span> 分钟
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
      </div>
      {available && (
        <div className="gradient-tech-green absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
      )}
    </article>
  );

  return href ? <Link href={href} className="block h-full">{card}</Link> : card;
}

