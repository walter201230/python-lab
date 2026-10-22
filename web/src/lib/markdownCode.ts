export type CodeMode = 'runnable' | 'local' | 'context' | 'syntax' | 'output' | 'error';

export const codeModeLabels: Record<CodeMode, string> = {
  runnable: '可在网页运行',
  local: '在本地运行',
  context: '结合前文阅读',
  syntax: '语法示意',
  output: '输出示例',
  error: '预期报错示例',
};

interface MarkdownNode {
  type: string;
  lang?: string | null;
  meta?: string | null;
  data?: { hProperties?: Record<string, string> };
  children?: MarkdownNode[];
}

/** 运行许可来自已校验的用途清单，不通过修改教学文字传递。 */
export function remarkCodeModes(options: { modes: CodeMode[] }) {
  return function transform(tree: MarkdownNode): void {
    let index = 0;
    function visit(node: MarkdownNode): void {
      if (node.type === 'code' && node.lang?.toLowerCase() === 'python') {
        let mode = options.modes[index++] ?? 'context';
        if (/\bno-run\b/.test(node.meta ?? '') && mode === 'runnable') mode = 'context';
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, 'data-code-mode': mode } };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

/** 从 ReactMarkdown 的 pre 节点读取其 code 子节点用途。 */
export function getCodeMode(node: unknown): CodeMode {
  const pre = node as { children?: Array<{ tagName?: string; properties?: Record<string, unknown> }> } | undefined;
  const properties = pre?.children?.find((child) => child.tagName === 'code')?.properties;
  const mode = properties?.['data-code-mode'] ?? properties?.dataCodeMode;
  return typeof mode === 'string' && Object.hasOwn(codeModeLabels, mode) ? mode as CodeMode : 'context';
}
