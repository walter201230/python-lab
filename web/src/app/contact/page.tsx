import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '联系方式 — 小白学 Python',
  description: '反馈内容错误、题目问题或功能建议的渠道：通过 GitHub Issues 联系小白学 Python（learn-py.org）。',
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm leading-7 text-slate-300">
      <h1 className="mb-6 text-2xl font-semibold text-slate-100">联系方式</h1>
      <p className="mb-4">
        本站的反馈统一收在 GitHub 上，公开可见，也方便其他遇到同样问题的人查阅。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-100">提交反馈</h2>
      <p className="mb-4">
        请到
        {' '}
        <a
          href="https://github.com/walter201230/Python/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 transition hover:text-emerald-300"
        >
          GitHub Issues
        </a>
        {' '}
        新建 issue。以下几类问题都欢迎：
      </p>
      <ul className="mb-4 ml-5 list-disc space-y-1">
        <li>教学内容有错误、示例输出对不上、讲解看不懂</li>
        <li>练习题判分不正确，或者你认为正确的答案没通过</li>
        <li>页面显示异常、代码编辑器或运行环境出问题</li>
        <li>希望增加的章节或功能</li>
      </ul>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-100">这样反馈更快被定位</h2>
      <p className="mb-4">
        如果问题出在某一道具体的题目上，请附上该题所在的章节名和页面网址；页面底部的报错信息或浏览器控制台的截图也很有帮助。判分类问题请把你写的完整代码贴上来——很多问题（比如中文输入法把英文引号自动变成了全角引号）只有看到原始代码才能确认。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-100">关于教程内容本身</h2>
      <p className="mb-4">
        本站教学内容整理自开源教程
        {' '}
        <a
          href="https://github.com/walter201230/Python"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 transition hover:text-emerald-300"
        >
          walter201230/Python
        </a>
        ，内容层面的勘误会同时修正到原教程。站点的更多背景说明见
        {' '}
        <Link href="/about" className="text-emerald-400 transition hover:text-emerald-300">
          关于本站
        </Link>
        ，数据与隐私相关说明见
        {' '}
        <Link href="/privacy" className="text-emerald-400 transition hover:text-emerald-300">
          隐私政策
        </Link>
        。
      </p>
    </div>
  );
}
