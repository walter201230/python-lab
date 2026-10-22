import { CHAPTERS, type Chapter } from './chapters';
import type { LoadedBlock } from './loadLesson';
import type { LessonProgress } from '../store/progress';

export type LessonMode = 'read' | 'practice';

export interface LessonOutlineItem {
  id: string;
  title: string;
  kind: 'step' | 'exercise';
  index: number;
  available: boolean;
  completed: boolean;
}

export function lessonHref(chapter: string, lesson: string, mode: LessonMode) {
  return `/lessons/${chapter}/${lesson}/${mode === 'read' ? 'read/' : ''}`;
}

export function chapterNeighbors(slug: string, chapters: Chapter[] = CHAPTERS) {
  const index = chapters.findIndex((chapter) => chapter.slug === slug);
  if (index === -1) return { prevChapter: null, nextChapter: null };
  const usable = (chapter: Chapter) => chapter.status === 'available' && chapter.lessons.length > 0;
  return {
    prevChapter: chapters.slice(0, index).reverse().find(usable) ?? null,
    nextChapter: chapters.slice(index + 1).find(usable) ?? null,
  };
}

type NavigationProgress = Pick<LessonProgress, 'completed' | 'viewedSolution'>;

export function visibleBlockCount(blocks: LoadedBlock[], progress?: NavigationProgress) {
  const passed = new Set([...(progress?.completed ?? []), ...(progress?.viewedSolution ?? [])]);
  const cutoff = blocks.findIndex((block) => block.kind === 'exercise' && !passed.has(block.exercise.id));
  return cutoff < 0 ? blocks.length : cutoff + 1;
}

export function lessonOutline(blocks: LoadedBlock[], mode: LessonMode, progress?: NavigationProgress): LessonOutlineItem[] {
  const visible = mode === 'read' ? blocks.length : visibleBlockCount(blocks, progress);
  return blocks.map((block, position) => ({
    id: block.kind === 'step' ? `step-${block.stepIndex}` : `${mode === 'read' ? 'read-' : ''}exercise-${block.exercise.id}`,
    title: block.kind === 'step' ? block.title : block.exercise.title,
    kind: block.kind,
    index: (block.kind === 'step' ? block.stepIndex : block.exerciseIndex) + 1,
    available: position < visible,
    completed: mode === 'practice' && block.kind === 'exercise' && (progress?.completed.includes(block.exercise.id) ?? false),
  }));
}

export function continuationTarget(outline: LessonOutlineItem[], exerciseId: string) {
  const index = outline.findIndex((item) => item.id === `exercise-${exerciseId}`);
  const next = index >= 0 ? outline[index + 1] : undefined;
  return next
    ? { href: `#${next.id}`, label: next.kind === 'step' ? '继续学习' : '下一题' }
    : { href: '#lesson-end', label: '查看本章总结' };
}
