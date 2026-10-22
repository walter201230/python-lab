'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { codeLanguageLabel, highlightCode } from '@/lib/codeHighlight';

interface CodeBlockProps {
  code: string;
  language?: string;
  usage?: string;
  plainText?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
}

/** 阅读、教学试运行、题面和答案共用；复制与执行始终使用原始代码。 */
export function CodeBlock({ code, language = '', usage, plainText = false, actions, children }: CodeBlockProps) {
  const html = useMemo(() => plainText ? null : highlightCode(code, language), [code, language, plainText]);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function handleCopy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    timer.current = setTimeout(() => setCopyState('idle'), 2500);
  }

  return (
    <div className="not-prose lesson-code-block">
      <div className="lesson-code-block__toolbar">
        <div className="lesson-code-block__caption">
          <span className="lesson-code-block__dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="lesson-code-block__language">{codeLanguageLabel(language)}</span>
          {usage && <span className="lesson-code-block__usage">· {usage}</span>}
        </div>
        <div className="lesson-code-block__actions">
          <button type="button" onClick={handleCopy} aria-label="复制代码" title="复制原始代码">
            {copyState === 'copied' ? '已复制' : copyState === 'failed' ? '请重试' : '复制'}
          </button>
          {actions}
        </div>
      </div>
      <span className="sr-only" role="status">
        {copyState === 'copied' ? '代码已复制' : copyState === 'failed' ? '复制失败，请重试或选中代码手动复制。' : ''}
      </span>
      <pre className="lesson-code-block__code" tabIndex={0} aria-label={`${codeLanguageLabel(language)}代码`}>
        {html === null ? <code>{code}</code> : (
          // HTML 仅来自 highlighter 的转义结果，绝不直接插入原文。
          <code dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </pre>
      {children && <div className="lesson-code-block__output">{children}</div>}
    </div>
  );
}
