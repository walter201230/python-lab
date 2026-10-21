# theme-switching Specification

## Purpose

定义深浅主题与偏好保存，主题变化独立于学习进度和 Python 执行状态。实现入口为 `web/src/lib/useTheme.ts`、`web/src/app/layout.tsx` 与 `web/src/app/globals.css`。

## Requirements

### Requirement: 深浅主题与默认值

站点 MUST 提供 `dark`、`light` 两种主题，无有效偏好时默认深色，MUST NOT 自动跟随系统配色。

#### Scenario: 新访客打开页面

- **WHEN** 浏览器没有本站有效的主题偏好
- **THEN** 页面呈现深色主题

### Requirement: 可访问的切换入口

顶栏 MUST 提供可由键盘聚焦和激活的主题切换按钮，并提供表明用途的可访问名称。

#### Scenario: 切换配色

- **WHEN** 用户点击按钮或通过键盘激活
- **THEN** 主题在深浅之间切换，按钮可访问名称同步反映目标主题

### Requirement: 偏好持久化与首屏应用

主题偏好 MUST 使用独立于学习进度的 localStorage 键保存。页面 MUST 在 React 水合前通过 head 中的同步脚本应用已保存的有效主题，存储不可用时仍可显示页面。

#### Scenario: 浅色用户重新访问

- **WHEN** 已保存浅色偏好的用户刷新或重新进入页面
- **THEN** 初始主题由同步脚本设为浅色，无需等待 React 水合

### Requirement: 主题配色与编辑器一致

主题颜色 MUST 通过 CSS 语义变量维护，代码编辑器 MUST 跟随站点深浅主题。浅色主题正文对比度 MUST 达到 4.5:1，大号文字达到 3:1。

#### Scenario: 编辑中的用户切换主题

- **WHEN** 用户在闯关页切换主题
- **THEN** 页面与编辑器配色同时切换，已输入的代码保留

### Requirement: 学习状态独立

主题切换 MUST NOT 重置学习进度、解锁状态、判分结果或 Pyodide worker。

#### Scenario: 已解锁课程切换主题

- **WHEN** 用户解锁后续练习并切换配色
- **THEN** 解锁和完成标记保留，已初始化的 Python 环境继续复用
