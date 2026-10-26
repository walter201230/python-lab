'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CHAPTERS } from '@/lib/chapters';
import { lessonHref, type LessonMode, type LessonOutlineItem } from '@/lib/lessonNavigation';
import { LessonToc } from './LessonToc';

interface LessonNavigationProps {
  chapter: string;
  title: string;
  mode: LessonMode;
  outline: LessonOutlineItem[];
  children: ReactNode;
}

/** 仅导航需要客户端交互；阅读正文通过 children 保留为静态服务端内容。 */
export function LessonNavigation({ chapter, title, mode, outline, children }: LessonNavigationProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [directory, setDirectory] = useState<'courses' | 'chapter'>('courses');
  const [directoryOpen, setDirectoryOpen] = useState(false);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const shell = shellRef.current;
    if (!toolbar || !shell) return;
    const measure = () => shell.style.setProperty('--lesson-toolbar-height', `${toolbar.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  function closeDirectory() {
    dialogRef.current?.close();
  }

  return (
    <div ref={shellRef} className="lesson-shell bg-tech-grid relative min-h-[calc(100vh-var(--spacing-header))] bg-canvas">
      <div ref={toolbarRef} data-lesson-toolbar className="sticky top-header z-30 border-b border-line bg-canvas lg:hidden">
        <div className="mx-auto max-w-[1600px] px-4 py-2 sm:px-6">
          <button
            ref={openButtonRef}
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              dialogRef.current?.showModal();
              setDirectoryOpen(true);
            }}
            className="focus-ring min-h-11 rounded-lg border border-line px-3 text-sm text-fg-body"
          >目录</button>
        </div>
      </div>

      <div className="lesson-columns mx-auto grid max-w-[1600px] gap-6 px-4 sm:px-6">
        <aside className="lesson-sidebar lesson-directory-scroll hidden min-w-0 border-r border-line pr-4 lg:block" aria-label="全部课程">
          <CourseDirectory chapter={chapter} mode={mode} />
        </aside>
        <div className="min-w-0">{children}</div>
        <aside className="lesson-sidebar lesson-directory-scroll hidden min-w-0 pl-4 min-[1440px]:block" aria-label="本章内容">
          <LessonToc items={outline} lessonTitle={title} />
        </aside>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="lesson-directory-title"
        className="lesson-directory-dialog m-0 h-dvh max-h-dvh w-[min(90vw,24rem)] max-w-none border-r border-line bg-canvas p-0 text-fg shadow-2xl backdrop:bg-black/50"
        onClose={() => {
          setDirectoryOpen(false);
          openButtonRef.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const box = event.currentTarget.getBoundingClientRect();
            if (event.clientX > box.right || event.clientY > box.bottom) closeDirectory();
          }
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 id="lesson-directory-title" className="font-semibold">学习目录</h2>
            <button type="button" onClick={closeDirectory} className="focus-ring min-h-11 rounded-lg px-3 text-sm text-fg-muted">关闭</button>
          </div>
          <div className="flex gap-2 border-b border-line p-3" aria-label="目录范围">
            {(['courses', 'chapter'] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={directory === item}
                onClick={() => setDirectory(item)}
                className={`focus-ring min-h-11 flex-1 rounded-lg text-sm ${directory === item ? 'bg-raised font-semibold text-accent-strong' : 'text-fg-subtle'}`}
              >{item === 'courses' ? '全部课程' : '本章内容'}</button>
            ))}
          </div>
          <div className="lesson-directory-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            {directoryOpen && (directory === 'courses'
              ? <CourseDirectory chapter={chapter} mode={mode} onNavigate={closeDirectory} />
              : <LessonToc items={outline} lessonTitle={title} onNavigate={closeDirectory} />)}
          </div>
        </div>
      </dialog>
    </div>
  );
}

function CourseDirectory({ chapter, mode, onNavigate }: { chapter: string; mode: LessonMode; onNavigate?: () => void }) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const container = listRef.current?.parentElement;
    if (current && container && container.clientHeight > 0) {
      container.scrollTop += current.getBoundingClientRect().top - container.getBoundingClientRect().top - container.clientHeight / 2;
    }
  }, [chapter]);

  return (
    <>
      <p className="mb-3 text-xs font-semibold text-fg-subtle">全部课程</p>
      <ol ref={listRef} className="space-y-1">
        {CHAPTERS.filter((item) => item.status === 'available' && item.lessons.length > 0).map((item) => (
          <li key={item.slug}>
            <Link
              href={lessonHref(item.slug, item.lessons[0].id, mode)}
              prefetch={false}
              onClick={onNavigate}
              aria-current={item.slug === chapter ? 'page' : undefined}
              className={`focus-ring flex min-h-11 items-start gap-2 rounded-lg px-3 py-3 text-sm leading-5 transition ${item.slug === chapter ? 'bg-emerald-500/10 font-medium text-accent-strong' : 'text-fg-muted hover:bg-raised hover:text-fg'}`}
            >
              <span className="shrink-0 font-mono text-xs leading-5 text-fg-subtle">{String(item.number).padStart(2, '0')}</span>
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
