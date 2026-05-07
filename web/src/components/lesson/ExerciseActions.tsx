'use client';

import { Button } from '@/components/ui/Button';

interface ExerciseActionsProps {
  isUnlocked: boolean;
  isCompleted: boolean;
  showSolution: boolean;
  running: boolean;
  pyReady: boolean;
  editorReadOnly: boolean;
  onRun: () => void;
  onCheck: () => void;
  onViewSolution: () => void;
}

/**
 * 编辑器底部三按钮：查看答案 (ghost) / 运行 (secondary) / 检查答案 (primary)。
 */
export function ExerciseActions({
  isUnlocked,
  isCompleted,
  showSolution,
  running,
  pyReady,
  editorReadOnly,
  onRun,
  onCheck,
  onViewSolution,
}: ExerciseActionsProps) {
  const submitDisabled = !pyReady || running || editorReadOnly;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-4 py-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewSolution}
        disabled={showSolution || !isUnlocked || isCompleted}
      >
        查看答案
      </Button>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="md"
          data-action="run"
          onClick={onRun}
          disabled={submitDisabled}
          loading={running}
          loadingText="运行中…"
          title="运行 (⌘/Ctrl + Enter)"
        >
          ▶ 运行
        </Button>
        <Button
          variant="primary"
          size="md"
          data-action="check"
          onClick={onCheck}
          disabled={submitDisabled}
          title="检查答案 (⌘/Ctrl + Shift + Enter)"
          className="px-5"
        >
          {isCompleted ? '已通过 ✓' : '检查答案'}
        </Button>
      </div>
    </div>
  );
}
