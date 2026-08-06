# AdSense 审核失败审计 — learn-py.org

- **日期**：2026-08-04
- **触发**：AdSense 后台网站状态「需要注意 · 低价值内容」（最后更新 2026-08-02 16:08 GMT+6，Ads.txt 状态「已授权」）
- **方法**：adsense-site-auditor skill（73 项 requirement 逐条评估，不抽样）
- **官方依据**：本次审计已刷新 `support.google.com/adsense/answer/9724` 与 `answer/7299563` ，与 skill 快照（2026-06-16）无冲突

## 结论

**Not ready。3 个 Blocker 全部集中在「Google 实际能抓到的内容」，与账号、ads.txt、爬虫可达性无关。**

73 项中：Pass 50 · Fail 9 · Unknown 3 · N/A 11。ads.txt、所有权验证、爬虫可达性、政策合规、隐私披露全部通过，没有第二个独立死因。

## Google Search Console 实证（2026-08-04 当天配置并取证）

本次审计当天配置了 GSC（此前从未配置）。验证方式：DNS TXT 域名级验证，在 Cloudflare 新增 1 条 TXT 记录 `google-site-verification=UMhQS-...7Vmxg`（名称 `@`，TTL 自动），两条既有 CNAME 未改动；`dig @8.8.8.8` 实测逐字一致后验证通过。

**该记录不可删除**——GSC 会定期复查所有权，删除会掉验证并丢失历史数据。

对 `https://learn-py.org/lessons/python8/oop/`（被截断的课程页之一）做网址检查，实测结果：

| 项 | 值 | 意义 |
|---|---|---|
| 索引状态 | 网址已收录到 Google · 网页已编入索引 | 页面**没有**被排除在索引外 |
| 上次抓取 | 2026-08-02 09:50:12 · Googlebot 智能手机版 | 与 AdSense 判定同一天（后台状态更新 08-02 16:08） |
| 网页抓取 | 成功 | 抓取链路无问题 |
| 是否允许抓取 / 编入索引 | 是 / 是 | robots、meta 无阻拦 |
| 用户声明的规范网址 | 无 | 站点未设 canonical |
| **Google 选择的规范网址** | **所检查的网址** | **Google 没有把它判为重复内容** |
| 站点地图 | 临时处理错误；GSC 内已提交站点地图 **0 条** | sitemap 从未提交过 |

实时渲染测试（08-04 04:33）拿到 Googlebot 渲染后的页面截图，前两屏为「教学 01 / 05」→「教学 02 / 05」，与静态 HTML 完全一致，证实 Googlebot 执行 JS 后看到的仍是截断版。

### 这修正了原诊断的因果链

原推断为：`截断 → 原创内容不可见 → 重复占比升至 45% → Google 判定低价值`。

**中间「Google 判重复」这一环被实证推翻**：Google Search 的索引系统明确将该页的规范网址选为它自己，没有指向 MkDocs 站，也没有当作重复网页处理。

修正后的结论：**AdSense 的「低价值内容」判定与 Google Search 的索引判定是两套独立系统**。搜索索引接受一个页面（技术上可抓取、可索引、非重复），不代表 AdSense 认可它值得展示广告。因此：

- 技术层面（抓取、索引、规范化、robots、TLS、ads.txt）**全部正常，无一是死因**
- 问题纯粹在 AdSense 的内容价值评估层：它读到的是每页一千多字的残页
- **根因不变**（截断），但机制更直接——不经由「重复内容」这个中介，而是页面内容本身太薄

重复率 45% 的数据依然有效，但它的角色从「主因」降为「加重因素」：它解释了为什么剩下能读到的内容也缺乏独特价值，而不是解释判定本身。

## 增量复审（同日第二轮，聚焦首轮未实测项）

### 新增发现

