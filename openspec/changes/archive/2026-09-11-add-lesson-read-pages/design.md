## Context

闯关页 `LessonLayout.tsx` 的 `visibleBlocks` 在遇到第一道未过关练习时截断整个 `blocks` 数组，过关状态来自 zustand persist（localStorage）。静态导出时 localStorage 不存在，因此 `out/lessons/<ch>/<lesson>/index.html` 里天然缺少后半章内容 —— 这不是「爬虫不执行 JS」，而是预渲染产物本身残缺。实测 22 个带练习章节平均 36% 教学正文入 HTML，python2 为 14%。

约束：闯关式渐进解锁是核心产品形态，`LessonLayout.tsx` 及其交互组件一行都不改。

现状中两处与本设计直接相关的既有事实：

- 项目**没有配置 `metadataBase`，也没有任何 `alternates.canonical`**。要引入 canonical 必须先补 `metadataBase`，否则 Next 生成相对 URL 并在 build 时告警。
- `scripts/generate-sitemap.mjs` 由 `postbuild` 触发，逻辑是**递归扫描 `out/` 下所有 `index.html`**，靠 `EXCLUDE_DIRS` 排除 `_next` / `_not-found` / `404`。因此新增阅读页会自动进 sitemap，而「让 sitemap 只列 canonical URL」需要新增排除规则。

## Goals / Non-Goals

**Goals:**
- 每章教学正文 100% 进入某个可被抓取、可被索引的静态页面。
- 闯关页的行为、代码、内容文件零改动。
- 阅读页与闯关页之间的规范关系明确（canonical 唯一、sitemap 唯一、双向内链）。
- 阅读页保持轻量：不加载 Pyodide，首屏与抓取成本低。

**Non-Goals:**
- 不在阅读页提供代码运行、判分、进度记录。练习始终只在闯关页完成。
- 不改变产品主路径：首页与站内导航的主链接仍指向闯关页。
- 不做 cloaking 或任何按 User-Agent 差异化返回内容的方案。
- 不为降低与原教程的文本重复率而改写内容（那是独立的后续工作）。

## Decisions

### D1：阅读页作为闯关页的子路由 `/lessons/[chapter]/[lesson]/read/`

沿用现有 `[chapter]/[lesson]` 段，直接复用该层的 `generateStaticParams` 与 `loadLesson(chapter, lesson)`，无需第二套参数生成逻辑。URL 语义上表达「同一章的另一种视图」，也让 sitemap 的排除规则可以靠目录结构判断（见 D6）。

考虑过的替代方案：
- 独立路由树 `/read/[chapter]/[lesson]/` —— 需要复制一份 `generateStaticParams`，且 URL 上与所属章节脱钩，内链与面包屑都要另写。
- 查询参数 `?mode=read` —— `output: 'export'` 静态导出下查询参数不产生独立页面，爬虫拿到的仍是同一份残缺 HTML，直接失效。

### D2：canonical 由闯关页指向阅读页，方向不可反

两页内容同源，必须指定唯一规范版本。阅读页内容完整，闯关页内容残缺 —— 若 canonical 反向指向闯关页，Google 索引的仍是 14% 内容的那一版，本次改动的全部意义归零。

因此：阅读页 canonical 自指，闯关页 canonical 指向阅读页。闯关页**不使用 `noindex`** —— canonical 已表达规范归属，`noindex` 会让 Google 完全丢弃该 URL，而它是用户实际使用的主页面，保留其被发现的能力更稳妥。

### D3：新增 `metadataBase`，canonical 用绝对 URL

在 `src/app/layout.tsx` 的 metadata 中补 `metadataBase: new URL('https://learn-py.org')`。这是 D2 的前置条件，也顺带修掉项目当前缺失站点绝对基址的问题（影响 OG 图片等）。域名与 `generate-sitemap.mjs` 里的 `SITE_URL` 保持一致。

### D4：阅读页不加载 Pyodide，新建静态渲染组件而非复用 `StepCard`

`StepCard` 的 props 签名要求 `pyStatus` 与 `run`，其 `pre` 渲染器会把 python 代码块替换成 `RunnableCodeBlock`（带「试运行」按钮）。复用它就必须把 Pyodide 引入阅读页，与「轻量、快、纯静态」的定位冲突，也会让每个抓取请求都触发 WASM 运行时下载。

新建一个只做 markdown → HTML 的静态 step 组件：同样使用 `ReactMarkdown` + `remarkGfm` 保证排版一致，但 python 代码块渲染为静态高亮块，附「到闯关页运行这段 →」链接。

