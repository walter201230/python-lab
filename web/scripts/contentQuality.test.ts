import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { validateTeachingText, validateCodeExamples } from './contentQuality';
import { remarkCodeModes, getCodeMode, type CodeMode } from '../src/lib/markdownCode';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import exampleCatalog from '../content/code-examples.json';
import { ReadStepCard } from '../src/components/lesson/ReadStepCard';
import { StepCard } from '../src/components/lesson/StepCard';
import { selectTeachingSection } from '../src/lib/teachingSections';

test('工作声明不进入教程，正常版本说明允许', () => {
  assert.equal(validateTeachingText('<!-- content-completion-2026-10-22:start -->').length, 1);
  assert.equal(validateTeachingText('本节为本轮新增补充，以上原有文字逐字保留。').length, 1);
  assert.deepEqual(validateTeachingText('此示例需要 Python 3.10 或更新版本，在本地运行。'), []);
});

test('代码变化和用途清单遗漏会阻断内容验证', () => {
  const text = '```Python\nprint(1)\n```';
  const entries = [{ sha256: createHash('sha256').update('print(1)').digest('hex'), mode: 'runnable' }];
  assert.deepEqual(validateCodeExamples(text, entries), []);
  assert.ok(validateCodeExamples(text.replace('1', '2'), entries).length);
  assert.ok(validateCodeExamples(text, undefined).length);
  assert.ok(validateCodeExamples(text.replace('Python', 'Python no-run'), entries).length);
});

function render(modes: CodeMode[], code = '```Python\nprint(1)\n```'): string {
  return renderToStaticMarkup(createElement(ReactMarkdown, {
    remarkPlugins: [[remarkCodeModes, { modes }]],
    components: { pre: ({ node }) => createElement('span', null, getCodeMode(node)) },
  }, code));
}

test('两种页面共用用途，未登记的片段不获得运行许可', () => {
  assert.equal(render(['runnable']), '<span>runnable</span>');
  assert.equal(render([]), '<span>context</span>');
  for (const mode of ['local', 'context', 'syntax', 'output', 'error'] as CodeMode[]) {
    assert.equal(render([mode]), `<span>${mode}</span>`);
  }
});

test('no-run 优先，混合代码围栏不打乱 Python 用途顺序', () => {
  assert.equal(render(['runnable'], '```python no-run\nprint(1)\n```'), '<span>context</span>');
  assert.equal(render(['local', 'runnable'], '```text\noutput\n```\n\n```Python\nfirst\n```\n\n```python\nsecond\n```'), '<span>context</span>\n<span>local</span>\n<span>runnable</span>');
});

test('所有在用步骤在阅读与闯关页给出相同运行许可，示意和本地代码没有运行入口', () => {
  const root = join(process.cwd(), 'content/lessons');
  let steps = 0;
  for (const chapter of readdirSync(root)) {
    for (const lesson of readdirSync(join(root, chapter))) {
      const dir = join(root, chapter, lesson);
      const meta = JSON.parse(readFileSync(join(dir, 'lesson.json'), 'utf8'));
      for (const block of meta.blocks) {
        if (block.kind !== 'step') continue;
        const key = `${chapter}/${lesson}/steps/${block.file}`;
        const entries = (exampleCatalog as Record<string, Array<{ mode: CodeMode }>>)[key];
        const fullContent = readFileSync(join(dir, 'steps', block.file), 'utf8');
        const keys = meta.blocks.filter((b: { kind: string; file: string; section?: string }) => b.kind === 'step' && b.file === block.file && b.section !== undefined).map((b: { section: string }) => b.section);
        const selected = selectTeachingSection(fullContent, entries, block.section, keys);
        const content = selected.content;
        const codeModes = selected.examples.map((entry) => entry.mode);
        const props = { content, codeModes, index: 0, totalSteps: 1 };
        const read = renderToStaticMarkup(createElement(ReadStepCard, { ...props, practiceHref: '/practice/' }));
        const practice = renderToStaticMarkup(createElement(StepCard, { ...props, state: 'current', pyStatus: 'ready', run: async () => ({ stdout: '', stderr: '', vars: {}, astNodes: [] }) }));
        const expected = codeModes.filter((mode) => mode === 'runnable').length;
        assert.equal((read.match(/在闯关页练习/g) ?? []).length, expected, key);
        assert.equal((practice.match(/▶ 试运行/g) ?? []).length, expected, key);
        assert.equal((read.match(/Python ·/g) ?? []).length, selected.examples.length, key);
        assert.equal((practice.match(/Python ·/g) ?? []).length, selected.examples.length, key);
        assert.ok(!read.includes('content-completion-') && !read.includes('原教程全文'), key);
        steps++;
      }
    }
  }
  assert.ok(steps >= 100);
});
