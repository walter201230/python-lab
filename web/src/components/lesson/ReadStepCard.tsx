import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { headingComponents } from '@/lib/markdownHeadings';
import { remarkHideComments } from '@/lib/markdownComments';
import { TeachingImage } from './TeachingImage';
import { CodeBlock } from './CodeBlock';
import { extractCodeFromPre } from './MarkdownCodeBlock';
import { remarkCodeModes, getCodeMode, codeModeLabels, type CodeMode } from '@/lib/markdownCode';

interface ReadStepCardProps {
  content: string;
  codeModes?: CodeMode[];
  index: number;
  totalSteps: number;
  /** 闯关页地址，供代码块的「到闯关页运行」入口使用 */
  practiceHref: string;
}

/**
 * 阅读页的教学步骤卡片——StepCard 的纯静态对应物。
 *
 * 与 StepCard 的区别（见仓库根 openspec/specs/lesson-read-view/spec.md）：
 *   - 不接收 pyStatus / run，因此阅读页不必引入 Pyodide
 *   - python 代码块渲染为静态块，右上角给一个回闯关页的入口，而非「▶ 试运行」
 *   - 没有 read/current/unread 状态——阅读页不读进度，所有段落一律平铺
 * 排版类名与 StepCard 保持一致，两个页面的正文观感相同。
 */
export function ReadStepCard({
  content,
  codeModes = [],
  index,
  totalSteps,
  practiceHref,
}: ReadStepCardProps) {
  const components: Components = {
    ...headingComponents,
    img: TeachingImage,
    pre({ children, node }) {
      const code = extractCodeFromPre(children);
      if (code && code.lang.toLowerCase() === 'python') {
        return <StaticCodeBlock code={code.text} practiceHref={practiceHref} mode={getCodeMode(node)} />;
      }
      return code ? <CodeBlock code={code.text} language={code.lang} /> : <pre>{children}</pre>;
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
        <ReactMarkdown remarkPlugins={[remarkGfm, [remarkCodeModes, { modes: codeModes }], remarkHideComments]} components={components}>
          {content}
        </ReactMarkdown>
      </article>
    </section>
  );
}

/** 静态 python 代码块：外观对齐 RunnableCodeBlock，但把交互按钮换成回闯关页的链接。 */
function StaticCodeBlock({ code, practiceHref, mode }: { code: string; practiceHref: string; mode: CodeMode }) {
  return (
    <CodeBlock
      code={code}
      language="python"
      usage={codeModeLabels[mode]}
      plainText={mode === 'output' || mode === 'error'}
      actions={mode === 'runnable' && (
        <a href={practiceHref}>
          在闯关页练习 →
        </a>
      )}
    />
  );
}
