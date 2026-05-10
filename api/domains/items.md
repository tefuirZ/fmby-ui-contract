# Items

> 媒体详情：单条媒体的字段、子项（season/episode）、后代、源（多 provider）、刷新元数据。

---

## 端点速查

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/items/{itemId}` | GET | 媒体详情 |
| `/api/items/{itemId}/children` | GET | 直接子项（season → episode 的 episode 列表，series → seasons） |
| `/api/items/{itemId}/descendants` | GET | 所有后代（用于 series 直接拿全 episodes） |
| `/api/items/{itemId}/sources` | GET | 该媒体可用的播放源 |
| `/api/items/{itemId}/refresh-metadata` | POST | 触发重新刮削（异步） |

普通用户都能调（要求登录）。`refresh-metadata` 通常需要 `manage:media-items` 或 owner-level 权限。

---

## 字段（MediaItemDetail 关键字段）

```json
{
  "id": "item_abc",
  "kind": "movie",                       // movie / series / season / episode / collection
  "title": "黑客帝国",
  "original_title": "The Matrix",
  "year": 1999,
  "release_date": "1999-03-31",
  "overview": "...",
  "runtime_minutes": 136,
  "rating": { "imdb": 8.7, "tmdb": 8.2 },
  "genres": ["科幻", "动作"],
  "tags": ["cyberpunk"],
  "library": { "id": "lib_001", "name": "电影" },
  "parent": null,                        // episode 的 parent 是 season
  "primary_image_url": "/api/assets/items/item_abc/images/primary",
  "backdrop_image_url": "/api/assets/items/item_abc/images/backdrop",
  "logo_image_url": "/api/assets/items/item_abc/images/logo",
  "people": [
    { "id": "p_xxx", "name": "Keanu Reeves", "role": "Neo", "kind": "actor" }
  ],
  "user_data": {
    "watched": false,
    "favorite": false,
    "playback_position_seconds": 0,
    "played_count": 0
  },
  "external_ids": { "tmdb": "603", "imdb": "tt0133093" },
  "scrape_status": "success",            // pending / running / success / failed
  "created_at": "...", "updated_at": "..."
}
```

**类型枚举 `kind`**：

| kind | 含义 |
|---|---|
| `movie` | 电影 |
| `series` | 剧集 |
| `season` | 季 |
| `episode` | 单集 |
| `collection` | 合集 / 系列 |

---

## 关键流程

### 详情页

```
useParams() → itemId
useQuery(`/api/items/${itemId}`)
  ↓
if (kind === "series") {
  useQuery(`/api/items/${itemId}/children`)  // 拿 seasons
}
if (kind === "season") {
  useQuery(`/api/items/${itemId}/children`)  // 拿 episodes
}
useQuery(`/api/items/${itemId}/sources`)     // 拿可播放源
```

### 触发刷新

```
button "重新刮削" → POST /api/items/{id}/refresh-metadata
  → 202 Accepted（异步），返回 { task_id }
  → skin 可以选择跳到 task-center 或继续轮询 GET /api/items/{id} 看 scrape_status
```

---

## 端点详解

### `GET /api/items/{itemId}`

返回单条媒体的完整详情。

错误：`item_not_found` / `forbidden`（库无权访问）。

### `GET /api/items/{itemId}/children`

| Query | 说明 |
|---|---|
| `order_by` | 默认按 episode_number / season_number |
| `order` | asc / desc |
| `page` / `page_size` | 分页 |

适用：

- series → 返回 seasons
- season → 返回 episodes
- movie / episode → 空 items

### `GET /api/items/{itemId}/descendants`

平铺所有后代。适合 series 直接拿全 episodes。

| Query | 说明 |
|---|---|
| `kind` | 仅返回某类型（如 `episode`） |
| `page` / `page_size` | 分页（建议大型 series 加上） |

### `GET /api/items/{itemId}/sources`

返回该媒体可播放的源（一个媒体可能多源——本地文件 + 115 + WebDAV）。

```json
{
  "sources": [
    {
      "id": "src_001",
      "provider_kind": "local",
      "mount_id": "mnt_a",
      "path": "/movies/Matrix.1999.mkv",
      "size_bytes": 15728640,
      "video": { "codec": "h264", "width": 1920, "height": 1080, "duration_seconds": 8160 },
      "audio_tracks": [ { "codec": "ac3", "language": "eng", "channels": 6 } ],
      "subtitle_tracks": [ { "language": "chi", "format": "srt" } ],
      "available": true,
      "last_seen_at": "..."
    },
    {
      "id": "src_002",
      "provider_kind": "pan115",
      "mount_id": "mnt_b",
      "available": true
    }
  ]
}
```

注意 `available: false` 的源（挂载点掉线 / 凭据失效）skin 应灰显或隐藏。

### `POST /api/items/{itemId}/refresh-metadata`

```http
POST /api/items/item_abc/refresh-metadata
X-CSRF-Token: ...

{
  "force": false                  // true = 全量重抓；false = 增量补全
}
```

响应（202 Accepted）：

```json
{
  "task_id": "task_xyz",
  "queued_at": "..."
}
```

错误：`task_already_running` / `forbidden`。

---

## 与其它域的关系

- 海报 / 字幕 URL → [`assets.md`](./assets.md)
- 播放 → 拿到 sources 后，调 [`playback.md`](./playback.md) `/api/playback/items/{id}` 决策
- 后台改元数据 → [`manage/media-items.md`](./manage/media-items.md)
- 触发刷新的任务进度 → [`manage/task-center.md`](./manage/task-center.md)

---

## skin 实现建议

- series 详情页可考虑 collapsed seasons + 默认展开第一季
- episode 详情页要有"上一集 / 下一集"快捷跳转
- sources 多个时给用户选择 UI（不要默认隐藏）
- 按 `available` 排序，不可用源沉底
- `user_data` 字段用乐观更新（点击"已看"立刻更新 UI，再调 API）
