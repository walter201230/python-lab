## Context

walter201230/Python 现状：mkdocs Material 静态文档站，已部署在 GitHub Pages（master 分支），25k star、28 章纯讲解型内容。无任何交互能力——读者无法在站内执行 Python、无法验证答案、没有进度跟踪。

参考目标产品：pypypy（风变编程）lecture 页面——左侧分步教学（每步一屏，类卡通对话风），右侧代码编辑器+终端，做对解锁下一步。

技术约束：
- 个人项目预算 ≈ 0，不接受月付服务器
- 现有 GitHub Pages + mkdocs 教程站不能动
- 用户主要是中文初学者（节假日/手机访问占比可能高）

## Goals / Non-Goals

**Goals:**
- MVP 用 1 章（python1 第一个 Python 程序）+ 5 道渐进题，**跑通整套交互链路**：教学渲染 → Pyodide 加载 → 编辑器 → 运行 → 判分 → 提示 → 解锁下一题
- 技术栈选定后**不可逆**——做完 MVP 不会换栈重写
- 部署方案 zero-cost（Vercel 免费额度对个人项目足够）
- 跟现有 mkdocs 教程站**完全解耦**（master 分支 mkdocs 部署不受任何影响）
- 内容/数据格式可扩展——MVP 跑通后铺其他 27 章不需要重构

**Non-Goals（V2+ 才做）:**
- 用户账号系统、登录、跨设备进度同步
- 付费墙、订阅、积分商店
- 卡通形象 + 对话动画 + 音效（pypypy 那种"沉浸感包装"）
- 错题本算法、推荐学习路径、排行榜
- 编辑器多文件 / 项目级支持
- 服务端代码沙箱（Pyodide 不行的功能直接放弃，不上后端）

## Decisions

### D1：前端框架 = Next.js 14（App Router + RSC）

**理由**：内置 SSG/ISR 适合内容驱动站、生态丰富、Vercel 一键部署、TS 支持完美。

**备选**：
- Astro：更轻量但 React 生态弱、学习曲线在 React 之外
- Docusaurus：文档站默认选项但 lesson 这种交互页面要重写组件，不如直接 Next 写
- 纯静态 HTML + Vanilla JS：长期维护代价高

### D2：Python 运行时 = Pyodide（CDN 加载）

**理由**：唯一无后端方案；标准库齐全；入门语法 100% 支持。

**备选**：
- 后端 Docker sandbox（Judge0 / 自建）：要服务器、要做安全隔离、月成本 ≥ ¥50
- Skulpt：纯 JS 实现 Python 子集，但 stdlib 不全（pathlib / dataclass 等不支持）
- Brython：同 Skulpt 问题
- 第三方嵌入（Replit）：UX 割裂

### D3：编辑器 = Monaco Editor

**理由**：VS Code 同款，自动补全/语法高亮/quickfix 都有，初学者熟悉度高。

**备选**：
- CodeMirror 6：更轻量（~100KB vs Monaco ~2MB），但功能简单；MVP 阶段可用，但若以后扩展难
- Ace：旧，社区不活跃

**Trade-off**：Monaco 体积大 ~2MB，但浏览器缓存后无感；新手对"VS Code 风格"亲切感很重要。

### D4：状态管理 = Zustand

**理由**：极简（< 5KB）、TypeScript 友好、不需要 Provider 套层。MVP 只跟踪「当前题进度 + 已解锁题列表」，Zustand 够用。

**备选**：Redux 过重；Jotai 也行但 API 比 Zustand 啰嗦；Context API 太裸。

### D5：内容格式 = JSON 元数据 + MDX 教学文本

**理由**：
- JSON 存结构化数据（题目 ID、判分规则、解锁条件、初始代码）—— 程序好处理
- MDX 存教学文本（分步教学，可嵌 React 组件如「点这里运行」按钮）—— 编写好读
- 一节课目录结构：`content/lessons/python1/01-hello-world/{lesson.json, steps/01.mdx, 02.mdx, ...}`

### D6：部署 = Vercel + lab 分支

**理由**：Next.js 原生最优、免费额度（100GB 带宽/月）对中文教程站够、自动 PR preview。

**配置**：Vercel project 关联 walter201230/Python 仓库，**指定部署 branch = lab**，build cmd 自动检测 Next.js。

**备选**：
- Cloudflare Pages：在国内访问稍快，但 Next.js SSR 支持有限
- GitHub Pages 直接部署：不支持 SSR，纯 Next.js 静态导出可行但失去 ISR
- 自建 VPS：违反 zero-cost 目标

### D7：判分规则 = 三层组合

按从严到松：
1. **stdout 完全匹配**：`expected_stdout: "Hello, World!\n"` → 严格对比
2. **变量值断言**：`expected_vars: { name: "Alice", count: 5 }` → 跑完用户代码后通过 Pyodide 取全局变量值对比
3. **AST 形态检查**：`required_ast: ["FunctionDef:greet"]` → 用 `ast.parse` 检查代码结构（确保用户用了循环/函数等）

每题至少配一种规则；多种叠加用 AND。

## Risks / Trade-offs

| 风险 | 缓解 |
|---|---|
| Pyodide 首次加载 ~10s | 进入站内立刻 prefetch，splash 屏遮挡；service worker 缓存让二次访问秒开 |
| 用户在编辑器写无限循环 / 大循环卡死浏览器 | Pyodide 跑在 Web Worker 里，主线程 5 秒超时强 terminate 该 worker |
| Vercel 在中国大陆访问偶尔不稳 | V2 接入 Cloudflare Pages 备份；MVP 阶段可接受 |
| 监管/ICP 备案 | 走 vercel.app 子域不需要 ICP；接自定义域才需要——MVP 不接 |
| 题库写得慢 / 质量参差 | MVP 先 5 题人工写，看用户反馈再决定批量；后期可用 AI 辅助生成草稿+人工审 |
| MDX 与 JSON 双源数据维护负担 | 写一个 schema validator + 简单 CLI 工具校验内容文件 |

## Migration Plan

1. **创建 lab 分支**（已完成 — 当前分支）
2. **MVP 实现** → 在 `lab/` 下搭 Next.js 项目，按 tasks.md 执行
3. **Vercel 配置** → 用户在 Vercel 网页端关联仓库 + 选 lab 分支 + 设置 root 目录为 `lab/`
4. **公开发布** → MVP 跑通后在主站（mkdocs）首页加一个"试试在线练习版"链接
5. **回滚策略** → 如果 MVP 后用户反馈不好或 ROI 低，直接 archive `lab` 分支不删（保留 30 天后再决定），主教程 master 不受任何影响

## Open Questions

- **OQ1**：MVP 选哪一章？默认 python1（第一个 Python 程序），但 python1 是"安装 Python / IDE"环境介绍，可能不适合代码练习。**备选**：python2（基本数据类型与变量）→ 立刻能写赋值/打印这类简单代码。**待用户拍板**。
- **OQ2**：Vercel 账号谁来开（用户的 GitHub 账号 walter201230 关联 Vercel）？这是手动一次性步骤。
- **OQ3**：错误反馈深度 —— MVP 给"通过/未通过 + 一句提示"够吗，还是要做"AST 级具体定位错误行"？后者实现复杂 5 倍。建议 MVP 用前者。
- **OQ4**：是否预留接 LLM API 的能力（"AI 老师"按钮，让 GPT 解释错误）？MVP 不做，但内容格式预留 hook 字段。
