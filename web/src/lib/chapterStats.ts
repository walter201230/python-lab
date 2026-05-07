/**
 * Server-only：为首页课程卡片预算每章的练习题总数。
 *
 * 直接读 lesson.json 数 blocks 中 kind === 'exercise' 的条数，不复用 loadLesson
 * 是为了避免读所有 step 的 mdx 内容浪费 IO。
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CHAPTERS } from './chapters';

export interface ChapterStat {
  /** progress store 里 byLesson 的 key，等于 lesson.json 的 id 字段 */
  lessonId: string;
  /** 该章练习题总数（read-only 章节为 0） */
  totalExercises: number;
  /** 该章教学步骤数（用于 TOC 占位估算等） */
  totalSteps: number;
  /** 预计完成分钟数（lesson.json 的 estimatedMinutes） */
  estimatedMinutes: number;
}

const CONTENT_ROOT = join(process.cwd(), 'content', 'lessons');

interface LessonJsonShape {
  id: string;
  estimatedMinutes?: number;
  blocks?: { kind: 'step' | 'exercise' }[];
}

export async function getChapterStats(): Promise<Record<string, ChapterStat>> {
  const out: Record<string, ChapterStat> = {};
  await Promise.all(
    CHAPTERS.flatMap((ch) =>
      ch.lessons.map(async (l) => {
        const file = join(CONTENT_ROOT, ch.slug, l.id, 'lesson.json');
        const meta = JSON.parse(await readFile(file, 'utf-8')) as LessonJsonShape;
        const blocks = meta.blocks ?? [];
        out[ch.slug] = {
          lessonId: meta.id,
          totalExercises: blocks.filter((b) => b.kind === 'exercise').length,
          totalSteps: blocks.filter((b) => b.kind === 'step').length,
          estimatedMinutes: meta.estimatedMinutes ?? 0,
        };
      }),
    ),
  );
  return out;
}
