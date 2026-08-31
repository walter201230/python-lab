import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReadStepCardProps {
  content: string;
  index: number;
  totalSteps: number;
  /** 闯关页地址，供代码块的「到闯关页运行」入口使用 */
  practiceHref: string;
}

/**
 * 阅读页的教学步骤卡片——StepCard 的纯静态对应物。
 *
 * 与 StepCard 的区别（见 openspec/changes/add-lesson-read-pages/design.md D4）：
 *   - 不接收 pyStatus / run，因此阅读页不必引入 Pyodide
 *   - python 代码块渲染为静态块，右上角给一个回闯关页的入口，而非「▶ 试运行」
 *   - 没有 read/current/unread 状态——阅读页不读进度，所有段落一律平铺
 * 排版类名与 StepCard 保持一致，两个页面的正文观感相同。
 */
export function ReadStepCard({
  content,
  index,
  totalSteps,
  practiceHref,
}: ReadStepCardProps) {
  const components: Components = {
    pre({ children }) {
      const code = extractCodeFromPre(children);
      if (code && code.lang === 'python') {
        return <StaticCodeBlock code={code.text} practiceHref={practiceHref} />;
      }
      return <pre>{children}</pre>;
    },
  };

  return (
    <section
      id={`step-${index}`}
      className="mt-6 rounded-2xl border border-line bg-surface/60 p-6 shadow-md shadow-emerald-500/5 backdrop-blur-sm sm:p-8"
      aria-label={`教学步骤 ${index + 1}`}
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-xs font-medium text-accent">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-solid" />
        <span className="font-mono">
          教学 {String(index + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </span>
      </div>
      <article className="prose max-w-none prose-headings:mt-0 prose-strong:text-accent-strong prose-code:text-accent-strong">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </article>
    </section>
  );
}

/** 静态 python 代码块：外观对齐 RunnableCodeBlock，但把交互按钮换成回闯关页的链接。 */
function StaticCodeBlock({ code, practiceHref }: { code: string; practiceHref: string }) {
  return (
    <div className="not-prose my-4 overflow-hidden rounded-lg border border-line-strong/60 bg-code/80">
      <div className="flex items-center justify-between border-b border-line bg-surface/60 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
          python
        </span>
        <a
          href={practiceHref}
          className="rounded px-2 py-0.5 text-xs font-medium text-accent-strong transition hover:bg-emerald-500/15 focus-ring"
        >
          到闯关页运行这段 →
        </a>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-accent-stronger">
        <code>{code}</code>
      </pre>
    </div>
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
