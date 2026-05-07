'use client';

interface CodeOutputProps {
  stdout?: string;
  stderr?: string;
  error?: string;
  /**
   * 'card' = 嵌入卡片内的输出区（带顶部"输出"小标，无外边框）
   * 'panel' = 与编辑器并列的输出面板（无小标，作为独立 panel）
   */
  variant?: 'card' | 'panel';
  /** panel 模式的高度限制，默认 200px */
  maxHeight?: string;
}

/**
 * 统一渲染 stdout / stderr / error 三色输出。
 *
 * 配色：
 *   stdout → emerald-300（成功输出）
 *   stderr → amber-400（警告/标准错误）
 *   error  → rose-400（异常）
 */
export function CodeOutput({ stdout, stderr, error, variant = 'panel', maxHeight = '200px' }: CodeOutputProps) {
  const hasContent = !!(stdout || stderr || error);

  if (variant === 'card') {
    return (
      <div className="border-t border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-xs">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">输出</div>
        {hasContent ? <Lines stdout={stdout} stderr={stderr} error={error} /> : <span className="text-slate-400">（无输出）</span>}
      </div>
    );
  }

  if (!hasContent) return null;
  return (
    <div
      className="overflow-y-auto border-t border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs"
      style={{ maxHeight }}
    >
      <Lines stdout={stdout} stderr={stderr} error={error} />
    </div>
  );
}

function Lines({ stdout, stderr, error }: Pick<CodeOutputProps, 'stdout' | 'stderr' | 'error'>) {
  return (
    <>
      {stdout && <pre className="whitespace-pre-wrap text-emerald-300">{stdout}</pre>}
      {stderr && <pre className="whitespace-pre-wrap text-amber-400">{stderr}</pre>}
      {error && <pre className="whitespace-pre-wrap text-rose-400">{error}</pre>}
    </>
  );
}
