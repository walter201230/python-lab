'use client';

import { useState } from 'react';
import { CodeOutput } from './CodeOutput';
import type { PyodideStatus, RunOptions, RunResult } from '@/lib/usePyodide';

interface RunnableCodeBlockProps {
  code: string;
  pyStatus: PyodideStatus;
  run: (code: string, opts?: RunOptions) => Promise<RunResult>;
  /** false 时只渲染代码与「复制」，不给「试运行」——见下方注释里的 no-run。 */
  runnable?: boolean;
  usage?: string;
}

/**
 * 教学步骤里的 python 代码块：右上角"▶ 试运行"按钮，原地展示输出。
 *
 * 设计动机：
 *   讲解里出现的代码片段，让用户当场跑一下能极大提高学习体验
 *   （Pyodide 已经在浏览器跑，零成本）。
 *   仅展示型——不参与解锁判分，与练习题严格分离。
 *
 *   仅展示用途清单中验证通过的独立示例的运行按钮；每次隔离名称空间，
 *   避免先前示例留下的名称影响当前结果。其余片段保留代码、复制和用途提示。
 */
export function RunnableCodeBlock({ code, pyStatus, run, runnable = false, usage }: RunnableCodeBlockProps) {
  const [output, setOutput] = useState<{ stdout: string; stderr: string; error?: string } | null>(
    null,
  );
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const canRun = pyStatus === 'ready' && !running;

  const handleRun = async () => {
    setRunning(true);
    const result = await run(code, { isolated: true });
    setOutput({ stdout: result.stdout, stderr: result.stderr, error: result.error });
    setRunning(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 复制失败静默
    }
  };

  return (
    <div className="not-prose my-4 overflow-hidden rounded-lg border border-line-strong/60 bg-code/80">
      <div className="flex items-center justify-between border-b border-line bg-surface/60 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
          Python{usage ? ` · ${usage}` : ''}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded px-2 py-0.5 text-xs text-fg-subtle transition hover:bg-raised hover:text-fg-body focus-ring"
          >
            {copied ? '已复制' : '复制'}
          </button>
          {runnable && (
            <button
              type="button"
              onClick={handleRun}
              disabled={!canRun}
              className="rounded px-2 py-0.5 text-xs font-medium text-accent-strong transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-40 focus-ring"
              title={pyStatus === 'ready' ? '在浏览器里跑这段代码' : 'Python 环境未就绪'}
            >
              {running ? '运行中…' : '▶ 试运行'}
            </button>
          )}
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-accent-stronger">
        <code>{code}</code>
      </pre>
      {output && (
        <CodeOutput
          stdout={output.stdout}
          stderr={output.stderr}
          error={output.error}
          variant="card"
        />
      )}
    </div>
  );
}
