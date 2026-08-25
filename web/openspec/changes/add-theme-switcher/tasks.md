## 1. 地基：token 与切换链路（此阶段组件不改，视觉不变）

- [ ] 1.1 在 `globals.css` 的 `:root` 下定义 18 个语义 token 的深色值（canvas / surface / surface-raised、text / text-muted / text-subtle、border / border-strong / border-subtle、accent / accent-strong / accent-surface / on-accent、danger / warn 组），取值与现有色阶逐一对应
- [ ] 1.2 在 `[data-theme="light"]` 下定义同名 token 的浅色值，品牌绿文字取 `emerald-700 #047857`（实测 5.48:1）
- [ ] 1.3 通过 `@theme inline` 把 token 暴露为 Tailwind 工具类（`bg-canvas`、`text-muted` 等），验证类名可用
- [ ] 1.4 把 `.bg-tech-grid` 网格线色、`--tech-green-*` 三个品牌绿变量拆成两套主题值
- [ ] 1.5 在 `layout.tsx` 的 `<head>` 内加同步内联脚本：读 `localStorage`，值为 `light` 时给 `<html>` 打 `data-theme="light"`
- [ ] 1.6 新建主题模块：`useSyncExternalStore` + `MutationObserver` 订阅 `<html>` 的 `data-theme`，导出当前主题与 `toggle`；切换时同时写 DOM 与 localStorage
- [ ] 1.7 新建 `ThemeToggle` 客户端组件（图标按钮，带 `aria-label`、`focus-ring`），插入 `layout.tsx` 顶栏 `<nav>` 右侧
- [ ] 1.8 验证切换链路：点击按钮 `<html data-theme>` 变化、localStorage 写入、刷新后保持、`lesson-progress` 未被触碰

## 2. 批次替换：244 处硬编码色阶 → 语义 token

- [ ] 2.1 替换 `app/` 下 3 个文件 + `app/lessons/[chapter]/[lesson]/` 下 2 个文件；跑 `tsc --noEmit` + `lint`
- [ ] 2.2 替换 `app/about/`、`app/contact/`、`app/privacy/` 3 个文件；跑 `tsc` + `lint`
- [ ] 2.3 替换 `components/` 下 5 个文件 + `components/ui/` 1 个文件；跑 `tsc` + `lint`
- [ ] 2.4 替换 `components/lesson/` 下 20 个文件（最大批，可再拆两轮）；跑 `tsc` + `lint`
- [ ] 2.5 处理 `text-slate-950`（5 处）等绿底文字：确认全部映射到 `on-accent` 而非随中性色翻转
- [ ] 2.6 修既有对比度缺陷：8 处 `text-slate-500` 并入 `text-subtle`（深色取 `slate-400`，4.24:1 → 7.87:1）——本次唯一刻意的范围扩大，提交说明中单独点出
- [ ] 2.7 执行完成判据：`grep -rE '\-(slate|gray)-[0-9]+' src --include='*.tsx'` 匹配数为 0

## 3. 收口：prose、编辑器、状态色

- [ ] 3.1 在 `globals.css` 中把 `--tw-prose-*` 系列变量绑到 D2 的 token
- [ ] 3.2 删除 7 处 `prose-invert` 及其后跟的 `prose-p:text-slate-*`、`prose-code:text-emerald-*` 等逐项修饰，确认 `StepCard` 与 `ReadStepCard` 排版仍一致
- [ ] 3.3 `ExerciseEditor.tsx` 的 `theme="vs-dark"` 改为随主题取 `vs-dark` / `vs`（prop 本身响应式，无需调 Monaco API）
- [ ] 3.4 处理 17 处状态色（rose 报错 / amber 提示）在浅色下的取值
- [ ] 3.5 逐处目视约 20 处半透明绿（`bg-emerald-500/8`、`shadow-emerald-500/10` 等）在白底上的效果，过淡的单独给浅色值

## 4. 验证

- [ ] 4.1 对浅色主题全站做对比度审计：正文/次级文字/链接均 ≥ 4.5:1，大字 ≥ 3:1
- [ ] 4.2 深色主题像素级回归：与改动前的构建产物对比，确认视觉零变化
- [ ] 4.3 把现有 5 套 Playwright 断言参数化主题（不复制脚本），两主题各跑一遍全绿
- [ ] 4.4 无闪色验证：浅色偏好下刷新，确认首次绘制即为浅色、无深色帧
- [ ] 4.5 学习功能不受影响：解锁进度、判分、Pyodide 不因切换主题而重置
- [ ] 4.6 `pnpm build` + `npm run validate-content` 通过，产物页数与 sitemap 条数不变

## 5. 收尾

- [ ] 5.1 更新工作区 `ROADMAP.md`，只记已实现并验证过的事项
- [ ] 5.2 汇总提交清单（文件、改动要点、目标 remote 与分支）交用户确认后再 commit；push 前另行确认
