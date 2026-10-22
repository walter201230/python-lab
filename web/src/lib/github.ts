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
 * 用户手动补充复现步骤、实际报错和环境，链接不收集代码或学习进度。
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
    ...(currentUrl ? [`- url: ${currentUrl}`] : []),
    '',
    '## 问题描述',
    '<!-- 请描述：题面不清楚 / 提示有误 / 判分异常 / 其他 -->',
    '',
    '## 复现步骤',
    '1. ',
    '2. ',
    '',
    '## 预期结果与实际结果',
    '- 预期：',
    '- 实际：',
    '',
    '<!-- 如有报错，请完整复制下面输出区和「未通过」提示；也可补充截图。 -->',
    '```text',
    '',
    '```',
    '',
    '## 使用环境与操作方式',
    '- 设备／操作系统：',
    '- 浏览器及版本：',
    '- 操作方式：<!-- 点击「运行」／「检查答案」，或写出使用的快捷键 -->',
    '- 刷新页面后是否仍出现：',
    '',
    '## 最小复现代码（可选）',
    '<!-- 请只粘贴与问题有关、可以复现问题的最小代码。 -->',
    '```python',
    '',
    '```',
    '',
  ]
    .join('\n');

  const params = new URLSearchParams({
    title,
    body,
    labels: 'feedback,exercise',
  });
  return `https://github.com/${ISSUE_REPO}/issues/new?${params.toString()}`;
}
