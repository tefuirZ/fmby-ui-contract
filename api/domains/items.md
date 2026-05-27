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

## 响应形状（ItemDetailResponse）

```json
{
  "item": {
    "id": "item_abc",
    "library_id": "lib_001",
    "library_name": "电影",
    "parent_id": null,
    "playback_target_id": "item_abc",
    "availability_notice": null,
    "title": "黑客帝国",
    "subtitle": null,
    "original_title": "The Matrix",
    "sort_title": "Matrix",
    "media_type": "Movie",
    "year": 1999,
    "overview": "...",
    "community_rating": 8.7,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-01-15T10:30:00Z",
    "source_count": 1,
    "has_playable_source": true,
    "primary_source_id": "src_001",
    "duration_ticks": 81600000000,
    "width": 1920,
    "height": 1080,
    "dynamic_range_label": "HDR10",
    "poster_url": "/api/assets/items/item_abc/images/poster",
    "backdrop_url": "/api/assets/items/item_abc/images/backdrop",
    "thumb_url": null,
    "progress": {
      "position_ticks": 0,
      "duration_ticks": 81600000000,
      "last_played_at": "2026-01-15T10:30:00Z",
      "is_completed": false
    }
  },
  "children": [],
  "children_total": 0,
  "related_items": [],
  "sources": [],
  "assets": [],
  "playback_progress": null,
  "metadata_extras": {
    "genres": ["科幻", "动作"],
    "directors": ["Lana Wachowski"],
    "actors": [
      { "name": "Keanu Reeves", "role": "Neo" }
    ],
    "studios": [],
    "external_ids": [
      { "provider": "tmdb", "id": "603" }
    ]
  }
}
```

**媒体类型来自 `item.media_type`，前端可自行映射成展示用 kind。常见值：**

| media_type | 含义 |
|---|---|
| `Movie` | 电影 |
| `Series` | 剧集 |
| `Season` | 季 |
| `Episode` | 单集 |
| `Collection` | 合集 / 系列 |

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
  → 返回刷新后的 ItemDetailResponse
  → 当前路由不接收 JSON body，不返回 task_id
```

---

## 端点详解

### `GET /api/items/{itemId}`

返回单条媒体的完整详情。

错误：`item_not_found` / `forbidden`（库无权访问）。

### `GET /api/items/{itemId}/children`

| Query | 说明 |
|---|---|
| `page` | 页码，默认 1 |
| `pageSize` / `page_size` | 每页数量，默认 20，后端 clamp 到 1-100 |

适用：

- series → 返回 seasons
- season → 返回 episodes
- movie / episode → 空 items

### `GET /api/items/{itemId}/descendants`

平铺所有后代。适合 series 直接拿全 episodes。

| Query | 说明 |
|---|---|
| `page` | 页码，默认 1 |
| `pageSize` / `page_size` | 每页数量，默认 20，后端 clamp 到 1-100 |

### `GET /api/items/{itemId}/sources`

返回该媒体可播放的源（一个媒体可能多源——本地文件 + 115 + WebDAV）。

```json
{
  "items": [
    {
      "id": "src_001",
      "media_item_id": "item_abc",
      "mount_id": "mnt_a",
      "mount_name": "本地电影",
      "provider_type": "Local",
      "mount_status": "Active",
      "file_path": "/movies/Matrix.1999.mkv",
      "source_status": "Playable",
      "container": "mkv",
      "size_bytes": 15728640,
      "duration_ticks": 81600000000,
      "bitrate": 18000000,
      "width": 1920,
      "height": 1080,
      "video_codec": "h264",
      "audio_codec": "ac3",
      "audio_track_count": 2,
      "subtitle_count": 1,
      "video_streams": [],
      "audio_streams": [],
      "subtitle_streams": [],
      "stream_url": "/api/assets/streams/src_001",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

注意 `mount_status` / `source_status` 非可播的源（挂载点掉线 / 凭据失效）skin 应灰显或隐藏。

### `POST /api/items/{itemId}/refresh-metadata`

```http
POST /api/items/{itemId}/refresh-metadata
X-CSRF-Token: ...
```

响应是刷新后的 `ItemDetailResponse`。

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
- 按 `mount_status` / `source_status` 排序，不可用源沉底
- 进度字段使用 ticks；展示秒数时由前端显式转换
