'use client';

import { useTheme } from '@/lib/useTheme';

/**
 * 顶栏主题切换（滑块开关）。
 *
 * 滑块位置与日/月显隐全部由 CSS 的 light: variant 驱动，不读 React state：静态导出下
 * SSR 快照恒为深色，若用 state 渲染，浅色用户在 hydration 前会看到滑块停在右侧再跳回
 * 左侧。data-theme 由 <head> 内联脚本在首次绘制前写好，交给 CSS 就是首屏即正确。
 * state 只用来生成 aria/title 文案——不可见，晚一帧无妨。
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const nextLabel = theme === 'dark' ? '浅色' : '深色';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`切换到${nextLabel}主题`}
      title={`切换到${nextLabel}主题`}
      className="focus-ring relative h-[22px] w-10 shrink-0 rounded-full border border-line-strong bg-raised transition-colors hover:border-accent"
    >
      {/* 滑块：深色停右、浅色停左，位移距离 = 轨道内宽 - 滑块宽 */}
      <span className="absolute top-px left-px block h-[18px] w-[18px] translate-x-[18px] overflow-hidden rounded-full bg-canvas text-fg-muted shadow-sm transition-transform light:translate-x-0 light:bg-surface">
        <SunIcon />
        <MoonIcon />
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute top-[3px] left-[3px] h-3 w-3 opacity-0 transition-opacity light:opacity-100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.55 1.55M17.05 17.05l1.55 1.55M18.6 5.4l-1.55 1.55M6.95 17.05L5.4 18.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute top-[3px] left-[3px] h-3 w-3 opacity-100 transition-opacity light:opacity-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9Z" />
    </svg>
  );
}