| # | 发现 | 证据 | 建议 |
|---|---|---|---|
| 1 | **域名站龄仅 3 个月** | `Creation Date: 2026-05-07T12:20:02Z`（Cloudflare 注册）；git 首个提交同为 05-07；07-23 首次提交 AdSense 时域名 2 个月 16 天 | 官方 `answer/9724` 未公开最低站龄要求，不作因果断言；但影响重新提交时机，见下文 |
| 2 | ~~**404 页面为 Next.js 英文默认页**~~ **✅ 已修待部署** | 状态码为真 404（非软 404）；原可见文本仅 178 字符，正文 `404: This page could not be found.` | 已新增 `web/src/app/not-found.tsx` ：全中文 289 字符 + 3 个引导入口（课程目录 / 第一课 / 关于本站）+ 反馈提示 |
| 3 | ~~CrUX 无数据 → 流量很低~~ **该推断已撤回（错误）** | GSC 核心网页指标确实显示「过去 90 天内未获得足够使用情况数据」，但 Cloudflare Analytics 实测：24 小时**唯一访问者 1.82k**、请求 150.61k、流量前五 China 96,997 / Japan 14,763 / HK 13,122 / US 10,901 / SG 5,921 | **流量不是问题**（日均约 1800 独立访客、月 5 万+）。CrUX 无数据因访客 68% 来自中国大陆，而 CrUX 仅采集「Chrome + 开启使用情况上报」样本。**不可用 CrUX 推断中文站点流量** |
| 4 | **117 个 H1 分散在 31 个页面** | 平均每页近 4 个 h1；教学 step 的 markdown 标题渲染为 h1；唯一重复 H1 为「线程与进程」 | 层级不清，轻微；可将 step 标题降级为 h2 |

### 状态升级（首轮靠推断，本轮取得 Google 官方证据）

| ID | 首轮依据 | 本轮依据 |
|---|---|---|
| `ADS-PUB-01`～`PUB-16`（全 16 项） | 内容关键词扫描 | **GSC 人工处置措施：未检测到任何问题** — 官方确认无内容政策违规 |
| `ADS-UX-04` | 代码审查无弹窗/劫持/下载 | **GSC 安全问题：未检测到任何问题** |
| `ADS-CONTENT-08` | 标题模式检查 | 31 个页面 title / description **全部唯一、无空值**；1 个 img 有 alt |

`ADS-PUB` 整组取得 Google 官方「无问题」是本轮最有价值的确认——**彻底排除内容政策违规路径，问题锁死在 AdSense 的内容价值评估上**。

### 复审结论

整体决策仍为 **Not ready**。新发现未改变根因，3 个 Blocker 一个未解。73 项中状态更新 19 项（PUB 组 16 + UX-04 + CONTENT-08 + CRAWL-07），其余 54 项维持首轮判定。

### 重新提交时机建议

修完 Blocker 后**不要立刻提交**。等域名满 6 个月（2026-11-07 前后）再交——站龄从 3 个月变 6 个月，配合内容修复，通过概率明显不同。这段时间用于补 About/Contact、改 404 页。

**流量无需担心**：Cloudflare 实测日均约 1800 独立访客、月 5 万+，这反而是有利事实——每天近两千人在用的站不是「无受众」。真正缺的只是让 Google 读到这些人看到的内容。

## Blocker 1 — 课程页正文被解锁逻辑截断（`ADS-CONTENT-03`）

**根因**：`web/src/components/lesson/LessonLayout.tsx:72-89` 的 `visibleBlocks` 用 `blocks.slice(0, cutoff)` 截断数组，未渲染的 block 不进 DOM。静态导出预渲染时 zustand persist 尚未水合，`lessonProgress` 为 undefined，cutoff 落在第一道练习题，因此 HTML 只含前两段教学 + 第一题。

**实测**（源 `steps/*.mdx` 去代码块字符数 vs `out/` 渲染可见文本）：

| 课程 | 源教学段 | HTML 渲染段 | 源正文 | HTML 可见文本 |
|---|---|---|---|---|
| python2/data-types-and-variables | 9 | 2 | 6590 | 2106 |
| python19/exception-handling | 6 | 2 | 5186 | 2753 |
| python7/iteration | 6 | 2 | 3733 | 1916 |
| python8/oop | 5 | 2 | 1438 | 1716 |

- **29 课中 21 课被截断**（全部带练习题的课）
- 未截断的 8 课全部是无练习的「概念阅读」章节：why-python、intro-and-hello-world、threading、pyproject-uv、ruff、pytest、pypi、whats-next
- 线上用 Googlebot UA 实测与本地产物一致（首页 2825、python8/oop 1716、python2 2106 字符）

## Blocker 2 — 与原教程站重复，且重复最高的页面恰是唯一完整可抓的（`ADS-CONTENT-02`）

**量化**：3059 个教学句子中 952 句与 `walter201230/Python` 逐字相同，整体 **31.1%**。最高：data-types-and-variables 68.7%、why-python 66.7%、whats-next 58.9%、pytest 55.1%、pypi 47.6%、ruff 38.7%。

**版权无问题**：`Python/LICENSE` 为 CC BY 4.0，内容为站长本人原创，两站同属一人。这是「无实质增值的再发布」（`PUB-11` 的 "copied content without added value"，对自我重复同样适用），不是侵权。

