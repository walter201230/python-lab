'use client';

interface SolutionPanelProps {
  solution: string;
}

/**
 * 题目"参考答案"面板（用户主动展开后显示）。
 */
export function SolutionPanel({ solution }: SolutionPanelProps) {
  return (
    <div className="border-t border-amber-500/40 bg-amber-500/10 p-5">
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
        <span aria-hidden>📖</span>
        <span>参考答案</span>
      </div>
      <pre className="overflow-x-auto rounded-md border border-emerald-500/15 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300">
        {solution}
      </pre>
    </div>
  );
}
