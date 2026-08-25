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

    // 序号必须在读文件之前同步分配完：Promise.all 里的 async 回调是并发启动的，
    // 若把 idx++ 放在 await readFile 之后，序号就按「哪个文件先读完」分配而非数组顺序，
    // 教学/练习编号与 section id 会随机错乱（文件大小不同，每次构建结果还不一样）。
    let stepIndex = 0;
    let exerciseIndex = 0;
    const numbered = meta.blocks.map((ref) => ({
      ref,
      idx: ref.kind === 'step' ? stepIndex++ : exerciseIndex++,
    }));

    const blocks: LoadedBlock[] = await Promise.all(
      numbered.map(async ({ ref, idx }): Promise<LoadedBlock> => {
        if (ref.kind === 'step') {
          const content = await readFile(
            join(lessonDir, 'steps', ref.file),
            'utf-8',
          );
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
          exerciseIndex: idx,
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
