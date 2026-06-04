# Manage · Media Reviews

元数据审核队列：识别 / 刮削低置信度、失败或需要人工指定外部 ID 的媒体项会进入这里。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/manage/media-reviews` | 列表，支持 `stage/status/mediaItemId/page/pageSize` |
| GET | `/api/manage/media-reviews/provider-search` | 搜索 provider 候选 |
| GET | `/api/manage/media-reviews/{reviewId}` | 详情 |
| POST | `/api/manage/media-reviews/{reviewId}/claim` | 当前管理员认领 |
| POST | `/api/manage/media-reviews/{reviewId}/release` | 释放认领 |
| POST | `/api/manage/media-reviews/{reviewId}/resolve` | 解决审核项 |

## 权限

- Cookie session
- `manage:access`
- `manage:libraries`

## 列表查询

```text
GET /api/manage/media-reviews?stage=Scrape&status=open&page=1&pageSize=50
```

响应：

```jsonc
{
  "items": [/* ManagedMediaReviewQueueItem */],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

`ManagedMediaReviewQueueItem` 关键字段：

```jsonc
{
  "id": "review-id",
  "media_item_id": "item-id",
  "media_item_title": "标题",
  "context": {
    "library_id": "library-id",
    "library_name": "电影库",
    "media_type": "Movie",
    "title": "标题",
    "season_number": null,
    "episode_number": null,
    "parsed": {
      "title": "解析标题",
      "year": 2026,
      "season_number": null,
      "episode_number": null,
      "confidence": 0.42
    },
    "primary_source": {
      "source_id": "source-id",
      "mount_id": "mount-id",
      "mount_name": "115 来源",
      "provider_type": "Pan115",
      "provider_label": "115",
      "mount_status": "Active",
      "source_status": "Playable",
      "file_path": "/raw/path/file.mkv",
      "display_path": "115 来源 / 片名/file.mkv"
    },
    "failure": {
      "stage": "Scrape",
      "reason_code": "LowConfidence",
      "error_code": null,
      "error_message": null
    }
  },
  "review_stage": "Scrape",
  "reason_code": "LowConfidence",
  "status": "Open",
  "priority": 100,
  "claimed_by_user_id": null,
  "claimed_at": null,
  "resolved_by_user_id": null,
  "resolved_at": null
}
```

`context.primary_source.display_path / file_path` 是人工审核的必要上下文，UI 不能省略。

## Provider 搜索

```text
GET /api/manage/media-reviews/provider-search?provider=tmdb&query=Movie&mediaType=Movie&year=2026
```

查询参数：

- `provider`: `tmdb | douban`
- `query`，别名 `q`
- `mediaType`
- `entityType`
- `year`
- `language`
- `region`

响应候选字段：

- `provider`
- `entity_type`
- `provider_item_id`
- `title`
- `original_title`
- `year`
- `confidence`
- `external_ids[]`
- `evidence_json`

## Resolve

请求体：

```jsonc
{
  "action": "ManualMatch",
  "payload": {
    "provider": "tmdb",
    "externalId": "12345",
    "entityType": "Movie",
    "title": "标题",
    "originalTitle": "Original Title",
    "year": 2026
  },
  "note": "人工确认"
}
```

支持 action：

- `ManualMatch`
- `ApproveScraped`
- `RejectScraped`
- `Dismiss`
- `RetryScrape`
- `ReassignBinding`

`ManualMatch` 成功后，后端写入 `Locked + Manual` identity binding，并异步触发强制重新刮削。前端提交成功后应立即更新队列状态，同时展示后台处理提示，不等待刮削完成。

## UI 状态

- claim 冲突：刷新该审核项并提示已被他人认领。
- provider 搜索无结果：保留直接填写外部 ID。
- resolve 成功：从待处理队列移除或标记已解决。
- 关联媒体项不存在：展示不可恢复状态。

> 权威：主仓 `crates/fmby-api/src/manage/dto/review_queue.rs` 与 `crates/fmby-api/src/manage/routes/media_reviews.rs`。
