## Why

当前 python-lab MVP 用 zustand `persist` 把学习进度（哪题通过、提交的代码、运行输出）写到浏览器 localStorage——只在当前浏览器有效，**换设备 / 换浏览器 / 清缓存 → 进度全丢**。准备部署到腾讯云 CVM 正式发布前，必须先解决进度归属问题：每个用户绑定自己的进度，跨设备访问能继续。

## What Changes

- **新增用户系统**：用户名 + 密码两字段（不要邮箱、不要邮箱验证），bcrypt 哈希存库，httpOnly cookie 携带 JWT 维持会话
- **进度持久化层从 localStorage 迁到服务端 SQLite**：登录后从 `GET /api/progress` 拉初值；本地变更通过 `PUT /api/progress` debounce 推送（500ms）；离线/未登录态降级到 localStorage（避免初学者第一次访问就被登录墙挡住）
- **路由保护**：`/lessons/*` 允许游客访问（继续用 localStorage），但**通过判分写入服务器进度需要登录**——未登录时点击「检查答案」弹登录提示
- **新增 4 条 API 路由**：`POST /api/auth/register`、`POST /api/auth/login`、`POST /api/auth/logout`、`GET /api/auth/me`、`GET /api/progress`、`PUT /api/progress`
- **顶部 nav 改造**：右侧加「登录 / 注册」入口；登录后显示用户名 + 退出按钮
- **部署形态确定**：腾讯云 CVM + Node 18+ + PM2 + nginx 反代（80 端口）+ SQLite 单文件（暂不做 HTTPS，等买域名后再加）

## Capabilities

### New Capabilities

- `user-auth`：用户注册、登录、会话、按用户绑定学习进度的完整能力——含 SQLite schema、API 契约、客户端 hook、cookie 策略

### Modified Capabilities

（无 — 现有 `interactive-lesson` 的 localStorage 进度持久化作为「未登录降级方案」保留，spec 不需要改。`user-auth` 在登录态下叠加在它之上，不替换它的核心契约。）

## Impact

- **新增依赖**：`better-sqlite3`（单文件 DB，同步 API 简单）、`bcryptjs`（纯 JS，不用 native compile，CVM 上免编译）、`jose`（JWT 签发/验证，标准 ESM）
- **新增代码**：
  - `web/src/lib/db.ts`（SQLite 单例 + schema migrations）
  - `web/src/lib/auth.ts`（密码哈希、JWT 签发/校验、cookie 工具）
  - `web/src/app/api/auth/{register,login,logout,me}/route.ts`
  - `web/src/app/api/progress/route.ts`
  - `web/src/app/(auth)/{login,register}/page.tsx`
  - `web/src/lib/useAuth.ts`、`web/src/lib/useServerProgress.ts`（取代部分 zustand 职责）
- **修改代码**：
  - `web/src/store/progress.ts`（增加 `syncToServer` 行为：登录后变更 debounce 推送）
  - `web/src/components/lesson/ExerciseCard.tsx`（判分通过且未登录时弹登录提示）
  - 顶部 nav 加登录状态
- **新增部署文档**：`web/DEPLOY.md`（CVM 装机步骤、PM2 配置、nginx vhost、SQLite 备份建议）
- **环境变量**：`AUTH_JWT_SECRET`（随机 64 字节）、`SQLITE_PATH`（默认 `./data/app.db`，CVM 上指向 `/var/lib/python-lab/app.db`）
- **不影响**：现有 lesson 内容、判分逻辑、Pyodide worker、UI 视觉风格 全部不动
- **风险点**：
  1. **better-sqlite3 是 native binding**——CVM 上需要 build-essential + Python 才能 npm install；用 prebuilt binary 通常自动解决，但要在部署文档里写清楚
  2. **未登录降级到 localStorage**——状态合并逻辑要小心：用户先在游客态做了 3 题、然后注册登录，本地 3 题进度需要一次性合并到服务端
  3. **SQLite 单文件备份**——CVM 掉盘进度全丢；MVP 阶段可接受，但部署文档要给每日 cron 备份脚本示例
  4. **cookie 没 secure 标志**（暂无 HTTPS）——MVP 内部测可接受；正式发布买域名上 Let's Encrypt 时把 secure 加上
