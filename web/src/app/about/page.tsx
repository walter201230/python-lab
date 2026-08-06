import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于本站 — 小白学 Python',
  description: '小白学 Python（learn-py.org）是什么、内容从哪来、代码怎么在浏览器里运行、进度存在哪里。',
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm leading-7 text-slate-300">
      <h1 className="mb-6 text-2xl font-semibold text-slate-100">关于本站</h1>
      <p className="mb-4">
        小白学 Python（learn-py.org）是一个面向零基础的 Python 在线学习站。全部 29 章教学内容配 100 道练习题，代码直接在你的浏览器里运行、当场判分，做对一题解锁下一题。完全免费，不需要注册账号。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-100">内容从哪来</h2>
      <p className="mb-4">
        本站的教学内容整理自开源中文 Python 教程
        {' '}
        <a
          href="https://github.com/walter201230/Python"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 transition hover:text-emerald-300"
        >
          walter201230/Python
        </a>
        （GitHub 上 25k+ Star，采用 CC BY 4.0 许可）。原教程是纯阅读形态的文档，本站在此基础上把每一章拆成分步讲解，并为其配上可运行、可判分的练习题。
      </p>
      <p className="mb-4">
        如果你更习惯整本通读或用作速查，原教程的文档版在
        {' '}
        <a
          href="https://walter201230.github.io/Python/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 transition hover:text-emerald-300"
        >
          walter201230.github.io/Python
        </a>
        。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-100">代码是怎么跑起来的</h2>
      <p className="mb-4">
        本站没有后端服务器执行你的代码。练习题里的 Python 由
        {' '}
        <a
          href="https://pyodide.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 transition hover:text-emerald-300"
        >
          Pyodide
        </a>
        {' '}
        在你自己的浏览器里运行——它是编译到 WebAssembly 的 CPython。这意味着你写的代码不会离开你的设备，也不需要在本地安装任何 Python 环境。
      </p>
      <p className="mb-4">
        第一次进入练习页面时需要下载运行环境，会稍慢一些；之后在同一次访问中切换章节都会复用同一个实例，不用重复加载。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-100">学习进度存在哪里</h2>
      <p className="mb-4">
        本站是纯静态网站，没有账号系统，也没有服务器数据库。你的做题进度和代码草稿保存在浏览器的 localStorage 里，只存在于当前这台设备的当前这个浏览器中。因此换设备、换浏览器或清除浏览器数据后，进度不会同步也无法找回。详见
        {' '}
        <Link href="/privacy" className="text-emerald-400 transition hover:text-emerald-300">
          隐私政策
        </Link>
        。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-100">怎么开始</h2>
      <p className="mb-4">
        直接从
        {' '}
        <Link href="/" className="text-emerald-400 transition hover:text-emerald-300">
          课程目录
        </Link>
        {' '}
        第一章开始即可。29 章分三段：基础语法（00–09）、进阶特性（10–22）、工程化与发布（23–28），建议按顺序学。
      </p>
      <p className="mb-4">
        发现内容错误或有建议，欢迎通过
        {' '}
        <Link href="/contact" className="text-emerald-400 transition hover:text-emerald-300">
          联系方式
        </Link>
        {' '}
        页面告诉我们。
      </p>
    </div>
  );
}
