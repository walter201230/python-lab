'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ExerciseHintsProps {
  hints: string[];
}

/**
 * 把 hint 字符串转成 markdown：
 *   单行 → 原样（已是 markdown，比如带 `inline-code`）
 *   多行 → 第一行作为说明，后续整段包成 ```python``` 代码块
 *
 * 这是因为现有 hints 的"完整代码：\n<code>" 约定是普通字符串里塞 \n，
 * 在 markdown 里 \n 不算换行，需要包成代码块才会原样显示。
 */
function hintToMarkdown(h: string): string {
  const nl = h.indexOf('\n');
  if (nl === -1) return h;
  const head = h.slice(0, nl).trimEnd();
  const rest = h.slice(nl + 1).replace(/```/g, '​```');
  return `${head}\n\n\`\`\`python\n${rest}\n\`\`\``;
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
        className="text-xs font-medium text-emerald-300 underline underline-offset-2 transition hover:text-emerald-200 disabled:text-slate-500 disabled:no-underline focus-ring rounded"
      >
        💡 提示（{level} / {hints.length}）
      </button>
      {level > 0 && (
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs text-slate-200 marker:text-emerald-400/70">
          {hints.slice(0, level).map((h, i) => (
            <li key={i}>
              <div className="prose prose-invert prose-xs max-w-none prose-p:my-0 prose-p:text-slate-200 prose-pre:my-1.5 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-emerald-500/15 prose-code:text-emerald-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{hintToMarkdown(h)}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
