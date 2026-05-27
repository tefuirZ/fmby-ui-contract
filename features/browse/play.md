# Features · Browse · Play

播放页。

## 路由
- `/play/:itemId?source=:sourceId&t=:seconds`

## 数据
- `GET /api/playback/items/{itemId}?sourceId={sourceId}`：播放决策，返回 `stream_url`、可选直链、字幕和上次位置。
- `POST /api/playback/sessions`：创建或恢复播放会话，返回会话、最终来源、流地址、音轨和字幕轨。
- `POST /api/playback/sessions/{sessionId}/progress`：按 ticks 上报持久化进度。
- `POST /api/playback/sessions/{sessionId}/heartbeat`：保持会话活跃，可附带当前位置和暂停状态。
- `POST /api/playback/sessions/{sessionId}/stop`：结束播放会话。
- 当前一方 Web UI 契约没有独立片头/片尾接口；跳片头/片尾只能依赖媒体元数据或 skin 自身能力。

## 必备 UI

| 区块 | 说明 |
|------|------|
| 视频 | hls.js / dash.js / native；按 mime 选 |
| 控制条 | 播放暂停 / 进度 / 音量 / 倍速 / 全屏 / PIP / cast |
| 字幕 | 多轨切换 + 偏移调节（持久化 preferences） |
| 音轨 | 多语言切换 |
| 章节 | 跳过片头 / 片尾按钮（若有） |
| 外部播放 | iina / vlc / mxplayer：见 [api/domains/playback.md] |
| 下一集 | 剧集尾自动 / 手动 |

## 进度
- 启动时优先使用 `position_ticks` / 会话响应映射出的 resume 位置，弹"是否继续"。
- 退出调用 `stop`；seek、暂停、恢复调用 `progress`，需要更新活跃态时再调用 `heartbeat`。
- 网络差时 heartbeat 失败排队重试，避免重置进度

## 状态
- 源不可达 → 重新请求播放决策或回详情页让用户换源；不要在前端伪造可播地址。
- 401 中途 → 暂停 + 弹「会话过期，请重新登录」

## 皮肤建议
- 触摸端隐藏控件 3s
- 桌面端键盘快捷键：Space, ←/→, F, M
- 移动端横屏全屏锁定
