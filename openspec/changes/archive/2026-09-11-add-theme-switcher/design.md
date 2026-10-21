## Context

站点当前只有一套深色主题，实现方式是把具体色阶直接写进组件类名。实测现状：

| 项 | 实测值 |
|---|---|
| 含硬编码 `slate/gray` 色阶的 `.tsx` | 34 / 53 |
| 硬编码颜色类出现次数 | 244 |
| distinct 中性色类 / 品牌绿类 / 状态色类 | 36 / 35 / 17 |
| 已有 `dark:` 变体 | 0 |
| `globals.css` 写死 hex / rgba | 20 |
| `prose prose-invert` 用点 | 7 |

已具备的地基：`globals.css` 已用 `--background` / `--foreground` 变量驱动 `html` 与 `body`；`layout.tsx` 的 `<body>` 已带 `suppressHydrationWarning`。缺的是组件层的颜色语义化和一套切换机制。

关键环境约束：Next 16.2.4 + `output: 'export'` 纯静态导出，无服务端，首屏 HTML 构建时固定；`layout.tsx` 是 Server Component，顶栏内联其中（非独立组件）；Tailwind v4（`@theme` / `@plugin` 语法，无 `tailwind.config.js`）。

## Goals / Non-Goals

**Goals:**
- 新增浅色主题，深色保持默认且视觉零变化。
- 顶栏右侧一个图标完成切换，偏好跨会话保持。
- 首屏不闪色，包括浅色用户刷新时。
- 244 处硬编码色阶收敛为语义 token，之后调色只改 CSS 变量。
- 浅色主题正文与链接达到 WCAG AA（4.5:1）。

**Non-Goals:**
- 不改闯关式渐进解锁机制。
- 不改任何教学内容与题目。
- 不新增第三种主题，不做每章/每组件级主题。
- 不跟随系统 `prefers-color-scheme`（产品决定：默认深色）。
- 不改 `public/pyodide.worker.js`（与视觉无关）。

## Decisions

### D1 用 `data-theme` + CSS 变量的语义 token，不用 Tailwind `dark:` 变体

`:root` 定义深色（默认）token，`[data-theme="light"]` 覆盖成浅色。组件写 `bg-surface`、`text-muted` 这类语义类。

- **对比 `dark:` 变体**：244 处要写成 488 个类名，且现有类名语义是深色，得先整体反转才能当浅色基线用。类名膨胀、diff 巨大、后续再调色仍要逐文件改。
- **对比引入 `next-themes`**：它解决的是 SSR/RSC 下的 class 同步，我们静态导出下需求更简单，自己实现约 30 行且完全可控；避免新增依赖。

**采纳**：语义 token。改动一次性集中在 `globals.css`，组件层只做一轮机械替换。

### D2 token 词汇表按「角色」而非「色阶」划分

**必须按角色而非色阶建 token**：同一个 `slate-800` 在站内既是 `bg-slate-800`（16 处，芯片/徽章底）又是 `border-slate-800`（17 处，卡片描边），两者在浅色下要走**相反方向**的值。所以不存在 1:1 的色阶映射表，244 处必须逐处判角色——这也是本次无法用 `sed` 批量替换的根本原因。

18 个 token，全部值已实测对比度（见下表「判定」列）：

| 组 | token | 深色 | 浅色 |
|---|---|---|---|
| 画布 | `canvas` | `#020617` | `#f8fafc` |
| | `surface` | `#0f172a` slate-900 | `#ffffff` |
| | `surface-raised` | `#1e293b` slate-800 | `#f1f5f9` slate-100 |
| | `code-surface` | `#020617` | `#f1f5f9` |
| 文字 | `text` | `#f1f5f9` | `#0f172a` |
| | `text-body` | `#e2e8f0` | `#1e293b` |
| | `text-muted` | `#cbd5e1` | `#475569` |
| | `text-subtle` | `#94a3b8` | `#64748b` |
| | `text-faint` | `#334155` | `#cbd5e1` |
| 边框 | `border` | `#1e293b` | `#e2e8f0` |
| | `border-strong` | `#334155` | `#cbd5e1` |
| | `border-emphasis` | `#475569` | `#94a3b8` |
| 强调 | `accent` | `#34d399` emerald-400 | `#047857` emerald-700 |
| | `accent-strong` | `#6ee7b7` emerald-300 | `#065f46` emerald-800 |
| | `accent-solid` | `#34d399` | `#34d399`（同值） |
| | `on-accent` | `#020617` | `#020617`（同值） |
| 状态 | `danger` | `#fb7185` | `#be123c` |
| | `warn` | `#fbbf24` | `#b45309` |

实测对比度（深色 canvas / 深色 surface / 浅色 canvas / 浅色 surface，全部 ≥ AA 4.5:1）：

