'use client';

import type { PyodideStatus } from '@/lib/usePyodide';

/**
 * Pyodide 加载状态 toast：右下角浮窗，加载完自动淡出。
 *
 * 替代以前顶部全宽琥珀色横幅，减少视觉干扰，让用户一进入就能开始阅读教学。
 *
 * 实现：纯 CSS 状态推导，没有 useState/useEffect。
 *   ready 状态保持挂载但 opacity:0 + pointer-events-none，CSS transition 自然淡出。
 */
export function PyodideToast({ status }: { status: PyodideStatus }) {
  const isError = status === 'error';
  const isReady = status === 'ready';

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        'pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium shadow-xl backdrop-blur-md transition-all duration-500 ' +
        (isReady ? 'translate-y-2 opacity-0 ' : 'translate-y-0 opacity-100 ') +
        (isError
          ? 'border-rose-500/40 bg-rose-500/15 text-rose-200 shadow-rose-500/20'
          : 'border-emerald-500/30 bg-slate-900/90 text-emerald-200 shadow-emerald-500/10')
      }
    >
      {isError ? (
        <>
          <span aria-hidden>⚠</span>
          <span>Python 环境加载失败，刷新重试</span>
        </>
      ) : (
        <>
          <span
            aria-hidden
            className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"
          />
          <span>Python 环境加载中…</span>
        </>
      )}
    </div>
  );
}
