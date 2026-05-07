'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GradingResultProps {
  pass: boolean;
  msg: string;
}

/**
 * 练习判分结果横条。通过时绿色 ✓ + spring scale-in 动效；不通过红色。
 */
export function GradingResult({ pass, msg }: GradingResultProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        'border-t-2 p-5 ' + (pass ? 'border-emerald-400 bg-emerald-500/15' : 'border-rose-400 bg-rose-500/15')
      }
    >
      <div className="mb-1.5 flex items-center gap-2 font-semibold">
        {pass ? (
          <>
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/30 text-base text-emerald-200 grading-pop"
            >
              ✓
            </span>
            <span className="text-emerald-200">通过！</span>
          </>
        ) : (
          <>
            <span aria-hidden className="text-rose-300">
              ✗
            </span>
            <span className="text-rose-200">未通过</span>
          </>
        )}
      </div>
      <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-100">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg}</ReactMarkdown>
      </div>
    </div>
  );
}
