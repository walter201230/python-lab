'use client';

import { isInformativeError } from '@/lib/grader';

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
      <div className="border-t border-line bg-code px-4 py-2.5 font-mono text-xs">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-fg-subtle">输出</div>
        {hasContent ? <Lines stdout={stdout} stderr={stderr} error={error} /> : <span className="text-fg-subtle">（无输出）</span>}
      </div>
    );
  }

  if (!hasContent) return null;
  return (
    <div
      className="overflow-y-auto border-t border-line bg-code px-4 py-3 font-mono text-xs"
      style={{ maxHeight }}
    >
      <Lines stdout={stdout} stderr={stderr} error={error} />
    </div>
  );
}

function Lines({ stdout, stderr, error }: Pick<CodeOutputProps, 'stdout' | 'stderr' | 'error'>) {
  // 浏览器里 Pyodide 的 PythonError.message 只有类名，完整 traceback 走 stderr（见
  // grader 的 describeError）。那种情况下 error 单独一行只会在 traceback 下面重复一个
  // 没信息量的「PythonError」，是噪音，不渲染。超时、「Pyodide 未就绪」这类自造提示
  // 不是光秃秃的类名，照常显示；stderr 为空时也照常显示，避免什么都不剩。
  const showError = !!error && (isInformativeError(error.trim()) || !stderr);
  return (
    <>
      {stdout && <pre className="whitespace-pre-wrap text-accent-strong">{stdout}</pre>}
      {stderr && <pre className="whitespace-pre-wrap text-warn">{stderr}</pre>}
      {showError && <pre className="whitespace-pre-wrap text-danger">{error}</pre>}
    </>
  );
}
