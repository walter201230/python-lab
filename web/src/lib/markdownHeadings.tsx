import type { Components } from 'react-markdown';

/**
 * 教学正文的标题降级映射：整体下移一级。
 *
 * step 的 MDX 用 `#` 写章节内标题（实测 166 处 h1 / 394 处 h2 / 81 处 h3），
 * react-markdown 直接渲染成 <h1>，与页面自身的课程标题并列——2026-09-03
 * 线上实测 29 个阅读页共 195 个 h1、平均 6.7 个/页，没有一页只有一个 h1，
 * 有几页 h1 比 h2 还多，层级完全倒置。
 *
 * 在渲染层下移一级即可让页面 h1 保持唯一、正文从 h2 起递进，158 个 MDX
 * 内容文件一个字不用改。h6 是 HTML 的底，再深不动（实测正文最深只到 h3）。
 */
export const headingComponents: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <h4>{children}</h4>,
  h4: ({ children }) => <h5>{children}</h5>,
  h5: ({ children }) => <h6>{children}</h6>,
};
