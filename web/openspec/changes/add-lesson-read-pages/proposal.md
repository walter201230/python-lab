## Why

Google AdSense 于 2026-08-17 以「低价值内容」拒审 learn-py.org。根因不是内容不足，而是闯关页的内容对爬虫不可见：`LessonLayout.tsx` 遇到第一道未过关练习即截断渲染，过关状态存在 localStorage，因此**静态导出的 HTML 本身就是残缺的**。实测 22 个带练习章节平均只有 36% 教学正文进入 HTML，入门第一课 python2 仅 14%（4,354 字中只暴露 623 字），全站 24,369 汉字 Google 永远抓不到。

闯关式渐进解锁是本站的核心产品形态，必须原样保留。因此不修改闯关页，而是另建一条无门控的阅读路径，让完整内容有一个可被抓取、可被索引的载体。

## What Changes

- 新增路由 `/lessons/[chapter]/[lesson]/read/`，渲染该章全部教学 step，无任何门控、不读取进度状态。
- 阅读页为纯静态阅读形态：不加载 Pyodide、无代码编辑器、无判分。代码块静态展示，练习位置改为指向闯关页对应练习的链接。
- 规范收敛：闯关页与阅读页内容同源，`canonical` 统一指向阅读页；`scripts/generate-sitemap.mjs` 输出阅读页 URL 替代闯关页 URL。
- 内链：首页章节卡片增加次要入口「先通读」，闯关页增加「完整通读本章」入口，避免阅读页成为仅靠 sitemap 可达的孤岛。
- 闯关页的渐进解锁行为、`LessonLayout.tsx` 的截断逻辑、29 章内容文件、练习判分逻辑均**不改动**。
- 首页主链接仍指向闯关页，产品主路径不变。

## Capabilities

### New Capabilities
- `lesson-read-view`: 每章无门控完整阅读页的内容完整性、静态化约束（不依赖 Pyodide 与 localStorage）、与闯关页的互链关系，以及 canonical 与 sitemap 的归属规则。

### Modified Capabilities
- `deployment`: 「构建产物完整覆盖所有可用 lesson 路径」这一 Scenario 目前只要求 `out/lessons/<chapter>/<lesson>/index.html` 存在；新增阅读页后必须同时覆盖 `out/lessons/<chapter>/<lesson>/read/index.html`。

## Impact

**新增**
- `src/app/lessons/[chapter]/[lesson]/read/page.tsx` — 阅读页路由，复用现有 `generateStaticParams` 与 `loadLesson`
- 阅读页布局与静态 step 渲染组件（不复用 `StepCard`，因其依赖 `pyStatus` / `run`）

**修改**
- `src/app/lessons/[chapter]/[lesson]/page.tsx` — `generateMetadata` 增加 `alternates.canonical` 指向阅读页
- `scripts/generate-sitemap.mjs` — 课程页 URL 替换为阅读页 URL
- 首页章节卡片组件、闯关页 — 各增加一处互链入口

**不动**
- `src/components/lesson/LessonLayout.tsx` 及全部闯关交互组件
- `src/lib/loadLesson.ts`、`src/lib/chapters.ts` 的数据结构
- `content/lessons/` 下 29 章内容与练习文件
- `progress-storage` 相关行为（阅读页不读写进度）

**风险**
- `canonical` 是建议而非指令，Google 可能仍抓取闯关页；缓解方式是 sitemap 只列阅读页，并保证阅读页内链充分。
- 两个页面内容同源，若 canonical 配置错误会造成重复内容判定，需在构建产物中验证 canonical 指向正确。

**收益（超出本次拒审）**
- 29 个完整内容页进入索引，自然搜索流量的前提才成立 —— 广告变现依赖于此。
- 想通读或速查的用户获得一条不必做题的路径。
