# python-lab 项目规范

## 项目定位

本项目把 `walter201230/Python` 原教程组织为浏览器中的 Python 学习站，接收教学正文、课程编排和练习配置，交付完整阅读页与可运行、可判分的闯关页，服务零基础学习者。应用以静态文件部署，Python 在浏览器 Web Worker 中运行，学习进度仅保存在本地浏览器，无后端和账号系统。

## 目录结构与路径边界

项目绝对路径：`/Users/walter/project/python-tutorial/python-lab`。本目录是独立 Git 仓库，应用工作目录为 `web/`。

```text
python-lab/
├── AGENTS.md              # 仓库长期规则，唯一内容源
├── CLAUDE.md              # 指向 AGENTS.md 的兼容入口
├── README.md              # 项目介绍与使用入口
├── docs/                  # 项目专属文档、带失效说明的历史资料
├── openspec/              # 唯一 OpenSpec 根目录
│   ├── README.md          # 当前规范索引与历史路径解释
│   ├── specs/             # 与当前实现一致的功能约束
│   └── changes/archive/   # 历史方案与原始验收记录
└── web/
    ├── AGENTS.md          # Web 局部工程约束
    ├── CLAUDE.md          # 指向同目录 AGENTS.md
    ├── README.md          # 开发、目录说明与当前部署入口
    ├── package.json       # 命令、依赖与 pnpm 版本
    ├── pnpm-lock.yaml     # 唯一应用依赖锁文件
    ├── src/               # 路由、组件、判分与进度逻辑
    ├── content/lessons/   # 教学 steps、练习 exercises 与 lesson.json
    ├── public/            # 静态源文件及脚本生成的运行时资源
    └── scripts/           # 资源复制、内容及课程目录校验、回归测试与 sitemap 生成
```

`.next/`、`out/`、`node_modules/`、`public/pyodide/`、`public/monaco/` 均为 `web/` 内的本地产物，不入库；后两者由 `predev/prebuild` 生成，不手工维护。`.claude/` 等工具配置不是产品代码，不作为功能规范来源。

原教程仓库为相邻的 `../Python/`；涉及同源教学修正时检查两仓，其他任务保持其只读。工作区状态与实施证据归父目录 `../ROADMAP.md`、`../log/`，不随本仓提交。独立克隆本仓时，项目说明与功能规范仍由本仓提供。

## 核心工作流

```text
读取本规范 + 工作区 ROADMAP（存在时）+ Git 状态
  ↓
涉及 Web → 读取 web/AGENTS.md 与 web/README.md
涉及功能约束 → 查 openspec/README.md；OpenSpec 命令在仓库根运行
  ↓
明确范围、验收方式
  ├─ 产品方向未定或扩大范围 → ⏸ 确认
  └─ 已授权 → 实施；更新受影响的当前规范与使用说明
  ↓
在 web/ 执行 pnpm check；pnpm build 自动先检查再静态导出
  ↓
../log/ 保存证据 → ../ROADMAP.md 更新当前状态 → 交付
  └─ 提交、推送、部署须在各自明确授权范围内执行
```

详细命令见 [Web 开发说明](/Users/walter/project/python-tutorial/python-lab/web/README.md) ，功能入口见 [OpenSpec 索引](/Users/walter/project/python-tutorial/python-lab/openspec/README.md) 。

## 文档维护约定

- 长期工程边界维护在本文件，Web 专属细节维护在 `web/AGENTS.md`，不复制工作区全局规则。
- 当前功能要求统一维护在根目录 `openspec/specs/`，不再创建 `web/openspec/`；历史方案保存在 `openspec/changes/archive/`，归档日期不冒充实施日期。
- 用户介绍归根 README；开发与当前部署命令只在 Web README 维护，其他文档通过链接引用。
- 已失效的部署说明放 `docs/archive/`，由同目录说明标明适用旧架构，不能作为现行操作入口。
- 当前进展、阻塞与详细验证分别记录在工作区 `ROADMAP.md`、`log/session-YYYY-MM-DD-<task>.md`；历史证据保留原始事实，不反写成新验证。
- 结构整理收尾须逐项核对移动前后的历史文件，保留恢复证据；提交前显式包含根目录 AGENTS.md、CLAUDE.md 与规范索引，不能只提交旧路径的删除。提交与推送仍各自等待授权。
- 目录或入口变化时同步维护本页目录图、README 和 OpenSpec 索引。
