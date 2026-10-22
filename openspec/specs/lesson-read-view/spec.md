# lesson-read-view Specification

## Purpose

定义完整阅读页的内容与交互边界。正文来自同一份 `web/content/lessons/`，用户无需解锁即可通读；编辑、运行和判分由闯关页承担。

## Requirements

### Requirement: 完整正文直接可读

每个可用课程 MUST 提供 `/lessons/<chapter>/<lesson>/read/`，按 `blocks` 顺序渲染全部教学步骤，MUST NOT 依据学习进度隐藏、截断或折叠教学正文。

#### Scenario: 新访客读取完整课程

- **WHEN** 无学习进度的用户直接打开阅读页
- **THEN** 所有教学段落可直接阅读，正文存在于构建生成的 HTML 中
- **AND** 已完成全部练习的用户看到相同的教学内容

### Requirement: 练习题面和提示静态展示

阅读页 MUST 展示练习标题、题面及前往闯关页对应题目的链接。存在提示时 MUST 通过默认收起的原生 `details` 展示，MUST NOT 渲染编辑器、判分控件或单独的参考答案面板。

#### Scenario: 读者展开提示

- **WHEN** 阅读页渲染含提示的练习
- **THEN** 题面直接显示，提示内容存在于 HTML 中，但 `details` 不带 `open`
- **AND** 用户可主动展开提示；提示可能包含示例完整代码，不以删除提示来隐藏内容
- **AND** 做题链接指向 `/lessons/<chapter>/<lesson>/#exercise-<id>`

### Requirement: 阅读不启动执行环境或更新进度

阅读页 MUST NOT 主动初始化 Pyodide 或读取、写入学习进度。站点共有的主题等交互不改变该边界。

阅读页代码块 MUST 复用 interactive-lesson 定义的展示规则，代码及语法高亮存在于静态 HTML。复制可由独立客户端组件处理；可运行的教学块继续提供闯关页链接，不在阅读页初始化执行环境。

#### Scenario: 直接进入阅读页

- **WHEN** 用户在新页面直接访问阅读页并滚动、展开提示
- **THEN** 阅读组件不触发 Pyodide worker 初始化，学习进度存储保持不变

### Requirement: 阅读页为课程规范版本

阅读页 canonical MUST 自指，闯关页 canonical MUST 指向对应阅读页，闯关页 MUST NOT 设置 `noindex`。sitemap MUST 仅收录同一课程的阅读页，并继续收录首页和普通说明页。

#### Scenario: 构建课程页面和 sitemap

- **WHEN** 检查任一课程两个页面的导出 HTML
- **THEN** 两页 canonical 均为本站对应 `/read/` 的绝对 URL
- **AND** sitemap 包含该阅读页，排除对应闯关页

### Requirement: 阅读与闯关双向可达

首页 MUST 提供课程的阅读与闯关入口，阅读页与闯关页 MUST 互相提供链接。教学代码块可通过链接引导至闯关页运行。

#### Scenario: 用户选择学习模式

- **WHEN** 用户从首页选择某课
- **THEN** 可以进入完整阅读或闯关，并在课程内切换模式
- **AND** 阅读入口不改变闯关的渐进解锁规则

### Requirement: 阅读导航与静态正文

阅读页 MUST 复用 interactive-lesson 定义的课程导航，全部本章条目可达，上一章／下一章和课程目录链接保持 `/read/` 模式。页底 MUST 提供跨章导航；无练习章节不显示做题邀请。目录交互可使用独立客户端组件，但正文 MUST 继续在静态 HTML 中完整输出，导航 MUST NOT 引入学习进度 store 或 Python 执行环境。

#### Scenario: 长文中途跳转

- **WHEN** 用户在阅读页中间点击下一章或目录中的另一章节
- **THEN** 进入目标章的阅读页，完整正文直接可读，不初始化 Python 环境或改写进度