**结构性反差**：Google 能完整抓取的 8 页正是重合率最高的纯讲解页；原创增值（100 道练习、判分、题目解析）全部躺在被截断的 21 页里。

> **2026-08-04 实证修正**：GSC 网址检查显示 Google 将该类页面的规范网址选为其自身，**未判定为重复内容**（详见上文「GSC 实证」）。因此本条的严重度应从 Blocker 降为**加重因素**：它解释的是「能读到的那部分内容为何缺乏独特价值」，而不是判定本身的直接成因。真正的 Blocker 是 CONTENT-03 的截断。

**因此本条不需要改写教程文本**——Blocker 1 修复后，同样这些页面变成「原教程全文 + 练习题 + 判分讲解」，内容量显著超过 MkDocs 站对应页，重合部分成为大分母中的一小块。

**跨域 canonical 不要做**：learn-py.org 指向 MkDocs 站会导致前者被判副本、降低索引，而广告恰恰要投在 learn-py.org；反向做则牺牲 25k star 站的 SEO。两站保持独立，靠练习内容拉开差异。

## Blocker 3 — 爬虫可见的原创内容不足以证明站点价值（`ADS-CONTENT-01`）

全站 31 个 URL；首页可见文本 2825 字符且全是课程卡片标题 + 一句话描述 + 进度条，无正文段落；隐私页 594 字符；21 个课程页 1438–4404 字符。站点真正的价值全在 JS 交互里，静态 HTML 体现不出来。Blocker 1 修复后本条自动大幅缓解。

## High — 无 EEA/UK 同意机制（`ADS-PRIV-04`）

`web/src/app/layout.tsx:66-71` 的 AdSense 脚本对所有地区无条件加载，全站无 CMP/同意横幅，Cloudflare 无地域拦截。修复：AdSense 后台「隐私与消息」生成 GDPR 消息，或先确认流量地域构成。

## Medium

> **2026-08-04 整改进度**：`ADS-UX-05`、`ADS-UX-03` 及 404 页问题**已修复并验证，待部署**（见 ROADMAP「2026-08-04 AdSense 整改第一批」）。3 个 Blocker 仍未动。

| 项 | 问题 | 位置 / 证据 | 修复 |
|---|---|---|---|
| ~~`ADS-UX-05`~~ ✅已修待部署 | 缺 About 与 Contact 页 | `/about` 404、`/contact` 404，仅 `/privacy` 200；联系方式只藏在隐私政策正文的 GitHub Issues 链接里 | 已新增 `/about`（850 字符）与 `/contact`（505 字符），页脚 31/31 页面加入口，sitemap 自动增至 33 URLs |
| ~~`ADS-UX-03`~~ ✅已修待部署 | 2 个坏链接 | `content/lessons/python27/pypi/steps/01-preface.mdx:49,60` 裸 URL 后紧跟中文句号被 autolink 吞入，生成 `https://pypi.org%E3%80%82...` 与 `https://test.pypi.org%E3%80%82...` ，curl 返回 000（DNS 失败） | 已改 markdown 链接语法；全项目回归扫描：修后该模式 0 处，原教程 `Python/Article/` 本就 0 处 |
| `ADS-CRAWL-05` | 无 canonical 标签 | `out/` 全部页面无 `<link rel="canonical">` （有 og:，无 robots meta、无 hreflang） | 同域 canonical 可加；跨域不做（见 Blocker 2） |
| `ADS-CRAWL-07` 附带 | **Google 读不到 sitemap**（已于 08-04 提交，状态「无法读取此站点地图」，已发现网页 0） | 提交前网址检查即显示「站点地图：临时处理错误」，说明 Google 此前经 robots.txt 发现过并已读失败，非「刚提交未抓取」。文件侧实测全部正常：Googlebot UA 与普通 UA 均 200、`content-type: application/xml`、无 BOM（首字节 `<?x`）、XML 格式正确含 31 个 `<loc>`、5668 字节。故 CRAWL-07 仍判 Pass（文件与声明均合规） | 24 小时后复查 GSC 状态。影响有限——网址检查显示页面的「引荐来源网页」是 `https://learn-py.org/` ，即 Google 已通过首页链接发现内容页，31 个 URL 首页均有链接。若持续报错再深查 Cloudflare 侧对 sitemap 抓取的处理 |

**外链结构观察**（未单独判 Fail）：31 个页面中 `coding.stormzhang.ai` 出现 60 次（页头导航 31 + 课程页底部推荐语 29），是仅次于 github.com 的第二高频外链。内容单薄时会强化「导流站」印象，是否在重审期间收敛由站长决定。

## 通过项要点（证据）

