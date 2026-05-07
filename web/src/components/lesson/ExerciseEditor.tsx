'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

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
      theme="vs-dark"
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
    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500/80" aria-hidden />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/80" aria-hidden />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/80" aria-hidden />
        <span className="ml-2 font-mono text-xs text-slate-400">main.py</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">
          {!unlocked ? '🔒 未解锁' : completed ? '✓ 已通过（只读）' : '可编辑'}
        </span>
        {unlocked && (
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? '退出全屏' : '全屏编辑'}
            title={fullscreen ? '退出全屏 (Esc)' : '全屏编辑'}
            className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-xs text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300 focus-ring"
          >
            {fullscreen ? '⤓ 退出' : '⛶ 全屏'}
          </button>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
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
