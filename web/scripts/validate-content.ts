/**
 * 校验 content/lessons/ 下所有 lesson.json + exercise.json：
 * - schema 完整性
 * - 跨文件引用一致性（lesson.blocks 引用的 step/exercise 文件存在）
 * - AST 规则语法合法（"NodeType:Name" 格式）
 *
 * 用法：pnpm validate-content（或 npm run validate-content）
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Exercise, LessonMeta, ValidationError } from '../src/types/content';

const CONTENT_ROOT = join(process.cwd(), 'content', 'lessons');

const REQUIRED_LESSON_FIELDS: (keyof LessonMeta)[] = [
  'id', 'title', 'chapter', 'order', 'estimatedMinutes', 'blocks',
];

const REQUIRED_EXERCISE_FIELDS: (keyof Exercise)[] = [
  'id', 'title', 'prompt', 'starterCode', 'solution', 'grading', 'hints',
];

const AST_RULE_RE = /^[A-Z][A-Za-z]+(?::[A-Za-z_][A-Za-z0-9_]*)?$/;

function readJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

function validateLesson(lessonDir: string, errors: ValidationError[]): number {
  const lessonJsonPath = join(lessonDir, 'lesson.json');
  if (!existsSync(lessonJsonPath)) {
    errors.push({ file: relative(CONTENT_ROOT, lessonDir), message: '缺少 lesson.json' });
    return 0;
  }

  let lesson: LessonMeta;
  try {
    lesson = readJSON<LessonMeta>(lessonJsonPath);
  } catch (e) {
    errors.push({
      file: relative(CONTENT_ROOT, lessonJsonPath),
      message: `JSON 解析失败：${(e as Error).message}`,
    });
    return 0;
  }

  for (const field of REQUIRED_LESSON_FIELDS) {
    if (lesson[field] === undefined) {
      errors.push({
        file: relative(CONTENT_ROOT, lessonJsonPath),
        message: `缺少必填字段：${field}`,
      });
    }
  }

  const stepsDir = join(lessonDir, 'steps');
  const exercisesDir = join(lessonDir, 'exercises');
  let exerciseCount = 0;

  for (const block of lesson.blocks ?? []) {
    if (block.kind === 'step') {
      if (!existsSync(join(stepsDir, block.file))) {
        errors.push({
          file: relative(CONTENT_ROOT, lessonJsonPath),
          message: `step 文件不存在 — ${block.file}`,
        });
      }
    } else if (block.kind === 'exercise') {
      const exPath = join(exercisesDir, block.file);
      if (!existsSync(exPath)) {
        errors.push({
          file: relative(CONTENT_ROOT, lessonJsonPath),
          message: `exercise 文件不存在 — ${block.file}`,
        });
        continue;
      }
      validateExercise(exPath, errors);
      exerciseCount += 1;
    } else {
      errors.push({
        file: relative(CONTENT_ROOT, lessonJsonPath),
        message: `block.kind 非法：${(block as { kind: string }).kind}`,
      });
    }
  }

  return exerciseCount;
}

function validateExercise(exPath: string, errors: ValidationError[]): void {
  let ex: Exercise;
  try {
    ex = readJSON<Exercise>(exPath);
  } catch (e) {
    errors.push({
      file: relative(CONTENT_ROOT, exPath),
      message: `JSON 解析失败：${(e as Error).message}`,
    });
    return;
  }

  for (const field of REQUIRED_EXERCISE_FIELDS) {
    if (ex[field] === undefined) {
      errors.push({
        file: relative(CONTENT_ROOT, exPath),
        message: `缺少必填字段：${field}`,
      });
    }
  }

  const g = ex.grading;
  if (g) {
    const hasAny = g.stdoutEquals !== undefined || g.varsEqual !== undefined || (g.requiredAst && g.requiredAst.length > 0);
    if (!hasAny) {
      errors.push({
        file: relative(CONTENT_ROOT, exPath),
        message: 'grading 至少要有一条规则（stdoutEquals / varsEqual / requiredAst）',
      });
    }
    for (const rule of g.requiredAst ?? []) {
      if (!AST_RULE_RE.test(rule)) {
        errors.push({
          file: relative(CONTENT_ROOT, exPath),
          message: `AST 规则格式非法：${rule}（应为 "NodeType" 或 "NodeType:Name"）`,
        });
      }
    }
  }
}

function main() {
  if (!existsSync(CONTENT_ROOT)) {
    console.log(`✓ 校验通过：0 节课，0 道题（content/lessons/ 不存在，跳过）`);
    process.exit(0);
  }

  const errors: ValidationError[] = [];
  let lessonCount = 0;
  let exerciseCount = 0;

  for (const chapter of readdirSync(CONTENT_ROOT)) {
    const chapterDir = join(CONTENT_ROOT, chapter);
    if (!statSync(chapterDir).isDirectory()) continue;
    for (const lesson of readdirSync(chapterDir)) {
      const lessonDir = join(chapterDir, lesson);
      if (!statSync(lessonDir).isDirectory()) continue;
      exerciseCount += validateLesson(lessonDir, errors);
      lessonCount += 1;
    }
  }

  if (errors.length === 0) {
    console.log(`✓ 校验通过：${lessonCount} 节课，${exerciseCount} 道题`);
    process.exit(0);
  } else {
    console.log(`✗ 校验失败：${errors.length} 个问题`);
    for (const err of errors) {
      console.log(`  ${err.file}: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
