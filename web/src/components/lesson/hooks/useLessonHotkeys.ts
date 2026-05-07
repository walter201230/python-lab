'use client';

import { useEffect } from 'react';

/**
 * lesson 全局快捷键。
 *
 * - ⌘/Ctrl + Enter         → 运行当前可操作题
 * - ⌘/Ctrl + Shift + Enter → 检查当前可操作题
 *
 * "当前可操作题" = 第一个 [data-exercise-card][data-exercise-actionable="true"] 元素。
 * 通过 click() 触发对应按钮，因此沿用按钮的 disabled / running 校验，无需重复实现。
 */
export function useLessonHotkeys(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod || e.key !== 'Enter') return;

      const target = document.querySelector<HTMLElement>(
        '[data-exercise-card][data-exercise-actionable="true"]',
      );
      if (!target) return;

      const action = e.shiftKey ? 'check' : 'run';
      const btn = target.querySelector<HTMLButtonElement>(`[data-action="${action}"]`);
      if (!btn || btn.disabled) return;

      e.preventDefault();
      btn.click();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
