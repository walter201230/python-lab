# deployment Specification

## Purpose

定义本项目的部署形态边界：以 Next.js 静态导出（`output: 'export'`）产出纯静态资产，由 Cloudflare Pages CDN 托管，不依赖 Node runtime、后台进程或持久磁盘。约束 build 产物的完整性与平台选型。

应用命令均在仓库内 `web/` 执行，以下 `out/` 指 `web/out/`。当前部署命令与平台配置的唯一维护入口为 [Web README](../../../web/README.md) 。

## Requirements
### Requirement: 发布构建前自动检查

`pnpm build` MUST 在静态构建前通过 `pnpm check` 执行回归测试、教学内容与课程目录校验、路由类型生成与 TypeScript 检查、lint；任一检查失败 MUST 非零退出，不继续导出。检查仅依赖本仓库文件，不要求相邻 Python 仓库。

#### Scenario: 课程目录和内容不一致

- **WHEN** 已发布课程缺少内容，或内容未登记到课程目录
- **THEN** 构建前校验失败，构建链不继续执行 `next build`

### Requirement: 项目必须以纯静态产物部署

`next build` MUST 在仓库内产出 `out/` 目录（由 `output: 'export'` 配置驱动），目录内容 MUST 可由任何静态文件托管平台（Cloudflare Pages、Netlify、Vercel 静态托管等）直接 serve，且 MUST NOT 依赖 Node runtime、后台进程或持久磁盘。

#### Scenario: 构建产物完整覆盖所有可用 lesson 路径

- **WHEN** 开发者在 `web/` 目录执行 `pnpm build`
- **THEN** `out/index.html` 存在
- **AND** 对每个 `chapters.ts` 中 `status === 'available'` 的章节的每个 lesson，`out/lessons/<chapter-slug>/<lesson-id>/index.html` 都存在且非空
- **AND** 对同样的每个 lesson，`out/lessons/<chapter-slug>/<lesson-id>/read/index.html` 也存在且非空

#### Scenario: 构建过程不依赖任何后端服务

- **WHEN** `pnpm build` 在没有数据库连接、没有环境变量 `AUTH_JWT_SECRET`、没有任何外部 API 可用的环境下执行
- **THEN** 构建必须成功完成，不报错、不警告"missing env"、不卡 fetch

#### Scenario: 静态产物不包含 server route handler

- **WHEN** 构建完成后检查 `out/` 目录结构
- **THEN** 目录中不存在任何 `route.json` / Worker 函数描述文件
- **AND** 任何指向 `/api/*` 的客户端请求在生产环境下都将得到 404

### Requirement: 部署平台必须为 Cloudflare Pages 纯静态托管

部署 MUST 使用 Cloudflare Pages 的 "directly upload" 或 "Git integration" 模式，安装和构建 MUST 使用 `web/package.json` 指定版本的 pnpm 与 `web/pnpm-lock.yaml`，产物目录 MUST 为 `web/out`。MUST NOT 使用 `@cloudflare/next-on-pages` 适配器或 Cloudflare Workers runtime。

#### Scenario: 构建配置在 Pages 控制台/wrangler 配置中正确声明

- **WHEN** 部署人员在 Cloudflare Pages 控制台配置项目，或使用 `wrangler pages deploy out` 上传
- **THEN** 根目录、构建命令与输出目录按 Web README 的当前配置填写
- **AND** 不需要配置任何环境变量

#### Scenario: 路由形式兼容 CDN 静态服务

- **WHEN** 构建产物被 Cloudflare Pages serve
- **THEN** lesson URL 形如 `/lessons/<chapter>/<lesson>/`（trailing slash）由 `out/lessons/<chapter>/<lesson>/index.html` 直接命中
- **AND** 首页 `/` 由 `out/index.html` 命中

### Requirement: 运行时资源随静态站同源部署

构建前 MUST 通过 `web/scripts/copy-pyodide.mjs` 和 `copy-monaco.mjs` 从依赖复制运行时资源到 `web/public/`，资源生成目录 MUST NOT 作为源文件入库。

#### Scenario: 构建产物包含浏览器运行所需资源

- **WHEN** 安装锁定依赖并完成 `pnpm build`
- **THEN** `out/pyodide/`、`out/monaco/` 与 `out/pyodide.worker.js` 存在
- **AND** Pyodide worker 从同源 `/pyodide/` 初始化运行时
