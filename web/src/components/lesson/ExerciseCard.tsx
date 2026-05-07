'use client';

import { useEffect, useState } from 'react';
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
  pyStatus: PyodideStatus;
  run: (code: string, opts?: RunOptions) => Promise<RunResult>;
}

export function ExerciseCard({
  exercise: ex,
  index,
  totalExercises,
  lessonId,
  nextExerciseId,
  pyStatus,
  run,
}: ExerciseCardProps) {
  const markCompleted = useProgress((s) => s.markCompleted);
  const markViewedSolution = useProgress((s) => s.markViewedSolution);
  const lessonProgress = useProgress((s) => s.byLesson[lessonId]);

  const isUnlocked = lessonProgress?.unlocked.includes(ex.id) ?? index === 0;
  const isCompleted = lessonProgress?.completed.includes(ex.id) ?? false;
  const savedCode = lessonProgress?.submittedCode?.[ex.id];
  const savedOutput = lessonProgress?.submittedOutput?.[ex.id];
  const editorReadOnly = !isUnlocked || isCompleted;

  const [code, setCode] = useState(savedCode ?? ex.starterCode);
  const [output, setOutput] = useState<Output>(savedOutput ?? { stdout: '', stderr: '' });
  const [grading, setGrading] = useState<{ pass: boolean; msg: string } | null>(null);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // zustand persist 在 SSR 模式下水合滞后，首次 render 时 saved* 可能为 undefined。
  // 这里在它到位后回填一次，保证刷新后已通过的题能看到当时提交的代码 + 当时的运行输出。
  // 这是合法的"外部存储水合 → 同步本地 state"场景，所以禁用 set-state-in-effect 警告。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedCode && code !== savedCode) setCode(savedCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedOutput) setOutput(savedOutput);
  }, [savedOutput]);

  const expectedVarNames = ex.grading.varsEqual ? Object.keys(ex.grading.varsEqual) : [];
  const detectAst = !!ex.grading.requiredAst?.length;

  async function execute(): Promise<ActualResult> {
    const result = await run(code, { expectedVarNames, detectAst });
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
        'mt-6 overflow-hidden rounded-2xl border bg-slate-900/60 shadow-xl backdrop-blur-sm transition ' +
        (isCompleted
          ? 'border-emerald-500/40 shadow-emerald-500/15'
          : isUnlocked
            ? 'border-slate-800 shadow-emerald-500/5'
            : 'border-slate-800/60 opacity-70 shadow-none')
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

      <div className="bg-slate-900">
        <ExerciseEditor
          code={code}
          onChange={setCode}
          readOnly={editorReadOnly}
          unlocked={isUnlocked}
          completed={isCompleted}
        />

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
    </section>
  );
}
