## Context

python-lab MVP 已跑通：python2 第一节 9 道题、Pyodide 在浏览器判分、zustand persist 把进度（unlocked / completed / submittedCode / submittedOutput）写入 localStorage。现在准备发布到腾讯云 CVM。当前进度仅在当前浏览器有效——换设备就丢，正式发布不可接受。

技术约束：
- 部署目标：**腾讯云 CVM**（Linux 虚拟机，可装 Node + nginx + SQLite）
- 暂无域名、暂无 HTTPS（先用 IP:port 或临时域名访问，HTTPS 等买域名再加）
- 个人项目，不接受额外月付服务
- 用户量预估：MVP 阶段 < 1000 注册用户，数据量小

## Goals / Non-Goals

**Goals:**
- 用最少的依赖把"用户名 + 密码"登录跑起来
- 学习进度按用户绑定，跨设备能继续
- 未登录态仍可学习（用 localStorage 降级）——不能因为登录墙吓跑游客
- 部署文档让用户能照着步骤把站点搭到 CVM 上

**Non-Goals（V2+ 才做）：**
- 邮箱验证、忘记密码、找回流程
- 第三方登录（GitHub、微信）
- 多角色权限、管理后台
- 实时 WebSocket 进度推送
- 数据库迁移到 Postgres / MySQL
- 进度的版本控制 / 历史回看
- 服务端代码沙箱（Pyodide 仍跑在浏览器）
- HTTPS（等买域名后单独处理）

## Decisions

### D1：数据库 = SQLite（better-sqlite3）

**理由**：单文件、零运维、同步 API 简单、MVP 用户量级足够。CVM 上一个 `/var/lib/python-lab/app.db` 文件就完事，备份就是 cp 一下。

**备选**：
- Postgres / MySQL：要装服务、要管账号权限，MVP 用户量根本撑不到 SQLite 瓶颈，过度
- 腾讯云 CDB：付费 + 网络往返延迟，没必要
- JSON 文件：并发写不安全

**Trade-off**：单文件不能水平扩展 + 单点故障。当前规模可接受；将来用户多再迁 Postgres（Drizzle/Prisma 抽象后迁移成本可控）。

### D2：密码哈希 = bcryptjs（纯 JS）

**理由**：避免 native compile（CVM 上 npm install 时不需要 gcc/python-dev）；性能差距对登录场景无感（登录验证慢 50ms 用户察觉不到）。

**备选**：
- `bcrypt`（native）：快但要编译，部署摩擦
- `argon2`：更现代但要 native，同上
- `scrypt`（Node 内置）：标准，但 API 啰嗦、社区例子少

### D3：会话 = httpOnly cookie + JWT（jose 库）

**理由**：
- httpOnly cookie：JS 拿不到，防 XSS 偷 token
- JWT 自包含：服务端不用查 session 表，每次请求验签即可
- jose 是标准 ESM、兼容 Edge runtime（万一以后用）

**Cookie 策略**（MVP 阶段）：
- name: `auth-token`
- httpOnly: true
- sameSite: 'lax'
- secure: **false**（无 HTTPS；上 HTTPS 后改 true）
- path: '/'
- maxAge: 30 天

**JWT payload**：`{ uid: number, username: string, iat, exp }`，HS256 签名，密钥从 `AUTH_JWT_SECRET` 环境变量读取。

### D4：进度同步策略 = 「读一次 + 写防抖」

**读**：lesson 页 mount 时 fetch 一次 `GET /api/progress`，把所有 lesson 的进度填到 zustand store。

**写**：zustand store 的状态变更（markCompleted / markViewedSolution / setCurrent），通过订阅触发一个 debounced（500ms）的 `PUT /api/progress`，请求体是「当前 lessonId + 完整 LessonProgress JSON」。

**为什么不实时同步每个动作**：判分通过、解锁、保存代码——这些动作可能 1 秒内连发好几次，逐个发请求浪费。500ms debounce 在用户感知"做完一道题点检查"这种粒度下足够，崩溃丢失最多 500ms 内的变更可接受。

**未登录降级**：useAuth 返回 null 时，store 仍走原有 localStorage persist，不发任何请求。登录后做一次「合并」：先 GET 服务端进度，跟本地 localStorage 进度合并（取 unlocked/completed 的并集，submittedCode 取本地为准——本地是用户最近的作品），合并结果 PUT 上去 + 写回 store。

### D5：API 设计（最少 6 条）

| 方法 | 路径 | 用途 |
|---|---|---|
| POST | `/api/auth/register` | 注册：body `{username, password}` → set cookie + 返回 `{user}` |
| POST | `/api/auth/login` | 登录：body `{username, password}` → set cookie + 返回 `{user}` |
| POST | `/api/auth/logout` | 退出：清 cookie |
| GET | `/api/auth/me` | 当前用户：从 cookie 解 JWT → 返回 `{user}` 或 `{user: null}` |
| GET | `/api/progress` | 当前用户全部进度：返回 `Record<lessonId, LessonProgress>` |
| PUT | `/api/progress` | 更新一节课进度：body `{lessonId, data: LessonProgress}` |

