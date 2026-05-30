# Changelog

本仓库记录 FMBY WebUI / skin 对外合同变更。版本仍处于 `0.x` draft 阶段，破坏性风险以具体条目说明。

## [Unreleased]

### Added

- 新增管理端运营看板实时合同，覆盖活跃播放快照、来源负载快照和 `GET /api/playback/realtime/ws?scope=admin`。
- 新增第一方播放实时 WebSocket 合同，区分普通用户 scope 与管理端 admin scope，并固定事件 envelope、事件类型和降级行为。
- 新增 WebSocket 安全验收项，约束 Cookie session + Origin、禁止 query token / `api_key`、禁止 Web Storage 和敏感 payload。

### Changed

- `development/api-client.md` 明确普通浏览主题仍可只用轮询，管理端 operations dashboard 使用同源 WebSocket + HTTP fallback。
- `features/manage/operations-dashboard.md` 扩展实时播放、来源负载、连接状态 badge、移动端布局和 degraded / disabled 状态矩阵。
- `api/domains/manage/operations.md` 同步运行观测、active playback、source load 和管理端 realtime 通道示例。

### Security

- 第一方 `/api/playback/realtime/ws` 固定使用 Cookie session + Origin 校验；`scope=admin` 只表示订阅范围，不是认证材料。
- 禁止 WebUI / skin 展示或缓存播放直链、stream token、Cookie、Authorization、PG / Redis URL、provider 凭据和授权材料。
- 兼容入口 `/embywebsocket`、`/jellyfinwebsocket` 的 `api_key` 语义不得复用到第一方 realtime WS。

### Compatibility

- 新增 realtime 能力是向后兼容扩展；普通 skin 可以继续使用 HTTP/轮询模型。
- 需要管理端实时运营看板的 skin 必须实现 HTTP 初始快照、WS snapshot 更新和 degraded HTTP fallback。
