'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'theme';

/**
 * 首屏反闪色脚本，必须在 <head> 里同步执行。
 *
 * 静态导出下首屏 HTML 是构建时固定的、hydration 晚于首次绘制，把主题判定放进
 * React 组件必然先闪一帧深色。
 *
 * 深色是默认（:root 本身即深色），所以这里只处理「用户主动选过浅色」一种情况：
 * 没设置过偏好的访客即使这段脚本抛错也不会闪，故障影响面仅限浅色用户。
 */
export const THEME_INIT_SCRIPT =
  `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light')` +
  `document.documentElement.dataset.theme='light'}catch(e){}`;

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

/** 写 DOM + 写 localStorage。DOM 是唯一真相源，写完由 MutationObserver 通知订阅者。 */
export function setTheme(next: Theme) {
  if (next === 'light') {
    document.documentElement.dataset.theme = 'light';
  } else {
    delete document.documentElement.dataset.theme;
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // 隐私模式/禁用存储：本次会话内仍可切换，只是不持久化
  }
}

/**
 * 读当前主题。真相源是 <html> 上的 data-theme，不是 React state——
 * 内联脚本在 React 之前就已写好，用 zustand persist 那套异步水合反而会晚于首屏。
 * 服务端快照恒为 'dark'，与静态产物里不带 data-theme 的 HTML 一致。
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, (): Theme => 'dark');
  const toggle = useCallback(() => {
    setTheme(readTheme() === 'light' ? 'dark' : 'light');
  }, []);
  return { theme, toggle };
}
