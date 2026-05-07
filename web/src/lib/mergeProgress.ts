/**
 * 进度合并：本地（localStorage 游客态留下的）+ 服务端（用户在其它设备的）
 *
 * 规则（design.md D4）：
 * - unlocked / completed / viewedSolution：取并集
 * - submittedCode：本地优先（用户最近编辑的）
 * - submittedOutput：跟 submittedCode 走，本地优先
 * - currentExerciseId：服务端优先（不重要）
 */

import type { LessonProgress, SubmittedOutput } from '@/store/progress';

function uniqueMerge<T>(a: T[] | undefined, b: T[] | undefined): T[] {
  return Array.from(new Set([...(a ?? []), ...(b ?? [])]));
}

export function mergeLessonProgress(
  local: LessonProgress | undefined,
  server: LessonProgress | undefined,
): LessonProgress {
  if (!local && !server) {
    throw new Error('mergeLessonProgress 调用时本地和服务端都为空');
  }
  if (!local) return server!;
  if (!server) return local;

  const submittedCode: Record<string, string> = {
    ...(server.submittedCode ?? {}),
    ...(local.submittedCode ?? {}),
  };
  const submittedOutput: Record<string, SubmittedOutput> = {
    ...(server.submittedOutput ?? {}),
    ...(local.submittedOutput ?? {}),
  };

  return {
    unlocked: uniqueMerge(local.unlocked, server.unlocked),
    completed: uniqueMerge(local.completed, server.completed),
    viewedSolution: uniqueMerge(local.viewedSolution, server.viewedSolution),
    currentExerciseId: server.currentExerciseId ?? local.currentExerciseId,
    submittedCode,
    submittedOutput,
    lessonCompleted: local.lessonCompleted || server.lessonCompleted || undefined,
  };
}
