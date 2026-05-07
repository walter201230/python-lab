# Tasks

## 1. 依赖与基础设施

- [x] 1.1 `npm i better-sqlite3 bcryptjs jose zod`，加 `@types/better-sqlite3 @types/bcryptjs` 到 devDeps
- [x] 1.2 加环境变量样例 `web/.env.example`：`AUTH_JWT_SECRET=...`、`SQLITE_PATH=./data/app.db`
- [x] 1.3 `.gitignore` 加 `data/` 和 `.env.local`（项目不上 git，但 `.env.example` 还是要有）
- [x] 1.4 `web/src/lib/db.ts`：better-sqlite3 单例 + 启动时执行 schema migration（CREATE IF NOT EXISTS）

## 2. 认证基础库

- [x] 2.1 `web/src/lib/auth.ts`：`hashPassword(plain)` / `verifyPassword(plain, hash)` 用 bcryptjs；`signToken({uid, username})` / `verifyToken(token)` 用 jose（HS256，30 天过期）
- [x] 2.2 `web/src/lib/auth.ts` 加 `getSession(req | cookies)`：从请求 cookie 解 JWT 返回 `{uid, username} | null`
- [x] 2.3 cookie helper：`setAuthCookie(token)` / `clearAuthCookie()`，配置 httpOnly + sameSite=lax + maxAge=30d，secure 暂时 false（注释说明 HTTPS 上线后改 true）

## 3. API 路由（Next.js Route Handlers）

- [x] 3.1 `app/api/auth/register/route.ts`：POST，zod 校验 `{username, password}` 规则，唯一性检查，bcrypt hash，INSERT users，签 JWT，setCookie，返回 user
- [x] 3.2 `app/api/auth/login/route.ts`：POST，查 user，bcrypt 比对，签 JWT，setCookie，返回 user
- [x] 3.3 `app/api/auth/logout/route.ts`：POST，clearAuthCookie，返回 ok
- [x] 3.4 `app/api/auth/me/route.ts`：GET，getSession，返回 `{user}` 或 `{user: null}`
- [x] 3.5 `app/api/progress/route.ts`：GET（拉当前用户全部进度）+ PUT（upsert 一节课）；未登录 401
- [x] 3.6 所有 route handler 错误统一格式：`{error: '中文消息'}`

## 4. 客户端 hook + store 改造

- [x] 4.1 `web/src/lib/useAuth.ts`：mount 时 fetch /api/auth/me，暴露 `{user, loading, login, register, logout}`；用 zustand 或 useSyncExternalStore 共享给所有组件（避免每个 hook 实例都 fetch 一次）
- [x] 4.2 改 `web/src/store/progress.ts`：加一个 subscriber，在 user 已登录时把 store 变更 debounce 500ms 发 PUT；新增 `hydrateFromServer(progress)` 方法用于登录后初始化
- [x] 4.3 加 `web/src/lib/mergeProgress.ts`：纯函数 `merge(local: LessonProgress, server: LessonProgress): LessonProgress`，按设计 D4 规则
- [x] 4.4 `web/src/components/lesson/LessonLayout.tsx` mount 时：登录态 → fetch /api/progress + 合并 localStorage + PUT 上去 + 写 store；未登录 → 不动
- [x] 4.5 beforeunload 时强制 flush 一次 PUT（fetch with keepalive）

## 5. 页面与 UI

- [x] 5.1 `app/(auth)/login/page.tsx`：用户名/密码表单 + 错误提示 + 跳注册链接
- [x] 5.2 `app/(auth)/register/page.tsx`：用户名/密码表单 + 规则提示 + 跳登录链接
- [x] 5.3 顶部 nav（找到现有 nav 组件）右侧加登录状态：未登录显示「登录 / 注册」；已登录显示用户名 + 退出按钮
- [x] 5.4 `ExerciseCard.tsx`：判分通过且未登录时弹 toast「登录后云端保存进度 →」（一个简单的 fixed 底部 toast，3 秒消失）
- [x] 5.5 已登录访问 /login 或 /register 直接 redirect 到首页

## 6. 部署文档

- [x] 6.1 `web/DEPLOY.md`：CVM 装机步骤（apt install + nvm + Node 18 + PM2）
- [x] 6.2 ecosystem.config.js（PM2 启动配置：name、script、env、log）
- [x] 6.3 nginx vhost 示例（80 → 3000 反代 + 静态资源 immutable 缓存 + limit_req 防注册暴刷）
- [x] 6.4 SQLite 备份 cron 示例（`0 3 * * *` 每日 03:00 cp + 保留 7 天）
- [x] 6.5 升级流程：git pull → npm ci → npm run build → pm2 reload

## 7. 测试

- [x] 7.1 Playwright 端到端：注册新用户 → 做对一题 → 退出 → 重登 → 进度还在
- [x] 7.2 Playwright：未登录做对一题 → toast 出现 → 跳登录 → 注册 → 合并进度 → 已通过题保留
- [x] 7.3 跨浏览器（清 localStorage 模拟换设备）：登录后能拉到之前的进度
- [x] 7.4 输入校验：用户名 < 3 字符 / 包含中文 / 密码 < 6 字符 都返回 400
- [x] 7.5 安全：尝试不带 cookie GET /api/progress → 401；伪造 JWT → 当作 user=null 处理

## 8. Archive

- [x] 8.1 跑 `openspec validate add-user-auth --strict` 全绿
- [ ] 8.2 用户验收（在本地或先在 CVM 部署一次跑全流程）
- [ ] 8.3 `openspec archive add-user-auth`
