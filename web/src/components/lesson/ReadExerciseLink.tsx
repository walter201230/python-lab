import Link from 'next/link';

interface ReadExerciseLinkProps {
  title: string;
  index: number;
  totalExercises: number;
  /** 闯关页对应练习的锚点地址 */
  href: string;
}

/**
 * 阅读页里练习位置的占位卡片。
 *
 * 阅读页只承载教学正文，练习本体（编辑器、提示、判分、答案）一律留在闯关页，
 * 这里只给标题和一个跳转入口——既保持阅读页的纯只读语义，也避免两个页面
 * 同时写 localStorage 造成进度状态歧义。
 */
export function ReadExerciseLink({
  title,
  index,
  totalExercises,
  href,
}: ReadExerciseLinkProps) {
  return (
    <Link
      href={href}
      className="focus-ring mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-4 transition hover:border-emerald-500/40 hover:bg-slate-900/70"
    >
      <span className="rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 font-mono text-xs font-medium text-emerald-400">
        练习 {index + 1} / {totalExercises}
      </span>
      <span className="font-medium text-slate-200">{title}</span>
      <span className="ml-auto text-sm text-emerald-300">去闯关页做这题 →</span>
    </Link>
  );
}
