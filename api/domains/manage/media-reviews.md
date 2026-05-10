# Manage · Media Reviews

元数据审核工单：刮削结果有歧义（多个 TMDB 候选 / 命名识别不出）时进入审核队列。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/media-reviews` | 列表 `?status=open|claimed|resolved&assignee&page&page_size` |
| GET    | `/api/manage/media-reviews/{reviewId}` | 详情（候选列表 + 原始命名 + 关联文件） |
| POST   | `/api/manage/media-reviews/{reviewId}/claim` | 当前管理员认领（独占） |
| POST   | `/api/manage/media-reviews/{reviewId}/release` | 释放认领 |
| POST   | `/api/manage/media-reviews/{reviewId}/resolve` | 决议：选定候选或自填 external_id |

## DTO

`MediaReview`：
```jsonc
{
  "id": "uuid",
  "media_item_id": "uuid?",
  "library_id": "uuid",
  "raw_filename": "Some.Movie.2023.1080p.mkv",
  "parsed":   { "title": "Some Movie", "year": 2023 },
  "candidates": [
    { "provider": "tmdb", "external_id": "12345", "title": "Some Movie", "year": 2023, "score": 0.92, "poster_url": "..." }
  ],
  "status": "open|claimed|resolved",
  "claimed_by_user_id": "uuid?",
  "claimed_at": "...",
  "resolved_by_user_id": "uuid?",
  "resolved_at": "...",
  "resolution": { "provider": "tmdb", "external_id": "12345" }
}
```

`ResolveReq`：`{ provider: "tmdb|tvdb|douban", external_id: "12345" }` 或 `{ skip: true }`（标记忽略）

> 权威：`crates/fmby-api/src/manage/dto/media_reviews.rs`。

## 关键流程

1. claim → 列表行变灰、其它管理员看到「张三正在处理」
2. resolve → 后端走 identify + scrape，结果落到对应 media_item
3. release → 不决议直接放回开放队列

## 错误

- `409 conflict`：claim 时已被他人认领
- `410 gone`：resolve 时关联的文件已被删
- `422 validation`：external_id 在 provider 不存在

## 皮肤实现建议

- 队列页双栏：左列表（按 library 分组）+ 右候选对比卡（标题/年份/海报/置信度）
- 顶部「我的认领」筛选
- 候选卡按 score 降序
- 决议成功 → toast + 5s 后从队列移除（避免误重复点）
