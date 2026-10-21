# web — learn-py.org 站点源码

Next.js 16 静态导出应用，[learn-py.org](https://learn-py.org) 的全部源码。项目介绍、技术栈与反馈入口见[仓库根 README](../README.md)。

## 本地开发

在本目录执行命令，使用 `package.json` 声明的 pnpm 10.33.0；依赖版本由唯一锁文件 `pnpm-lock.yaml` 固定。

```bash
pnpm install
pnpm dev                            # http://localhost:3000
pnpm check                          # 测试、内容及课程目录、类型、lint
pnpm build                          # 自动先 check，再导出 out/ 并生成 sitemap
pnpm validate-content               # 单独检查教学配置与课程目录一致性
pnpm typecheck                      # 生成路由类型，再检查 TypeScript
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
public/pyodide/          predev/prebuild 从依赖复制的 Pyodide 资源，不入库
public/monaco/           predev/prebuild 从依赖复制的编辑器资源，不入库
scripts/                资源复制、内容及课程目录校验、回归测试、静态 sitemap 生成
content/lessons/         <chapter>/<lesson>/{lesson.json, steps/*.mdx, exercises/*.json}
```

项目规范见 [仓库 AGENTS.md](../AGENTS.md) 与 [Web 局部约束](AGENTS.md) 。功能规范统一位于 [仓库根 openspec/](../openspec/README.md) ；OpenSpec 命令在仓库根执行。

当前静态站无需配置 JWT、SQLite 或其他环境变量。预览导出产物时，在构建后执行 `python3 -m http.server 3000 --bind 127.0.0.1 --directory out`，访问 `http://127.0.0.1:3000/`；该预览命令需要本机 Python 3。静态导出不使用 `next start`。

## 发布前检查

`pnpm build` 的 prebuild 会先运行 `pnpm check`；测试、内容与课程目录校验、类型检查或 lint 有任一错误即停止，Cloudflare 的现有构建命令也会经过这些检查。`pnpm typecheck` 调用 `next typegen` 生成 `.next/types`，正在运行其他会话的开发服务器时应在隔离副本执行。

课程目录的章节 slug 和 lesson id 必须唯一，lesson.json 的 chapter／id 必须与目录一致；可用课程不能缺少内容，磁盘中的课程不能漏登。展示标题及首页短介绍仍可与正文标题、搜索摘要分别维护。此检查不需要相邻仓库；两仓旧站跳转目标的联合检查见工作区规范或原教程 README。

## 搜索摘要维护

每门课程的搜索摘要写在 `content/lessons/<chapter>/<lesson>/lesson.json` 的必填字段 `description` 中，仅概括本课实际知识点。闯关页与阅读页的 `generateMetadata` 在其后补充各自的页面说明，生成 `<meta name="description">`，并同步到 Open Graph 和 Twitter 描述。无练习题的章节使用阅读说明，不宣称提供在线判分。

首页摘要在 `src/app/layout.tsx` 的 `metadata.description` 中维护；首页卡片的短介绍仍由 `src/lib/chapters.ts` 管理。修改摘要不会修改教学正文或做题流程。当前首页及 58 个课程页面的完整摘要按 150–160 字符编写；这个范围是本次编辑目标，不是搜索展示保证，后续以准确、自然为先。

更新后运行 `pnpm validate-content`，构建并检查导出 HTML 中的描述、唯一性与页面对应关系；部署后由搜索引擎重新抓取生效。

## 部署到 Cloudflare Pages

本项目为纯静态导出（`next.config.ts` 设 `output: 'export'`），构建产物为 HTML/CSS/JS，
由 Cloudflare Pages 的 CDN 直接托管，无 Node runtime、无后端服务。

### 构建配置

- **构建命令**：`pnpm install && pnpm build`
- **根目录**：`web`（以下命令均在此目录运行）
- **构建输出目录**：`out`
- **Node 版本**：≥ 20.9.0（Next 依赖声明的最低版本；可使用 Node 22）
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
- Pyodide 和 Monaco 资源由 `predev/prebuild` 从 `node_modules` 复制到 `public/`，随站点同源部署；安装后不要跳过资源复制步骤
- `public/pyodide.worker.js` 无内容哈希、有 HTTP 缓存：改动 worker 消息协议时，
  必须同步递增 `pyodideSingleton.ts` 里 worker URL 的 `?v=N`，否则部署期会出现
  新页面 JS 配旧缓存 worker 的混配
- 进度仅存用户浏览器 `localStorage`：换浏览器/清缓存会丢；这是本站当前的设计折中

旧腾讯云 CVM、PM2、SQLite 部署方案已失效，仅保留在 [历史资料](../docs/archive/2026-09-11-structure/README.md) 中；不适用于当前静态站。
