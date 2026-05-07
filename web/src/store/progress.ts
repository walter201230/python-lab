/**
 * 学习进度 store（zustand + localStorage 持久化）。
 *
 * 数据结构按 lessonId 分组，每节课独立追踪：
 * - unlocked：已解锁的练习题 IDs（当前题判分通过 OR 查看答案后，下一题加入）
 * - completed：已通过判分的练习题 IDs
 * - viewedSolution：查看过参考答案的练习题 IDs
 * - currentExerciseId：当前展示的练习题 ID（用户切题后会更新）
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubmittedOutput {
  stdout: string;
  stderr: string;
  error?: string;
}

export interface LessonProgress {
  unlocked: string[];
  completed: string[];
  viewedSolution: string[];
  currentExerciseId: string | null;
  /** 通过判分时用户提交的代码——刷新后回显，编辑器变只读 */
  submittedCode: Record<string, string>;
  /** 通过判分时的运行输出——刷新后回显在输出区 */
  submittedOutput: Record<string, SubmittedOutput>;
  /** 仅 read-only（无练习题）章节使用：访问页面即标记 true */
  lessonCompleted?: boolean;
}

interface ProgressState {
  byLesson: Record<string, LessonProgress>;
  /** 初始化某节课进度（首次访问，设置 currentExerciseId 为第一题，并 unlock 第一题） */
  ensureLesson: (lessonId: string, firstExerciseId: string) => void;
  /** 切换当前查看的练习题 */
  setCurrent: (lessonId: string, exerciseId: string) => void;
  /** 标记练习题判分通过 + 保存通过时的代码与输出 + 解锁下一题 */
  markCompleted: (
    lessonId: string,
    exerciseId: string,
    code: string,
    output: SubmittedOutput,
    nextExerciseId: string | null,
  ) => void;
  /** 标记查看过答案 + 解锁下一题（不算 completed） */
  markViewedSolution: (lessonId: string, exerciseId: string, nextExerciseId: string | null) => void;
  /** 标记 read-only 章节为已学完（无练习题，进入页面即调用） */
  markLessonCompleted: (lessonId: string) => void;
  /** 重置某节课进度（开发/测试用） */
  reset: (lessonId: string) => void;
  /** 用服务端的全量进度替换 byLesson（登录态在 lesson 页 mount 时调用） */
  hydrate: (byLesson: Record<string, LessonProgress>) => void;
}

const empty = (firstExerciseId: string): LessonProgress => ({
  unlocked: [firstExerciseId],
  completed: [],
  viewedSolution: [],
  currentExerciseId: firstExerciseId,
  submittedCode: {},
  submittedOutput: {},
});

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      byLesson: {},
      ensureLesson: (lessonId, firstExerciseId) =>
        set((s) => {
          if (s.byLesson[lessonId]) return s;
          return { byLesson: { ...s.byLesson, [lessonId]: empty(firstExerciseId) } };
        }),
      setCurrent: (lessonId, exerciseId) =>
        set((s) => ({
          byLesson: {
            ...s.byLesson,
            [lessonId]: { ...(s.byLesson[lessonId] ?? empty(exerciseId)), currentExerciseId: exerciseId },
          },
        })),
      markCompleted: (lessonId, exerciseId, code, output, nextExerciseId) =>
        set((s) => {
          const cur = s.byLesson[lessonId] ?? empty(exerciseId);
          const completed = cur.completed.includes(exerciseId)
            ? cur.completed
            : [...cur.completed, exerciseId];
          const unlocked = !nextExerciseId || cur.unlocked.includes(nextExerciseId)
            ? cur.unlocked
            : [...cur.unlocked, nextExerciseId];
          const submittedCode = { ...(cur.submittedCode ?? {}), [exerciseId]: code };
          const submittedOutput = { ...(cur.submittedOutput ?? {}), [exerciseId]: output };
          return {
            byLesson: {
              ...s.byLesson,
              [lessonId]: { ...cur, completed, unlocked, submittedCode, submittedOutput },
            },
          };
        }),
      markViewedSolution: (lessonId, exerciseId, nextExerciseId) =>
        set((s) => {
          const cur = s.byLesson[lessonId] ?? empty(exerciseId);
          const viewedSolution = cur.viewedSolution.includes(exerciseId)
            ? cur.viewedSolution
            : [...cur.viewedSolution, exerciseId];
          const unlocked = !nextExerciseId || cur.unlocked.includes(nextExerciseId)
            ? cur.unlocked
            : [...cur.unlocked, nextExerciseId];
          return {
            byLesson: { ...s.byLesson, [lessonId]: { ...cur, viewedSolution, unlocked } },
          };
        }),
      markLessonCompleted: (lessonId) =>
        set((s) => {
          const cur = s.byLesson[lessonId];
          if (cur?.lessonCompleted) return s;
          const base: LessonProgress = cur ?? {
            unlocked: [],
            completed: [],
            viewedSolution: [],
            currentExerciseId: null,
            submittedCode: {},
            submittedOutput: {},
          };
          return {
            byLesson: { ...s.byLesson, [lessonId]: { ...base, lessonCompleted: true } },
          };
        }),
      reset: (lessonId) =>
        set((s) => {
          const next = { ...s.byLesson };
          delete next[lessonId];
          return { byLesson: next };
        }),
      hydrate: (byLesson) => set({ byLesson }),
    }),
    { name: 'lesson-progress' },
  ),
);
