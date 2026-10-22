import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { splitTeachingSections, teachingHeadings, selectTeachingSection } from '../src/lib/teachingSections';
import catalog from '../content/code-examples.json';

test('保留全部原字节，代码围栏中的标题不切开，代码用途按原位置截取', () => {
  const source = '# 课名\n引入\n\n## 第一节\n```python\n# 原始注释\nprint(1)\n```\n\n## 第二节\n````markdown\n## 代码里的标题\n```python\nprint(2)\n```\n````\n结尾\n';
  assert.deepEqual(teachingHeadings(source).map(h => h.key), ['## 第一节', '## 第二节']);
  const parts = splitTeachingSections(source, ['$intro', '## 第一节', '## 第二节']);
  assert.equal(parts.map(p => p.content).join(''), source);
  const plain = '# 课名\n## 第一节\n```python\nprint(1)\n```\n## 第二节\n```python\nraise ValueError()\n```\n';
  assert.deepEqual(selectTeachingSection(plain, ['runnable', 'error'], '## 第二节', ['$intro','## 第一节','## 第二节']).examples, ['error']);
});

test('拒绝不存在、重名、重复、倒序或缺少引入的分段引用', () => {
  const source = '# 课名\n## A\na\n## B\nb\n';
  for (const keys of [['## A'], ['$intro','## Missing'], ['$intro','## B','## A'], ['$intro','## A','## A']]) {
    assert.throws(() => splitTeachingSections(source, keys));
  }
  assert.throws(() => splitTeachingSections(source+'## A\nx', ['$intro','## A']));
});

test('长章分段可完整拼回正文，题目先修讲解位置与顺序符合教学要求', () => {
  const root = join(process.cwd(),'content/lessons');
  const prerequisites: Record<number, Record<string,string>> = {
    18: {'01-name-suffix-stem.json':'### 3.3', '02-joining.json':'## 二、', '03-parents.json':'### 3.5', '04-suffixes.json':'### 3.3'},
    19: {'01-safe-divide.json':'## 最朴素', '02-parse-int.json':'## 一次捕获', '03-finally.json':'## finally', '04-raise-age.json':'## 主动', '05-custom-exception.json':'## 自定义'},
    20: {'01-basic-point.json':'## 第一个', '02-default-factory.json':'## `field()`', '03-frozen-hash.json':'## 不可变', '04-eq.json':'## 比较'},
    21: {'01-with-stringio.json':'## with 的本质', '02-custom-class.json':'## 一个稍微', '03-contextmanager.json':'## contextlib：', '04-suppress.json':'### suppress：'},
    22: {'01-hello.json':'## asyncio.run()', '02-sleep-order.json':'## asyncio.run()', '03-gather-two.json':'## 一次等多个', '04-gather-fetch.json':'## 一次等多个'},
  };
  for (let n = 17; n <= 28; n++) {
    const chapter = join(root,`python${n}`); const dir = join(chapter,readdirSync(chapter)[0]);
    const meta = JSON.parse(readFileSync(join(dir,'lesson.json'),'utf8'));
    const refs = meta.blocks.filter((b: { section?: string }) => b.section !== undefined);
    assert.ok(refs.length > 3, `python${n}`);
    const file = refs[0].file;
    const source = readFileSync(join(dir,'steps',file),'utf8');
    const sections = splitTeachingSections(source, refs.map((b: {section: string}) => b.section));
    assert.equal(sections.map(s=>s.content).join(''), source);
    const key = `python${n}/${meta.id}/steps/${file}`;
    assert.equal(sections.reduce((sum,s)=>sum+s.codeCount,0),(catalog as Record<string,unknown[]>)[key].length);
    assert.ok(Math.max(...sections.map(s=>s.content.split('\n').length)) < 350, `python${n} 仍有超长分段`);
    for (const [exercise, prefix] of Object.entries(prerequisites[n] ?? {})) {
      const exIndex = meta.blocks.findIndex((b: {file: string}) => b.file===exercise);
      const topicIndex = meta.blocks.findIndex((b: {section?: string}) => b.section?.startsWith(prefix));
      assert.ok(topicIndex >= 0 && topicIndex < exIndex, `${n}/${exercise} 缺少前置讲解`);
    }
  }
  const dir=join(root,'python18','pathlib');const meta=JSON.parse(readFileSync(join(dir,'lesson.json'),'utf8'));
  const firstExercise=meta.blocks.findIndex((b:{kind:string})=>b.kind==='exercise');
  assert.ok(firstExercise>0 && meta.blocks.slice(firstExercise).some((b:{kind:string})=>b.kind==='step'), '讲解和练习必须交错，不能整章讲完才开始做题');
});
