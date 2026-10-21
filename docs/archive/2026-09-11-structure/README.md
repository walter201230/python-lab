# 结构整理前的历史文档

这些文件于 2026-09-11 归档，日期表示归档时间，不表示功能实施时间。文件原文保留，仅供追溯，不是现行要求或可执行的部署入口。

| 历史文件 | 整理前位置 | 失效或变化原因 |
|---|---|---|
| [DEPLOY-cvm.md](DEPLOY-cvm.md) | `web/DEPLOY.md` | 当前站点已静态导出，不再运行 CVM、PM2、SQLite 或账号后端 |
| [user-auth-spec.md](user-auth-spec.md) | `openspec/specs/user-auth/spec.md` | 账号功能已移除，当前以浏览器本地进度规范为准 |
| [interactive-lesson-spec.md](interactive-lesson-spec.md) | `openspec/specs/interactive-lesson/spec.md` | 左右分栏、下一步按钮及旧 localStorage 结构与当前实现不一致 |
| [lesson-content-format-spec.md](lesson-content-format-spec.md) | `openspec/specs/lesson-content-format/spec.md` | 示例路径及校验范围描述需按实际内容和脚本校准 |

旧广告审查引用的 `interactive-lesson` 行号对应本目录的历史副本，不能据此覆盖当前闯关规则。现行功能规范见 [OpenSpec 索引](../../../openspec/README.md) ，当前部署命令见 [Web README](../../../web/README.md) 。
