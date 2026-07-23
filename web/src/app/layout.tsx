import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { Toast } from '@/components/Toast';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '小白学 Python — 浏览器里就能跑',
  description: '零基础友好的 Python 在线学习站。代码在浏览器里跑（Pyodide），自动判分，做对一题解锁下一题。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body
        className="flex min-h-full flex-col bg-slate-950 text-slate-100"
        suppressHydrationWarning
      >
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold" aria-label="小白学 Python — 首页">
              <span
                className="gradient-text-flow text-lg tracking-tight"
                data-text="小白学 Python"
                aria-hidden="true"
              >
                小白学 Python
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm sm:gap-5">
              <Link href="/" className="text-slate-300 transition hover:text-slate-100">课程</Link>
              <a
                href="https://github.com/walter201230/Python"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-slate-300 transition hover:text-slate-100 sm:block"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-slate-800/60 bg-slate-950">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row">
            <span>© {new Date().getFullYear()} 小白学 Python · 基于 <a href="https://github.com/walter201230/Python" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-200">walter201230/Python</a> 教程</span>
            <div className="flex items-center gap-4">
              <Link href="/" className="transition hover:text-slate-200">课程目录</Link>
              <Link href="/privacy" className="transition hover:text-slate-200">隐私政策</Link>
              <a href="https://github.com/walter201230/Python" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-200">GitHub</a>
            </div>
          </div>
        </footer>
        <Toast />
        {/* Google AdSense 站点验证 + 广告库（仅手动广告单元，后台不开自动广告）。
            用原生 async script（React 19 会提升到 <head>）而非 next/script：
            AdSense 爬虫需要在静态 HTML 源码里看到字面标签。 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6749653052850583"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
