# web — learn-py.org 站点源码

Next.js 16 静态导出应用，[learn-py.org](https://learn-py.org) 的全部源码。项目介绍、技术栈与反馈入口见[仓库根 README](../README.md)。

## 本地开发

```bash
pnpm install
pnpm dev                            # http://localhost:3000
pnpm build                          # 静态导出到 out/（含 postbuild 生成 sitemap）
pnpm tsc --noEmit && pnpm lint      # 类型 + lint
npm run validate-content            # 校验 content/lessons/ 数据
```

## 目录速览

```
src/components/lesson/   课程页核心：渐进解锁布局（LessonLayout）、练习卡（ExerciseCard）、
                         教学块试运行（RunnableCodeBlock）
src/lib/                 Pyodide worker 单例 + hook（pyodideSingleton / usePyodide）、
                         判分纯函数（grader）、课程加载（loadLesson）
src/store/progress.ts    进度存储（zustand + persist localStorage，唯一进度来源）
public/pyodide.worker.js 代码执行 worker：练习隔离命名空间 / 教学块共享累积，
                         run 串行化 + runId 路由（详见文件内注释）
content/lessons/         <chapter>/<lesson>/{lesson.json, steps/*.mdx, exercises/*.json}
```

## 搜索摘要维护

每门课程的搜索摘要写在 `content/lessons/<chapter>/<lesson>/lesson.json` 的必填字段 `description` 中，仅概括本课实际知识点。闯关页与阅读页的 `generateMetadata` 在其后补充各自的页面说明，生成 `<meta name="description">`，并同步到 Open Graph 和 Twitter 描述。无练习题的章节使用阅读说明，不宣称提供在线判分。

首页摘要在 `src/app/layout.tsx` 的 `metadata.description` 中维护；首页卡片的短介绍仍由 `src/lib/chapters.ts` 管理。修改摘要不会修改教学正文或做题流程。当前首页及 58 个课程页面的完整摘要按 150–160 字符编写；这个范围是本次编辑目标，不是搜索展示保证，后续以准确、自然为先。

更新后运行 `pnpm validate-content`，构建并检查导出 HTML 中的描述、唯一性与页面对应关系；部署后由搜索引擎重新抓取生效。

## 部署到 Cloudflare Pages

本项目为纯静态导出（`next.config.ts` 设 `output: 'export'`），构建产物为 HTML/CSS/JS，
由 Cloudflare Pages 的 CDN 直接托管，无 Node runtime、无后端服务。

### 构建配置

- **构建命令**：`pnpm install && pnpm build`
- **构建输出目录**：`out`
- **Node 版本**：≥ 20（建议 22 LTS）
- **环境变量**：无（无账号系统，进度仅保存在浏览器 `localStorage`）

### 两种部署方式

**方式 1：Git 集成（当前生产方式）**

Cloudflare 控制台 → Workers & Pages → Create → Pages → Connect to Git，
绑定本仓库后填上述构建配置。push 到 `main` 即自动构建，约 2 分钟生效。

**方式 2：手动上传**

```bash
pnpm build
npx wrangler pages deploy out --project-name <你的项目名>
```

### 注意事项

- 路由形式为 `/lessons/<chapter>/<lesson>/`（带尾斜杠，CDN 友好）
- Pyodide 资源（~10MB）由 jsdelivr CDN 加载，不占 Cloudflare 流量
- `public/pyodide.worker.js` 无内容哈希、有 HTTP 缓存：改动 worker 消息协议时，
  必须同步递增 `pyodideSingleton.ts` 里 worker URL 的 `?v=N`，否则部署期会出现
  新页面 JS 配旧缓存 worker 的混配
- 进度仅存用户浏览器 `localStorage`：换浏览器/清缓存会丢；这是本站当前的设计折中
