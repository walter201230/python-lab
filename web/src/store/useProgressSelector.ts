'use client';

import { useSyncExternalStore } from 'react';
import { useProgress, type LessonProgress } from './progress';

const EMPTY_BY_LESSON: Record<string, LessonProgress> = {};

/**
 * SSR-safe 读 zustand persist 状态的统一入口。
 *
 * 用 useSyncExternalStore 而不是 zustand 默认 hook 是为了：
 *   - 服务端渲染期 progress 还没 hydrate，必须返回稳定空引用避免无限循环警告
 *   - 调用方写法更短：useProgressSelector(s => s.byLesson[id])
 *
 * 注意 selector 必须返回引用稳定的值（zustand 已为顶层字段保证），否则会触发
 * "should be cached to avoid an infinite loop" 警告。
 */
export function useProgressSelector<T>(selector: (state: ReturnType<typeof useProgress.getState>) => T, fallback: T): T {
  return useSyncExternalStore(
    useProgress.subscribe,
    () => selector(useProgress.getState()),
    () => fallback,
  );
}

/** 常用的 byLesson 选择器：返回 store 里全部 byLesson 字典；SSR 期返回空对象 */
export function useByLesson(): Record<string, LessonProgress> {
  return useProgressSelector((s) => s.byLesson, EMPTY_BY_LESSON);
}