| token | 深/canvas | 深/surface | 浅/canvas | 浅/surface |
|---|---|---|---|---|
| `text` | 18.41 | 16.30 | 17.06 | 17.85 |
| `text-body` | 16.36 | 14.48 | 13.98 | 14.63 |
| `text-muted` | 13.59 | 12.02 | 7.24 | 7.58 |
| `text-subtle` | 7.87 | 6.96 | **4.55** | 4.76 |
| `accent` | 10.49 | 9.29 | 5.24 | **5.48** |
| `accent-strong` | 13.23 | 11.71 | 7.34 | 7.68 |
| `danger` | 7.50 | 6.63 | 6.01 | 6.29 |
| `warn` | 12.08 | 10.69 | **4.80** | 5.02 |

`text-faint`（深 1.95:1 / 浅 1.42:1）是 `·` 分隔符与下划线装饰专用，非信息性内容，按 WCAG 豁免。

**实施中确认的三处修正（相对本节初稿）：**

**① 浅色下 canvas 与 surface 的关系要反过来。** 初稿写 canvas `#ffffff` / surface `slate-50`。但站内有 7 处 `bg-slate-900/60`——半透明卡片。浅色若沿用「白底 + slate-50 卡片 @60%」，卡片实际渲染成 `#fcfdfd`，与白底无法区分，卡片全靠描边支撑、页面发飘。改为 **canvas `#f8fafc` / surface `#ffffff`**：卡片浮在微灰页面之上，`/60` 等透明度修饰仍然读得出层次，深浅两套主题的层级语义也保持一致。

**② `bg-slate-950` 承担了两个相反的角色，必须拆成两个 token。** 它既是页面底色（`canvas`），又是**卡片内代码块**的底色（`RunnableCodeBlock` 的 `bg-slate-950/80`）——在深色下代码块比卡片更暗，在浅色下则要比白卡片更亮一档。同一个源色阶、相反的浅色目标值，故新增 `code-surface`（浅色 `#f1f5f9`）。

**③ 实心绿按钮的填充色两套主题同值，不做深浅切换。** 填充色不是文字，无需对页面达到 4.5:1；需要达标的是**压在它上面的文字对填充色**——`#020617` on `#34d399` 实测 **10.49:1**。故 `accent-solid` 与 `on-accent` 都是主题无关的常量，浅色下按钮保持亮绿，品牌辨识度不损失。

**`on-accent` 是最容易踩的坑**：现有 `text-slate-950`（5 处）正是绿按钮上的深色文字。若无脑把中性色全部翻转，浅色下会变成白字压亮绿底，直接不可读。这类「不随主题翻转」的颜色必须单独立 token。

### D3 浅色下品牌绿必须换深阶（实测对比度）

在 `#ffffff` 上实测：

| 色 | 对比度 | 判定 |
|---|---|---|
| `emerald-300 #6ee7b7` | 1.52:1 | ✗ |
| `emerald-400 #34d399` | 1.92:1 | ✗ |
| `emerald-500 #10b981` | 2.54:1 | ✗ |
| `emerald-600 #059669` | 3.77:1 | 仅大字达 AA |
| **`emerald-700 #047857`** | **5.48:1** | **AA 正文 ✓** |

`text-emerald-300`（46 处）与 `text-emerald-400`（30 处）合计 76 处文字用绿，在浅色下全部必须走 `emerald-700`；`emerald-600` 只能用于大号标题。

**半透明绿**（`bg-emerald-500/10`、`border-emerald-500/40` 等）作为色调底色两套主题可共用，不参与替换，但需目视确认白底上不至于淡到看不见。

### D4 反闪色靠 `<head>` 内联阻塞脚本，且「默认深色」天然降低风险

脚本读 `localStorage.theme`，仅当值为 `light` 时给 `document.documentElement` 打 `data-theme="light"`，在样式表应用前同步执行。

**选深色作默认带来一个额外好处**：`:root` 默认即深色，未设置过偏好的访客（绝大多数）即使脚本失败也不会闪色——脚本只服务主动选了浅色的用户。这降低了这段脚本的故障影响面。

不能放进 React 组件：静态导出下 hydration 晚于首屏绘制，必然闪。

### D5 主题状态不进 Zustand persist，用 `useSyncExternalStore` 读 DOM

`progress` store 用 `persist`，但主题**不能**复用：`persist` 是异步水合（`onFinishHydration`），晚于首屏 → 必闪色。

**采纳**：DOM 上的 `data-theme` 属性是唯一真相源（single source of truth），内联脚本负责首屏写入，React 侧用 `useSyncExternalStore` + `MutationObserver` 订阅，切换时同时写 DOM 和 localStorage。与 `LessonLayout` 里已有的 `useSyncExternalStore` 水合处理是同一套思路，风格一致。

