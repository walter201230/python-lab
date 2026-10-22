import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownCodeComponents } from './MarkdownCodeBlock';
import { hintToMarkdown } from '@/lib/hintMarkdown';
import type { Exercise } from '@/types/content';

interface ReadExerciseCardProps {
  exercise: Exercise;
  index: number;
  totalExercises: number;
  /** 闯关页对应练习的锚点地址 */
  href: string;
}

/**
 * 阅读页里的练习卡片：题面 + 全部提示，静态渲染。
 *
 * 与闯关页 ExerciseCard 的分工（阅读页只读、闯关页才是做题现场）：
 *   - 这里放题面与提示，让通读版能独立读懂每道题在考什么
 *   - 编辑器、判分、参考答案仍只在闯关页——参考答案摊在无门控页上会让闯关失去意义
 *   - 提示用原生 <details> 折叠，默认收起：95/100 道题的 hints 末条按「完整代码：」
 *     约定写着整段答案，全展开等于把答案摊在无门控页上。折叠后内容仍在 DOM，
 *     爬虫照常读到，读者要主动点开才看见
 *   - 不复用 ExerciseHints 的逐条解锁（那是做题时的节奏控制，通读时没有可解锁的对象），
 *     <details> 是原生元素，因此本组件保持 Server Component，仅代码框复制等叶子组件带客户端交互
 */
export function ReadExerciseCard({
  exercise,
  index,
  totalExercises,
  href,
}: ReadExerciseCardProps) {
  return (
    <section
      id={`read-exercise-${exercise.id}`}
      className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/25 bg-surface/60 shadow-md shadow-emerald-500/5 backdrop-blur-sm"
      aria-label={`练习 ${index + 1}`}
    >
      <header className="border-b border-line bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-6 sm:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 font-mono text-xs font-medium text-accent">
            练习 {index + 1} / {totalExercises}
          </span>
          <span className="font-medium text-fg-body">{exercise.title}</span>
        </div>

        <div className="prose prose-sm max-w-none prose-p:text-fg prose-strong:text-accent-strong prose-code:text-accent-strong">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownCodeComponents}>{exercise.prompt}</ReactMarkdown>
        </div>

        {exercise.hints.length > 0 && (
          <details className="mt-4 border-t border-emerald-500/20 pt-3">
            <summary className="focus-ring cursor-pointer rounded text-xs font-medium text-accent-strong transition hover:text-accent-stronger">
              💡 提示（{exercise.hints.length} 条）
            </summary>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs text-fg-body marker:text-accent/70">
              {exercise.hints.map((h, i) => (
                <li key={i}>
                  <div className="prose prose-xs max-w-none prose-p:my-0 prose-pre:my-1.5 prose-pre:border prose-pre:border-emerald-500/15 prose-code:text-accent-strong">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownCodeComponents}>{hintToMarkdown(h)}</ReactMarkdown>
                  </div>
                </li>
              ))}
            </ol>
          </details>
        )}
      </header>

      <Link
        href={href}
        className="focus-ring flex items-center justify-between px-6 py-4 transition hover:bg-emerald-500/10"
      >
        <span className="text-sm text-fg-subtle">在编辑器里写这题，跑判分、看参考答案</span>
        <span className="text-sm font-medium text-accent-strong">去闯关页做这题 →</span>
      </Link>
    </section>
  );
}
