## ADDED Requirements

### Requirement: 项目必须以纯静态产物部署

`next build` MUST 在仓库内产出 `out/` 目录（由 `output: 'export'` 配置驱动），目录内容 MUST 可由任何静态文件托管平台（Cloudflare Pages、Netlify、Vercel 静态托管等）直接 serve，且 MUST NOT 依赖 Node runtime、后台进程或持久磁盘。

#### Scenario: 构建产物完整覆盖所有可用 lesson 路径

- **WHEN** 开发者在 `web/` 目录执行 `pnpm build`
- **THEN** `out/index.html` 存在
- **AND** 对每个 `chapters.ts` 中 `status === 'available'` 的章节的每个 lesson，`out/lessons/<chapter-slug>/<lesson-id>/index.html` 都存在且非空

#### Scenario: 构建过程不依赖任何后端服务

- **WHEN** `pnpm build` 在没有数据库连接、没有环境变量 `AUTH_JWT_SECRET`、没有任何外部 API 可用的环境下执行
- **THEN** 构建必须成功完成，不报错、不警告"missing env"、不卡 fetch

#### Scenario: 静态产物不包含 server route handler

- **WHEN** 构建完成后检查 `out/` 目录结构
- **THEN** 目录中不存在任何 `route.json` / Worker 函数描述文件
- **AND** 任何指向 `/api/*` 的客户端请求在生产环境下都将得到 404

### Requirement: 部署平台必须为 Cloudflare Pages 纯静态托管

部署 MUST 使用 Cloudflare Pages 的 "directly upload" 或 "Git integration" 模式，构建命令 MUST 为 `pnpm build`，产物目录 MUST 为 `out`。MUST NOT 使用 `@cloudflare/next-on-pages` 适配器或 Cloudflare Workers runtime。

#### Scenario: 构建配置在 Pages 控制台/wrangler 配置中正确声明

- **WHEN** 部署人员在 Cloudflare Pages 控制台配置项目，或使用 `wrangler pages deploy out` 上传
- **THEN** 构建命令为 `pnpm install && pnpm build`
- **AND** 构建输出目录为 `out`
- **AND** 不需要配置任何环境变量

#### Scenario: 路由形式兼容 CDN 静态服务

- **WHEN** 构建产物被 Cloudflare Pages serve
- **THEN** lesson URL 形如 `/lessons/<chapter>/<lesson>/`（trailing slash）由 `out/lessons/<chapter>/<lesson>/index.html` 直接命中
- **AND** 首页 `/` 由 `out/index.html` 命中
