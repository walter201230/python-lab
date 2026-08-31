import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { Toast } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { THEME_INIT_SCRIPT } from '@/lib/useTheme';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  // 站点绝对基址：canonical、OG 等 URL 型字段据此从相对路径解析成绝对地址。
  // 域名须与 scripts/generate-sitemap.mjs 的 SITE_URL 保持一致。
  metadataBase: new URL('https://learn-py.org'),
  title: '小白学 Python — 浏览器里就能跑',
  description: '零基础友好的 Python 在线学习站。代码在浏览器里跑（Pyodide），自动判分，做对一题解锁下一题。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* 反闪色：必须同步执行在样式表生效之前，不能放进 React 组件。
            这里只手写 <script>，<title>/<meta> 一律交给 Metadata API。 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="flex min-h-full flex-col bg-canvas text-fg"
        suppressHydrationWarning
      >
        <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
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
              <a
                href="https://coding.stormzhang.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted transition hover:text-fg"
              >
                AI 编程指南
              </a>
              <a
                href="https://github.com/walter201230/Python"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-fg-muted transition hover:text-fg sm:block"
              >
                GitHub
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-line/60 bg-canvas">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-fg-subtle sm:flex-row">
            <span>© {new Date().getFullYear()} 小白学 Python · 基于 <a href="https://github.com/walter201230/Python" target="_blank" rel="noopener noreferrer" className="transition hover:text-fg-body">walter201230/Python</a> 教程</span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <Link href="/" className="transition hover:text-fg-body">课程目录</Link>
              <Link href="/about" className="transition hover:text-fg-body">关于本站</Link>
              <Link href="/contact" className="transition hover:text-fg-body">联系方式</Link>
              <Link href="/privacy" className="transition hover:text-fg-body">隐私政策</Link>
              <a href="https://github.com/walter201230/Python" target="_blank" rel="noopener noreferrer" className="transition hover:text-fg-body">GitHub</a>
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
        {/* Google Analytics 4（衡量 ID G-WGW7JQK5CJ）：只做基础 pageview，
            滚动深度、外链点击等由 GA4 后台的「增强型衡量」自动采集，不在代码里埋事件。

            不需要自己写路由监听：App Router 的客户端导航（含浏览器后退）由 GA4「增强型衡量」
            的 history 监听自动上报，已实测确认首页→课程页→后退三步各上报一次、无重复计数。
            对应地，GA4 后台的「增强型衡量 → 基于浏览器历史记录事件的网页浏览」必须保持开启，
            关掉它站内跳转就会全部漏报（GA 里会显示所有人只访问了首页）。

            不用 @next/third-parties 的 GoogleAnalytics 组件：核对过其源码（dist/google/ga.js），
            只是 gtag 的薄封装、同样不监听路由，没有额外收益，不值得多一个依赖。 */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WGW7JQK5CJ" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-WGW7JQK5CJ');`,
          }}
        />
      </body>
    </html>
  );
}
