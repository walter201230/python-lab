# 功能规范与方案索引

本目录是 python-lab 唯一的 OpenSpec 根目录。在 `/Users/walter/project/python-tutorial/python-lab` 执行 OpenSpec 命令，不能在 `web/` 创建第二套规范。

## 当前规范

| 规范 | 职责 |
|---|---|
| [interactive-lesson](specs/interactive-lesson/spec.md) | 闯关页的教学编排、代码执行、判分与解锁 |
| [lesson-content-format](specs/lesson-content-format/spec.md) | 教学内容、练习格式与校验入口 |
| [lesson-read-view](specs/lesson-read-view/spec.md) | 完整阅读、静态题面与提示、课程 canonical 与互链 |
| [progress-storage](specs/progress-storage/spec.md) | 浏览器本地进度、无账号与无服务端同步边界 |
| [theme-switching](specs/theme-switching/spec.md) | 深浅主题、偏好保存与学习状态隔离 |
| [deployment](specs/deployment/spec.md) | 静态导出、资源生成与部署边界 |

验证当前规范：`openspec validate --specs --strict --no-interactive`。应用验证命令见 [Web README](../web/README.md) 。

## 历史方案

历史方案位于 [changes/archive/](changes/archive/) ，保留原始设计与任务勾选，不作为当前待办。2026-09-11 迁入的阅读页和主题方案已有实现及历史验收，旧任务中未勾选的提交确认项保留原貌，不代表本次新增任务。

- [初始交互学习站](changes/archive/2026-04-30-online-coding-mvp/proposal.md)
- [已移除的账号方案](changes/archive/2026-04-30-add-user-auth/proposal.md)
- [静态导出与移除账号](changes/archive/2026-05-07-static-export-remove-account/README.md)
- [完整阅读页](changes/archive/2026-09-11-add-lesson-read-pages/proposal.md)
- [主题切换](changes/archive/2026-09-11-add-theme-switcher/proposal.md)

归档原文中 `src/`、`content/`、`public/`、`out/`、`scripts/` 以及应用命令均以仓库内 `web/` 为基准；旧 `web/openspec/` 已并入本目录。归档中的功能差异以当前 `specs/` 为准，例如阅读页现已包含题面与折叠提示。

旧账号规范及失效部署指南另见 [历史文档索引](../docs/archive/2026-09-11-structure/README.md) 。
