# Features · Browse · Play

播放页。

## 路由
- `/play/:itemId?source=:sourceId&t=:seconds`

## 数据
- `POST /api/items/{id}/play-target`：返回 stream URL（302 redirect 或直链）+ subtitles + chapters
- `POST /api/playback/heartbeat`：进度上报（每 10s 或暂停/seek 时）
- `POST /api/playback/stopped`：结束上报
- `GET /api/items/{id}/intro-credits`（若可用）：片头/片尾时间

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
- 启动时读 `last_position_seconds`，弹"是否继续"
- 退出/暂停/seek 立即 heartbeat
- 网络差时 heartbeat 失败排队重试，避免重置进度

## 状态
- 源不可达 → 自动尝试同条目其它 source；都失败回详情页
- 401 中途 → 暂停 + 弹「会话过期，请重新登录」

## 皮肤建议
- 触摸端隐藏控件 3s
- 桌面端键盘快捷键：Space, ←/→, F, M
- 移动端横屏全屏锁定
