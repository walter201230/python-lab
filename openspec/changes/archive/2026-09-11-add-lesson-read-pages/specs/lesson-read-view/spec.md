## ADDED Requirements

### Requirement: 每章必须存在一个无门控的完整阅读页

对每个 `chapters.ts` 中 `status === 'available'` 的章节的每个 lesson，系统 MUST 在 `/lessons/<chapter>/<lesson>/read/` 提供一个页面，该页面 MUST 渲染该 lesson `blocks` 中**全部** `kind === 'step'` 的教学内容，且 MUST NOT 依据任何进度、解锁或过关状态隐藏、截断或折叠其中任何一段。

#### Scenario: 静态产物包含全章教学正文

- **WHEN** 执行 `pnpm build` 后检查 `out/lessons/python2/data-types-and-variables/read/index.html`
- **THEN** 文件存在且非空
- **AND** 该 lesson `lesson.json` 中列出的 9 个 step 文件的正文文本全部出现在该 HTML 中
- **AND** HTML 中不出现任何表示内容被锁定的标记（如 `🔒`、「解锁」、「做对当前题」）

#### Scenario: 首次访问者与爬虫看到相同的完整内容

- **WHEN** 在无 localStorage 数据的浏览器上下文（无痕窗口）打开任一章阅读页
- **THEN** 该章全部教学段可直接向下滚动读完
- **AND** 页面内容与 `curl` 取得的静态 HTML 中的教学正文一致

#### Scenario: 阅读页不因进度差异而变化

- **WHEN** 同一章的阅读页分别在「无任何进度」与「全部练习已通过」两种 localStorage 状态下打开
- **THEN** 两次渲染的教学正文内容完全相同

### Requirement: 阅读页必须为纯静态只读形态

阅读页 MUST NOT 加载 Pyodide 运行时，MUST NOT 渲染代码编辑器或判分控件，且 MUST NOT 读取或写入学习进度状态。练习本体 MUST 只在闯关页提供。

#### Scenario: 不触发 Pyodide 下载

- **WHEN** 用户打开任一章阅读页并观察网络请求
- **THEN** 不存在指向 Pyodide CDN 或 `pyodide.worker.js` 的请求

#### Scenario: 不写入进度存储

- **WHEN** 用户打开阅读页、滚动读完全章后关闭页面
- **THEN** localStorage 中的进度数据与打开前完全一致

#### Scenario: 练习位置渲染为跳转入口

- **WHEN** 阅读页遍历到 `kind === 'exercise'` 的 block
- **THEN** 页面显示该练习的标题与一个指向 `/lessons/<chapter>/<lesson>/#exercise-<id>` 的链接
- **AND** 不渲染代码编辑器、提示、判分按钮或答案

### Requirement: 阅读页必须是两个同源页面的规范版本

闯关页与阅读页内容同源，系统 MUST 将阅读页声明为规范版本：阅读页的 `canonical` MUST 自指，闯关页的 `canonical` MUST 指向对应阅读页。闯关页 MUST NOT 使用 `noindex`。

#### Scenario: 闯关页 canonical 指向阅读页

- **WHEN** 检查 `out/lessons/python16/decorator/index.html`
- **THEN** 存在 `<link rel="canonical">` 且其 href 为 `https://learn-py.org/lessons/python16/decorator/read/`

#### Scenario: 阅读页 canonical 自指

- **WHEN** 检查 `out/lessons/python16/decorator/read/index.html`
- **THEN** 存在 `<link rel="canonical">` 且其 href 为 `https://learn-py.org/lessons/python16/decorator/read/`

#### Scenario: 闯关页未被标记为不可索引

- **WHEN** 检查任一闯关页的静态 HTML
- **THEN** 不存在 `noindex` 的 robots meta 标签

### Requirement: sitemap 必须只列出规范版本 URL

`sitemap.xml` MUST 包含每章的阅读页 URL，且 MUST NOT 包含存在对应阅读页的闯关页 URL。

#### Scenario: sitemap 收录阅读页而非闯关页

- **WHEN** `pnpm build` 完成后检查 `out/sitemap.xml`
- **THEN** 包含 `https://learn-py.org/lessons/python2/data-types-and-variables/read/`
- **AND** 不包含 `https://learn-py.org/lessons/python2/data-types-and-variables/`

#### Scenario: 无阅读页的普通页面仍被收录

- **WHEN** 检查 `out/sitemap.xml`
- **THEN** 仍包含 `/`、`/about/`、`/contact/`、`/privacy/`

### Requirement: 阅读页必须可通过站内链接抵达

阅读页 MUST NOT 仅靠 sitemap 可达。首页章节列表 MUST 为每章提供一个指向该章阅读页的链接，闯关页 MUST 提供一个指向对应阅读页的链接，阅读页 MUST 提供指向闯关页的链接。

#### Scenario: 首页提供阅读页入口

- **WHEN** 检查 `out/index.html`
- **THEN** 对每个可用章节，存在指向该章 `/lessons/<chapter>/<lesson>/read/` 的链接
- **AND** 该章的主链接仍指向闯关页 `/lessons/<chapter>/<lesson>/`

#### Scenario: 闯关页与阅读页双向可达

- **WHEN** 用户在闯关页
- **THEN** 存在一个指向本章阅读页的链接
- **WHEN** 用户在阅读页
- **THEN** 存在至少一个指向本章闯关页的链接

### Requirement: 闯关页的渐进解锁行为不得改变

本变更 MUST NOT 改变闯关页的内容截断与练习解锁行为。`LessonLayout.tsx` 中的 `visibleBlocks` 截断逻辑、练习解锁判定、进度存储结构 MUST 保持原状，对该文件的改动 MUST 仅限于新增一个指向阅读页的链接。

#### Scenario: 闯关页行为回归不变

- **WHEN** 在无进度状态下打开 `/lessons/python16/decorator/`
- **THEN** 仅显示教学 01、教学 02 与练习 1
- **AND** 教学 03、教学 04、练习 2、练习 3 不出现在页面上

#### Scenario: 解锁流程不变

- **WHEN** 用户在闯关页做对练习 1
- **THEN** 教学 03 与练习 2 展开
- **AND** 进度写入 localStorage 的结构与本变更前一致
