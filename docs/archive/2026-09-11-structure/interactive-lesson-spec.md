# interactive-lesson Specification

## Purpose
TBD - created by archiving change online-coding-mvp. Update Purpose after archive.
## Requirements
### Requirement: 教学步骤渲染

系统 SHALL 把一节课渲染为「分步教学 + 练习题」的混合页面：左侧顺序展示当前教学步骤（markdown 内容，每步占据小于一屏，包含说明文字、可选示意图、可选「跑这段示例」按钮），右侧固定展示当前练习题的代码编辑器和终端。

#### Scenario: 用户进入一节课首页

- **WHEN** 用户访问 `/lessons/python1/hello-world`
- **THEN** 页面左侧显示该课的第 1 个教学步骤（markdown 渲染），右侧显示第 1 道题的初始代码（已填入题目模板代码）和空白终端

#### Scenario: 用户点击「下一步」推进教学

- **WHEN** 用户在左侧教学步骤完成阅读，点击「下一步」按钮
- **THEN** 左侧切换到下一个教学步骤，右侧编辑器和题目状态保持不变

### Requirement: Pyodide 代码运行

系统 SHALL 在用户浏览器中通过 Pyodide（Web Worker 隔离）执行用户编辑器中的 Python 代码，将 stdout/stderr 输出实时显示在右侧终端中。单次执行超时 5 秒，超时强制终止该 Web Worker 并提示「执行超时」。

#### Scenario: 用户点击「运行」按钮

- **WHEN** 用户在编辑器输入 `print("Hello")` 后点击「运行」
- **THEN** Pyodide 在 Web Worker 中执行该代码，终端显示 `Hello\n`，用时 < 1 秒

#### Scenario: 用户代码包含无限循环

- **WHEN** 用户写 `while True: pass` 并点击「运行」
- **THEN** Pyodide Web Worker 在执行 5 秒后被强制终止，终端显示 `执行超时（5 秒），可能是死循环`

#### Scenario: 用户代码抛异常

- **WHEN** 用户写 `print(1 / 0)` 并点击「运行」
- **THEN** 终端显示完整 traceback（`ZeroDivisionError: division by zero`），但不影响下一次运行

### Requirement: 自动判分

系统 SHALL 在用户点击「检查答案」时，按题目配置的判分规则（stdout 匹配 / 变量断言 / AST 检查的任意组合）评估用户代码是否通过，给出「通过 / 未通过 + 一句提示」反馈。

#### Scenario: stdout 完全匹配通过

- **WHEN** 题目 expected_stdout = `"Hello, World!\n"`，用户运行结果 stdout = `"Hello, World!\n"`
- **THEN** 显示绿色「✓ 通过」徽章，并解锁下一题按钮

#### Scenario: stdout 不匹配

- **WHEN** 题目 expected_stdout = `"Hello, World!\n"`，用户运行结果 stdout = `"hello world"`
- **THEN** 显示红色「✗ 未通过 — 输出大小写不一致，注意首字母大写和标点」提示

#### Scenario: 变量值断言通过

- **WHEN** 题目 expected_vars = `{"name": "Alice"}`，用户代码运行后全局变量 `name` 的值为 `"Alice"`
- **THEN** 显示「✓ 通过」徽章

#### Scenario: AST 检查失败

- **WHEN** 题目要求 required_ast = `["FunctionDef:greet"]`，用户代码没有定义 `greet` 函数
- **THEN** 显示「✗ 未通过 — 题目要求你定义一个名叫 greet 的函数」

### Requirement: 提示与查看答案

系统 SHALL 为每道题提供「提示」按钮（按需展开，1-3 条提示渐进展示）和「查看答案」按钮（确认对话框后展示参考答案）。查看答案后用户仍可继续编辑代码，但题目标记「已查看答案」状态（不影响解锁下一题）。

#### Scenario: 用户点击提示

- **WHEN** 用户在第 3 题点击「提示」按钮
- **THEN** 提示面板展开，显示该题的第 1 条提示文本

#### Scenario: 用户点击查看答案

- **WHEN** 用户在第 3 题点击「查看答案」并在确认对话框点「确定」
- **THEN** 编辑器旁打开一个只读的「参考答案」面板显示标准代码，该题状态标记为「已查看答案」

### Requirement: 进度门控（解锁规则）

系统 SHALL 严格按题目顺序解锁——只有当前题判分通过（或显式查看了答案）后，下一题入口才可点击。同一节课内进度 SHALL 持久化在 localStorage（Key 格式 `lesson-progress:<lesson-id>`）。

#### Scenario: 第 1 题未通过时点击第 2 题

- **WHEN** 用户在第 1 题未通过的状态下点击第 2 题入口
- **THEN** 该入口为禁用态（灰色 + 锁图标），点击无反应

#### Scenario: 第 1 题通过后

- **WHEN** 用户第 1 题判分通过
- **THEN** 第 2 题入口变为可点击态，自动跳转到第 2 题，localStorage 保存 `lesson-progress:python1-hello-world` = `{ unlockedExercises: [1, 2] }`

#### Scenario: 用户刷新页面

- **WHEN** 用户已解锁到第 3 题，刷新页面
- **THEN** 系统读取 localStorage 恢复进度，第 1-3 题入口可点击，第 4 题保持锁定

