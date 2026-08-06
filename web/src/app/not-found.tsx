import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '页面不存在 — 小白学 Python',
  description: '你访问的页面不存在或已经移动。回到课程目录继续学习 Python。',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 text-sm leading-7 text-slate-300">
      <p className="mb-2 font-mono text-5xl font-bold text-emerald-400">404</p>
      <h1 className="mb-4 text-2xl font-semibold text-slate-100">这个页面不存在</h1>
      <p className="mb-8">
        你访问的地址可能拼错了，或者这个页面已经被移动。下面几个入口可以直接过去：
      </p>

      <ul className="mb-8 space-y-3">
        <li>
          <Link href="/" className="text-emerald-400 transition hover:text-emerald-300">
            课程目录
          </Link>
          <span className="ml-2 text-slate-400">— 29 章内容，从零开始学 Python</span>
        </li>
        <li>
          <Link
            href="/lessons/python1/intro-and-hello-world"
            className="text-emerald-400 transition hover:text-emerald-300"
          >
            第一课：Python 安装与第一个程序
          </Link>
          <span className="ml-2 text-slate-400">— 不用装环境，浏览器里就能写</span>
        </li>
        <li>
          <Link href="/about" className="text-emerald-400 transition hover:text-emerald-300">
            关于本站
          </Link>
          <span className="ml-2 text-slate-400">— 这是个什么站、内容从哪来</span>
        </li>
      </ul>

      <p className="text-slate-400">
        如果你是从站内链接点过来的，说明我们这边有问题，欢迎到
        {' '}
        <Link href="/contact" className="text-emerald-400 transition hover:text-emerald-300">
          联系方式
        </Link>
        {' '}
        页面反馈。
      </p>
    </div>
  );
}
