/**
 * lesson 切换时的骨架屏。读 lesson.json + 文件 IO 一般 100-300ms，
 * 这段时间内显示与最终布局结构一致的灰色骨架，避免白屏闪烁。
 */
export default function LessonLoading() {
  return (
    <div className="bg-tech-grid relative min-h-[calc(100vh-57px)] animate-pulse bg-slate-950">
      {/* sticky bar 占位 */}
      <div className="sticky top-[57px] z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 rounded bg-slate-800" />
            <div className="h-5 w-12 rounded-md bg-slate-800" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-9 rounded-lg bg-slate-800" />
            ))}
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-2 h-9 w-3/4 rounded bg-slate-800 sm:h-10" />
        <div className="mt-2 h-4 w-1/2 rounded bg-slate-800/70" />

        {/* 两个 step 卡片占位 */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8"
          >
            <div className="mb-4 h-6 w-32 rounded-md bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-slate-800/70" />
              <div className="h-4 w-11/12 rounded bg-slate-800/70" />
              <div className="h-4 w-4/5 rounded bg-slate-800/70" />
            </div>
            <div className="mt-4 h-32 rounded-lg bg-slate-950/60" />
          </div>
        ))}
      </article>
    </div>
  );
}
