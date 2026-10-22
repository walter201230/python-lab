'use client';

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@/store/progress';
import { grade, type ActualResult } from '@/lib/grader';
import { STICKY_BAR_SCROLL_OFFSET } from '@/lib/layoutConstants';
import type { Exercise } from '@/types/content';
import type { PyodideStatus, RunOptions, RunResult } from '@/lib/usePyodide';
import { ExerciseEditor } from './ExerciseEditor';
import { ExerciseHeader } from './ExerciseHeader';
import { ExerciseActions } from './ExerciseActions';
import { GradingResult } from './GradingResult';
import { SolutionPanel } from './SolutionPanel';
import { CodeOutput } from './CodeOutput';

type Output = { stdout: string; stderr: string; error?: string };

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  totalExercises: number;
  lessonId: string;
  nextExerciseId: string | null;
  continuation: { href: string; label: string };
  pyStatus: PyodideStatus;
  run: (code: string, opts?: RunOptions) => Promise<RunResult>;
}

export function ExerciseCard({
  exercise: ex,
  index,
  totalExercises,
  lessonId,
  nextExerciseId,
  continuation,
  pyStatus,
  run,
}: ExerciseCardProps) {
  const markCompleted = useProgress((s) => s.markCompleted);
  const markViewedSolution = useProgress((s) => s.markViewedSolution);
  const saveDraft = useProgress((s) => s.saveDraft);
  const lessonProgress = useProgress((s) => s.byLesson[lessonId]);

  const isUnlocked = lessonProgress?.unlocked.includes(ex.id) ?? index === 0;
  const isCompleted = lessonProgress?.completed.includes(ex.id) ?? false;
  const savedCode = isCompleted ? lessonProgress?.submittedCode?.[ex.id] : lessonProgress?.draftCode?.[ex.id];
  const savedOutput = lessonProgress?.submittedOutput?.[ex.id];
  const editorReadOnly = !isUnlocked || isCompleted;

  const [code, setCode] = useState(savedCode ?? ex.starterCode);
  const [output, setOutput] = useState<Output>(savedOutput ?? { stdout: '', stderr: '' });
  const [grading, setGrading] = useState<{ pass: boolean; msg: string } | null>(null);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'saved' | 'error' | null>(null);
  const edited = useRef(false);

  // zustand persist 在 SSR 模式下水合滞后，首次 render 时 saved* 可能为 undefined。
  // 存储到位后恢复草稿／提交；不能覆盖用户已开始输入的内容，空草稿同样有效。
  // 这是合法的"外部存储水合 → 同步本地 state"场景，所以禁用 set-state-in-effect 警告。
  useEffect(() => {
    if (savedCode !== undefined && (!edited.current || isCompleted) && code !== savedCode) setCode(savedCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCode, isCompleted]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedOutput) setOutput(savedOutput);
  }, [savedOutput]);

  const expectedVarNames = ex.grading.varsEqual ? Object.keys(ex.grading.varsEqual) : [];
  const detectAst = !!ex.grading.requiredAst?.length;

  async function execute(): Promise<ActualResult> {
    // isolated：练习判分跑在全新命名空间，避免被别题/教学块残留的全局名污染（#296/#301）
    const result = await run(code, { expectedVarNames, detectAst, isolated: true });
    setOutput({ stdout: result.stdout, stderr: result.stderr, error: result.error });
    return result;
  }

  function completeIfPassed(result: Output, outcome: { pass: boolean }) {
    if (!outcome.pass) return;
    markCompleted(lessonId, ex.id, code, result, nextExerciseId);
  }

  // 「运行」：执行 + 隐式判分。通过时正向反馈并解锁；不通过保持沉默，让用户继续调试
  const handleRun = async () => {
    if (editorReadOnly) return;
    setRunning(true);
    setGrading(null);
    const result = await execute();
    const outcome = grade(result, ex.grading);
    if (outcome.pass) {
      setGrading(outcome);
      completeIfPassed(result, outcome);
    }
    setRunning(false);
  };

  // 「检查答案」：通过/不通过都显示判分结果
  const handleCheck = async () => {
    if (editorReadOnly) return;
    setRunning(true);
    const result = await execute();
    const outcome = grade(result, ex.grading);
    setGrading(outcome);
    completeIfPassed(result, outcome);
    setRunning(false);
  };

  const handleViewSolution = () => {
    if (showSolution) return;
    if (!confirm('查看答案后这道题不影响解锁下一题，但会标记「已查看答案」。继续吗？')) return;
    setShowSolution(true);
    markViewedSolution(lessonId, ex.id, nextExerciseId);
  };

  return (
    <section
      id={`exercise-${ex.id}`}
      data-exercise-card
      data-exercise-actionable={!editorReadOnly && !running}
      style={{ scrollMarginTop: STICKY_BAR_SCROLL_OFFSET }}
      className={
        'mt-6 overflow-hidden rounded-2xl border bg-surface/60 shadow-xl backdrop-blur-sm transition ' +
        (isCompleted
          ? 'border-emerald-500/40 shadow-emerald-500/15'
          : isUnlocked
            ? 'border-line shadow-emerald-500/5'
            : 'border-line/60 opacity-70 shadow-none')
      }
      aria-label={`练习 ${index + 1}: ${ex.title}`}
    >
      <ExerciseHeader
        exercise={ex}
        index={index}
        totalExercises={totalExercises}
        lessonId={lessonId}
        isUnlocked={isUnlocked}
        isCompleted={isCompleted}
      />

      <div className="bg-surface">
        <ExerciseEditor
          code={code}
          onChange={(next) => {
            if (editorReadOnly) return;
            edited.current = true;
            setCode(next);
            setDraftStatus(saveDraft(lessonId, ex.id, next) ? 'saved' : 'error');
          }}
          readOnly={editorReadOnly}
          unlocked={isUnlocked}
          completed={isCompleted}
        />

        {!isCompleted && draftStatus && <p role={draftStatus === 'error' ? 'alert' : undefined} className="px-4 py-2 text-xs text-fg-subtle">
          {draftStatus === 'saved' ? '草稿已保存在此浏览器' : '草稿无法保存到浏览器，请在离开前复制代码。'}
        </p>}

        <CodeOutput stdout={output.stdout} stderr={output.stderr} error={output.error} />

        <ExerciseActions
          isUnlocked={isUnlocked}
          isCompleted={isCompleted}
          showSolution={showSolution}
          running={running}
          pyReady={pyStatus === 'ready'}
          editorReadOnly={editorReadOnly}
          onRun={handleRun}
          onCheck={handleCheck}
          onViewSolution={handleViewSolution}
        />
      </div>

      {grading && <GradingResult pass={grading.pass} msg={grading.msg} />}

      {showSolution && <SolutionPanel solution={ex.solution} />}
      {(isCompleted || lessonProgress?.viewedSolution.includes(ex.id)) && (
        <div className="flex justify-end border-t border-line px-4 py-3">
          <a href={continuation.href} className="focus-ring inline-flex min-h-11 items-center rounded-lg bg-emerald-500/15 px-4 text-sm font-semibold text-accent-strong">
            {continuation.label} →
          </a>
        </div>
      )}
    </section>
  );
}
