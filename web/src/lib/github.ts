/**
 * GitHub 相关的 URL 构造函数（纯函数，便于单测）。
 */

const ISSUE_REPO = 'walter201230/Python';

interface ExerciseFeedbackInput {
  lessonId: string;
  exerciseId: string;
  exerciseTitle: string;
  /** 当前页面 URL，传入即一并填进 body；server side 调用时可省略 */
  currentUrl?: string;
}

/**
 * 构造练习题反馈 Issue URL，预填 lessonId / exerciseId / 当前页 URL。
 * 用户点开后只需填写"问题描述"。
 */
export function buildExerciseFeedbackUrl({
  lessonId,
  exerciseId,
  exerciseTitle,
  currentUrl,
}: ExerciseFeedbackInput): string {
  const title = `[${lessonId}] ${exerciseTitle} 题目反馈`;
  const body = [
    '## 哪一题',
    `- lesson: \`${lessonId}\``,
    `- exercise: \`${exerciseId}\``,
    currentUrl ? `- url: ${currentUrl}` : '',
    '',
    '## 问题描述',
    '<!-- 请描述：题面不清楚 / 提示有误 / 判分异常 / 其他 -->',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    title,
    body,
    labels: 'feedback,exercise',
  });
  return `https://github.com/${ISSUE_REPO}/issues/new?${params.toString()}`;
}
