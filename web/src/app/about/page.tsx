import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactLinks } from '@/components/ContactLinks';
import { socialMetadata } from '@/lib/siteMetadata';

const title = '关于本站 — 小白学 Python';
const description =
  '小白学 Python（learn-py.org）的内容整理自开源中文 Python 教程 walter201230/Python（GitHub 25k+ Star），把每一章拆成分步讲解并配上可运行、可判分的练习题。';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about/' },
  ...socialMetadata({ title, description, path: '/about/' }),
};

export default function AboutPage() {
  return (
    <div className="relative">
      {/* 这里不能加 overflow-hidden，否则会裁掉联系方式的二维码浮层 */}
      {/* 网格背景 + 顶部光晕，与首页 hero 同一套视觉 */}
      <div className="bg-tech-grid absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.14),transparent_60%)]" />

      <div className="mx-auto w-full max-w-3xl px-4 py-20 md:py-28">
        <h1 className="gradient-tech-green-text mb-10 text-3xl font-bold sm:text-4xl">关于本站</h1>

        <div className="space-y-6 text-base leading-8 text-fg-muted sm:text-lg sm:leading-9">
          <p>
            小白学 Python（learn-py.org）是一个面向零基础的 Python 在线学习站。29 章教学内容配 100 道练习题，代码直接在你的浏览器里运行、当场判分，做对一题解锁下一题。完全免费，不需要注册账号。
          </p>

          <p className="rounded-xl border border-emerald-400/20 bg-accent-solid/[0.04] px-5 py-4 text-fg-body">
            本站的内容整理自我自己写的开源中文 Python 教程
            {' '}
            <a
              href="https://github.com/walter201230/Python"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-emerald-500/40 underline-offset-4 transition hover:text-accent-strong focus-ring"
            >
              walter201230/Python
            </a>
            。如今在 GitHub 上有
            {' '}
            <span className="font-semibold text-accent-strong">25k+ Star</span>
            。
          </p>

          <p>
            直接从
            {' '}
            <Link href="/" className="text-accent transition hover:text-accent-strong focus-ring">
              课程目录
            </Link>
            {' '}
            第一章开始即可，建议按顺序学。本站是纯静态网站，没有账号系统，学习进度只存在你自己的浏览器里，详见
            {' '}
            <Link href="/privacy" className="text-accent transition hover:text-accent-strong focus-ring">
              隐私政策
            </Link>
            。
          </p>
        </div>

        {/* 联系方式 */}
        <div className="mt-20 border-t border-line/60 pt-14">
          <h2 className="gradient-tech-green-text mb-12 text-center text-2xl font-semibold sm:text-3xl">
            在这里找到我
          </h2>
          <ContactLinks />
        </div>
      </div>
    </div>
  );
}
