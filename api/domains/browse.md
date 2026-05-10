# Browse

> 浏览侧：首页推荐、媒体库列表与详情、历史、搜索、最近添加、继续观看。

skin 的"主页 / 媒体库导航 / 搜索栏"基本都靠这个域。

---

## 端点速查

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/browse/home/bootstrap` | GET | 首页初始化数据（导航、收藏、关键 widget） |
| `/api/browse/home` | GET | 首页推荐流 |
| `/api/browse/recently-added` | GET | 最近添加（可分页） |
| `/api/browse/resume` | GET | 继续观看队列 |
| `/api/browse/history` | GET | 观看历史（cursor 分页） |
| `/api/browse/search` | GET | 全局搜索（query: `q`, `kind`, `library_id`） |
| `/api/browse/libraries` | GET | 当前用户可访问的媒体库列表 |
| `/api/browse/libraries/{libraryId}` | GET | 单个媒体库详情 + 内容（分页） |

所有端点都需要登录（`401` 未登录）。

---

## 关键流程

### 首屏加载

```
loginGuard ✅
   │
   ▼
useQuery("/api/browse/home/bootstrap")  // 一次性拿导航、用户偏好等
   │
   ├─→ useQuery("/api/browse/home")     // 推荐流（卡片）
   ├─→ useQuery("/api/browse/resume")   // 继续观看（封面 + 进度条）
   └─→ useQuery("/api/browse/recently-added?limit=12")
```

### 媒体库页

```
useParams() → libraryId
useQuery(`/api/browse/libraries/${libraryId}?page=1`)
  → 显示标题 / 排序 / 筛选 + 网格
```

### 搜索

```
inputDebounce("foo")
  → useQuery("/api/browse/search?q=foo&page_size=20")
  → 返回 items 数组（混合 movie / series / season / episode）
```

---

## 端点详解

### `GET /api/browse/home/bootstrap`

返回首页所需的"一揽子"初始化数据。**通常每次进入首页只调一次**。

响应（示意）：

```json
{
  "user": { /* SessionUserInfo */ },
  "libraries": [ /* Library[] */ ],
  "preferences": {
    "default_view": "grid",
    "show_resume": true
  },
  "site": {
    "site_name": "我的小媒体库",
    "homepage_message": ""
  }
}
```

> 字段精确版本请看 classic skin 的 `apps/web/src/api/types/browse.ts`（或后续 OpenAPI）。

### `GET /api/browse/home`

首页推荐流。返回**多组 section**：

```json
{
  "sections": [
    {
      "id": "recently_added",
      "title": "最近添加",
      "items": [ /* MediaItemSummary[] */ ]
    },
    {
      "id": "resume",
      "title": "继续观看",
      "items": [ /* ... */ ]
    },
    {
      "id": "trending_movies",
      "title": "热门电影",
      "items": [ /* ... */ ]
    }
  ]
}
```

每个 section 至多 12 项左右。skin 在卡片上点击进入 `items.md` 详情页。

### `GET /api/browse/recently-added`

| Query | 默认 | 说明 |
|---|---|---|
| `library_id` | — | 仅查某库（不传 = 全部） |
| `kind` | — | `movie` / `series` / `episode` 等 |
| `page` / `page_size` | 1 / 20 | 分页 |

响应：标准分页 envelope。

### `GET /api/browse/resume`

返回当前用户**有进度** 的项（PlaybackProgress 表的活跃记录）。

```json
{
  "items": [
    {
      "item": { /* MediaItemSummary */ },
      "progress_seconds": 1820,
      "duration_seconds": 7200,
      "last_played_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### `GET /api/browse/history`

观看历史，cursor 分页：

| Query | 说明 |
|---|---|
| `cursor` | 上次的 next_cursor |
| `limit` | 默认 30 |

### `GET /api/browse/search`

| Query | 说明 |
|---|---|
| `q` | 关键词（必填，UTF-8 percent-encoded） |
| `kind` | 限定类型 |
| `library_id` | 限定媒体库 |
| `page` / `page_size` | 分页 |

返回标准分页 + 类型混合：

```json
{
  "items": [
    { "kind": "movie", "id": "...", "title": "...", "primary_image_url": "...", "year": 2024 },
    { "kind": "series", "id": "...", "title": "...", "primary_image_url": "...", "year": 2023 }
  ],
  "page": 1, "page_size": 20, "total": 42, "total_pages": 3
}
```

### `GET /api/browse/libraries`

```json
{
  "libraries": [
    { "id": "lib_001", "name": "电影", "kind": "movies", "items_count": 1280 },
    { "id": "lib_002", "name": "剧集", "kind": "tv", "items_count": 230 }
  ]
}
```

### `GET /api/browse/libraries/{libraryId}`

| Query | 说明 |
|---|---|
| `order_by` | `title` / `added_at` / `release_date` / `random` |
| `order` | `asc` / `desc` |
| `kind` | 限定类型（库内多类型时用） |
| `page` / `page_size` | 分页 |
| `q` | 库内搜索 |

响应：

```json
{
  "library": { /* Library */ },
  "items": [ /* MediaItemSummary[] */ ],
  "page": 1, "page_size": 20, "total": ..., "total_pages": ...
}
```

错误：`library_not_found` / `forbidden`（无权访问该库）。

---

## 与其它域的关系

- 点击卡片 → 跳详情页 → 调 [`items.md`](./items.md) 的 `/api/items/{id}`
- 海报 URL → 直接当 `<img src>`，由 [`assets.md`](./assets.md) serve
- 搜索结果 → 同上
- 用户偏好（默认视图等） → 由 [`settings.md`](./settings.md) 设置 / 读取

---

## skin 实现建议

- 首页用 TanStack Query 的 prefetch + suspense，提升首屏体验
- 搜索框做 350ms debounce + abort 上一次请求
- 媒体库页支持 URL state（`?page=2&order_by=title`）便于分享 / 后退
- 卡片图片懒加载 + LQIP 占位
- 移动端搜索改为全屏 modal 体验
