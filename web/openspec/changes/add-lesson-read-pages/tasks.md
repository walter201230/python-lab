## 1. 前置：站点绝对基址

- [x] 1.1 在 `src/app/layout.tsx` 的 metadata 中新增 `metadataBase: new URL('https://learn-py.org')`，域名与 `scripts/generate-sitemap.mjs` 的 `SITE_URL` 保持一致
- [x] 1.2 跑 `pnpm build`，确认不再出现 metadataBase 相关告警，且 OG 标签中的 URL 已变为绝对地址

## 2. 阅读页渲染组件

- [x] 2.1 新建静态教学段组件（如 `src/components/lesson/ReadStepCard.tsx`）：用 `ReactMarkdown` + `remarkGfm` 渲染 `content`，排版类名与 `StepCard` 的 `article` 保持一致，不接收 `pyStatus` / `run`
- [x] 2.2 该组件把 python 代码块渲染为静态代码块，并附「到闯关页运行这段 →」链接，链接指向 `/lessons/<chapter>/<lesson>/`
- [x] 2.3 新建练习跳转卡片组件：显示 `exercise.title`，链接到 `/lessons/<chapter>/<lesson>/#exercise-<id>`，不渲染编辑器、提示、判分按钮或答案
- [x] 2.4 新建阅读页布局组件（如 `src/components/lesson/LessonReadLayout.tsx`）：遍历完整 `blocks`，step 用 2.1 渲染、exercise 用 2.3 渲染；不订阅 `useProgress`、不调用 `usePyodide`
- [x] 2.5 布局中加入章末「去闯关模式练习 →」入口，以及标题区的章节信息（练习题数、预计时长）

## 3. 阅读页路由

- [x] 3.1 新建 `src/app/lessons/[chapter]/[lesson]/read/page.tsx`，`generateStaticParams` 复用与闯关页相同的 `CHAPTERS` 过滤逻辑（`status === 'available'`）
- [x] 3.2 页面通过 `loadLesson(chapter, lesson)` 取数据，数据缺失时 `notFound()`
- [x] 3.3 实现 `generateMetadata`：标题与 description 偏「教程正文」语义以区别于闯关页，并设置 `alternates.canonical` 自指到 `/lessons/<chapter>/<lesson>/read/`
- [x] 3.4 跑 `pnpm build`，确认 29 章的 `out/lessons/<ch>/<lesson>/read/index.html` 全部存在且非空

## 4. canonical 归属

- [x] 4.1 在闯关页 `src/app/lessons/[chapter]/[lesson]/page.tsx` 的 `generateMetadata` 中新增 `alternates.canonical`，指向对应阅读页 URL
- [x] 4.2 确认闯关页未引入任何 `noindex` robots meta
- [x] 4.3 构建后断言：任取 3 章，闯关页 HTML 的 canonical href 为对应 `/read/` 绝对 URL，阅读页 canonical href 为自身绝对 URL，两者均非空

## 5. sitemap 规范收敛

- [x] 5.1 修改 `scripts/generate-sitemap.mjs`：若某目录下存在 `read/index.html`，则该目录自身的 `index.html` 不进 sitemap
- [x] 5.2 构建后断言：`out/sitemap.xml` 含 29 个 `/read/` URL，且不含对应的闯关页 URL
- [x] 5.3 断言 `/`、`/about/`、`/contact/`、`/privacy/` 仍在 sitemap 中，总 URL 数符合预期

## 6. 站内互链

- [x] 6.1 首页 `src/app/page.tsx` 章节卡片新增次要入口「先通读」，指向该章阅读页；主链接保持指向闯关页不变
- [x] 6.2 闯关页新增一处「完整通读本章 →」链接指向对应阅读页 —— 这是对闯关交互文件的唯一改动，不得触碰 `visibleBlocks`、`currentStepIndex` 或解锁判定
- [x] 6.3 构建后断言 `out/index.html` 中对每个可用章节都存在 `/read/` 链接

## 7. 闯关页行为回归

- [x] 7.1 无痕窗口打开 `/lessons/python16/decorator/`，确认仍只显示教学 01、教学 02、练习 1，教学 03/04 与练习 2/3 不出现
- [x] 7.2 做对练习 1，确认教学 03 与练习 2 正常展开，庆祝动效与进度写入行为不变
- [x] 7.3 确认 localStorage 中进度结构与本变更前一致（键名、字段、语义均未变）
- [x] 7.4 按项目约定做全项目回归扫描：列出所有读取进度状态的调用方（`LessonToc`、`LessonStickyBar`、`ExerciseCard`、`ExerciseEditor`、`ExerciseHeader`、`ExerciseActions`、`CompletionBanner`）逐一确认未受影响

## 8. 阅读页验证

- [x] 8.1 无痕窗口打开 python2 阅读页，确认 9 段教学全部可读、无 `🔒` 或解锁类文案
- [x] 8.2 观察网络请求，确认无 Pyodide CDN 与 `pyodide.worker.js` 请求
- [x] 8.3 读完全章后确认 localStorage 进度数据与打开前完全一致
- [x] 8.4 对比同一章阅读页在「无进度」与「全部通过」两种状态下的教学正文，确认完全相同
- [x] 8.5 用脚本剥离 `out/lessons/python2/data-types-and-variables/read/index.html` 标签，确认 9 个 step 源文件正文全部命中，可见汉字数接近源文件的 4,354

## 9. 质量门与交付

- [x] 9.1 `pnpm tsc --noEmit && pnpm lint` 通过
- [x] 9.2 `npm run validate-content` 通过
- [x] 9.3 `pnpm build` 通过，产物完整性断言（3.4 / 5.2 / 6.3）全部复跑一次
- [x] 9.4 更新工作区 `ROADMAP.md`：记录本次 AdSense 拒审根因与阅读页方案的落地结果
- [ ] 9.5 汇总提交清单（文件、改动要点、目标 remote 与分支）交用户确认后再 commit；push 前另行确认
