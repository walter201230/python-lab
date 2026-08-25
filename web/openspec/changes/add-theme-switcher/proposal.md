## Why

learn-py.org 目前只有一套深色主题，全站 34 个组件文件里散布着 244 处硬编码色阶（`bg-slate-950`、`text-slate-100` 等），`dark:` 变体 0 处。深色在暗环境下体验好，但白天阅读、投影演示、以及习惯浅色的用户没有选择；新增的无门控阅读页（`add-lesson-read-pages`）是长文通读场景，浅色需求更强。

同时，硬编码色阶本身是技术债：任何配色调整都要逐文件改类名，无法收敛。这次借加浅色主题一并把颜色语义化，之后再加主题只改 CSS 变量。

## What Changes

- 新增浅色主题，深色保持现状为默认（现有科技绿调性不变）。
- 顶栏右侧新增主题切换图标，点击在深/浅之间切换。
- 全站 34 个组件文件的 244 处硬编码色阶替换为语义 token（`bg-surface`、`text-body` 等），token 在 `:root` 与 `[data-theme="light"]` 下各定义一套值。
- `globals.css` 的 20 处写死 hex/rgba（含 `--tech-green-*` 品牌绿、`.bg-tech-grid` 网格线）拆成两套主题值。
- 7 处 `prose prose-invert` 改为随主题切换，配套的 `prose-*:text-slate-*` 修饰一并 token 化。
- Monaco 编辑器主题从写死的 `vs-dark` 改为跟随站点主题。
- `<head>` 内新增一段阻塞式内联脚本，在 CSS 生效前把 `data-theme` 打到 `<html>` 上，避免静态导出首屏闪色。
- 主题偏好持久化到 localStorage，独立于 `lesson-progress`。
- 首次访问无存储值时使用深色，不跟随系统 `prefers-color-scheme`（与「默认深色」的产品决定一致）。

**非目标**：不改动闯关式渐进解锁机制；不改动任何教学内容；不新增第三种主题。

## Capabilities

### New Capabilities
- `theme-switching`: 站点深/浅主题的选择、持久化、首屏无闪色渲染，以及颜色 token 的语义化契约。

### Modified Capabilities
（无。`progress-storage` 的进度语义与 `deployment` 的纯静态约束均不变；主题偏好用独立的 localStorage key，顶栏新增的是主题图标而非账号入口。）

## Impact

**代码**
- `src/app/globals.css`：主题 token 定义（两套）、品牌绿与网格线拆分。
- `src/app/layout.tsx`：`<head>` 内联反闪色脚本、`<html>` 上的 `data-theme`。
- 顶栏组件：新增主题切换按钮。
- 新增主题 store（Zustand，与 `progress` store 并列）与切换组件。
- 34 个含硬编码色阶的组件文件（`src/**/*.tsx`）：类名替换。
- `src/components/lesson/ExerciseEditor.tsx`：Monaco `theme` 由静态值改为跟随主题。

**约束与风险**
- 品牌绿 `emerald-400 #34d399` 在白底上对比度约 1.9:1，低于 WCAG AA 4.5:1，浅色下正文与链接必须换用更深的绿，不能直接复用深色值。
- 静态导出（`output: 'export'`）下首屏 HTML 构建时固定，反闪色脚本必须阻塞执行，不能放进 React 组件。
- 现有 5 套 Playwright 回归断言需在两种主题下各跑一遍，回归成本翻倍。

**依赖**：无新增 npm 依赖（不引入 `next-themes`，静态导出下自己实现更可控）。

**顺序**：建议在 `add-lesson-read-pages` 提交落地后再开工，避免 244 处替换的 diff 淹没阅读页改动、导致无法 review 与二分定位。
