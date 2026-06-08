# Changelog

本仓库记录 FMBY WebUI / skin 对外合同变更。版本仍处于 `0.x` draft 阶段，破坏性风险以具体条目说明。

## [Unreleased]

### Added

- 新增人物合集合同：`/people/:personId`、`GET /api/items/people/{personId}` 和 `GET /api/items/people/{personId}/items`。
- 新增 WebUI 默认 ArtPlayer 与远端视频不经服务端代理的播放边界合同。
- 新增 Microsoft 数据源创建向导合同：从 `microsoft-global` / `microsoft-china`、OneDrive / SharePoint、token 授权、drive/site 选择、持久账号导入、目录选择到创建来源必须形成连续闭环。
- 新增单一 Admin 管理员契约：管理后台只保留 Admin 作为管理员语义，权限边界以后端 capability guard 与 license entitlement 为准。
- 新增管理端运营看板实时合同，覆盖活跃播放快照、来源负载快照和 `GET /api/playback/realtime/ws?scope=admin`。
- 新增第一方播放实时 WebSocket 合同，区分普通用户 scope 与管理端 admin scope，并固定事件 envelope、事件类型和降级行为。
- 新增 WebSocket 安全验收项，约束 Cookie session + Origin、禁止 query token / `api_key`、禁止 Web Storage 和敏感 payload。
- 新增管理端待审核队列人工匹配合同，覆盖 `/manage/media/reviews`、`provider-search` 和 `ManualMatch` resolve payload。
- 新增系统关于页合同，覆盖 `/manage/site/about` 与 `GET /api/manage/system/about` 的脱敏版本、链接、依赖和部署摘要。
- 新增登录风控手动解除合同：账号级 `POST /api/manage/users/{userId}/login-risk/reset`，IP 级 `POST /api/manage/login-risk/ip/reset`。

### Changed

- 管理端用户列表合同明确改为后端分页 / 后端筛选，`total` 是全站账号总数，前端不得只拉第一页后本地过滤；批量选择范围固定为当前页。
- 站点安全策略合同明确拆分 IP 登录限流与账号失败锁定；`/api/settings/server/security` 要求 `system:security`。
- `features/manage/microsoft.md`、`api/domains/manage/microsoft.md` 与 `api/domains/manage/mounts.md` 明确 Microsoft mount wizard contract，禁止只给孤立“导入持久账号”按钮。
- `api/auth.md` 与管理端领域文档统一 Admin 管理员措辞；历史 SuperAdmin 仅作为兼容别名说明，不再作为前端权限判断依据。
- `development/api-client.md` 明确普通浏览主题仍可只用轮询，管理端 operations dashboard 使用同源 WebSocket + HTTP fallback。
- `features/manage/operations-dashboard.md` 扩展实时播放、来源负载、连接状态 badge、移动端布局和 degraded / disabled 状态矩阵。
- `api/domains/manage/operations.md` 同步运行观测、active playback、source load 和管理端 realtime 通道示例。
- `api/domains/manage/media-reviews.md` 更新为当前真实审核队列 API，明确来源路径展示、provider 搜索和异步重刮语义。

### Security

- WebUI 播放器不得为视频元素默认设置 `crossorigin` / `crossOrigin`，也不得用服务端视频代理、fetch/blob 中转或隐藏 iframe 代理规避 115 / Pan115 CDN CORS。
- Microsoft 授权 URL、完整 callback URL、access token、refresh token、tenant 信息和中间授权态只能保存在页面内存态；不得写入 localStorage、sessionStorage、IndexedDB、URL query、日志或持久表单草稿。
- 第一方 `/api/playback/realtime/ws` 固定使用 Cookie session + Origin 校验；`scope=admin` 只表示订阅范围，不是认证材料。
- 禁止 WebUI / skin 展示或缓存播放直链、stream token、Cookie、Authorization、PG / Redis URL、provider 凭据和授权材料。
- 兼容入口 `/embywebsocket`、`/jellyfinwebsocket` 的 `api_key` 语义不得复用到第一方 realtime WS。
- 系统关于页不得展示 PostgreSQL URL、Redis URL、密码、token、Cookie、license key 或 provider 凭据；GitHub 归属固定 `tefuirZ`，DockerHub 固定 `itefuir/fmby`。

### Compatibility

- 老版本 skin 若仍看到 `SuperAdmin` / `superadmin` 角色名，只能当作 Admin 兼容别名展示；功能入口和接口调用必须继续以后端 `capabilities`、capability guard 与 entitlement 判定。
- 新增 realtime 能力是向后兼容扩展；普通 skin 可以继续使用 HTTP/轮询模型。
- 需要管理端实时运营看板的 skin 必须实现 HTTP 初始快照、WS snapshot 更新和 degraded HTTP fallback。
