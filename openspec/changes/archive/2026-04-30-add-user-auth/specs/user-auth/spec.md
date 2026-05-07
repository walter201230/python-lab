## ADDED Requirements

### Requirement: 用户注册

系统 SHALL 提供 `POST /api/auth/register` 端点，接收 `{username, password}` 创建新用户，使用 bcrypt 哈希存储密码，校验通过后立即在响应里设置 httpOnly cookie 完成自动登录，并返回 `{user: {id, username}}`。

#### Scenario: 合法用户名 + 合法密码

- **WHEN** 客户端 POST `/api/auth/register` body `{"username": "walter", "password": "abc123"}`，且数据库中不存在 `walter`
- **THEN** 数据库 `users` 表新增一行（password 字段是 bcrypt hash，不是明文）；响应 200，body `{user: {id: 1, username: "walter"}}`；响应头 Set-Cookie: `auth-token=<JWT>; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`

#### Scenario: 用户名已存在

- **WHEN** 注册 username 已被占用
- **THEN** 响应 409，body `{error: "用户名已被占用"}`，不创建新行、不设置 cookie

#### Scenario: 用户名/密码不符合规则

- **WHEN** 用户名长度 < 3 或 > 20，或包含 `[A-Za-z0-9_-]` 之外的字符；或密码长度 < 6 或 > 72
- **THEN** 响应 400，body `{error: "<具体哪条不通过的中文消息>"}`，不创建新行

### Requirement: 用户登录

系统 SHALL 提供 `POST /api/auth/login` 端点，接收 `{username, password}`，从数据库查到用户后用 bcrypt 比对密码哈希；通过则签发 JWT 写入 httpOnly cookie，并返回 `{user: {id, username}}`。

#### Scenario: 凭据正确

- **WHEN** 客户端 POST `/api/auth/login` body `{"username": "walter", "password": "abc123"}`，数据库中存在 walter 且密码匹配
- **THEN** 响应 200，body `{user: {id, username}}`；Set-Cookie 同注册流程

#### Scenario: 用户名不存在或密码错误

- **WHEN** 用户名不存在 OR 密码 hash 不匹配
- **THEN** 响应 401，body `{error: "用户名或密码错误"}`（**不区分**两种情况，避免泄露用户名是否存在）；不设置 cookie

### Requirement: 退出登录

系统 SHALL 提供 `POST /api/auth/logout` 端点，立即清除 `auth-token` cookie，返回 200。

#### Scenario: 已登录用户退出

- **WHEN** 客户端 POST `/api/auth/logout`（带或不带 cookie 都行）
- **THEN** 响应 200，body `{ok: true}`；Set-Cookie: `auth-token=; HttpOnly; Max-Age=0; Path=/`

### Requirement: 当前用户查询

系统 SHALL 提供 `GET /api/auth/me` 端点，从请求 cookie 解 JWT，验签通过则返回 `{user: {id, username}}`，否则返回 `{user: null}`（200 而不是 401，方便前端无脑调用）。

#### Scenario: 有效 cookie

- **WHEN** 客户端 GET `/api/auth/me` 且携带未过期、签名正确的 `auth-token` cookie
- **THEN** 响应 200，body `{user: {id, username}}`

#### Scenario: 无 cookie 或 cookie 无效/过期

- **WHEN** cookie 不存在 / 签名错 / 已过期
- **THEN** 响应 200，body `{user: null}`，**不**清 cookie（让浏览器自然过期）

### Requirement: 学习进度服务端读取

系统 SHALL 提供 `GET /api/progress` 端点，仅限登录态访问，返回当前用户所有 lesson 的进度——结构 `Record<lessonId, LessonProgress>`，其中 LessonProgress 包含 `unlocked / completed / viewedSolution / currentExerciseId / submittedCode / submittedOutput` 全部字段。

#### Scenario: 已登录用户拉进度

- **WHEN** 已登录用户 GET `/api/progress`
- **THEN** 响应 200，body 是该用户在 `lesson_progress` 表里所有行的 JSON 反序列化结果，按 lessonId 索引

#### Scenario: 未登录拉进度

- **WHEN** 未带 cookie 或 cookie 无效的请求 GET `/api/progress`
- **THEN** 响应 401，body `{error: "请先登录"}`

#### Scenario: 用户从未做过题

- **WHEN** 新注册用户首次 GET `/api/progress`，`lesson_progress` 表无该用户的行
- **THEN** 响应 200，body `{}`

### Requirement: 学习进度服务端写入