- `ADS-CRAWL-02`：robots.txt 仅 `Allow: /` ；Mediapartners-Google 抓首页 200/149KB、课程页 200/57KB；AdsBot-Google 200
- `ADS-CRAWL-01`：sitemap 31 个 URL 逐个实测，非 200 数量为 0
- `ADS-TXT-01`：`/ads.txt` 200，内容 `google.com, pub-6749653052850583, DIRECT, f08c47fec0942fa0` ，后台「已授权」
- `ADS-CRAWL-04`：http→https 一跳 301；`/privacy`→`/privacy/` 一跳 308（Next 尾斜杠固有行为）
- `ADS-CRAWL-06`：TLS 握手 0.152s，总响应 0.446s
- `ADS-CONTENT-05` / `PROG-01`：全站 `<ins class="adsbygoogle">` 数量为 0，从未展示过广告
- `ADS-PRIV-01/02/10`：`/privacy` 披露 localStorage 与 Google AdSense cookie 及个性化广告，含 Google 广告设置链接
- `ADS-PRIV-07`：grep `document.cookie` 全站 0 命中
- `ADS-CONTENT-07`：无评论/UGC 系统（grep 无 disqus/giscus/utterances）
- `REST-01..07`：限制类内容关键词扫描全部 0 命中；「枪/武器」4 处命中均为比喻（「两件武器」「核武器」）

## Unknown（需站长本人确认，站点侧无法验证）

- `ADS-ELIG-01`：申请人年满 18 岁
- `ADS-ELIG-02`：名下无第二个 AdSense 账号
- `ADS-PROG-04`：未购买流量、未使用流量交换（当前无付费流量证据，主要为 GitHub 25k star 仓库自然引流）

## 审计局限

`ADS-UX-01` / `ADS-UX-02` 的判定基于 HTML 结构、组件代码与链接可达性实测。移动端 header 的 GitHub 链接被 `sm:block` 隐藏，仅剩 logo 与外站链接，列为观察项。

> **增量复审更新**：该局限已部分解除——GSC 实时渲染测试（08-04 04:33）取得 Googlebot **智能手机版**渲染截图，移动端页头呈现与代码推断一致（仅「小白学 Python」+「AI 编程指南」）。仍未做的是真实设备上的多分辨率交互测试。

## 修复方案（待实施）

### 第一优先：放开教学内容截断

**目标**：静态产物输出全部教学 step，练习门控行为不变。

**依据**：`openspec/specs/interactive-lesson/spec.md:77-79` 的「进度门控（解锁规则）」只约束练习题入口（「下一题入口才可点击」），从未要求隐藏教学内容。教学跟随截断是实现偏离，不是产品设计要求。

**改法**：`LessonLayout.tsx` 的 `visibleBlocks` 改为——教学 step 全部渲染，练习题仍只渲染到第一个未过关的（含）。给爬虫和用户的 HTML 完全一致，不涉及 cloaking（cloaking 是给两者不同内容，当前是对所有人都截断）。

**连带必须处理**（否则视觉与交互错乱）：

1. `currentStepIndex`（`LessonLayout.tsx:92-97`）现取「最后一个未截断的 step」，教学全展开后会永远指向最后一段，StepCard 的「已读 / 当前」区分失效 → 改为「第一个未过关练习之前的最后一个 step」
2. 「🔒 做对当前题解锁下一段」提示（`LessonLayout.tsx:177-187`）现在渲染在所有 block 之后，教学全展开后位置会错到页面最底部 → 需紧跟未过关练习之后
3. `LessonToc` 传的是全部 `blocks`（`:213`），不受影响；TOC 里此前指向被截断内容的锚点将全部生效（改善）
4. `LessonStickyBar`、`allCompleted`、Confetti 基于 `exercises` 与进度计算，不受影响

**验收标准**：

- 29 课全部渲染出全部教学 step（截断课数 21 → 0）
- `python2/data-types-and-variables` 页可见文本从 2106 字符升至 7000+ 量级
- 练习门控行为不变：未通过第 1 题时第 2 题不出现
- `pnpm tsc --noEmit` + `pnpm lint` + `pnpm build` 全过
- 按项目规范做全项目回归扫描（共享 `lessonProgress` 状态的所有调用方逐一评估）

### 后续

1. 补 About / Contact 页（`UX-05`）
2. 修 pypi 课 2 个坏链接（`UX-03`）
3. 接入 CMP（`PRIV-04`），可与重审并行
4. 全部 Blocker 修完并上线后，在 AdSense 详情页点「请求审核」

**在 3 个 Blocker 修复上线前不重新提交审核。**
