This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 部署到 Cloudflare Pages

本项目已配置为静态导出（`next.config.ts` 设 `output: 'export'`），构建产物为纯 HTML/CSS/JS，
可直接由 Cloudflare Pages 的 CDN 托管，无需 Node runtime 或后端服务。

### 构建配置

- **构建命令**：`pnpm install && pnpm build`
- **构建输出目录**：`out`
- **Node 版本**：≥ 20（建议 22 LTS）
- **环境变量**：无（账号系统已移除，进度仅保存在浏览器 `localStorage`）

### 两种部署方式

**方式 1：Git 集成（推荐）**

在 Cloudflare 控制台 → Workers & Pages → Create → Pages → Connect to Git，
绑定本仓库后填上述构建配置，每次推送自动构建。

**方式 2：手动上传**

```bash
pnpm build
npx wrangler pages deploy out --project-name <你的项目名>
```

### 注意事项

- 路由形式为 `/lessons/<chapter>/<lesson>/`（带尾斜杠，CDN 友好）
- Pyodide 资源（~10MB）由 jsdelivr CDN 加载，不占 Cloudflare 流量
- 进度仅保存在用户浏览器 `localStorage`：换浏览器/清缓存会丢；这是本站当前的设计折中