考虑过给 `StepCard` 加一个 `static?: boolean` 开关：会让闯关页的组件为阅读页的需求承担分支，违反「闯关页零改动」的约束边界，放弃。

### D5：练习位置渲染为指向闯关页的跳转卡片

阅读页遍历完整 `blocks`：`kind === 'step'` 正常渲染；`kind === 'exercise'` 不渲染练习本体，改为一张轻量卡片，标题取 `exercise.title`，链接到 `/lessons/<ch>/<lesson>/#exercise-<id>`。

这样阅读页保持「只读」语义，无需处理判分、编辑器、解锁状态，也避免两个页面同时写 localStorage 造成的状态歧义。锚点复用闯关页既有的 `exercise-<id>` id，无需改动闯关页。

### D6：sitemap 只列阅读页，靠产物结构自动排除

在 `generate-sitemap.mjs` 中新增规则：若某目录下存在 `read/index.html` 子目录，则该目录自身的 `index.html` 不进 sitemap。

选择结构判断而非硬编码路径列表或解析 HTML 里的 canonical 标签：规则由产物形态自然推出，新增章节时零维护；无需引入 HTML 解析依赖。

### D7：阅读页不读写任何进度状态

阅读页组件不订阅 `useProgress`，因此可完全静态预渲染，且**爬虫所见与用户所见一致** —— 这是本方案与「视觉遮挡」类做法的本质区别，从设计上排除了 cloaking 风险。

### D8：内链拓扑

- 首页章节卡片：主链接仍指向闯关页，新增次要入口「先通读」指向阅读页。
- 闯关页：新增「完整通读本章」入口指向阅读页。此项是对闯关页文件的**唯一**改动，且仅新增一个链接，不触碰渲染与解锁逻辑。
- 阅读页：章末「去闯关模式练习」指向闯关页，正文内每处练习卡片亦为入口。

首页入口是关键 —— 阅读页若只靠 sitemap 可达，内链权重近零，Google 可能长期不抓。

## Risks / Trade-offs

- **canonical 是建议而非指令，Google 可能仍抓取并评估闯关页** → sitemap 只列阅读页（D6）、首页与闯关页都给出阅读页内链（D8），使阅读页成为发现路径上的主版本。重新提交审核前用 Search Console 确认代表页抓取到的是完整内容。

- **两页内容同源，canonical 配置错误会被判重复内容** → 构建后在 `out/` 产物中断言：闯关页 HTML 的 canonical 指向阅读页，阅读页 canonical 自指，两者都不为空。此断言进验证清单。

- **阅读页无「试运行」，用户在阅读页想跑代码时体验割裂** → 每个 python 代码块附「到闯关页运行这段」链接，章末与练习卡片亦为入口。接受这一取舍以换取阅读页的轻量与抓取友好。

- **新增 29 个页面使构建产物翻倍（lesson 部分）** → 纯静态 HTML，体积增量小；`deployment` spec 的产物完整性 scenario 需同步扩展以覆盖 read 路径，否则回归时漏检。

- **人工审核员仍可能打开闯关页并看到残缺内容** → 无法完全消除。缓解：首页章节卡片的「先通读」入口使审核员有机会进入完整页面；且闯关页的锁定语义明确（练习渐进解锁是常见合规的产品形态，与「内容缺失」不同）。这是本方案相对「教学全展开」方案保留的残余风险，属已知取舍。

## Migration Plan

1. 补 `metadataBase`（D3），验证 build 无 metadata 告警。
2. 新增阅读页路由与静态渲染组件，验证 29 章产物齐全。
3. 加 canonical 两侧配置，在 `out/` 中断言指向正确。
4. 改 sitemap 排除规则，断言 sitemap 含 29 个 read URL 且不含对应闯关页 URL。
5. 补内链入口。
6. 全量验证后部署；Search Console 请求重新抓取代表页；确认抓取内容完整后再回 AdSense 申请审核。

回滚：本改动全为新增 + 三处小修改（metadataBase、canonical、sitemap 规则、内链）。回滚只需撤销这几处并删除 read 路由，闯关页从未被修改，无数据迁移、无 localStorage 结构变更，风险极低。

## Open Questions

- 阅读页是否需要显示预计阅读时间与练习题数量（`meta.estimatedMinutes` / `exercises.length`）？倾向显示，与闯关页信息一致，但非阻塞项。
- 阅读页的 `<title>` 与 description 是否需要与闯关页区分？若完全相同，canonical 已表明规范归属，重复不构成问题；若区分，可让阅读页更偏「教程正文」语义以利搜索匹配。倾向区分，实现时定稿。
