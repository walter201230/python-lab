'use client';

import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { STICKY_BAR_SCROLL_OFFSET } from '@/lib/layoutConstants';
import { RunnableCodeBlock } from './RunnableCodeBlock';
import type { PyodideStatus, RunOptions, RunResult } from '@/lib/usePyodide';

type StepState = 'read' | 'current' | 'unread';

interface StepCardProps {
  content: string;
  index: number;
  totalSteps: number;
  state: StepState;
  pyStatus: PyodideStatus;
  run: (code: string, opts?: RunOptions) => Promise<RunResult>;
}

/**
 * 教学步骤卡片。
 *
 * - state='read' / 'current' / 'unread' 控制视觉节奏：当前 step 高亮，已读降饱和度
 * - python 代码块替换为 RunnableCodeBlock（带"试运行"按钮）
 */
export function StepCard({ content, index, totalSteps, state, pyStatus, run }: StepCardProps) {
  const components: Components = {
    pre({ children }) {
      const code = extractCodeFromPre(children);
      if (code && code.lang === 'python') {
        return <RunnableCodeBlock code={code.text} pyStatus={pyStatus} run={run} />;
      }
      // 非 python 代码块（或检测失败）：保留默认渲染
      return <pre>{children}</pre>;
    },
  };

  return (
    <section
      id={`step-${index}`}
      style={{ scrollMarginTop: STICKY_BAR_SCROLL_OFFSET }}
      className={
        'mt-6 rounded-2xl border bg-slate-900/60 p-6 backdrop-blur-sm transition-all sm:p-8 ' +
        (state === 'current'
          ? 'border-emerald-500/35 shadow-xl shadow-emerald-500/10'
          : state === 'read'
            ? 'border-slate-800 shadow-md shadow-emerald-500/5 opacity-85'
            : 'border-slate-800 shadow-md shadow-emerald-500/5')
      }
      aria-label={`教学步骤 ${index + 1}`}
    >
      <div
        className={
          'mb-4 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition ' +
          (state === 'current'
            ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300'
            : state === 'read'
              ? 'border-slate-700/70 bg-slate-800/40 text-slate-400'
              : 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400')
        }
      >
        <span
          className={
            'inline-block h-1.5 w-1.5 rounded-full ' +
            (state === 'current'
              ? 'animate-pulse bg-emerald-400'
              : state === 'read'
                ? 'bg-slate-500'
                : 'bg-emerald-400')
          }
        />
        <span className="font-mono">
          教学 {String(index + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </span>
        {state === 'read' && <span className="text-slate-500">· 已读</span>}
      </div>
      <article className="prose prose-invert max-w-none prose-headings:mt-0 prose-headings:text-slate-100 prose-p:text-slate-200 prose-strong:text-emerald-300 prose-blockquote:border-emerald-500/40 prose-blockquote:text-slate-200 prose-li:text-slate-200 prose-code:text-emerald-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </article>
    </section>
  );
}

/**
 * 从 ReactMarkdown 给出的 <pre> children 中拆出代码语言 + 文本。
 * react-markdown 渲染 ```lang\ncode``` 时结构是 <pre><code class="language-lang">code</code></pre>。
 */
function extractCodeFromPre(
  children: ReactNode,
): { lang: string; text: string } | null {
  const arr = Children.toArray(children);
  const codeEl = arr.find((c) => isValidElement(c) && c.type === 'code');
  if (!codeEl || !isValidElement(codeEl)) return null;
  const props = codeEl.props as { className?: string; children?: ReactNode };
  const cls = props.className ?? '';
  const m = /language-(\w+)/.exec(cls);
  const lang = m ? m[1] : '';
  const text = String(props.children ?? '').replace(/\n$/, '');
  return { lang, text };
}
