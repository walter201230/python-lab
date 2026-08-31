'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/lib/useTheme';

// issue #303 同因：@monaco-editor/react 默认从 cdn.jsdelivr.net 加载 monaco 本体，
// CDN 不可达的网络环境下编辑器渲染不出来。改从同源 /monaco/vs 加载
//（scripts/copy-monaco.mjs 随 predev/prebuild 从 node_modules 复制）。
const MonacoEditor = dynamic(
  () =>
    import('@monaco-editor/react').then((m) => {
      m.loader.config({ paths: { vs: '/monaco/vs' } });
      return m.default;
    }),
  { ssr: false },
);

interface ExerciseEditorProps {
  code: string;
  onChange: (next: string) => void;
  readOnly: boolean;
  unlocked: boolean;
  completed: boolean;
}

/**
 * 练习题代码编辑器（Monaco 包装）。
 *
 * - 小屏默认 240px（h-60），桌面 340px——避免在 iPhone 上吃掉一半视口
 * - "⛶ 全屏" 按钮：进入覆盖整个 viewport 的全屏编辑模式（Esc 退出）
 * - 编辑器顶部 macOS 风格三色圆点 + main.py 文件名 + 状态标签
 */
export function ExerciseEditor({
  code,
  onChange,
  readOnly,
  unlocked,
  completed,
}: ExerciseEditorProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const { theme } = useTheme();

  // Esc 退出全屏 + body 锁滚动
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  const editor = (
    <MonacoEditor
      height="100%"
      defaultLanguage="python"
      value={code}
      onChange={(v) => onChange(v ?? '')}
      theme={theme === "light" ? "vs" : "vs-dark"}
      options={{
        fontSize: 14,
        minimap: { enabled: fullscreen },
        scrollBeyondLastLine: false,
        padding: { top: 12, bottom: 12 },
        lineNumbersMinChars: 3,
        readOnly,
      }}
    />
  );

  const toolbar = (
    <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500/80" aria-hidden />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/80" aria-hidden />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/80" aria-hidden />
        <span className="ml-2 font-mono text-xs text-fg-subtle">main.py</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-fg-subtle">
          {!unlocked ? '🔒 未解锁' : completed ? '✓ 已通过（只读）' : '可编辑'}
        </span>
        {unlocked && (
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? '退出全屏' : '全屏编辑'}
            title={fullscreen ? '退出全屏 (Esc)' : '全屏编辑'}
            className="rounded-md border border-line-strong bg-raised/60 px-2 py-1 text-xs text-fg-muted transition hover:border-emerald-500/40 hover:text-accent-strong focus-ring"
          >
            {fullscreen ? '⤓ 退出' : '⛶ 全屏'}
          </button>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
        {toolbar}
        <div className="flex-1">{editor}</div>
      </div>
    );
  }

  return (
    <>
      {toolbar}
      <div className="h-60 sm:h-[340px]">{editor}</div>
    </>
  );
}
