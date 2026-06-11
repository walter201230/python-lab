'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ensurePyodideWorker,
  getPyodideError,
  getPyodideStatus,
  getPyodideWorker,
  resetPyodideWorker,
  subscribePyodide,
  type PyodideStatus,
} from './pyodideSingleton';

export type { PyodideStatus };

export interface RunOptions {
  expectedVarNames?: string[];
  detectAst?: boolean;
  timeoutMs?: number;
  /**
   * 隔离执行：在全新命名空间里跑这段代码，跑完即销毁，不读写共享的 pyodide.globals。
   * 练习题判分用（互不污染、也不被教学块累积状态污染，修 #296/#301）。
   * 教学代码块不传（缺省共享 globals，故意跨块累积变量）。
   */
  isolated?: boolean;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  vars: Record<string, unknown>;
  astNodes: string[];
  error?: string;
  timedOut?: boolean;
}

const DEFAULT_TIMEOUT_MS = 5000;

// run 的自增标识，worker 在 result 里原样带回。没有它时，并发的两次 run（教学块 +
// 练习可同时运行）会被第一个到达的 result 同时 resolve——判分拿错结果。module 级
// 计数器保证跨组件唯一。
let runSeq = 0;

/**
 * 消费全局 Pyodide singleton。多组件同时使用同一个 worker。
 *
 * 不在 unmount 时 terminate worker—worker 跨路由存活，只有 timeout 或 reset 才重建。
 * 这样首页预热的 worker 会被 lesson 页直接复用。
 */
export function usePyodide() {
  const [, force] = useState(0);

  useEffect(() => {
    const unsub = subscribePyodide(() => force((n) => n + 1));
    ensurePyodideWorker();
    return unsub;
  }, []);

  const status = getPyodideStatus();
  const error = getPyodideError();

  const run = useCallback(
    (code: string, opts: RunOptions = {}): Promise<RunResult> => {
      return new Promise((resolve) => {
        const w = getPyodideWorker();
        if (!w || status !== 'ready') {
          resolve({
            stdout: '',
            stderr: '',
            vars: {},
            astNodes: [],
            error: 'Pyodide 未就绪',
          });
          return;
        }

        const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        const runId = ++runSeq;
        let settled = false;

        const handler = (e: MessageEvent) => {
          const data = e.data as Partial<RunResult> & { type: string; runId?: number };
          if (data.type !== 'result' || data.runId !== runId) return;
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          w.removeEventListener('message', handler);
          resolve({
            stdout: data.stdout ?? '',
            stderr: data.stderr ?? '',
            vars: (data.vars as Record<string, unknown>) ?? {},
            astNodes: (data.astNodes as string[]) ?? [],
            error: data.error,
          });
        };

        const timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          w.removeEventListener('message', handler);
          // 强制 kill 当前 worker，立刻重启一个新 worker（不影响下次调用）。
          // 仅当超时的还是当前 worker 才 reset——并发场景下另一个 run 已触发过 reset 时，
          // 这里再 reset 会把刚重建、正在加载的新 worker 也杀掉（级联误杀）。
          if (getPyodideWorker() === w) resetPyodideWorker();
          resolve({
            stdout: '',
            stderr: '',
            vars: {},
            astNodes: [],
            error: `执行超时（${timeoutMs / 1000} 秒，可能是死循环）`,
            timedOut: true,
          });
        }, timeoutMs);

        w.addEventListener('message', handler);
        w.postMessage({
          type: 'run',
          runId,
          code,
          expectedVarNames: opts.expectedVarNames,
          detectAst: opts.detectAst,
          isolated: opts.isolated,
        });
      });
    },
    [status],
  );

  return { status, error, run };
}
