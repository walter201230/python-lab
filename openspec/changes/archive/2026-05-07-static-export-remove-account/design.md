## Context

`python-lab/web/` 是 Next.js 16 + React 19 单页应用，提供"在浏览器里学 Python"的交互式教程：Pyodide Worker 跑代码、Monaco 写代码、Zustand 持久化进度。当前持久化是双轨的：

- **客户端**：Zustand `persist` middleware → localStorage，store 文件 `src/store/progress.ts`，已是页面的真正"事实源"——所有解锁/判分/已完成状态都从这里读
- **服务端**：`useServerProgress(meta.id)` hook 在 lesson 页 mount 时把 Zustand 状态推送到 `/api/progress`（PUT），登录态下 GET 拉回。背后是 `better-sqlite3` 写本地 `./data/app.db`

账号系统（`/api/auth/*` + `cookies()` JWT）刚搭完，无真实用户。部署目标定为 Cloudflare Pages —— Pages 纯静态托管，不跑 Node、无持久磁盘、不支持 Next.js route handler。

## Goals / Non-Goals

**Goals:**
- 让 `next build` 产出可由 Cloudflare Pages 直接 serve 的静态产物（`out/` 目录）
- 移除一切阻碍静态导出的代码：API routes、`cookies()`、Node-only 依赖
- 保留客户端进度闭环：localStorage 已足够支撑"做对一题解锁下一题"
- 不留死代码：删除组件、hook、依赖必须连带清理调用方

**Non-Goals:**
- **不**改 Pyodide / Monaco / 教学内容渲染管线
- **不**实现替代账号方案（OAuth、匿名 ID 等）—— 留给未来需要时重做
- **不**保留任何"账号占位 stub"或"Coming Soon"页面 —— 全删比留半截更干净
- **不**改 Zustand store 内部结构（`progress.ts`、`useProgressSelector.ts` 不动）
- **不**实现 Cloudflare Pages 的 CI 配置 —— 用户在控制台对接 GitHub 即可

## Decisions

### D1. 走 `output: 'export'` 而非 `@cloudflare/next-on-pages`

| 选项 | 复杂度 | 适配风险 | 长期成本 |
|---|---|---|---|
| `output: 'export'` | ★ | 几乎为零，纯静态 HTML/JS | CDN 服务，零冷启动 |
| `@cloudflare/next-on-pages` | ★★★ | Next 16 + React 19 适配未稳，Workers runtime 限制 | 仍有跑时复杂度 |

由于本项目所有动态行为都已在客户端（Pyodide、Zustand、Monaco），SSR 能力对我们没有功能价值。选最简方案。

### D2. `generateStaticParams` 实现

`src/app/lessons/[chapter]/[lesson]/page.tsx` 的 dynamic segment 必须在 build 时枚举完整路径列表。从 `CHAPTERS`（`src/lib/chapters.ts`）展开：

```ts
export function generateStaticParams() {
  return CHAPTERS
    .filter((ch) => ch.status === 'available')
    .flatMap((ch) => ch.lessons.map((l) => ({ chapter: ch.slug, lesson: l.id })));
}
```

只为 `status === 'available'` 的章节生成。"规划中"章节不出现在静态产物里，配合首页课程卡片已有的 `cursor-not-allowed opacity-50` 视觉表达。

### D3. 删 `useServerProgress` 后 Zustand 状态机的影响

`useServerProgress` 当前的语义：**登录态下**把 Zustand 状态镜像到服务端，**登录后**从服务端 hydrate 回 Zustand。删除后：

- Zustand 仅依赖 `persist` middleware → localStorage（**已经在跑**）
- 不需要改 store 任何代码 —— `useServerProgress` 只是个外挂订阅者
- `LessonLayout` 里删一行 `useServerProgress(meta.id)` 调用即可

`ExerciseCard.tsx:81-82` 那条"登录后云端保存进度"的提示 toast：连同 `useAuth` 一起删，不替换为其他文案（toast 是为登录系统而生，没了登录就没必要显示）。

### D4. 依赖卸载策略

| 包 | 唯一用户 | 删 |
|---|---|---|
| `bcryptjs` + `@types/bcryptjs` | `auth.ts:hashPassword/verifyPassword` | ✅ |
| `jose` | `auth.ts:signToken/verifyToken` | ✅ |
| `better-sqlite3` + `@types/better-sqlite3` | `db.ts` | ✅ |
| `zod` | `api/progress/route.ts` schema、`lib/api.ts:parseJson` | ✅ |

`zod` 已经过 grep 确认只在 API 边界用，没有客户端校验场景。

### D5. `next.config.ts` 配置

```ts
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,           // /lessons/intro/hello/ 形式，CDN 友好
  images: { unoptimized: true }, // 静态导出禁用 Image Optimization
};
```

当前项目无 `next/image` 用例（已 grep 确认），`unoptimized` 是防御性配置。

### D6. 任务执行顺序

为避免编译中间态报错（"删了文件但还有 import"），按 **拆引用 → 删文件 → 卸依赖 → 加配置 → 构建验证** 顺序：

1. 先改 5 处编辑（拔引用）
2. 再删 13 个文件
3. 然后 `pnpm remove ...` 卸依赖
4. 最后加 `output: 'export'` + `generateStaticParams`，跑 `next build`

每步都让 `tsc --noEmit` + `eslint` 通过再继续。

## Risks / Trade-offs

### R1. 进度跨设备/跨浏览器丢失（已接受）
- 风险：用户换浏览器或清缓存后所有进度归零
- 缓解：教学站性质决定这是可接受的折中；后续如果上账号体系，可在 Cloudflare D1 重建

### R2. Git 历史保留旧账号代码（接受）
- 不做 `git filter-branch` 之类历史改写。被删代码以 commit 形式保留在 history，未来需要时可 cherry-pick 参考

### R3. `.env` / `AUTH_JWT_SECRET` 残留
- 不再被任何代码读取，但本地开发者环境可能还有；不需要主动清理（无害）

### R4. `data/app.db` 残留文件
- 已在 `.gitignore`（按 init 时的标准 gitignore 推断），不进 git，不影响部署

### R5. Cloudflare Pages 路由问题
- `trailingSlash: true` 让 lesson URL 形如 `/lessons/intro/hello/`，Cloudflare Pages 默认行为兼容
- 若后续遇到 404，`out/_redirects` 里加 SPA fallback 即可（这次 proposal 不预先加，等真的需要再加）
