'use client';

import { CodeBlock } from './CodeBlock';

interface SolutionPanelProps {
  solution: string;
}

/**
 * 题目"参考答案"面板（用户主动展开后显示）。
 */
export function SolutionPanel({ solution }: SolutionPanelProps) {
  return (
    <div className="border-t border-amber-500/40 bg-amber-500/10 p-5">
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-warn-strong">
        <span aria-hidden>📖</span>
        <span>参考答案</span>
      </div>
      <CodeBlock code={solution} language="python" />
    </div>
  );
}
