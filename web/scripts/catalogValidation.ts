import type { Chapter } from '../src/lib/chapters';
import type { LessonMeta, ValidationError } from '../src/types/content';

export interface CatalogLesson {
  chapterDir: string;
  lessonDir: string;
  meta: LessonMeta;
}

/** 路由目录、课程声明与进度存储共用 lesson id，检查三者不会脱节。 */
export function validateCatalog(chapters: Chapter[], lessons: CatalogLesson[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const chapterSlugs = new Set<string>();
  const declaredIds = new Set<string>();
  const registered = new Set<string>();
  const required = new Set<string>();

  for (const chapter of chapters) {
    if (chapterSlugs.has(chapter.slug)) {
      errors.push({ file: 'src/lib/chapters.ts', message: `章节 slug 重复：${chapter.slug}` });
    }
    chapterSlugs.add(chapter.slug);
    if (chapter.status === 'available' && chapter.lessons.length === 0) {
      errors.push({ file: 'src/lib/chapters.ts', message: `可用章节没有课程：${chapter.slug}` });
    }
    for (const lesson of chapter.lessons) {
      const key = `${chapter.slug}/${lesson.id}`;
      if (declaredIds.has(lesson.id)) {
        errors.push({ file: 'src/lib/chapters.ts', message: `lesson id 全站重复：${lesson.id}` });
      }
      declaredIds.add(lesson.id);
      registered.add(key);
      if (chapter.status === 'available') required.add(key);
    }
  }

  const actual = new Set<string>();
  const contentIds = new Set<string>();
  for (const { chapterDir, lessonDir, meta } of lessons) {
    const key = `${chapterDir}/${lessonDir}`;
    const file = `${key}/lesson.json`;
    actual.add(key);
    if (meta.chapter !== chapterDir || meta.id !== lessonDir) {
      errors.push({ file, message: 'chapter／id 必须与实际课程目录一致' });
    }
    if (typeof meta.id === 'string') {
      if (contentIds.has(meta.id)) {
        errors.push({ file, message: `内容 lesson id 全站重复：${meta.id}` });
      }
      contentIds.add(meta.id);
    }
    if (!registered.has(key)) {
      errors.push({ file, message: '课程内容未在 chapters.ts 登记' });
    }
  }
  for (const key of required) {
    if (!actual.has(key)) {
      errors.push({ file: `${key}/lesson.json`, message: '可用课程缺少有效内容' });
    }
  }
  return errors;
}
