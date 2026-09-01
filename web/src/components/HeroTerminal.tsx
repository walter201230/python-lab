'use client';

import { useEffect, useState } from 'react';

/** 演示用的是课程里真实的第 1 题（python1/intro-and-hello-world/01-hello-python）。 */
const LESSON_TITLE = '第 1 题 · 向 Python 打个招呼';
const STARTER = '# 用 print() 打印一句话';
const CODE = "print('你好，Python！')";
const OUTPUT = '你好，Python！';

/** 推进阶段，数值即顺序：越大显示的内容越多。 */
const TYPING = 0;
const RUN = 1;
const OUTPUT_SHOWN = 2;
const PASS = 3;

type Frame = { stage: number; typed: number; hold: number };

/** 把整轮演示摊平成一串定时帧，省得写嵌套 setTimeout。 */
function buildTimeline(): Frame[] {
  const frames: Frame[] = [];
  for (let i = 0; i <= CODE.length; i += 1) {
    frames.push({ stage: TYPING, typed: i, hold: i === 0 ? 700 : 55 });
  }
  frames.push({ stage: RUN, typed: CODE.length, hold: 450 });
  frames.push({ stage: OUTPUT_SHOWN, typed: CODE.length, hold: 550 });
  frames.push({ stage: PASS, typed: CODE.length, hold: 3400 });
  return frames;
}

const TIMELINE = buildTimeline();
const FINAL_FRAME = TIMELINE[TIMELINE.length - 1];

/**
 * 首页 hero 右侧的演示终端：把「写代码 → 运行 → 判分 → 解锁」这条闭环循环演一遍。
 *
 * 只是动画，不跑真代码（真的运行在课程页里）。初始 state 就是最终完整帧，
 * 所以 SSR 产物、爬虫和禁用 JS 的访客拿到的都是完整内容，hydrate 之后才从头播。
 */
export function HeroTerminal() {
  const [frame, setFrame] = useState<Frame>(FINAL_FRAME);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const current = TIMELINE[index];
      setFrame(current);
      timer = setTimeout(() => {
        index = (index + 1) % TIMELINE.length;
        step();
      }, current.hold);
    };
    step();

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="img"
      aria-label="演示：在本站写一行 Python 代码，运行后判分通过、解锁下一题"
      className="overflow-hidden rounded-xl border border-line-strong/60 bg-surface shadow-[0_8px_40px_rgba(0,0,0,0.28)]"
    >
      {/* 窗口标题栏 */}
      <div className="flex items-center gap-2 border-b border-line/80 bg-raised px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-line-emphasis" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-emphasis" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-emphasis" />
        </span>
        <span className="ml-1 font-mono text-xs text-fg-subtle">{LESSON_TITLE}</span>
      </div>

      {/* 内容区：每一行都常驻占位，只切换可见性，避免播放过程中高度跳动 */}
      <div aria-hidden className="space-y-1.5 px-5 py-5 font-mono text-[13px] leading-6 sm:text-sm">
        <div className="text-fg-faint">{STARTER}</div>
        <div className="text-fg-body">
          {CODE.slice(0, frame.typed)}
          {frame.stage === TYPING && (
            <span className="ml-px inline-block h-4 w-[7px] translate-y-0.5 animate-pulse bg-accent" />
          )}
        </div>
        <div className="h-6" />
        <div className={frame.stage >= RUN ? 'text-fg-subtle' : 'invisible'}>▶ 运行</div>
        <div className={frame.stage >= OUTPUT_SHOWN ? 'text-fg' : 'invisible'}>{OUTPUT}</div>
        <div
          className={
            frame.stage >= PASS ? 'font-medium text-accent-strong' : 'invisible font-medium'
          }
        >
          ✓ 判分通过 · 解锁下一题
        </div>
      </div>
    </div>
  );
}
