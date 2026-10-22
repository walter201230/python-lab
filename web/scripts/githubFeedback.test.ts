import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildExerciseFeedbackUrl } from '../src/lib/github';

test('反馈链接完整保留中文题目与带特殊字符的页面 URL，并提供复现信息填写项', () => {
  const currentUrl = 'https://learn-py.org/lessons/python8/oop/?a=1&b=中文%20值#exercise-02-init';
  const url = new URL(buildExerciseFeedbackUrl({
    lessonId: 'oop', exerciseId: '02-init', exerciseTitle: '用 __init__ & print("你好？")', currentUrl,
  }));
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.pathname, '/walter201230/Python/issues/new');
  assert.equal(url.searchParams.get('title'), '[oop] 用 __init__ & print("你好？") 题目反馈');
  assert.equal(url.searchParams.get('labels'), 'feedback,exercise');
  const body = url.searchParams.get('body')!;
  assert.ok(body.includes(`- url: ${currentUrl}`));
  assert.ok(body.includes('- lesson: `oop`\n- exercise: `02-init`'));
  for (const field of ['复现步骤', '预期', '实际', '报错', '设备／操作系统', '浏览器及版本', '快捷键', '刷新页面后是否仍出现', '最小复现代码（可选）']) {
    assert.ok(body.includes(field), `缺少反馈字段：${field}`);
  }
  assert.ok(body.includes('\n\n## 问题描述\n'));
  assert.ok(body.includes('```python\n\n```'));
  assert.ok(body.includes('```text\n\n```'));
});

test('服务端没有页面 URL 时保持模板有效，不生成空值或额外查询参数', () => {
  const url = new URL(buildExerciseFeedbackUrl({
    lessonId: 'functions', exerciseId: '01-define-add', exerciseTitle: '定义 add 函数',
  }));
  const body = url.searchParams.get('body')!;
  assert.ok(!body.includes('- url:'));
  assert.ok(!body.includes('undefined'));
  assert.ok(body.startsWith('## 哪一题\n- lesson: `functions`\n- exercise: `01-define-add`\n\n'));
  assert.deepEqual([...url.searchParams.keys()].sort(), ['body', 'labels', 'title']);
});
