import { Children, isValidElement, type ReactNode } from 'react';
import type { Components } from 'react-markdown';
import { CodeBlock } from './CodeBlock';

/** 围栏与缩进代码都从 pre 提取；行内 code 保持正文原有样式。 */
export function extractCodeFromPre(children: ReactNode): { lang: string; text: string } | null {
  const codeEl = Children.toArray(children).find((child) => isValidElement(child) && child.type === 'code');
  if (!isValidElement(codeEl)) return null;
  const props = codeEl.props as { className?: string; children?: ReactNode };
  const lang = /\blanguage-([^\s]+)/.exec(props.className ?? '')?.[1] ?? '';
  return { lang, text: String(props.children ?? '').replace(/\n$/, '') };
}

export const markdownCodeComponents: Components = {
  pre({ children }) {
    const code = extractCodeFromPre(children);
    return code ? <CodeBlock code={code.text} language={code.lang} /> : <pre>{children}</pre>;
  },
};
