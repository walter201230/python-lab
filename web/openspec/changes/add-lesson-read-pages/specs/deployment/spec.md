## MODIFIED Requirements

### Requirement: 项目必须以纯静态产物部署

`next build` MUST 在仓库内产出 `out/` 目录（由 `output: 'export'` 配置驱动），目录内容 MUST 可由任何静态文件托管平台（Cloudflare Pages、Netlify、Vercel 静态托管等）直接 serve，且 MUST NOT 依赖 Node runtime、后台进程或持久磁盘。

#### Scenario: 构建产物完整覆盖所有可用 lesson 路径

- **WHEN** 开发者在 `web/` 目录执行 `pnpm build`
- **THEN** `out/index.html` 存在
- **AND** 对每个 `chapters.ts` 中 `status === 'available'` 的章节的每个 lesson，`out/lessons/<chapter-slug>/<lesson-id>/index.html` 都存在且非空
- **AND** 对同样的每个 lesson，`out/lessons/<chapter-slug>/<lesson-id>/read/index.html` 也都存在且非空

#### Scenario: 构建过程不依赖任何后端服务

- **WHEN** `pnpm build` 在没有数据库连接、没有环境变量 `AUTH_JWT_SECRET`、没有任何外部 API 可用的环境下执行
- **THEN** 构建必须成功完成，不报错、不警告"missing env"、不卡 fetch

#### Scenario: 静态产物不包含 server route handler

- **WHEN** 构建完成后检查 `out/` 目录结构
- **THEN** 目录中不存在任何 `route.json` / Worker 函数描述文件
- **AND** 任何指向 `/api/*` 的客户端请求在生产环境下都将得到 404
