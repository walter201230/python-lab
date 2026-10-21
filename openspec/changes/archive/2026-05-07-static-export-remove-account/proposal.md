## Why

当前项目同时具备两条进度持久化路径：客户端 Zustand `persist`（localStorage）+ 服务端 SQLite via `/api/progress`，并配套整套 JWT cookie 账号系统（`/api/auth/{login,register,logout,me}`）。这套账号系统刚搭好，**还没有任何真实用户**，但它强依赖 Node runtime + 持久磁盘（`better-sqlite3`、`cookies()` from `next/headers`），与目标部署平台 Cloudflare Pages 的纯静态托管模型直接冲突。

部署目标已确定为 **Cloudflare Pages 静态托管**（CDN 友好，对 ~10MB Pyodide 资源加载有利；零冷启动；零运维成本）。继续保留账号系统意味着要么放弃 Cloudflare 改用带 Node runtime 的平台，要么改造成 `@cloudflare/next-on-pages` + Cloudflare D1 —— 两者都是为了一个尚无用户的功能而引入显著复杂度。

结论：**为静态导出让路，移除账号系统**。客户端进度 persist 已能独立支撑"做对一题解锁下一题"的核心闭环，账号同步将来需要时可在新平台上重做。

## What Changes

- **新增**：`output: 'export'` 配置 + `generateStaticParams` 枚举所有 lesson 路径，使 `next build` 产出可由 CDN 直接服务的纯静态站点
- **删除**：5 个 API routes（`/api/auth/{login,register,logout,me}`、`/api/progress`）
- **删除**：服务端鉴权与持久化（`src/lib/auth.ts` cookies+JWT、`src/lib/db.ts` better-sqlite3）
- **删除**：客户端账号 hook 与服务端进度同步 hook（`src/lib/useAuth.ts`、`src/lib/useServerProgress.ts`）
- **删除**：登录注册页面、表单组件、顶栏导航入口（`/login`、`/register`、`AuthForm`、`AuthNav`）
- **修改**：清理调用方残留（`layout.tsx`、`LessonLayout.tsx`、`ExerciseCard.tsx`）
- **保留**：客户端 Zustand `persist` 进度（localStorage），所有教学/练习/Pyodide/UI 功能不动

## Capabilities

### New Capabilities
- `deployment`: 项目部署形态——静态导出 + Cloudflare Pages CDN 托管
- `progress-storage`: 用户练习进度的存储边界——仅本地浏览器 localStorage，无服务端同步

### Modified Capabilities
（无：项目刚初始化 OpenSpec，没有既有 specs 需要修改）

## Impact

**代码删除（13 个文件 / 1 整目录）**：
- `src/app/api/`（整目录，含 5 个 route.ts）
- `src/app/login/page.tsx`、`src/app/register/page.tsx`
- `src/components/AuthForm.tsx`、`src/components/AuthNav.tsx`
- `src/lib/auth.ts`、`src/lib/db.ts`、`src/lib/api.ts`
- `src/lib/useAuth.ts`、`src/lib/useServerProgress.ts`

**代码编辑（5 处）**：
- `src/app/layout.tsx` — 删 `AuthNav` 引用与 footer 登录/注册 Link
- `src/components/lesson/LessonLayout.tsx` — 删 `useAuth.refresh` 与 `useServerProgress(meta.id)` 调用
- `src/components/lesson/ExerciseCard.tsx` — 删"登录后云端保存进度"toast 分支
- `src/app/lessons/[chapter]/[lesson]/page.tsx` — 新增 `generateStaticParams`
- `next.config.ts` — 加 `output: 'export'`、`trailingSlash: true`、`images: { unoptimized: true }`

**依赖卸载**：`bcryptjs`、`better-sqlite3`、`jose`、`zod`、`@types/bcryptjs`、`@types/better-sqlite3`

**用户面影响**：
- 顶栏不再显示登录/注册入口
- 进度仅保存在当前浏览器 localStorage；换浏览器/设备/清缓存会丢
- 其余功能完全不变（教学、练习、判分、解锁、Pyodide、Monaco、TOC、快捷键）

**运行时数据**：本地 `data/app.db` 文件不再被读写（保留磁盘文件不影响构建，但建议 `.gitignore` 已忽略 → 部署不会上传）
