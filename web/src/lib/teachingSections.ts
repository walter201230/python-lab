/** 原文分段：只在代码围栏外的既有标题处切片，拼接后逐字还原。 */
export interface TeachingSection {
  key: string;
  content: string;
  codeOffset: number;
  codeCount: number;
}

export function pythonBlocks(content: string) {
  return [...content.matchAll(/^ {0,3}```[Pp]ython([^\n]*)\n([\s\S]*?)^ {0,3}```[ \t]*$/gm)];
}

export function teachingHeadings(content: string): Array<{ key: string; offset: number }> {
  const result: Array<{ key: string; offset: number }> = [];
  let fence: { char: string; length: number } | undefined;
  let offset = 0;
  for (const line of content.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)/.exec(line);
    if (marker) {
      if (!fence) fence = { char: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
    } else if (!fence && /^ {0,3}#{2,3}\s+\S/.test(line)) {
      result.push({ key: line.trim(), offset });
    }
    offset += line.length;
  }
  return result;
}

export function splitTeachingSections(content: string, keys: string[]): TeachingSection[] {
  if (!keys.length || keys[0] !== '$intro') throw new Error('分段必须从 $intro 开始');
  if (new Set(keys).size !== keys.length) throw new Error('小节重复引用');
  const headings = teachingHeadings(content);
  const starts = [0];
  for (const key of keys.slice(1)) {
    const matches = headings.filter((heading) => heading.key === key);
    if (matches.length !== 1) throw new Error(`小节标题缺失或不唯一：${key}`);
    if (matches[0].offset <= starts[starts.length - 1]) throw new Error(`小节顺序与原文不一致：${key}`);
    starts.push(matches[0].offset);
  }
  let codeOffset = 0;
  return starts.map((start, index) => {
    const text = content.slice(start, starts[index + 1] ?? content.length);
    const codeCount = pythonBlocks(text).length;
    const section = { key: keys[index], content: text, codeOffset, codeCount };
    codeOffset += codeCount;
    return section;
  });
}

export function selectTeachingSection<T>(content: string, examples: T[], section?: string, keys?: string[]) {
  if (section === undefined) return { content, examples };
  const selected = splitTeachingSections(content, keys ?? []).find((item) => item.key === section);
  if (!selected) throw new Error(`未找到教学小节：${section}`);
  return { content: selected.content, examples: examples.slice(selected.codeOffset, selected.codeOffset + selected.codeCount) };
}
