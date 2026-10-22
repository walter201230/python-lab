# lesson-content-format Specification

## Purpose
定义 `web/content/lessons/` 中教学步骤、课程编排和练习配置的格式。应用命令在 `web/` 执行；校验入口为 `web/scripts/validate-content.ts`，类型定义为 `web/src/types/content.ts`。
## Requirements
### Requirement: 原文注释与代码原样保留

教学正文 MUST 保留作者文字，来源映射放在独立数据文件中，不向正文添加来源包装或施工标记。阅读页和闯关页 MUST 在 Markdown 渲染阶段隐藏完整 HTML 注释节点，包括原有 skip-ci 注释。此处理 MUST 保留代码块、行内代码中的注释字符串，以及不属于完整注释的原有文本；不得直接用全文正则改写正文源文件。

#### Scenario: 来源注释不出现在教学正文

- **WHEN** 教学步骤包含独立或行内的完整 HTML 注释
- **THEN** 两种页面均隐藏注释，前后正文仍保留

#### Scenario: 代码与未闭合文本保持

- **WHEN** Python 示例的字符串包含 HTML 注释文字，或普通正文存在未闭合的注释样式文本
- **THEN** 代码内容和未闭合文本保持可见，不影响原有教学表达

### Requirement: 课程目录结构

系统 SHALL 按以下目录结构组织课程内容：每节课一个独立目录，包含 `lesson.json`（结构化元数据）和若干 `steps/NN.mdx`（教学步骤文本）以及若干 `exercises/NN.json`（练习题）。

```
web/content/lessons/<chapter-slug>/<lesson-slug>/
  ├── lesson.json
  ├── steps/
  │   ├── 01-intro.mdx
  │   ├── 02-syntax.mdx
  │   └── ...
  └── exercises/
      ├── 01-hello-world.json
      ├── 02-variables.json
      └── ...
```

#### Scenario: 加载第一课

- **WHEN** 构建 `/lessons/python1/intro-and-hello-world/` 页面
- **THEN** 构建阶段读取 `web/content/lessons/python1/intro-and-hello-world/lesson.json`，按 `blocks` 顺序加载引用的教学和练习文件，渲染静态页面

### Requirement: lesson.json schema

系统 SHALL 要求 `lesson.json` 包含以下字段：`id`（kebab-case 唯一标识，与目录同名）、`title`（显示标题）、`description`（非空课程摘要，供搜索元数据使用）、`chapter`（所属章节 slug）、`order`（章节内排序，整数）、`blocks`（按展示顺序排列的教学与练习引用，每项包含 `kind` 和 `file`）、`estimatedMinutes`（预计学习时长，整数）。

#### Scenario: 合法 lesson.json

- **WHEN** `lesson.json` 内容为 `{"id":"hello-world","title":"第一个 Python 程序","description":"认识 Python，学习 print 的基本用法，通过第一个 Hello World 程序理解代码与输出的关系。","chapter":"python1","order":1,"blocks":[{"kind":"step","file":"01-intro.mdx"},{"kind":"step","file":"02-print.mdx"},{"kind":"exercise","file":"01-hello.json"},{"kind":"exercise","file":"02-greet.json"}],"estimatedMinutes":15}`
- **THEN** 系统加载成功并按 blocks 顺序渲染；课程摘要仅由元数据生成逻辑消费，不作为教学正文展示

#### Scenario: 课程摘要缺失或无效

- **WHEN** `description` 缺失、不是字符串，或去除空白后为空
- **THEN** 内容校验脚本报错并非零退出；新增课程需先填写与实际教学内容对应的摘要

#### Scenario: 缺失必填字段

- **WHEN** `lesson.json` 缺少 `title` 字段
- **THEN** 内容校验脚本（在 `web/` 执行 `pnpm validate-content`）报错并非零退出；修改者须修正后再交付，不假定已有自动合并门禁

### Requirement: 练习题 JSON schema

系统 SHALL 要求每个练习文件包含：`id`（kebab-case）、`title`（题目标题）、`prompt`（题目 markdown 描述）、`starterCode`（编辑器初始代码字符串）、`solution`（参考答案字符串）、`grading`（判分规则对象）、`hints`（提示数组，0-3 条）。

判分规则对象 `grading` SHALL 是以下 3 类规则的一个或多个组合（AND 关系）：
- `stdoutEquals`: string —— 期望 stdout 完全匹配
- `varsEqual`: object —— 期望执行后全局变量值的键值对
- `requiredAst`: string array —— 必须存在的 AST 节点（格式 `<NodeType>:<Name>`，如 `FunctionDef:greet`）

#### Scenario: stdout 判分练习

- **WHEN** 练习 JSON 为 `{"id":"01-hello","title":"打印 Hello World","prompt":"用 print 打印 Hello, World!","starterCode":"# 在这里写代码\n","solution":"print('Hello, World!')","grading":{"stdoutEquals":"Hello, World!\n"},"hints":["用 print 函数","注意大小写和感叹号"]}`
- **THEN** 用户运行后系统按 `stdoutEquals` 规则判分

#### Scenario: 多规则组合判分

- **WHEN** 练习 grading 为 `{"varsEqual":{"name":"Alice"},"requiredAst":["Assign:name"]}`
- **THEN** 必须同时满足「变量 name 值为 Alice」AND「代码包含对 name 的赋值语句」才通过

### Requirement: 内容校验工具

