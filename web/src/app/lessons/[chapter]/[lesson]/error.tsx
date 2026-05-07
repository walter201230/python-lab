'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * lesson 渲染异常时的兜底页：避免单题报错导致整站白屏。
 *
 * Next.js App Router 在 server / client 任何阶段抛错都会渲染这里。
 */
export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 把错误打到控制台便于排查；线上接 Sentry 之类的话在这里上报
    console.error('LessonError:', error);
  }, [error]);

  return (
    <div className="bg-tech-grid relative flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-950 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900/80 p-8 text-center backdrop-blur-md">
        <div className="mb-4 text-5xl" aria-hidden>
          ⚠️
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-100">这一节加载出错了</h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          可能是网络抖动或这节内容暂时损坏。可以重试，或者先去其他章节学习。
        </p>
        {error.digest && (
          <p className="mb-6 font-mono text-[10px] text-slate-500">错误代码：{error.digest}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="gradient-tech-green inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-950 shadow shadow-emerald-500/40 transition hover:opacity-95"
          >
            重试
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            返回课程目录
          </Link>
        </div>
      </div>
    </div>
  );
}
