'use client';

import Link from 'next/link';

interface CompletionBannerProps {
  title: string;
  nextChapter: { slug: string; title: string; lessons: { id: string }[] } | null;
}

/**
 * 章节完成后的庆祝横幅：标题 + 主 CTA（继续下一章）+ 副 CTA（返回目录）。
 */
export function CompletionBanner({ title, nextChapter }: CompletionBannerProps) {
  const nextHref = nextChapter
    ? `/lessons/${nextChapter.slug}/${nextChapter.lessons[0].id}`
    : null;

  return (
    <section className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center backdrop-blur-sm">
      <div className="mb-3 text-4xl" aria-hidden>
        🎉
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-100">
        「{title}」学完了！
      </h2>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-300">
        很好，继续保持。每一章学完都是进步。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {nextHref && nextChapter && (
          <Link
            href={nextHref}
            className="gradient-tech-green inline-flex items-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-950 shadow shadow-emerald-500/40 transition hover:scale-105 hover:opacity-95 focus-ring"
          >
            继续学：{nextChapter.title} →
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-ring"
        >
          返回课程目录
        </Link>
      </div>
    </section>
  );
}