### D6 prose 通过 `--tw-prose-*` 变量接管，删掉组件里的 `prose-invert` 和逐项修饰

`@tailwindcss/typography` 的配色走 `--tw-prose-body`、`--tw-prose-headings` 等变量。在 `globals.css` 里把这些变量绑到 D2 的 token，组件里 7 处 `prose-invert` 及其后跟的 `prose-p:text-slate-200`、`prose-code:text-emerald-300` 等修饰全部删除。

**副产品**：`StepCard.tsx` 与 `ReadStepCard.tsx` 里那串完全重复的长 prose 类名会一起消失，两者的排版一致性从「靠人肉同步类名」变成「靠同一组变量」。

**实施中发现的例外**：`prose-strong:` 与 `prose-code:` 两个修饰**不能**删。typography 插件带有 `:where(blockquote strong) { color: inherit }` 一类规则，原先靠这两个工具类的优先级压过它；仅靠 `--tw-prose-bold` / `--tw-prose-code` 变量时，blockquote 内的 `strong`/`code` 会退回继承引用块颜色，绿色丢失（回归比对在 `python6/functions` 抓到 5 处）。故这两个修饰予以保留，其余（`prose-p:`、`prose-headings:`、`prose-li:`、`prose-blockquote:` 的着色部分）仍全部删除。

### D7 Monaco 直接传动态 `theme` prop

已核实 `@monaco-editor/react@4.7.0` 源码：内部 `useUpdate(() => monaco.editor.setTheme(theme), [theme], isEditorReady)`，`theme` prop 本身响应式。`ExerciseEditor.tsx` 把写死的 `"vs-dark"` 换成随主题取 `vs-dark` / `vs` 即可，无需手动调 Monaco API。

### D8 分三阶段落地，每阶段可独立验证

1. **建地基**：token 定义 + 内联脚本 + 主题 store + 顶栏切换器。此时组件未改，浅色下大部分区域仍是深色——**故意的**，用于验证切换链路本身通不通。
2. **批次替换**：按目录分批（`app/` → `components/` → `components/lesson/`），每批跑一次 `tsc` + `lint` + 回归。
3. **收口**：`prose` 变量接管、Monaco、对比度审计、两主题全量回归。

不一次性替换 244 处：单个巨型 diff 无法 review，出问题也无法二分定位。

### D9 完成判据用 grep 断言，不靠人眼

阶段 2 结束后，`src/**/*.tsx` 中不得再出现 `-(slate|gray)-\d+` 形式的类名（当前 244 处 → 0）。这是可执行的硬判据，避免「看着差不多就算改完」。

## Risks / Trade-offs

- **244 处手工替换必然有遗漏** → D9 的 grep 断言兜底；漏改的表现是浅色下局部仍深色，视觉上刺眼、容易发现，不是静默失败。
- **浅色下半透明绿底/阴影可能过淡或过脏**（`bg-emerald-500/8`、`shadow-emerald-500/10` 等约 20 处）→ 这类不参与自动替换，阶段 3 逐处目视，必要时给浅色单独值。
- **`.bg-tech-grid` 网格线是 `rgba(52,211,153,0.04)`，白底上肉眼不可见** → 拆成 token，浅色下提高不透明度或改用中性灰网格。
- **回归成本翻倍**：现有 5 套 Playwright 断言需两主题各跑一遍 → 断言脚本参数化主题，而非复制一份。
- **一处既有缺陷已确认纳入本次范围**：`text-slate-500` 在 `slate-950` 上实测 4.24:1，低于 AA 4.5:1，8 处。属预先存在问题，用户已确认顺手修掉——token 化时并入 `text-subtle`（深色取 `slate-400`，实测 7.87:1），改动落在同一批文件内，边际成本接近零。**此为唯一一处刻意的范围扩大**，需在提交说明中单独点出，避免被误认为纯机械替换。
- **主题切换瞬间 Monaco 会重绘**，编辑器内容不丢但会有一帧闪烁 → 可接受，不做额外处理。

## Migration Plan

无数据迁移。新增 localStorage key（默认缺失=深色），老用户无感知。

**回滚**：三个阶段各自是独立 commit；阶段 1 单独回滚只会移除切换按钮，阶段 2/3 回滚需整体 revert。因阶段 2 是纯类名替换、无逻辑改动，revert 风险低。

## Open Questions

1. ~~既有的 `text-slate-500` 对比度不达标是否一并修掉？~~ **已定（2026-08-25）：修**。8 处并入 `text-subtle`，深色取 `slate-400`（7.87:1），两套主题均达 AA。
2. 切换图标用「太阳/月亮」还是「亮度」单图标？默认按当前主题显示「切到另一个」的图标（深色时显示太阳）。实施时若无异议按默认执行。
3. 是否需要在首次切换到浅色时给一次提示？默认不加。
