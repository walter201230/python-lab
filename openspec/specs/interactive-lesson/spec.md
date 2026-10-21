# interactive-lesson Specification

## Purpose

定义当前闯关页的教学与练习编排、浏览器内执行、自动判分及解锁规则。正文以单列卡片展示，目录和题号提供导航；完整无门控阅读由 lesson-read-view 规范定义。

## Requirements

### Requirement: 教学与练习按课程顺序展示

系统 MUST 按 lesson.json 的 blocks 顺序混合展示教学和练习。未完成当前练习时，正文 MUST 截止到第一个既未通过、也未查看答案的练习；通过或查看答案后继续展示下一段内容，不使用旧版左右分栏和下一步按钮模型。

#### Scenario: 首次进入闯关课程

- **WHEN** 无进度的用户访问 `/lessons/python16/decorator/`
- **THEN** 只展示教学 01、教学 02 与练习 1，后续教学及练习尚不显示

#### Scenario: 推进到下一题

- **WHEN** 用户通过当前练习或确认查看答案
- **THEN** 其后的教学与下一道练习可见，题号和目录导航与解锁状态一致

### Requirement: Python 在浏览器运行

系统 MUST 通过浏览器 Web Worker 中的 Pyodide 执行代码并展示输出或异常，不向服务端上传用户代码。worker 在跨题与跨路由时复用；练习执行使用隔离命名空间，教学试运行可使用累积命名空间。

#### Scenario: 执行普通代码

- **WHEN** 环境就绪后用户运行 `print("Hello")`
- **THEN** 输出区显示 `Hello`，不触发服务端代码执行请求

#### Scenario: 执行超时或异常

- **WHEN** 默认运行配置下代码持续执行超过 5 秒
- **THEN** 显示执行超时提示并终止、重建 worker
- **AND** Python 异常通过输出区展示，后续运行仍可重新发起

### Requirement: 按练习规则判分

点击检查答案时系统 MUST 执行用户代码，并按 grading 中的 stdoutEquals、varsEqual、requiredAst 规则组合判定。所有已配置规则均满足才能通过，失败时 MUST 提供对应诊断。

#### Scenario: 判分通过与未通过

- **WHEN** 用户代码满足题目所有判分规则
- **THEN** 题目标记完成，保存通过时的代码和输出，并解锁下一题
- **AND** 任一规则不满足时不得标记通过

### Requirement: 快捷键操作当前练习

系统 MUST 支持 `⌘/Ctrl + Enter` 运行、`⌘/Ctrl + Shift + Enter` 检查当前练习，并优先于编辑器的默认插行快捷键处理。目标优先采用焦点所在练习，其次采用当前聚焦的题号／目录链接指向的练习，最后采用视口内可见高度最大的练习；没有可见目标时不执行。目标已通过、正在运行或按钮不可用时 MUST NOT 转而操作其他题；练习卡片外的输入控件及输入法组合过程不触发练习操作。

#### Scenario: 在后续题的编辑器中检查答案

- **WHEN** 用户查看第一题答案后，在第二题编辑器按检查快捷键
- **THEN** 仅检查第二题，编辑器不插入空行，第一题不执行

#### Scenario: 在编辑器外操作与禁用状态

- **WHEN** 焦点在第二题题号链接，或没有明确焦点且第二题占据视口主要部分
- **THEN** 快捷键操作第二题，而非页面上第一道未通过的题
- **AND** 当前题按钮不可用时不执行，也不回退操作其他题

### Requirement: 提示与参考答案

闯关页 MUST 支持逐条展开提示，并在确认查看答案后展示参考代码、记录已查看答案状态。查看答案 MUST 解锁下一题，但 MUST NOT 等同于独立通过判分。

#### Scenario: 查看答案继续学习

- **WHEN** 用户确认查看当前练习答案
- **THEN** 该练习进入 viewedSolution，下一题解锁，completed 不因此新增该题

### Requirement: 进度持久化与只读章节

系统 MUST 通过 Zustand persist 的 `lesson-progress` 存储项保存 byLesson 进度，而不是每课单独的 localStorage 键。详细字段和无账号边界见 progress-storage 规范。

#### Scenario: 刷新恢复

- **WHEN** 用户刷新已经解锁部分练习的课程
- **THEN** 从本地进度恢复解锁、完成、查看答案标记，以及通过时保存的代码和输出

#### Scenario: 无练习的概念章节

- **WHEN** 用户进入没有练习的闯关课程
- **THEN** 所有教学内容直接显示，并按现有规则记录 lessonCompleted，不虚构练习或判分入口
