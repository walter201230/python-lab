/**
 * Server-side 课程数据加载器（仅在 server component / route handler 中调用）。
 *
 * 按 lesson.json 的 blocks 顺序加载 step/exercise，前端可直接按数组顺序渲染。
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Exercise, LessonMeta } from '@/types/content';

export type LoadedBlock =
  | {
      kind: 'step';
      file: string;
      content: string;
      stepIndex: number;
      /** 从 content 第一个 markdown heading 提取，给 TOC 显示用 */
      title: string;
    }
  | { kind: 'exercise'; file: string; exercise: Exercise; exerciseIndex: number };

/** 取 markdown 内容里第一个非空 ATX heading 的纯文本，作为 TOC 显示标题 */
function extractStepTitle(content: string, fallback: string): string {
  for (const line of content.split('\n')) {
    const m = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) return m[1].trim();
  }
  return fallback;
}

export interface LoadedLesson {
  meta: LessonMeta;
  blocks: LoadedBlock[];
  /** 仅 exercise 的扁平列表（顶部题号导航、计数用） */
  exercises: Exercise[];
}

const CONTENT_ROOT = join(process.cwd(), 'content', 'lessons');

export async function loadLesson(
  chapter: string,
  lessonId: string,
): Promise<LoadedLesson | null> {
  const lessonDir = join(CONTENT_ROOT, chapter, lessonId);
  try {
    const meta = JSON.parse(
      await readFile(join(lessonDir, 'lesson.json'), 'utf-8'),
    ) as LessonMeta;

    let stepIndex = 0;
    let exerciseIndex = 0;
    const blocks: LoadedBlock[] = await Promise.all(
      meta.blocks.map(async (ref): Promise<LoadedBlock> => {
        if (ref.kind === 'step') {
          const content = await readFile(
            join(lessonDir, 'steps', ref.file),
            'utf-8',
          );
          const idx = stepIndex++;
          const title = extractStepTitle(content, `教学 ${idx + 1}`);
          return { kind: 'step', file: ref.file, content, stepIndex: idx, title };
        }
        const exercise = JSON.parse(
          await readFile(join(lessonDir, 'exercises', ref.file), 'utf-8'),
        ) as Exercise;
        return {
          kind: 'exercise',
          file: ref.file,
          exercise,
          exerciseIndex: exerciseIndex++,
        };
      }),
    );

    const exercises = blocks
      .filter((b): b is Extract<LoadedBlock, { kind: 'exercise' }> => b.kind === 'exercise')
      .map((b) => b.exercise);

    return { meta, blocks, exercises };
  } catch (e) {
    console.error(`loadLesson(${chapter}/${lessonId}) error:`, e);
    return null;
  }
}
