# Features · Manage · Operations Dashboard

## 路由

- `/manage`

## 数据

- API：[`../../api/domains/manage/operations.md`](../../api/domains/manage/operations.md)
- Query 参数：`days=7|30|90`
- 初始实时快照：
  - `GET /api/manage/operations/playback/active?limit=200`
  - `GET /api/manage/operations/data-sources/load`
- 实时通道：`GET /api/playback/realtime/ws?scope=admin`

## 必须面板

| 面板 | 内容 |
|---|---|
| 摘要指标 | 播放次数、去重播放用户、估算观看分钟、当前媒体总数、当前用户总数 |
| 热播榜单 | 电影按电影，电视剧按具体 Episode；展示剧名 / 季集、来源、平均观看时长、播放次数 |
| 播放用户 | 用户名 / 昵称、播放次数、估算观看时长、最近播放、常用客户端 |
| 媒体总数趋势 | 每日新增与累计 |
| 用户注册趋势 | 每日新增与累计，仅 human 账号 |
| 用户播放趋势 | 每日播放次数、去重用户、估算观看分钟 |
| 实时播放 | 当前播放 / 暂停会话、用户摘要、客户端、媒体、进度、来源摘要 |
| 来源实时负载 | 来源维度活跃会话数、播放 / 暂停数、媒体源数量、最近心跳、负载等级和建议 |
| 实时连接状态 | `connecting` / `connected` / `degraded` / `disabled`，展示最近事件时间和重连次数 |

## 状态

- `loading`：保留布局骨架，不要让页面高度跳变。
- `empty`：播放榜和用户榜可显示空态，但趋势仍展示补齐日期的 0 值。
- `error`：显示 API 错误与重试按钮；不要把用户踢回登录，除非 `401`。
- `forbidden`：渲染 403 页面。
- `realtime connecting`：保留 HTTP 初始快照，连接状态 badge 显示连接中。
- `realtime connected`：使用 WS snapshot 覆盖实时播放和来源负载。
- `realtime degraded`：WS 断开、解析失败或重连中；继续展示最后一次 HTTP / WS 快照，并提供手动刷新。
- `realtime disabled`：浏览器不支持 WebSocket 或后端拒绝升级；页面退回 HTTP 刷新，不隐藏其它运营面板。
- `partial`：实时播放或来源负载任一接口失败时，只降级对应面板，不让整个 `/manage` 失败。

## 交互

- 顶部提供 7 / 30 / 90 天切换，切换后所有面板共用同一接口刷新。
- 热播项可跳到 `/item/:itemId` 或 `/manage/media/items/:itemId`，取决于页面上下文。
- 时间展示统一 `Asia/Shanghai`。
- 页面首屏必须先请求 HTTP 总览、活跃播放快照和来源负载快照，再建立 WS；不能把 WebSocket 当首屏唯一真相。
- `playback.active_snapshot` 用于覆盖 / 合并实时播放列表。
- `playback.source_load_snapshot` 用于覆盖 / 合并来源负载列表。
- `playback.session.started`、`playback.session.progress`、`playback.session.paused`、`playback.session.stopped` 只触发轻量 refetch 或等待下一次 snapshot，不作为全局列表最终真相。
- WS 重连使用退避策略；重连期间维持 `degraded`，不要清空列表。

## 首次配置

`/manage` 仍需要保留首次配置引导：当站点缺少基础配置、媒体库或来源时，优先展示 setup/引导状态；配置完成后展示运营看板。

## 安全与布局

- 只有 SuperAdmin 且具备 `manage:access` 才能进入运营看板实时能力；前端隐藏入口不是权限边界。
- `scope=admin` 只是订阅范围，不是 token；不要把 session、api key、Bearer 或一次性票据放入 URL。
- WebSocket URL 必须从 `window.location.origin` 派生，并转换为同源 `ws:` / `wss:`，不接受配置中的外部绝对地址。
- 不得把 realtime envelope、session id、用户 id、client info、api key、token、播放 URL、Cookie、Authorization 或连接串写入 localStorage / sessionStorage / IndexedDB。
- UI 只展示脱敏 DTO：用户摘要、客户端摘要、媒体标题、进度、状态、来源摘要和负载计数。
- UI 不展示播放直链、stream token、PG / Redis URL、provider 凭据或授权材料。
- 移动端实时播放和来源负载必须单列展示；长标题、客户端信息和来源名必须省略或换行，不允许撑破卡片。
