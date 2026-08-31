'use client';

import { useTheme } from '@/lib/useTheme';

/** 顶栏主题切换。显示的是「切过去之后」的那个主题的图标。 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const nextLabel = theme === 'dark' ? '浅色' : '深色';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`切换到${nextLabel}主题`}
      title={`切换到${nextLabel}主题`}
      className="focus-ring -mr-1 rounded-md p-1.5 text-fg-muted transition hover:bg-raised hover:text-fg"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9Z" />
    </svg>
  );
}
