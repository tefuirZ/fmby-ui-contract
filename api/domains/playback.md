# Playback

> 播放决策、播放会话生命周期（heartbeat / progress / stop）。

skin 的播放器接到 fmby 后端的所有交互都在这里。

---

## 端点速查

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/playback/items/{itemId}` | GET | 播放决策（拿到流 URL / 字幕 / 推荐源） |
| `/api/playback/sessions` | GET | 当前用户的所有播放会话 |
| `/api/playback/sessions` | POST | 创建播放会话（开播一条） |
| `/api/playback/sessions/{sessionId}/heartbeat` | POST | 心跳（保持会话活跃） |
| `/api/playback/sessions/{sessionId}/progress` | POST | 上报观看进度 |
| `/api/playback/sessions/{sessionId}/stop` | POST | 主动结束会话 |

---

## 关键流程

### 完整生命周期

```
1. 用户点"播放"
   │
   ▼
2. GET /api/playback/items/{itemId}?source_id=src_001
   响应: { stream_url, subtitles, audio_tracks, recommended_seek_seconds }
   │
   ▼
3. POST /api/playback/sessions
   body: { item_id, source_id, client: { name, version, capabilities } }
   响应: { session_id }
   │
   ▼
4. <video src={stream_url} /> 开播
   │
   ▼
5. 每 30s 一次 → POST /api/playback/sessions/{id}/heartbeat
   每次进度变化 (seek / pause) → POST /api/playback/sessions/{id}/progress
   │
   ▼
6. 用户停止播放 / 关闭窗口
   POST /api/playback/sessions/{id}/stop
```

### 心跳与进度

| 操作 | 触发 | body |
|---|---|---|
| heartbeat | 每 ~30s 定时 | `{ position_seconds }` |
| progress | seek、pause、resume、buffer event | `{ position_seconds, paused, playback_rate }` |
| stop | 关闭播放器 / unmount | `{ position_seconds, completed: bool }` |

> **重要**：用户关闭浏览器 tab 时务必用 `navigator.sendBeacon('/api/playback/sessions/{id}/stop', ...)`，否则会有"幽灵会话"。fmby 后端有兜底（heartbeat 超时自动判死，默认 90s），但 sendBeacon 更准确。

---

## 端点详解

### `GET /api/playback/items/{itemId}`

| Query | 说明 |
|---|---|
| `source_id` | 选定哪个源（如不指定，后端选 best） |
| `audio_track_id` | 可选 |
| `subtitle_track_id` | 可选 |
| `client_capabilities` | 客户端能力声明（codec 列表，可影响 transcode 决策） |

响应：

```json
{
  "decision": "direct_play",            // direct_play / direct_stream / transcode / redirect
  "stream_url": "/api/assets/streams/src_001",
  "stream_kind": "mp4",                  // mp4 / hls / dash / direct
  "headers": {                           // 客户端发流请求时要带的额外 header（如 Range）
    "Range": "bytes=0-"
  },
  "audio_tracks": [
    { "id": "a1", "language": "eng", "codec": "ac3", "channels": 6, "default": true }
  ],
  "subtitle_tracks": [
    { "id": "s1", "language": "chi", "format": "vtt", "url": "/api/assets/subtitles/sub_xxx" }
  ],
  "video": { "width": 1920, "height": 1080, "duration_seconds": 8160 },
  "recommended_seek_seconds": 1820,      // 上次中断位置（resume）
  "session_hint": {                       // POST /sessions 时复用
    "item_id": "item_abc",
    "source_id": "src_001"
  }
}
```

**decision 字段语义**：

| 值 | 含义 |
|---|---|
| `direct_play` | 客户端直接 fetch `stream_url`（最快，无 transcode） |
| `direct_stream` | 同上但需 remux |
| `transcode` | 后端 transcode（当前 fmby 不强制提供 transcode，可能不出现） |
| `redirect` | `stream_url` 是 302 跳到 CDN（如 115 直链）—— 客户端应支持自动 follow |

### `POST /api/playback/sessions`

```json
{
  "item_id": "item_abc",
  "source_id": "src_001",
  "client": {
    "name": "MySkin Web",
    "version": "1.2.3",
    "device_kind": "browser",
    "user_agent": "..."
  }
}
```

响应：

```json
{
  "session_id": "psess_xyz",
  "started_at": "2026-01-15T10:30:00Z",
  "heartbeat_interval_seconds": 30
}
```

### `POST /api/playback/sessions/{id}/heartbeat`

```json
{ "position_seconds": 145 }
```

响应：`204 No Content`。如果 session 不存在 → `404 session_not_found`，skin 应停止上报。

### `POST /api/playback/sessions/{id}/progress`

```json
{
  "position_seconds": 1820,
  "paused": false,
  "playback_rate": 1.5,
  "audio_track_id": "a1",
  "subtitle_track_id": "s1"
}
```

可在每次 seek、pause、resume 调用。

### `POST /api/playback/sessions/{id}/stop`

```json
{
  "position_seconds": 7200,
  "completed": true                       // true = 看完了（如 >= 90% 时长）
}
```

后端会：

- 把进度写入用户的"已看 / 继续观看"
- 触发 webhook（如有）
- 标记会话结束

### `GET /api/playback/sessions`

列出当前用户的活跃会话（如多端在播）：

```json
{
  "sessions": [
    {
      "id": "psess_xyz",
      "item": { /* MediaItemSummary */ },
      "started_at": "...",
      "last_heartbeat_at": "...",
      "position_seconds": 1820,
      "client": { /* ... */ }
    }
  ]
}
```

可用于"在其它设备播放中"提示。

---

## 错误处理

| code | 场景 |
|---|---|
| `item_not_found` | item id 错 |
| `source_not_available` | 该源当前不可用（挂载掉线） |
| `provider_error` | provider 上游报错（115 401 等） |
| `session_not_found` | session 已被清理 / id 错 |
| `forbidden` | 无 `playback` capability |

---

## 与其它域的关系

- 播放前调 [`items.md`](./items.md) 拿 sources
- stream_url 由 [`assets.md`](./assets.md) 的 `/api/assets/streams/{sourceId}` 提供
- subtitle URL 由 `/api/assets/subtitles/{assetId}` 提供
- 后台 [`manage/sessions.md`](./manage/sessions.md) 是**鉴权 session**，不是播放会话——别混淆

---

## skin 实现建议

- 用 hls.js / dash.js / native `<video>` 三选一，依据 `decision` + `stream_kind`
- heartbeat 用 `setInterval` + 页面 `visibilitychange` 监听（隐藏时降频）
- progress 用 throttle / debounce，每 5-10 秒上报一次足矣
- 移动端：监听 `pagehide` 事件 + `sendBeacon` 上报 stop
- 错误：流加载失败时给"换源"按钮（重新调 `/api/playback/items/{id}?source_id=...`）
- 字幕：vtt 直接 `<track>`，srt / ass 需要前端转 vtt（推荐 subtitles-octopus 处理 ass）
