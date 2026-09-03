'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hintToMarkdown } from '@/lib/hintMarkdown';

interface ExerciseHintsProps {
  hints: string[];
}

export function ExerciseHints({ hints }: ExerciseHintsProps) {
  const [level, setLevel] = useState(0);
  if (hints.length === 0) return null;

  return (
    <div className="mt-3 border-t border-emerald-500/20 pt-3">
      <button
        type="button"
        onClick={() => setLevel((l) => Math.min(hints.length, l + 1))}
        disabled={level >= hints.length}
        className="text-xs font-medium text-accent-strong underline underline-offset-2 transition hover:text-accent-stronger disabled:text-fg-subtle disabled:no-underline focus-ring rounded"
      >
        💡 提示（{level} / {hints.length}）
      </button>
      {level > 0 && (
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs text-fg-body marker:text-accent/70">
          {hints.slice(0, level).map((h, i) => (
            <li key={i}>
              <div className="prose prose-xs max-w-none prose-p:my-0 prose-pre:my-1.5 prose-pre:border prose-pre:border-emerald-500/15 prose-code:text-accent-strong">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{hintToMarkdown(h)}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
