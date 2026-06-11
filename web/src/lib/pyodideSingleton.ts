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
  // ?v=N：worker.js 无内容哈希、有 HTTP 缓存。消息协议变更（如 v2 加 runId 回传）时
  // 递增版本号，保证新页面 JS 一定拿到配套的新 worker，避免新旧混配导致 run 全部超时。
  const w = new Worker('/pyodide.worker.js?v=2');
  workerInstance = w;

  w.addEventListener('message', (e: MessageEvent) => {
    const data = e.data as { type: string; error?: string };
    if (data.type === 'ready') setState('ready');
    if (data.type === 'init-error') setState('error', data.error ?? '初始化失败');
  });

  // worker 顶层错误（最常见：CDN importScripts 失败）不走 message 通道，只触发 error
  // 事件——不监听它，状态会永远停在 loading（toast 无限转圈，用户得不到任何提示）。
  // ready 之后的偶发未捕获错误不改状态：worker 仍可用，不要误报「加载失败」。
  w.addEventListener('error', (e: ErrorEvent) => {
    if (currentStatus !== 'ready') {
      setState('error', e.message || 'Python 环境加载失败（网络或 CDN 不可用）');
    }
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
