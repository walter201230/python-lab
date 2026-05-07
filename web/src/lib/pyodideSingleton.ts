'use client';

/**
 * 全局唯一的 Pyodide Web Worker。
 *
 * 提升到 module level 的目的：
 *   1. 首页可以提前 ensurePyodideWorker() 预热，用户在浏览课程目录时后台下载 wasm
 *   2. 切换 lesson 时复用同一个 worker，不用重新加载（节省 8-15 秒）
 *   3. timeout 后 reset 仍可工作（terminate + 重建）
 *
 * 注意：worker 永不在组件 unmount 时 terminate；只有 timeout / 显式 reset 时才会重建。
 */

export type PyodideStatus = 'idle' | 'loading' | 'ready' | 'error';

let workerInstance: Worker | null = null;
let currentStatus: PyodideStatus = 'idle';
let currentError: string | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((cb) => cb());
}

function setState(status: PyodideStatus, error: string | null = null): void {
  currentStatus = status;
  currentError = error;
  notify();
}

export function ensurePyodideWorker(): Worker {
  if (workerInstance) return workerInstance;
  if (typeof window === 'undefined') {
    throw new Error('ensurePyodideWorker can only be called in the browser');
  }

  setState('loading', null);
  const w = new Worker('/pyodide.worker.js');
  workerInstance = w;

  w.addEventListener('message', (e: MessageEvent) => {
    const data = e.data as { type: string; error?: string };
    if (data.type === 'ready') setState('ready');
    if (data.type === 'init-error') setState('error', data.error ?? '初始化失败');
  });

  w.postMessage({ type: 'init' });
  return w;
}

export function getPyodideWorker(): Worker | null {
  return workerInstance;
}

export function getPyodideStatus(): PyodideStatus {
  return currentStatus;
}

export function getPyodideError(): string | null {
  return currentError;
}

export function subscribePyodide(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** timeout 时调用：彻底干掉当前 worker，立刻重建（保持 ensure 不变） */
export function resetPyodideWorker(): void {
  workerInstance?.terminate();
  workerInstance = null;
  setState('idle');
  ensurePyodideWorker();
}
