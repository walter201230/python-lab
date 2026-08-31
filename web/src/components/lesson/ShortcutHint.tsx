'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lesson-shortcut-hint-seen';

function persistSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // 隐私模式可能 throw，忽略
  }
}

/**
 * 第一次进 lesson 时显示的快捷键提示卡（右下角）。
 *
 * - localStorage 标记看过，下次不再显示
 * - 7.5 秒后自动淡出，或用户手动关
 * - 桌面端才显示（移动端没有键盘）
 */
export function ShortcutHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    const t1 = setTimeout(() => setShow(true), 1500);
    const t2 = setTimeout(() => {
      setShow(false);
      persistSeen();
    }, 7500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    persistSeen();
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      className="pointer-events-auto fixed bottom-5 left-5 z-40 max-w-xs rounded-xl border border-emerald-500/30 bg-surface/95 p-4 text-xs shadow-xl shadow-emerald-500/10 backdrop-blur-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-accent-strong">小提示 · 快捷键</span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="关闭"
          className="text-fg-subtle transition hover:text-fg"
        >
          ✕
        </button>
      </div>
      <ul className="space-y-1.5 text-fg-body">
        <li className="flex items-center justify-between gap-3">
          <span>运行代码</span>
          <kbd className="rounded border border-line-strong bg-raised px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
            ⌘/Ctrl + Enter
          </kbd>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span>检查答案</span>
          <kbd className="rounded border border-line-strong bg-raised px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
            ⌘ + Shift + Enter
          </kbd>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span>退出全屏编辑</span>
          <kbd className="rounded border border-line-strong bg-raised px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
            Esc
          </kbd>
        </li>
      </ul>
    </div>
  );
}
