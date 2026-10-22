'use client';

import { useEffect, useState } from 'react';
import type { LessonOutlineItem } from '@/lib/lessonNavigation';

interface LessonTocProps {
  items: LessonOutlineItem[];
  lessonTitle: string;
  onNavigate?: () => void;
}

/**
 * 侧栏与目录弹层共用，链接可用性来自与正文相同的可见范围。
 */
export function LessonToc({ items, lessonTitle, onNavigate }: LessonTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.filter((item) => item.available).map((item) => item.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        const first = [...visible].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
        if (first) setActiveId(first.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="本章目录"
    >
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
        本章目录
      </div>
      <p className="mb-4 truncate text-sm font-medium text-fg-body">{lessonTitle}</p>
      <ol className="space-y-1 border-l border-line">
        {items.map((item) => (
            <TocItem
              key={item.id}
              href={item.available ? `#${item.id}` : undefined}
              active={activeId === item.id}
              kind={item.kind}
              index={item.index}
              label={item.title}
              unlocked={item.available}
              completed={item.completed}
              onNavigate={onNavigate}
            />
        ))}
      </ol>
    </nav>
  );
}

interface TocItemProps {
  href?: string;
  active: boolean;
  kind: 'step' | 'exercise';
  index: number;
  label: string;
  unlocked?: boolean;
  completed?: boolean;
  onNavigate?: () => void;
}

function TocItem({ href, active, kind, index, label, unlocked = true, completed, onNavigate }: TocItemProps) {
  const baseColor = !unlocked
    ? 'text-fg-disabled'
    : completed
      ? 'text-accent'
      : active
        ? 'text-fg'
        : 'text-fg-muted hover:text-fg';

  const content = (
    <>
      <span
        aria-hidden
        className={
          'absolute -left-px top-0 h-full w-0.5 transition ' +
          (active ? 'bg-accent-solid' : 'bg-transparent')
        }
      />
      <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">
        {kind === 'step' ? `教学 ${String(index).padStart(2, '0')}` : `练习 ${index}`}
        {completed && ' ✓'}
        {!unlocked && ' 🔒'}
      </span>
      <span className="line-clamp-2 leading-snug">{label}</span>
    </>
  );

  return (
    <li className="relative">
      {href ? (
        <a
          href={href}
          onClick={onNavigate}
          aria-current={active ? 'location' : undefined}
          className={
            'flex min-h-11 flex-col gap-0.5 px-3 py-2 text-xs transition focus-ring rounded ' +
            baseColor
          }
        >
          {content}
        </a>
      ) : (
        <span
          aria-disabled="true"
          className={
            'flex cursor-not-allowed flex-col gap-0.5 px-3 py-1.5 text-xs ' + baseColor
          }
          title="完成上一题后解锁"
        >
          {content}
        </span>
      )}
    </li>
  );
}
