## 1. 项目脚手架

- [ ] 1.1 在 `python-lab/` 根下执行 `npx create-next-app@latest app --typescript --tailwind --app --eslint`，子目录命名 `app/`
- [ ] 1.2 安装运行时依赖：`zustand`, `@monaco-editor/react`, `react-markdown`, `remark-gfm`
- [ ] 1.3 安装开发依赖：`@types/node`, `prettier`
- [ ] 1.4 配置 `tsconfig.json` path alias（`@/*` → `src/*`）和 prettier 基础规则
- [ ] 1.5 验证：`pnpm dev` 能起 localhost:3000，看到 Next.js 默认欢迎页

## 2. Pyodide Web Worker 集成

- [ ] 2.1 创建 `src/lib/pyodide-worker.ts`（Web Worker 入口，从 jsdelivr CDN 加载 pyodide v0.25+）
- [ ] 2.2 实现 worker 消息协议：`{type:'run', code, expectedVars?}` → `{type:'result', stdout, stderr, vars, error?}`
- [ ] 2.3 创建 `src/lib/usePyodide.ts` hook 封装：`init()` / `run(code)` / `terminate()`
- [ ] 2.4 实现 5 秒超时机制：主线程 `setTimeout` 触发 → `worker.terminate()` → 立即重启 worker
- [ ] 2.5 验证：dev 环境跑 `print('Hello')` 在 < 1s 返回；跑 `while True: pass` 在 5s 后报「执行超时」

## 3. 内容数据格式与样例

- [ ] 3.1 创建 `content/lessons/` 目录结构骨架
- [ ] 3.2 定义 `src/types/content.ts`（lesson.json + exercise.json 的 TypeScript 类型）
- [ ] 3.3 写 `scripts/validate-content.ts`（按 spec 校验所有 lesson.json + exercise.json + 跨文件引用一致性）
- [ ] 3.4 配置 `package.json` 加 script：`"validate-content": "tsx scripts/validate-content.ts"`
- [ ] 3.5 编写 `python1/hello-world/lesson.json` + 1 个空 step + 1 道空题，跑 `pnpm validate-content` 通过

## 4. 核心 UI 组件

- [ ] 4.1 `src/components/LessonLayout.tsx`：左 step + 右 editor 双栏（< 768px 改为上下两栏）
- [ ] 4.2 `src/components/StepNavigator.tsx`：分步 prev/next 按钮 + 当前进度指示器
- [ ] 4.3 `src/components/CodeEditor.tsx`：Monaco wrapper，受控 value，Python 语法高亮
- [ ] 4.4 `src/components/Terminal.tsx`：等宽字体输出展示，区分 stdout/stderr 颜色
- [ ] 4.5 `src/components/ExerciseHeader.tsx`：题目标题、prompt markdown 渲染、提示按钮、查看答案按钮
- [ ] 4.6 `src/components/GradingResult.tsx`：通过 / 未通过徽章 + 提示文本

## 5. 判分系统

- [ ] 5.1 `src/lib/grader.ts`：纯函数 `grade(actual, rules) → {pass, msg}`
- [ ] 5.2 实现 `stdoutEquals` 规则
- [ ] 5.3 实现 `varsEqual` 规则（通过 Pyodide `globals.toJs()` 取变量后逐 key 对比）
- [ ] 5.4 实现 `requiredAst` 规则（在 worker 里 `import ast; ast.parse(code)` 然后递归检查）
- [ ] 5.5 写 vitest unit test：3 类规则各 2 道样例题验证判分准确（pass/fail 各一个）

## 6. 进度门控

- [ ] 6.1 `src/store/progress.ts`：zustand store，state 形如 `{ unlockedExerciseIds: string[], completedExerciseIds: string[], viewedSolutionIds: string[] }`
- [ ] 6.2 zustand persist middleware → localStorage（key: `lesson-progress:<lesson-id>`）
- [ ] 6.3 unlock 规则：当前题判分通过 OR 查看答案 → 把下一题加入 unlockedExerciseIds
- [ ] 6.4 题目入口 UI 禁用态（灰色 + 锁图标，点击无反应）
- [ ] 6.5 验证：刷新页面进度恢复

## 7. UX 细节

- [ ] 7.1 Pyodide 加载 splash 屏（首次进入显示「加载 Python 中... 大约 10 秒」）
- [ ] 7.2 Service Worker 缓存 Pyodide WASM（基于 next-pwa 或自写 SW）
- [ ] 7.3 编辑器代码本地暂存（localStorage key: `editor-draft:<exercise-id>`，每次输入 debounce 500ms 保存）
- [ ] 7.4 提示按钮：渐进展开 1-3 条提示
- [ ] 7.5 查看答案：确认 dialog → 旁开只读面板展示 solution

## 8. 内容编写（python1 5 道题）

- [ ] 8.1 题 1：打印 Hello, World!（`stdoutEquals: "Hello, World!\n"`）
- [ ] 8.2 题 2：变量赋值并打印（`varsEqual: {name:"两点水"}` + `stdoutEquals`）
- [ ] 8.3 题 3：基础算术 + print（`stdoutEquals`）
- [ ] 8.4 题 4：字符串拼接（`varsEqual`）
- [ ] 8.5 题 5：综合 — 接收 input + 计算 + 输出（多规则组合）
- [ ] 8.6 写 5 个 step .mdx（每步 < 1 屏，自然衔接到对应题目）
- [ ] 8.7 跑 `pnpm validate-content` 全通过

## 9. 部署（方案待用户确定）

- [ ] 9.1 跟用户对齐部署方案（自建 VPS / 内网 / Docker / nginx 反代等），更新 design.md D6 决策
- [ ] 9.2 根据方案写 Dockerfile 或 build/start 脚本
- [ ] 9.3 配置生产构建：`pnpm build && pnpm start` 或 `next export` 静态导出
- [ ] 9.4 部署 + 验证 MVP 全链路（教学渲染 → Pyodide 加载 → 编辑器 → 运行 → 判分 → 解锁）跑通

## 10. MVP 收尾

- [ ] 10.1 README.md：写明项目目的、本地运行步骤、部署步骤、内容编写规范
- [ ] 10.2 跑通完整用户旅程：从首页 → 进入第一节课 → 5 道题全部通过 → 看结束页面
- [ ] 10.3 评估 ROI：决定是否继续铺其他章节，或调整方向