错误码：400 = 输入校验失败、401 = 未登录、409 = 用户名已存在、500 = 服务器错。Body 用 `{ error: '中文消息' }` 形式。

### D6：用户名/密码规则

- 用户名：3-20 字符、只允许 `[A-Za-z0-9_-]`、大小写敏感、注册时校验唯一
- 密码：≥ 6 字符、≤ 72 字符（bcrypt 限制）、不限字符集
- 服务端 + 客户端双重校验

不强行复杂密码——这是学习站不是银行，6 位够用，反而能降低用户放弃注册的概率。

### D7：路由保护策略 = 软引导

- `/lessons/*`：游客可访问，可阅读、可运行代码、可看判分结果
- 但**判分通过的瞬间**如果未登录，弹一个轻量提示 toast：「登录后保存进度」+ 一键跳登录页
- 登录页/注册页：未登录可访问；已登录访问跳首页
- API 路由：除了 register/login/me，其它都强制登录（401）

这样不会一开始就用登录墙拦人，但会在用户产生「成果」（第一题通过）的时机让他主动登录——转化率更高。

### D8：部署 = CVM + PM2 + nginx + SQLite

最小可行部署形态：

1. CVM 上装 Node 18+（`nvm install 18`）+ PM2（`npm i -g pm2`）+ nginx
2. clone 项目 → `npm ci` → `npm run build`
3. PM2 启动 `next start -p 3000`，配置 ecosystem.config.js（自动重启 + 日志）
4. nginx 反代 80 → 3000，配置 `proxy_pass http://127.0.0.1:3000` + 静态资源缓存
5. SQLite 文件放 `/var/lib/python-lab/app.db`，启动时检查不存在则初始化 schema
6. 备份：crontab 每日 03:00 `cp app.db app.db.$(date +%F).bak`，保留 7 天

**为什么 PM2 不 systemd**：PM2 自带日志聚合 + 在线 reload + 集群模式，比写 systemd unit file 省事，单机够用。

## Risks / Trade-offs

| 风险 | 缓解 |
|---|---|
| better-sqlite3 native binding 在 CVM 上 npm install 失败 | 部署文档明确写：先 `apt install build-essential python3-dev`；优先走 prebuilt（默认） |
| 进度合并冲突（用户在 A 设备做了第 1-3 题、B 设备做了第 1-2 题，登录后哪个赢） | 取并集：unlocked/completed 取并集；submittedCode 取本地（最近编辑的）；冲突极少（用户量小+练习单向推进） |
| JWT secret 泄露 → 全用户被伪造 | 部署时随机生成 64 字节 base64 字符串，写进 `.env.local`，不入 git；定期轮换文档化（V2 做） |
| SQLite 单文件丢失 | crontab 每日 cp 备份；用户量大后做 LiteFS 或迁 Postgres |
| 没有 HTTPS，登录密码明文走网络 | 文档明确警告"内部测试用，正式上线必须先做 HTTPS"；MVP 阶段不阻塞发布 |
| 用户名占坑：恶意注册 walter / admin 等 | MVP 不防——等运营时再加保留名单；初期用户量小不是问题 |
| 注册接口被脚本暴力刷 | MVP 不做 rate limit；nginx 层加 `limit_req` 配置（部署文档示例给一行） |
| zustand 订阅 debounced sync 在路由切换时可能丢最后一次 | beforeunload 时强制 flush 一次（fetch keepalive） |

## Migration Plan

1. **OpenSpec 校验通过** → tasks.md 全 done → archive
2. **新增依赖** → `npm i better-sqlite3 bcryptjs jose`
3. **DB schema + 迁移** → `web/src/lib/db.ts` 启动时自动建表（idempotent）
4. **API 路由** → 6 条 route handlers + zod 校验
5. **客户端 hook** → useAuth() / useServerProgress()
6. **store 改造** → 加 syncToServer + 合并逻辑
7. **UI** → 登录/注册页 + 顶部 nav 状态
8. **部署文档** → DEPLOY.md
9. **本地端到端测** → Playwright 跑：注册 → 登录 → 通过题 → 退出 → 重登 → 进度还在
10. **archive 这个 change**

## Open Questions

- **OQ1**：是否要给"游客"概念一个明确的本地 UUID？目前 zustand store 用 lessonId 索引，不区分用户。游客做完题登录后合并即可。**结论**：不需要 UUID，按时间戳合并。
- **OQ2**：进度数据是否压缩？目前一节课进度 JSON 不超 5KB（5 题各存代码 + 输出），10 章 50 题 ≈ 50KB。**结论**：暂不压缩，将来超过 100KB 再说。
- **OQ3**：是否记录用户登录历史 / 学习时长？**结论**：MVP 不做，schema 不预留——以后有需要再加表，不污染当前设计。
- **OQ4**：管理员后台（看注册数 / 完成率）要不要？**结论**：不做，直接 ssh 上 CVM `sqlite3 app.db` 查就行。
