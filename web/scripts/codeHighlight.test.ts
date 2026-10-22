import assert from 'node:assert/strict';
import test from 'node:test';
import { highlightCode } from '../src/lib/codeHighlight';

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|#x27);/g, (_, entity: string) =>
    ({ amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'" })[entity]!);
}

test('Python 高亮区分关键字、字符串、注释，保留中文、缩进和空行', () => {
  const code = '# 中文注释\n\ndef hello(name):\n    print(f"你好，{name}")\n\nhello("两点水")\n';
  const html = highlightCode(code, 'Python')!;
  for (const token of ['keyword', 'string', 'comment']) assert.ok(html.includes(`hljs-${token}`));
  assert.equal(plainText(html), code);
});

test('教程中的非 Python 语言和别名都生成高亮', () => {
  for (const [language, code] of [
    ['bash', 'echo "$HOME"'], ['toml', '[project]\nname = "demo"'],
    ['json', '{"enabled": true}'], ['yaml', 'name: demo'],
    ['markdown', '# 标题'], ['lua', 'local name = "demo"'], ['py', 'print("hello")'],
  ]) {
    const html = highlightCode(code, language);
    assert.ok(html, language);
    assert.ok(html.includes('hljs-'), language);
    assert.equal(plainText(html), code);
  }
});

test('纯文本、未知语言和无标记输出回退给 React 原文渲染', () => {
  for (const language of ['', 'text', 'txt', 'unknown-language']) {
    assert.equal(highlightCode('<img src=x onerror=alert(1)>\n  123', language), null);
  }
  assert.equal(highlightCode('', 'python'), '');
});

test('高亮结果转义 HTML，不把代码里的标签作为页面元素', () => {
  const code = 'value = "<script>alert(1)</script>&<img src=x onerror=alert(1)>"';
  const html = highlightCode(code, 'python')!;
  assert.doesNotMatch(html, /<(script|img)\b/i);
  assert.equal(plainText(html), code);
});
