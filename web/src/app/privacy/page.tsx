import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 — 小白学 Python',
  description: '小白学 Python（learn-py.org）的隐私政策：本地存储、Cookie、Google Analytics 统计与 Google AdSense 广告说明。',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm leading-7 text-fg-muted">
      <h1 className="mb-6 text-2xl font-semibold text-fg">隐私政策</h1>
      <p className="mb-4">
        本站（learn-py.org，下称「小白学 Python」）是一个纯静态的 Python 在线学习网站。我们尽可能少地收集信息，本页说明本站会在你的设备上存储什么、以及第三方服务如何使用数据。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-fg">我们自己收集什么</h2>
      <p className="mb-4">
        本站没有账号系统，也没有自建服务器数据库。你的学习进度、代码草稿等数据仅通过浏览器的 localStorage 保存在你自己的设备上，不会上传到我们的服务器。清除浏览器数据会同时清除这些进度。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-fg">第三方服务</h2>
      <p className="mb-4">
        本站使用 Google AdSense 展示广告。Google 及其合作伙伴可能会使用 Cookie 或类似技术，根据你对本站及其他网站的访问记录展示个性化广告。你可以在
        {' '}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent transition hover:text-accent-strong"
        >
          Google 广告设置
        </a>
        {' '}
        中管理个性化广告偏好，详见
        {' '}
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent transition hover:text-accent-strong"
        >
          Google 广告技术政策
        </a>
        。
      </p>
      <p className="mb-4">
        本站使用 Google Analytics（GA4）统计访问情况，用于了解哪些课程更受欢迎、据此改进内容。它会通过 Cookie 或类似技术收集你访问的页面路径、来源渠道、设备与浏览器类型、大致地域等信息，不收集姓名、邮箱等能直接识别你身份的信息，也不会读取你保存在本地的学习进度与代码。如果你不希望被统计，可以安装
        {' '}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent transition hover:text-accent-strong"
        >
          Google Analytics 停用插件
        </a>
        {' '}
        ，它对本站及其他使用 Google Analytics 的网站同时生效。
      </p>
      <p className="mb-4">
        本站的 Python 运行环境（Pyodide）与部分静态资源通过公共 CDN 加载，CDN 服务商可能会记录常规访问日志（如 IP 地址、User-Agent）用于服务运维。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-fg">联系方式</h2>
      <p className="mb-4">
        如对本政策有疑问，可通过
        {' '}
        <a
          href="https://github.com/walter201230/Python/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent transition hover:text-accent-strong"
        >
          GitHub Issues
        </a>
        {' '}
        联系我们。本政策如有更新，将直接发布在本页面。
      </p>
    </div>
  );
}
