## 1. 拔引用（让代码不再依赖即将删除的模块）

- [x] 1.1 `src/app/layout.tsx`：删 `import { AuthNav } from '@/components/AuthNav'`、`<AuthNav />` 渲染、footer 中 `/login` 与 `/register` Link
- [x] 1.2 `src/components/lesson/LessonLayout.tsx`：删 `import { useAuth } from '@/lib/useAuth'`、`import { useServerProgress } from '@/lib/useServerProgress'`、`refreshAuth = useAuth(...)`、`useServerProgress(meta.id)`
- [x] 1.3 `src/components/lesson/ExerciseCard.tsx`：删 `import { useAuth }` 与第 81-82 行的"登录后云端保存进度"toast 分支
- [x] 1.4 跑 `pnpm tsc --noEmit` 与 `pnpm lint`，确认 1.1-1.3 完成后没有引用错误

## 2. 删除文件（无引用后的清理）

- [x] 2.1 删除 `src/app/api/` 整目录（5 个 route.ts）
- [x] 2.2 删除 `src/app/login/page.tsx`、`src/app/register/page.tsx` 及空目录
- [x] 2.3 删除 `src/components/AuthForm.tsx`、`src/components/AuthNav.tsx`
- [x] 2.4 删除 `src/lib/auth.ts`、`src/lib/db.ts`、`src/lib/api.ts`
- [x] 2.5 删除 `src/lib/useAuth.ts`、`src/lib/useServerProgress.ts`
- [x] 2.6 跑 `pnpm tsc --noEmit` + `pnpm lint`，再次确认无残留引用

## 3. 卸载依赖

- [x] 3.1 `pnpm remove bcryptjs better-sqlite3 jose zod @types/bcryptjs @types/better-sqlite3`
- [x] 3.2 检查 `package.json` / `pnpm-lock.yaml` 确认这些依赖已移除
- [x] 3.3 跑 `pnpm install` 确认 lockfile 一致

## 4. 接通静态导出

- [x] 4.1 `next.config.ts` 加 `output: 'export'`、`trailingSlash: true`、`images: { unoptimized: true }`
- [x] 4.2 `src/app/lessons/[chapter]/[lesson]/page.tsx` 新增 `generateStaticParams`，从 `CHAPTERS` 展开（仅 `status === 'available'`）
- [x] 4.3 `pnpm build` 跑通，产物落到 `out/` 目录
- [x] 4.4 `out/` 下肉眼检查：首页 `out/index.html`、若干 lesson `out/lessons/<chapter>/<lesson>/index.html` 都存在且非空

## 5. 功能回归（构建产物本地预览）

- [x] 5.1 `python3 -m http.server 4173`（在 `out/` 内）起本地静态服务器
- [x] 5.2 Playwright 脚本访问 `/`、`/lessons/python1/intro-and-hello-world/`：截图视觉无回归
- [x] 5.3 Pyodide 资源由 CDN 加载，托管侧无关；本回归不阻塞通过判定
- [x] 5.4 lesson 页加载即触发 `ensureLesson`，`localStorage` 出现 `lesson-progress` key（Zustand persist 正常）
- [x] 5.5 顶栏 + footer 无登录/注册文案
- [x] 5.6 整个会话 0 个 `/api/*` 请求；手动 fetch `/api/auth/me` 返回 404

## 6. 部署文档与收尾

- [ ] 6.1 `README.md` 加一节"部署到 Cloudflare Pages"：构建命令 `pnpm build`、产物目录 `out`、Node 版本要求
- [ ] 6.2 删 `data/app.db`（如果存在）与 `.env` 中 `AUTH_JWT_SECRET` 行（如果用户希望本地清理；可作为可选步骤）
- [ ] 6.3 archive change：`openspec archive static-export-remove-account` 把 `deployment` 与 `progress-storage` capability 写入 main specs
