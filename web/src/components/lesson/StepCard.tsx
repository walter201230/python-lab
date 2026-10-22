'use client';

import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { headingComponents } from '@/lib/markdownHeadings';
import { remarkHideComments } from '@/lib/markdownComments';
import { remarkCodeModes, getCodeMode, codeModeLabels, type CodeMode } from '@/lib/markdownCode';
import { STICKY_BAR_SCROLL_OFFSET } from '@/lib/layoutConstants';
import { RunnableCodeBlock } from './RunnableCodeBlock';
import { TeachingImage } from './TeachingImage';
import type { PyodideStatus, RunOptions, RunResult } from '@/lib/usePyodide';

type StepState = 'read' | 'current' | 'unread';

interface StepCardProps {
  content: string;
  codeModes?: CodeMode[];
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
export function StepCard({ content, codeModes = [], index, totalSteps, state, pyStatus, run }: StepCardProps) {
  const components: Components = {
    ...headingComponents,
    img: TeachingImage,
    pre({ children, node }) {
      const code = extractCodeFromPre(children);
      if (code && code.lang.toLowerCase() === 'python') {
        return (
          <RunnableCodeBlock
            code={code.text}
            pyStatus={pyStatus}
            run={run}
            runnable={getCodeMode(node) === 'runnable' && !hasNoRunMeta(node)}
            usage={codeModeLabels[getCodeMode(node)]}
          />
        );
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
        'mt-6 rounded-2xl border bg-surface/60 p-6 backdrop-blur-sm transition-all sm:p-8 ' +
        (state === 'current'
          ? 'border-emerald-500/35 shadow-xl shadow-emerald-500/10'
          : state === 'read'
            ? 'border-line shadow-md shadow-emerald-500/5 opacity-85'
            : 'border-line shadow-md shadow-emerald-500/5')
      }
      aria-label={`教学步骤 ${index + 1}`}
    >
      <div
        className={
          'mb-4 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition ' +
          (state === 'current'
            ? 'border-emerald-500/35 bg-emerald-500/12 text-accent-strong'
            : state === 'read'
              ? 'border-line-strong/70 bg-raised/40 text-fg-subtle'
              : 'border-emerald-500/20 bg-emerald-500/8 text-accent')
        }
      >
        <span
          className={
            'inline-block h-1.5 w-1.5 rounded-full ' +
            (state === 'current'
              ? 'animate-pulse bg-accent-solid'
              : state === 'read'
                ? 'bg-fg-subtle'
                : 'bg-accent-solid')
          }
        />
        <span className="font-mono">
          教学 {String(index + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </span>
        {state === 'read' && <span className="text-fg-subtle">· 已读</span>}
      </div>
      <article className="prose max-w-none prose-headings:mt-0 prose-strong:text-accent-strong prose-code:text-accent-strong">
        <ReactMarkdown remarkPlugins={[remarkGfm, [remarkCodeModes, { modes: codeModes }], remarkHideComments]} components={components}>
          {content}
        </ReactMarkdown>
      </article>
    </section>
  );
}

/**
 * 代码块是否标了 ```python no-run（不给「试运行」按钮）。
 *
 * mdast-util-to-hast 把 ``` 围栏语言后面的 meta 挂在 <code> 元素的 data.meta 上
 * （见 node_modules/mdast-util-to-hast/lib/handlers/code.js），className 里只有
 * language-python，所以 meta 必须从 hast 节点取，不能从 className 正则里拿。
 */
function hasNoRunMeta(node: unknown): boolean {
  const pre = node as
    | { children?: Array<{ tagName?: string; data?: { meta?: string } }> }
    | undefined;
  const codeNode = pre?.children?.find((c) => c.tagName === 'code');
  return /\bno-run\b/.test(codeNode?.data?.meta ?? '');
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
