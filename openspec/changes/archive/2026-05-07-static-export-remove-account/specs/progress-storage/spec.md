## ADDED Requirements

### Requirement: 用户练习进度仅保存在浏览器本地

进度（解锁、已完成、当前练习、提交代码、提交输出、章节完成等）MUST 仅由 Zustand `persist` middleware 写入浏览器 `localStorage`，MUST NOT 存在任何指向服务端的同步路径。

#### Scenario: 用户做对一道题，进度立刻持久化到 localStorage

- **WHEN** 用户在练习卡片中提交并通过判分
- **THEN** 下一题在当前会话立即解锁
- **AND** `localStorage` 中对应的 Zustand persist key 包含更新后的 `unlocked` / `completed` 集合
- **AND** 浏览器 DevTools Network 面板上不出现任何 `/api/*` 请求

#### Scenario: 刷新页面后进度恢复

- **WHEN** 用户刷新当前 lesson 页面
- **THEN** Zustand 从 `localStorage` 重水化（rehydrate）
- **AND** 已通过的题目继续显示已完成、之前解锁的下一题保持解锁、已查看解析的标记仍在

#### Scenario: 切换浏览器或清缓存后进度归零（已知折中）

- **WHEN** 用户在另一台设备/浏览器/隐私模式打开站点
- **THEN** 进度从零开始
- **AND** 不出现任何"登录后云端保存进度"的提示或入口（这类提示已随账号系统一并移除）

### Requirement: 不存在任何账号相关 UI 入口或提示

顶栏导航、footer、lesson 内 toast 中 MUST NOT 出现 `登录` / `注册` / `登录后...` 等文案；MUST NOT 存在 `/login`、`/register` 等可达 URL。

#### Scenario: 顶栏不显示登录/注册

- **WHEN** 用户访问任意页面
- **THEN** 顶栏只展示 logo + 站点入口
- **AND** 不存在指向 `/login` 或 `/register` 的链接或按钮

#### Scenario: 访问已删除的 auth 路径返回 404

- **WHEN** 用户在浏览器手动输入 `/login` 或 `/register`
- **THEN** 由 Cloudflare Pages 返回标准 404
- **AND** 不出现部分渲染的登录表单残影