系统 SHALL 提供 CLI 工具 `pnpm validate-content`，扫描 `web/content/lessons/` 下的课程与课程引用的练习 JSON，检查必填字段、课程摘要类型及非空、block 类型、引用文件存在性、判分规则非空和 AST 规则语法。该脚本不等于完整 JSON Schema 验证，不承诺检查所有字段类型或 `order` 唯一性。

#### Scenario: 所有内容合法

- **WHEN** 仓库内容全合规，运行 `pnpm validate-content`
- **THEN** 输出 `✓ 校验通过：N 节课，M 道题`，退出码 0

#### Scenario: 内容引用错误

- **WHEN** `lesson.json` 中 `blocks: [{"kind":"step","file":"99-missing.mdx"}]` 但该文件不存在
- **THEN** 输出 `✗ python1/hello-world: step 文件不存在 — 99-missing.mdx`，退出码 1

### Requirement: 课程目录与内容身份一致

内容校验 MUST 检查 `chapters.ts` 内章节 slug 唯一、lesson id 全站唯一；lesson.json 的 chapter 和 id MUST 与实际目录一致，内容中的 lesson id 也 MUST 全站唯一。可用课程 MUST 有对应内容，每份课程内容 MUST 在目录中登记。首页展示标题和搜索摘要无需逐字相同；尚未发布的 planned 章节允许没有内容。

#### Scenario: 课程身份错位或遗漏

- **WHEN** lesson.json 的 id 与目录名不同、lesson id 重复、已发布课程内容缺失，或内容没有在 chapters.ts 登记
- **THEN** `pnpm validate-content` 输出具体路径和原因并非零退出

### Requirement: 教程编排与代码使用方式

课程 SHALL 按知识点组织完整来源讲解及对应练习，不把重复的精简讲解与完整来源依次铺陈。来源映射保存在 `web/content/source-map.json`，正文不包含施工标记或维护声明。课程与练习 ID、练习相对顺序保持稳定，以兼容既有学习进度。

代码用途 SHALL 在 `web/content/code-examples.json` 单独维护，按在用步骤中的 Python 代码块顺序记录摘要和用途。两种阅读模式 MUST 共用用途判断：独立验证通过的片段可在网页运行；预期报错、语法示意、输出记录、上下文依赖与本地专用片段展示相应说明。未登记的片段不得默认为可运行，`no-run` 优先禁用运行入口。代码围栏语言大小写均须识别。

#### Scenario: 代码不是独立网页示例

- **WHEN** 正文包含 Python 语法模板、输出记录、预期失败、依赖前文对象或线程／进程等本地示例
- **THEN** 阅读页不提供运行跳转，闯关页不提供试运行按钮；正文和代码原样展示，并说明使用方式

#### Scenario: 示例变更后忘记复核

- **WHEN** 在用代码块的数量或摘要与用途清单不一致
- **THEN** 内容检查失败，要求重新审阅和验证；不得沿用旧代码的运行许可

#### Scenario: 旧进度继续学习

- **WHEN** 用户浏览器已有某课程通过或查看答案的题目 ID
- **THEN** 重排讲解后仍按相同课程及练习 ID 恢复进度，题目相对顺序与下一题关系保持

### Requirement: 原文章节分段显示

系统 MUST 支持 step 引用中的可选 `section`，以原文件中完整二／三级 Markdown 标题行定位分段边界；`$intro` 表示第一个边界前的引入。分段只影响显示，不改源文件文字，未选作边界的标题仍留在所在段落。代码围栏中的标题样式文本不得作为边界。所有分段 MUST 完整、唯一、按原文顺序覆盖全文，且不得同时整篇展示。引用的标题缺失、重名、重复或倒序 MUST 阻断校验。代码用途按原文件代码位置截取，不能从每段重新使用第一条用途。

#### Scenario: 长章练习衔接

- **WHEN** pathlib、异常、dataclass 等长章按原小节展示
- **THEN** 既有题目在所需讲解后穿插，完整正文可逐段拼回原文件；课程 ID、练习 ID 及题目相对顺序保持

### Requirement: 代码用途的独立验证

用途审阅 MUST 区分语法模板、上下文依赖、预期错误和环境能力；不得因存在报错关键词或导入某个标准库就推断用途。恢复网页运行必须通过实际 Pyodide/worker，记录独立预期输出或断言。预期错误须以异常类型或明确失败原因复核，未定义前文名称不自动归为预期错误。渲染入口数量一致不替代分类正确性验证。

#### Scenario: 分类语义回归

- **WHEN** 正常列表拼接或字典查询片段被错误标为预期报错，或独立路径操作被限制为本地运行
- **THEN** 独立断言验证实际输入、结果及预期用途，错误分类使测试失败；全部预期错误均有明确异常类型断言

### Requirement: 正文矢量图

正文图 SHALL 使用仓库内的静态 SVG，配有有意义的替代文字及 SVG title/desc；阅读与闯关模式使用相同组件。图随网站的深浅色切换保持清晰，窄屏允许图内水平滚动，页面不得因图而横向溢出。正文只展示图示，不额外添加放大查看入口。图资产及正文引用通过独立清单校验，不能出现缺图或不同路由加载不同副本。

#### Scenario: 图在两种阅读模式和主题中展示

- **WHEN** 学习者在阅读页或闯关页查看正文 SVG，切换主题或使用窄屏
- **THEN** 图中文字、箭头与节点可读，窄屏可横向查看完整图，目录图不会重新出现
