# python-lab — 浏览器里学 Python

**在线访问：[https://learn-py.org](https://learn-py.org)**

一个零基础友好的 Python 在线学习站。代码在浏览器里直接跑（Pyodide），自动判分，做对一题解锁下一题。无需安装环境、无需注册、不上传代码。

## 它是什么

基于 [walter201230/Python](https://github.com/walter201230/Python) 教程内容，做成了交互式的"升级打怪"形态：

- **边读边练**：每讲完一个知识点马上跟一道练习
- **代码即跑**：编辑器里写完代码 → Pyodide 在浏览器执行 → 立刻看到输出
- **自动判分**：对比 stdout、变量值、AST 结构，多种判分策略组合
- **渐进解锁**：做对当前题才解锁下一段讲解和下一道题，避免囫囵吞枣
- **进度本地存**：Zustand + localStorage，刷新页面不丢；但跨设备需要重做（静态站，无后端）

29 章 / 100 道题，覆盖从 Hello World 到装饰器、async、pytest、pyproject/uv 的现代 Python 工程实践。

## 与教程主仓的关系

| 仓库 | 形态 | 适合 |
|------|------|------|
| [walter201230/Python](https://github.com/walter201230/Python) | 教程内容主仓（Markdown + GitHub Pages 文档版） | 系统通读、速查、手机阅读 |
| **walter201230/python-lab**（本仓） | 交互式学习站源码 | 零基础动手学、刷题、解锁式学习 |

教程文字内容沿用主仓，本仓负责把它们重组为 step + exercise 的渐进解锁形态。

## 技术栈

- **Next.js 16** + **React 19** + Tailwind v4 + `@tailwindcss/typography`
- **Pyodide v0.27**（Web Worker 单例，io.StringIO 重定向 stdout 精准捕获 \n 和中文）
- **Monaco Editor**（`@monaco-editor/react`）
- **Zustand + persist localStorage**（唯一进度存储）
- `output: 'export'` 静态导出，**Cloudflare Pages** 托管 + 自定义域名

## 本地开发

```bash
cd web
pnpm install
pnpm dev                            # http://localhost:3000
pnpm build                          # 静态导出到 web/out/
pnpm tsc --noEmit && pnpm lint      # 类型 + lint
npm run validate-content            # 校验 content/lessons/ 数据
```

## 反馈与贡献

教学内容、判分逻辑、UI 体验任何问题，欢迎到 [walter201230/Python issues](https://github.com/walter201230/Python/issues) 反馈（站内每道题右下角有"反馈此题"入口会自动带上 lesson-id）。

代码贡献请在本仓提 PR。
