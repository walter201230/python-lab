'use client';

import { useEffect } from 'react';
import { STICKY_BAR_SCROLL_OFFSET } from '@/lib/layoutConstants';

/**
 * lesson 全局快捷键。
 *
 * - ⌘/Ctrl + Enter         → 运行当前可操作题
 * - ⌘/Ctrl + Shift + Enter → 检查当前可操作题
 *
 * 优先焦点所在题、题号链接目标，再选视口内可见部分最大的题。
 * capture 阶段接管按键，避免 Monaco 把同一组合键解释为插入空行。
 * 通过 click() 触发对应按钮，因此沿用按钮的 disabled / running 校验，无需重复实现。
 */
export function handleLessonHotkey(e: KeyboardEvent): void {
  if (e.defaultPrevented || e.isComposing || e.altKey || !(e.metaKey || e.ctrlKey) || e.key !== 'Enter') return;

  const origin = e.target instanceof Element ? e.target : null;
  let target = origin?.closest<HTMLElement>('[data-exercise-card]') ?? null;
  // 不拦截练习卡片外的搜索框、第三方输入框等控件。
  if (!target && origin?.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;

  if (!target) {
    const link = origin?.closest<HTMLAnchorElement>('a[href^="#exercise-"]');
    if (link) target = document.getElementById(link.hash.slice(1));
  }

  if (!target) {
    let largest = 0;
    const top = Number.parseFloat(STICKY_BAR_SCROLL_OFFSET);
    for (const card of document.querySelectorAll<HTMLElement>('[data-exercise-card]')) {
      const rect = card.getBoundingClientRect();
      if (rect.right <= 0 || rect.left >= window.innerWidth) continue;
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, top);
      if (visible > largest) {
        largest = visible;
        target = card;
      }
    }
  }
  if (!target) return;

  e.preventDefault();
  e.stopPropagation();
  // 当前题不可操作时仍阻止默认插行，但不能误跑另一题或长按连发。
  if (e.repeat || target.dataset.exerciseActionable !== 'true') return;
  const action = e.shiftKey ? 'check' : 'run';
  const button = target.querySelector<HTMLButtonElement>(`[data-action="${action}"]`);
  if (button && !button.disabled) button.click();
}

export function useLessonHotkeys(): void {
  useEffect(() => {
    window.addEventListener('keydown', handleLessonHotkey, true);
    return () => window.removeEventListener('keydown', handleLessonHotkey, true);
  }, []);
}
