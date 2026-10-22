interface MarkdownNode {
  type: string;
  value?: string;
  children?: MarkdownNode[];
}

/** 仅隐藏 Markdown 解析后的完整注释节点，不改源文或代码字符串。 */
export function remarkHideComments() {
  return function transform(tree: MarkdownNode): void {
    if (!tree.children) return;
    tree.children = tree.children.filter((child) => !(
      child.type === 'html'
      && /^(?:<!--[\s\S]*?-->\s*)+$/.test((child.value ?? '').trim())
    ));
    for (const child of tree.children) transform(child);
  };
}
