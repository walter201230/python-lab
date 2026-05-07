'use client';

import { useEffect } from 'react';
import { ensurePyodideWorker } from '@/lib/pyodideSingleton';

/**
 * 首页挂这个空组件，浏览器空闲时启动 Pyodide worker（下载 wasm + 初始化）。
 *
 * 用户在课程目录浏览的几秒内，pyodide 后台已经 ready；
 * 切到 lesson 页时 usePyodide 复用同一个 worker，体感"秒开"。
 */
export function PyodideBootstrap() {
  useEffect(() => {
    type IdleCallbackHandle = number;
    const win = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => IdleCallbackHandle;
        cancelIdleCallback?: (id: IdleCallbackHandle) => void;
      };

    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => ensurePyodideWorker(), { timeout: 2500 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = setTimeout(() => ensurePyodideWorker(), 800);
    return () => clearTimeout(id);
  }, []);

  return null;
}
