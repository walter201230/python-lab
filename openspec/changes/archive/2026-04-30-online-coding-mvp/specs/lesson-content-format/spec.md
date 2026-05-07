## ADDED Requirements

### Requirement: 课程目录结构

系统 SHALL 按以下目录结构组织课程内容：每节课一个独立目录，包含 `lesson.json`（结构化元数据）和若干 `steps/NN.mdx`（教学步骤文本）以及若干 `exercises/NN.json`（练习题）。

```
content/lessons/<chapter-slug>/<lesson-slug>/
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

#### Scenario: 加载 python1 hello-world 课程

- **WHEN** 系统访问路径 `/lessons/python1/hello-world`
- **THEN** 服务端读取 `content/lessons/python1/hello-world/lesson.json` 和 `steps/*.mdx` 和 `exercises/*.json`，渲染该课页面

### Requirement: lesson.json schema

系统 SHALL 要求 `lesson.json` 包含以下字段：`id`（kebab-case 唯一标识，与目录同名）、`title`（显示标题）、`chapter`（所属章节 slug）、`order`（章节内排序，整数）、`steps`（步骤文件名数组，按顺序）、`exercises`（练习文件名数组，按顺序）、`estimatedMinutes`（预计学习时长，整数）。

#### Scenario: 合法 lesson.json

- **WHEN** `lesson.json` 内容为 `{"id":"hello-world","title":"第一个 Python 程序","chapter":"python1","order":1,"steps":["01-intro.mdx","02-print.mdx"],"exercises":["01-hello.json","02-greet.json"],"estimatedMinutes":15}`
- **THEN** 系统加载成功并按 steps/exercises 顺序渲染

#### Scenario: 缺失必填字段

- **WHEN** `lesson.json` 缺少 `title` 字段
- **THEN** 内容校验脚本（`pnpm validate-content`）报错并非零退出，CI 阻止合并

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

系统 SHALL 提供一个 CLI 工具 `pnpm validate-content`，扫描 `content/lessons/` 下所有 `lesson.json` 和练习 JSON，按 schema 校验、检查跨文件引用一致性（lesson 引用的 step 文件存在、order 不重复、AST 规则语法合法）。

#### Scenario: 所有内容合法

- **WHEN** 仓库内容全合规，运行 `pnpm validate-content`
- **THEN** 输出 `✓ 校验通过：N 节课，M 道题`，退出码 0

#### Scenario: 内容引用错误

- **WHEN** `lesson.json` 中 `steps: ["99-missing.mdx"]` 但该文件不存在
- **THEN** 输出 `✗ python1/hello-world: step 文件不存在 — 99-missing.mdx`，退出码 1
