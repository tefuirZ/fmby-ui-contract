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
   响应: { item_id, source_id, play_method, stream_url, position_ticks, subtitles }
   │
   ▼
3. POST /api/playback/sessions
   body: { item_id, source_id, client_info, position_ticks }
   响应: { session_id, stream_url, active_source, audio_tracks, subtitle_tracks }
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
| heartbeat | 每 ~30s 定时 / 暂停态变化 | `{ position_ticks, paused }` |
| progress | seek、pause、resume、buffer event | `{ position_ticks, duration_ticks, is_completed }` |
| stop | 关闭播放器 / unmount | `{ position_ticks, duration_ticks, is_completed }` |

> **重要**：用户关闭浏览器 tab 时务必用 `navigator.sendBeacon('/api/playback/sessions/{id}/stop', ...)`，否则会有"幽灵会话"。fmby 后端有兜底（heartbeat 超时自动判死，默认 90s），但 sendBeacon 更准确。

---

## 端点详解

### `GET /api/playback/items/{itemId}`

| Query | 说明 |
|---|---|
| `sourceId` / `source_id` | 选定哪个源（如不指定，后端选 best） |

响应：

```json
{
  "item_id": "item_abc",
  "source_id": "src_001",
  "play_method": "DirectPlay",
  "stream_url": "/api/assets/streams/src_001",
  "direct_url": null,
  "direct_url_kind": null,
  "stream_origin_kind": null,
  "requires_range_support": true,
  "duration_ticks": 81600000000,
  "position_ticks": 18200000000,
  "subtitles": [
    { "id": "subtitle_001", "language": "zh", "url": "/api/assets/subtitles/subtitle_001" }
  ]
}
```

`play_method` 是后端当前播放决策的字符串值；skin 不应枚举兜底成错误含义。浏览器播放优先使用 `stream_url`，外部播放器可在存在时使用 `direct_url`。

### `POST /api/playback/sessions`

```json
{
  "item_id": "item_abc",
  "source_id": "src_001",
  "session_id": null,
  "client_info": "MySkin Web 1.2.3",
  "position_ticks": 18200000000
}
```

响应：

```json
{
  "session_id": "psess_xyz",
  "item_id": "item_abc",
  "source_id": "src_001",
  "item": {},
  "title": "示例电影",
  "subtitle": null,
  "status": "Playing",
  "play_method": "DirectPlay",
  "stream_url": "/api/assets/streams/src_001",
  "external_stream_url": null,
  "external_stream_expires_at": null,
  "direct_url": null,
  "mime_type": "video/mp4",
  "active_source": {
    "id": "src_001",
    "container": "mp4",
    "video_codec": "h264",
    "audio_codec": "aac",
    "duration_ticks": 81600000000,
    "width": 1920,
    "height": 1080
  },
  "audio_tracks": [],
  "subtitle_tracks": [],
  "duration_ticks": 81600000000,
  "position_ticks": 18200000000,
  "started_at": "2026-01-15T10:30:00Z",
  "last_heartbeat_at": "2026-01-15T10:30:00Z"
}
```

### `POST /api/playback/sessions/{id}/heartbeat`

```json
{ "position_ticks": 1450000000, "paused": false }
```

响应：

```json
{ "ok": true }
```

如果 session 不存在 → `404` + `ApiErrorResponse`，skin 应停止上报。

### `POST /api/playback/sessions/{id}/progress`

```json
{
  "position_ticks": 18200000000,
  "duration_ticks": 81600000000,
  "is_completed": false
}
```

可在每次 seek、pause、resume 调用。

### `POST /api/playback/sessions/{id}/stop`

```json
{
  "position_ticks": 72000000000,
  "duration_ticks": 81600000000,
  "is_completed": true
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
  "items": [
    {
      "session_id": "psess_xyz",
      "item_id": "item_abc",
      "source_id": "src_001",
      "item_title": "示例电影",
      "status": "Playing",
      "play_method": "DirectPlay",
      "client_info": "MySkin Web 1.2.3",
      "started_at": "2026-01-15T10:30:00Z",
      "last_heartbeat_at": "2026-01-15T10:31:00Z",
      "stopped_at": null
    }
  ],
  "total": 1
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

- 用 hls.js / dash.js / native `<video>` 三选一，依据 `play_method`、`mime_type`、`active_source.container` 和实际 URL 类型判断。
- heartbeat 用 `setInterval` + 页面 `visibilitychange` 监听（隐藏时降频）
- progress 用 throttle / debounce，每 5-10 秒上报一次足矣
- 移动端：监听 `pagehide` 事件 + `sendBeacon` 上报 stop
- 错误：流加载失败时给"换源"按钮（重新调 `/api/playback/items/{id}?source_id=...`）
- 字幕：vtt 直接 `<track>`，srt / ass 需要前端转 vtt（推荐 subtitles-octopus 处理 ass）
