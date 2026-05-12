# Manage · Task Center

跨任务源的统一聚合视图：扫描、识别、刮削、`115 图床`、AI 辅助、审核、墓碑等都汇总在一起。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/task-center/overview` | 顶部 KPI：按类别聚合 total / running / failed / today_succeeded |
| GET    | `/api/manage/task-center/items` | 统一任务列表 `?category&status&from&to&page&size` |
| GET    | `/api/manage/task-center/items/{category}/{taskId}` | 单条详情 |
| POST   | `/api/manage/task-center/items/{category}/{taskId}/actions` | 通用动作：Retry / Cancel / Skip / Resolve |

## DTO

`TaskItem`：
```jsonc
{
  "id": "uuid",
  "category": "Scan|Identify|Scrape|Imghost|AiAssist|Review|Tombstone",
  "status": "Queued|Running|RetryWaiting|Failed|Succeeded|NeedsReview|Cancelled|Skipped",
  "media_item_id": "item-id-or-null",
  "media_title": "媒体标题或 null",
  "retry_count": 1,
  "last_error_code": "string-or-null",
  "last_error_message": "string-or-null",
  "summary": "115 图床 · poster · ScrapeSuccess · 第 1/8 次",
  "created_at": "...",
  "updated_at": "..."
}
```

`ActionReq`：`{ "action": "Retry|Cancel|Skip|Resolve" }`

> 权威：`crates/fmby-api/src/manage/dto/task_center.rs`。

## 错误

- `404 not_found`：category 或 task_id 错误
- `409 conflict`：动作不合法（如当前状态不允许 Retry / Cancel）
- `422 validation`：未知 action 或类别不支持该动作

## 皮肤实现建议

- 分类徽标至少区分 `Imghost` 与 `Scrape`，避免管理员误以为镜像失败就是刮削失败
- `Imghost` 详情页应展示 `target_type / scope / request_reason / retain_local_copy / attempt_count`
- 操作按钮按类别和状态渲染，不要把所有任务都假定有同一组动作
- 详情面板可链回各自来源（media_item / review / tombstone 等）
