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
        let settled = false;

        const handler = (e: MessageEvent) => {
          const data = e.data as Partial<RunResult> & { type: string };
          if (data.type !== 'result') return;
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
          // 强制 kill 当前 worker，立刻重启一个新 worker（不影响下次调用）
          resetPyodideWorker();
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
          code,
          expectedVarNames: opts.expectedVarNames,
          detectAst: opts.detectAst,
        });
      });
    },
    [status],
  );

  return { status, error, run };
}
