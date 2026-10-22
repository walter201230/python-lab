import { createHash } from 'node:crypto';

export interface CodeExample {
  sha256: string;
  mode: string;
}

export function validateTeachingText(text: string): string[] {
  const errors: string[] = [];
  if (/<!--\s*(?:content-(?:completion|enhancement)-|original-source:)/.test(text)
    || /本节为本轮新增|本轮分别保留|^# 原教程全文|以下保留原教程的(?:完整|详细)/m.test(text)) {
    errors.push('教程含工作标记或维护声明');
  }
  return errors;
}

export function validateCodeExamples(text: string, entries: CodeExample[] | undefined): string[] {
  const errors: string[] = [];
  const matches = [...text.matchAll(/^ {0,3}```[Pp]ython([^\n]*)\n([\s\S]*?)^ {0,3}```[ \t]*$/gm)];
  if (!entries || matches.length !== entries.length) return ['代码用途清单缺失或数量不匹配'];
  const modes = new Set(['runnable', 'local', 'context', 'syntax', 'output', 'error']);
  matches.forEach((match, index) => {
    const entry = entries[index];
    const code = match[2].replace(/\n$/, '');
    if (createHash('sha256').update(code).digest('hex') !== entry.sha256) errors.push(`代码块 ${index + 1} 已变化，须重新验证用途`);
    if (!modes.has(entry.mode)) errors.push(`代码块 ${index + 1} 用途不合法`);
    if (/\bno-run\b/.test(match[1]) && entry.mode === 'runnable') errors.push(`代码块 ${index + 1} 的 no-run 与运行许可冲突`);
  });
  return errors;
}
