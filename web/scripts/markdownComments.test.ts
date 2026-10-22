import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkHideComments } from '../src/lib/markdownComments';

function render(content: string): string {
  return renderToStaticMarkup(createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm, remarkHideComments],
  }, content));
}

test('来源与保护注释隐藏，前后正文保留', () => {
  const source = '作者原文\n\n<!-- original-source:example.md -->\n\n新增讲解';
  const html = render(source);
  assert.ok(html.includes('作者原文'));
  assert.ok(html.includes('新增讲解'));
  assert.ok(!html.includes('original-source'));
});

test('行内完整注释隐藏，手写表达不断字', () => {
  assert.ok(render('手写<!-- 标记 -->表达').includes('手写表达'));
});

test('Python 代码块的注释字符串逐字展示', () => {
  const html = render('```python\ntext = "<!-- 原样保留 -->"\nprint(text)\n```');
  assert.ok(html.includes('&lt;!-- 原样保留 --&gt;'));
  assert.ok(html.includes('print(text)'));
});

test('行内代码的注释文字不隐藏', () => {
  assert.ok(render('示例 `<!-- 原样保留 -->`').includes('&lt;!-- 原样保留 --&gt;'));
});

test('其他原有 HTML 样式文字不被注释处理移除', () => {
  const html = render('<span>作者文字</span>');
  assert.ok(html.includes('作者文字'));
  assert.ok(html.includes('&lt;span&gt;'));
});

test('未闭合的注释样式文本不吞掉后续内容', () => {
  const html = render('<!-- 未闭合\n\n后面的手写文字');
  assert.ok(html.includes('未闭合'));
  assert.ok(html.includes('后面的手写文字'));
});
