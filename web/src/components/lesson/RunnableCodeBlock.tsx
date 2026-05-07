'use client';

import { useState } from 'react';
import { CodeOutput } from './CodeOutput';
import type { PyodideStatus, RunOptions, RunResult } from '@/lib/usePyodide';

interface RunnableCodeBlockProps {
  code: string;
  pyStatus: PyodideStatus;
  run: (code: string, opts?: RunOptions) => Promise<RunResult>;
}

/**
 * 教学步骤里的 python 代码块：右上角"▶ 试运行"按钮，原地展示输出。
 *
 * 设计动机：
 *   讲解里出现的代码片段，让用户当场跑一下能极大提高学习体验
 *   （Pyodide 已经在浏览器跑，零成本）。
 *   仅展示型——不参与解锁判分，与练习题严格分离。
 */
export function RunnableCodeBlock({ code, pyStatus, run }: RunnableCodeBlockProps) {
  const [output, setOutput] = useState<{ stdout: string; stderr: string; error?: string } | null>(
    null,
  );
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const canRun = pyStatus === 'ready' && !running;

  const handleRun = async () => {
    setRunning(true);
    const result = await run(code);
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
    <div className="not-prose my-4 overflow-hidden rounded-lg border border-slate-700/60 bg-slate-950/80">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          python
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded px-2 py-0.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 focus-ring"
          >
            {copied ? '已复制' : '复制'}
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={!canRun}
            className="rounded px-2 py-0.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-40 focus-ring"
            title={pyStatus === 'ready' ? '在浏览器里跑这段代码' : 'Python 环境未就绪'}
          >
            {running ? '运行中…' : '▶ 试运行'}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-emerald-200">
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
