import type { Metadata } from 'next';
import { ContactLinks } from '@/components/ContactLinks';

export const metadata: Metadata = {
  title: '联系方式 — 小白学 Python',
  description: '反馈内容错误、题目问题或功能建议的渠道：通过 GitHub Issues 联系小白学 Python（learn-py.org）。',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm leading-7 text-fg-muted">
      <h1 className="mb-6 text-2xl font-semibold text-fg">联系方式</h1>
      <p className="mb-4">
        本站的反馈统一收在 GitHub 上，公开可见，也方便其他遇到同样问题的人查阅。
      </p>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-fg">提交反馈</h2>
      <p className="mb-4">
        请到
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
        新建 issue。以下几类问题都欢迎：
      </p>
      <ul className="mb-4 ml-5 list-disc space-y-1">
        <li>教学内容有错误、示例输出对不上、讲解看不懂</li>
        <li>练习题判分不正确，或者你认为正确的答案没通过</li>
        <li>页面显示异常、代码编辑器或运行环境出问题</li>
        <li>希望增加的章节或功能</li>
      </ul>

      {/* 联系方式 */}
      <div className="mt-16 border-t border-line/60 pt-14">
        <h2 className="gradient-tech-green-text mb-12 text-center text-2xl font-semibold sm:text-3xl">
          在这里找到我
        </h2>
        <ContactLinks />
      </div>
    </div>
  );
}
