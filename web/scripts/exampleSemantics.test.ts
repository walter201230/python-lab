import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { loadPyodide } from 'pyodide';
import catalog from '../content/code-examples.json';
import regressions from '../content/example-regressions.json';
import { pythonBlocks } from '../src/lib/teachingSections';

interface Regression {
  file: string;
  index: number;
  sha256: string;
  mode: string;
  setup?: string;
  stdout?: string;
  vars?: Record<string, unknown>;
  errorType?: string;
  normalize?: string;
}
interface Result { stdout: string; stderr: string; error?: string; vars: Record<string, unknown> }

function normalize(text: string, kind?: string) {
  if (kind === 'dates') return text.replace(/\d{4}-\d{2}-\d{2}/g, '<date>');
  if (kind === 'elapsed') return text.replace(/\d+\.\d+(?= (?:秒|ms))/g, '<elapsed>');
  if (kind === 'timing-records') return text.replace(/(?<='cost_ms': )\d+(?:\.\d+)?/g, '<elapsed>');
  return text;
}

test('真实 worker 验证恢复的独立示例、上下文反例和全部预期异常，重复执行结果一致', async () => {
  const web = process.cwd();
  const runtime = await loadPyodide({ indexURL: join(web, 'node_modules/pyodide/') });
  let result: Result | undefined;
  const context = vm.createContext({
    self: { location: { href: 'http://localhost/' }, postMessage: (value: Result) => { result = value; } },
    URL, structuredClone, importScripts() {},
  });
  const worker = readFileSync(join(web, 'public/pyodide.worker.js'), 'utf8');
  vm.runInContext(`${worker}\nglobalThis.setRuntime=(value)=>{pyodide=value};globalThis.runExample=handleRun;`, context);
  context.setRuntime(runtime);
  const entries = catalog as Record<string, Array<{ sha256: string; mode: string }>>;
  const coveredErrors = new Set<string>();
  for (const item of regressions as Regression[]) {
    const label = `${item.file}:${item.index}`;
    const source = readFileSync(join(web, 'content/lessons', item.file), 'utf8');
    const match = pythonBlocks(source)[item.index];
    assert.ok(match, label);
    const code = match[2].replace(/\n$/, '');
    assert.equal(createHash('sha256').update(code).digest('hex'), item.sha256, label);
    assert.equal(entries[item.file][item.index].mode, item.mode, label);
    if (item.errorType) coveredErrors.add(label);
    if (item.mode === 'runnable') assert.equal(item.setup, undefined, `${label} 独立示例不能依赖测试前置代码`);
    for (let repetition = 0; repetition < 2; repetition++) {
      result = undefined;
      await context.runExample({ runId: label, code: `${item.setup ?? ''}\n${code}`, isolated: true, expectedVarNames: Object.keys(item.vars ?? {}) });
      assert.ok(result, label);
      const actual = result as Result;
      if (item.errorType) {
        assert.ok(actual.error, `${label} 必须实际抛错`);
        assert.match(`${actual.error}\n${actual.stderr}`, new RegExp(`(?:^|\\n)${item.errorType}:`), label);
      }
      else {
        assert.equal(actual.error, undefined, `${label}: ${actual.error}`);
        assert.equal(normalize(actual.stdout, item.normalize), item.stdout, label);
        for (const [name, value] of Object.entries(item.vars ?? {})) assert.deepEqual(actual.vars[name], value, `${label} ${name}`);
      }
    }
  }
  for (const [file, examples] of Object.entries(entries)) {
    examples.forEach((entry, index) => {
      if (entry.mode === 'error') assert.ok(coveredErrors.has(`${file}:${index}`), `预期错误缺少异常断言：${file}:${index}`);
    });
  }
});