系统 SHALL 提供 `PUT /api/progress` 端点，仅限登录态访问，接收 `{lessonId, data: LessonProgress}`，对 `(user_id, lesson_id)` 复合主键做 upsert，并更新 `updated_at` 时间戳。

#### Scenario: 写入新进度

- **WHEN** 已登录用户 PUT `/api/progress` body `{"lessonId": "data-types-and-variables", "data": {...}}`，该用户该课无现有行
- **THEN** `lesson_progress` 表 INSERT 一行；响应 200，body `{ok: true, updatedAt: <unix-seconds>}`

#### Scenario: 更新已有进度

- **WHEN** 已登录用户对同一 lessonId PUT 第二次（数据有变化）
- **THEN** `lesson_progress` 表对应行 UPDATE，data 字段被新 JSON 覆盖，updated_at 刷新

#### Scenario: 输入校验失败

- **WHEN** body 缺 lessonId / data，或 data 不是合法 LessonProgress 形态
- **THEN** 响应 400，不写库

### Requirement: 客户端会话 hook

系统 SHALL 提供 `useAuth()` React hook，返回 `{user: User | null, loading: boolean, login(username, password), register(username, password), logout()}`。组件挂载时自动 fetch `/api/auth/me` 一次，结果缓存到全局；login/register 成功后刷新缓存；logout 后清缓存。

#### Scenario: 顶部 nav 渲染登录状态

- **WHEN** 顶部 nav 组件 mount，调用 `useAuth()`
- **THEN** 期间 `loading=true` 显示骨架；fetch 完成后若 `user=null` 显示「登录 / 注册」按钮，若 `user` 存在显示用户名 + 退出按钮

### Requirement: 进度同步策略

系统 SHALL 在用户登录态下，把 zustand `progress` store 的状态变更通过 debounced（500ms）`PUT /api/progress` 推送到服务端；未登录态保持原 localStorage persist 行为不变。

#### Scenario: 登录态做对一道题

- **WHEN** 已登录用户在 lesson 页通过判分（markCompleted 触发 store 更新）
- **THEN** 500ms 后客户端发起 PUT `/api/progress`，body 包含当前 lesson 的最新 LessonProgress；网络失败时静默重试 1 次（配合 fetch keepalive，离开页面也能送出）

#### Scenario: 未登录做对一道题

- **WHEN** 未登录用户通过判分
- **THEN** zustand persist 写 localStorage 的行为照常，不发起任何网络请求；UI 弹一个轻量 toast「登录后云端保存进度」+ 跳登录页的链接

#### Scenario: 登录后首次拉进度

- **WHEN** 用户登录成功后跳回 lesson 页（或刷新 lesson 页）
- **THEN** lesson 页 mount 时调用 `GET /api/progress` 拿到该用户全部进度，写入 zustand store；如果当前浏览器 localStorage 里有未登录态的进度，做一次「合并」：unlocked/completed 取并集，submittedCode 取本地（更近期），合并结果立即 PUT 上去 + 替换 store 状态

### Requirement: 数据库 schema

系统 SHALL 在应用启动时自动初始化 SQLite schema（idempotent，CREATE IF NOT EXISTS），包含两张表：

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL  -- unix seconds
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id INTEGER NOT NULL,
  lesson_id TEXT NOT NULL,
  data TEXT NOT NULL,         -- LessonProgress JSON
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Scenario: 首次启动空目录

- **WHEN** CVM 上首次跑 `npm start`，`SQLITE_PATH` 指向不存在的文件
- **THEN** 应用创建 SQLite 文件 + 上述两表 + 索引；启动日志输出「DB initialized at <path>」

#### Scenario: 重复启动

- **WHEN** 应用重启
- **THEN** schema 已存在，CREATE IF NOT EXISTS 跳过，不报错

### Requirement: 部署文档

系统 SHALL 在 `web/DEPLOY.md` 提供腾讯云 CVM 部署的可执行指南，覆盖：Node 安装、依赖安装、环境变量、build & start、PM2 配置、nginx 反代、SQLite 备份 cron。文档中所有命令直接 copy 即可在干净 Ubuntu 22.04 CVM 上跑通。

#### Scenario: 用户照文档部署

- **WHEN** 用户在腾讯云开一台 Ubuntu 22.04 CVM，按 DEPLOY.md 一步步操作
- **THEN** 站点能从外网 IP:80 访问，注册/登录/做题/退出登录全流程跑通；SQLite 文件落在文档指定路径
