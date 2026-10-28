<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Web 局部约束

项目定位、路径边界、主工作流与文档维护见 [仓库规范](../AGENTS.md) 。本文件只补充应用工程约束。

- 应用工作目录为仓库下的 `web/`，即本文件所在目录；以下路径除非另有说明，均相对于该目录。依赖安装与开发命令在此执行；统一使用 `package.json` 指定版本的 pnpm 和 `pnpm-lock.yaml`，不维护 npm/yarn 锁文件。只运行包脚本并不需要另一种包管理器。
- OpenSpec 的唯一根目录为上一级 `../openspec/`；执行 OpenSpec 命令先回仓库根，不在 `web/` 初始化第二套规范。
- `src/` 为应用逻辑，`content/lessons/<chapter>/<lesson>/` 为内容源；课程路径、lesson/练习 ID 同时用于路由与浏览器进度，变更时须评估旧链接和已有进度。
- `public/pyodide.worker.js` 是手工维护的源文件；`public/pyodide/`、`public/monaco/` 是资源复制脚本生成物。修改 worker 中的 Python 字符串须做等价 CPython 测试与真实 Pyodide 验证；消息协议变化须同步核对 worker URL 的版本参数。
- 验证入口：`pnpm check` 顺序执行测试、内容及课程目录校验、路由类型生成与类型检查、lint；`pnpm build` 自动先运行相同检查再生成资源和静态导出。类型生成会写 `.next/`，不要占用其他会话的 `.next/`、`out/`，必要时在任务隔离副本验证。
- 课程身份必须在 `src/lib/chapters.ts`、课程目录和 lesson.json 之间一致；lesson id 为进度存储键，全站不可重复。两仓跳转目标的联合核验按工作区规范单独执行，不使生产构建依赖另一仓库。
- 修改前读取规范、Git 状态与对应 Next 本地文档 → 实施 → 必要检查 → 更新受影响的规范和 Web README → 工作区日志与状态交付。新产品方向或授权外操作为 ⏸ 确认点。
