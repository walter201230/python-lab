/**
 * 把 hint 字符串转成 markdown：
 *   单行 → 原样（已是 markdown，比如带 `inline-code`）
 *   多行 → 第一行作为说明，后续整段包成 ```python``` 代码块
 *
 * 这是因为现有 hints 的"完整代码：\n<code>" 约定是普通字符串里塞 \n，
 * 在 markdown 里 \n 不算换行，需要包成代码块才会原样显示。
 *
 * 闯关页的 ExerciseHints 与阅读页的 ReadExerciseCard 共用同一份转换，
 * 保证同一条提示在两个页面渲染结果一致。
 */
export function hintToMarkdown(h: string): string {
  const nl = h.indexOf('\n');
  if (nl === -1) return h;
  const head = h.slice(0, nl).trimEnd();
  const rest = h.slice(nl + 1).replace(/```/g, '​```');
  return `${head}\n\n\`\`\`python\n${rest}\n\`\`\``;
}
