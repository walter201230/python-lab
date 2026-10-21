import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Chapter } from '../src/lib/chapters';
import { validateCatalog, type CatalogLesson } from './catalogValidation';

function chapter(slug = 'python1', id = 'intro'): Chapter {
  return { slug, number: 1, title: '课程', description: '', emoji: '', status: 'available', lessons: [{ id, title: '课程' }] };
}

function lesson(chapterDir = 'python1', lessonDir = 'intro'): CatalogLesson {
  return {
    chapterDir,
    lessonDir,
    meta: { chapter: chapterDir, id: lessonDir, title: '课程正文', description: '摘要', order: 1, estimatedMinutes: 10, blocks: [] },
  };
}

test('课程身份一致即可通过，展示标题无需相同', () => {
  assert.deepEqual(validateCatalog([chapter()], [lesson()]), []);
});

test('可用课程缺少内容时阻断', () => {
  assert.match(validateCatalog([chapter()], [])[0].message, /缺少有效内容/);
});

test('磁盘内容未登记时阻断', () => {
  assert.match(validateCatalog([], [lesson()])[0].message, /未在 chapters.ts 登记/);
});

test('元数据与路径错位时阻断', () => {
  const data = lesson();
  data.meta.chapter = 'python2';
  data.meta.id = 'other';
  assert.ok(validateCatalog([chapter()], [data]).some((e) => e.message.includes('实际课程目录')));
});

test('跨章节复用 lesson id 会污染进度键，目录及内容均拒绝重复', () => {
  const errors = validateCatalog([chapter(), chapter('python2')], [lesson(), lesson('python2')]);
  assert.ok(errors.some((e) => e.message === 'lesson id 全站重复：intro'));
  assert.ok(errors.some((e) => e.message === '内容 lesson id 全站重复：intro'));
});

test('重复章节及没有课程的可用章节都会阻断', () => {
  const empty = chapter('python2');
  empty.lessons = [];
  const errors = validateCatalog([chapter(), chapter(), empty], [lesson()]);
  assert.ok(errors.some((e) => e.message.includes('章节 slug 重复')));
  assert.ok(errors.some((e) => e.message.includes('可用章节没有课程')));
});

test('尚未发布的 planned 章节允许没有内容', () => {
  const draft = chapter();
  draft.status = 'planned';
  assert.deepEqual(validateCatalog([draft], []), []);
});
