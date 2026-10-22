import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHAPTERS } from '../src/lib/chapters';
import { loadLesson } from '../src/lib/loadLesson';
import { chapterNeighbors, continuationTarget, lessonHref, lessonOutline, visibleBlockCount } from '../src/lib/lessonNavigation';
import type { Exercise } from '../src/types/content';

test('跨章保持模式，首尾和无效章节不产生错误链接，跳过不可用章节', () => {
  assert.equal(lessonHref('python4', 'dict-and-set', 'read'), '/lessons/python4/dict-and-set/read/');
  assert.equal(lessonHref('python4', 'dict-and-set', 'practice'), '/lessons/python4/dict-and-set/');
  assert.equal(chapterNeighbors(CHAPTERS[0].slug).prevChapter, null);
  assert.equal(chapterNeighbors(CHAPTERS.at(-1)!.slug).nextChapter, null);
  assert.deepEqual(chapterNeighbors('missing'), { prevChapter: null, nextChapter: null });
  const chapters = [CHAPTERS[0], { ...CHAPTERS[1], status: 'planned' as const }, { ...CHAPTERS[2], lessons: [] }, CHAPTERS[3]];
  assert.equal(chapterNeighbors(chapters[0].slug, chapters).nextChapter?.slug, chapters[3].slug);
  assert.equal(chapterNeighbors(chapters[3].slug, chapters).prevChapter?.slug, chapters[0].slug);
});

test('全课程阅读目录可达；闯关目录、题号与逐题解锁正文的范围一致', async () => {
  for (const chapter of CHAPTERS) {
    for (const lesson of chapter.lessons) {
      const data = await loadLesson(chapter.slug, lesson.id);
      assert.ok(data);
      const read = lessonOutline(data.blocks, 'read');
      assert.equal(new Set(read.map((item) => item.id)).size, data.blocks.length);
      assert.ok(read.every((item) => item.available && !item.completed));
      assert.ok(read.filter((item) => item.kind === 'exercise').every((item) => item.id.startsWith('read-exercise-')));
      for (let passed = 0; passed <= data.exercises.length; passed++) {
        // 完成和看答案混合；两种状态都推进，但只有完成计入通过。
        const progress: { completed: string[]; viewedSolution: string[] } = {
          completed: data.exercises.slice(0, passed).filter((_, i) => i % 2 === 0).map((item) => item.id),
          viewedSolution: data.exercises.slice(0, passed).filter((_, i) => i % 2 === 1).map((item) => item.id),
        };
        const outline = lessonOutline(data.blocks, 'practice', progress);
        const next: Exercise | undefined = data.exercises[passed];
        const expected: number = next ? outline.findIndex((item) => item.id === `exercise-${next.id}`) + 1 : data.blocks.length;
        assert.equal(visibleBlockCount(data.blocks, progress), expected, lesson.id);
        assert.equal(outline.filter((item) => item.available).length, expected, lesson.id);
        assert.ok(outline.slice(expected).every((item) => !item.available), lesson.id);
        assert.equal(outline.filter((item) => item.completed).length, progress.completed.length);
      }
    }
  }
});

test('全课程继续入口按正文顺序推进，末题不跳过后续讲解', async () => {
  let followingTeaching = 0;
  let followingExercise = 0;
  let trailingTeaching = 0;
  for (const chapter of CHAPTERS) {
    for (const lesson of chapter.lessons) {
      const data = await loadLesson(chapter.slug, lesson.id);
      assert.ok(data);
      const outline = lessonOutline(data.blocks, 'practice');
      for (const exercise of data.exercises) {
        const position = outline.findIndex((item) => item.id === `exercise-${exercise.id}`);
        const next = outline[position + 1];
        const target = continuationTarget(outline, exercise.id);
        assert.equal(target.href, next ? `#${next.id}` : '#lesson-end');
        if (next?.kind === 'step') {
          followingTeaching++;
          assert.equal(target.label, '继续学习');
          if (exercise === data.exercises.at(-1)) trailingTeaching++;
        } else if (next) {
          followingExercise++;
          assert.equal(target.label, '下一题');
        }
      }
    }
  }
  assert.ok(followingTeaching > 0 && followingExercise > 0 && trailingTeaching > 0);
});

test('空课与旧内容残留进度不会凭空解锁', async () => {
  assert.equal(visibleBlockCount([]), 0);
  assert.deepEqual(lessonOutline([], 'read'), []);
  const data = await loadLesson('python4', 'dict-and-set');
  assert.ok(data);
  assert.deepEqual(lessonOutline(data.blocks, 'practice', { completed: ['removed-exercise'], viewedSolution: [] }), lessonOutline(data.blocks, 'practice'));
});
