## Why

walter201230/Python 这份 25k star 的入门教程目前是纯文档站（mkdocs Material）——用户只能"读"，不能"练"。在 AI 编程普及的 2026 年，被动阅读式教程的吸引力在下降，pypypy / Codecademy 这种"读一段 → 立刻在浏览器写代码 → 自动判分"的沉浸式交互形态已成入门教程主流。本次 change 把现有教程改造成一个**重量版**交互学习站（沉浸式分步引导 + 在线代码编辑 + 自动判分 + 进度门控），用 1 章 MVP 验证可行性后，再决定是否铺到 28 章。

## What Changes

- **新增独立交互学习站**：在 `lab/` 子目录下建 Next.js 14 应用，跟现有 mkdocs 教程站解耦（master 分支保留 mkdocs，`lab` 分支独立部署到 Vercel）
- **MVP 范围 = 1 章 + 5 道题**：实现 python1（第一个 Python 程序）的"教学切片 → 5 道渐进练习题"全链路，跑通后再决定铺其他章节
- **Pyodide 浏览器沙箱**：Python 在用户浏览器里运行（WASM），零后端、免费托管
- **自动判分系统**：用户跑代码后对比预期 stdout / 检查变量值，给出「通过 / 未通过 + 提示」
- **进度门控**：当前题做对才解锁下一题（仿 pypypy 的解锁机制）
- **沉浸式 UI**：左侧分步教学（每步 < 1 屏）+ 右侧编辑器 + 终端 + 运行/检查按钮
- **不在 MVP 范围**（V2+ 再考虑）：用户账号、进度跨设备同步、付费墙、卡通形象动画、错题本、排行榜、社交分享

## Capabilities

### New Capabilities

- `interactive-lesson`：核心交互单元——一节课由若干「教学步骤 + 练习题」组成，支持 markdown 教学渲染、Pyodide 代码运行、自动判分、提示展示、解锁规则
- `lesson-content-format`：课程内容的数据格式定义（每节课的 metadata、教学步骤数组、题目集、每题的判分规则）

### Modified Capabilities

（无 — 这是全新模块，不修改现有 mkdocs 教程站的任何 spec）

## Impact

- **新增代码**：`lab/` 目录（Next.js 14 App Router + Tailwind + Zustand + Pyodide 集成）
- **新增部署**：Vercel 项目（默认 `walter201230-python-lab.vercel.app`，可后续接自定义域）
- **新增依赖**：node deps（`next` / `react` / `tailwindcss` / `zustand` / `monaco-editor` 等）；Pyodide 通过 CDN 运行时加载 WASM，**不需要 npm 装 Pyodide**
- **不影响**：`Article/`、`mkdocs.yml`、`.github/workflows/docs.yml`、master 分支的现有教程和 GitHub Pages 部署 **全部保留原样**
- **风险点**：
  1. **Pyodide 首次加载 ~10s** —— 影响用户初体验，用 splash 屏 + service worker 缓存缓解
  2. **题库设计是慢工** —— 每题需要 1-2 小时（写题面、初始代码、期望输出、提示），MVP 只验证 1 章/5 题，看 ROI 决定是否继续投入
  3. **Vercel 部署链路要 setup** —— 需要 Vercel 账号 + 关联 GitHub 仓库 + 配置 lab 分支为部署源（一次性，约 30 分钟）
  4. **教学法重构** —— 现有 mkdocs 教程是「讲解型」（一章长 markdown），交互学习站需要「任务驱动型」（讲一点 → 立即练 → 再讲一点），改造一章约 1-2 天
