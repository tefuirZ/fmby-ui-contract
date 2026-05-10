# Manage · Task Center

跨任务源的统一聚合视图：扫描、探针、刮削、命名修复、回填、上传等都汇总在一起。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/task-center/overview` | 顶部数字卡：running / queued / failed_24h / completed_24h |
| GET    | `/api/manage/task-center/items` | 任务流式列表 `?category&status&page&page_size&since` |
| GET    | `/api/manage/task-center/items/{category}/{taskId}` | 单条详情 |
| POST   | `/api/manage/task-center/items/{category}/{taskId}/actions` | 通用动作：cancel / retry / pause / resume |

## DTO

`TaskItem`：
```jsonc
{
  "id": "uuid",
  "category": "scan|probe|scrape|naming_repair|imghost_upload|backfill",
  "status": "queued|running|paused|completed|failed|cancelled",
  "progress": { "done": 120, "total": 500, "percent": 24 },
  "ref": { "library_id?": "...", "media_item_id?": "...", "source_id?": "..." },
  "started_at": "...",
  "finished_at": "...",
  "duration_ms": 12345,
  "error": "string?",
  "available_actions": ["cancel", "retry"]
}
```

`ActionReq`：`{ action: "cancel|retry|pause|resume" }`

> 权威：`crates/fmby-api/src/manage/dto/task_center.rs`。

## 错误

- `404 not_found`：category 或 task_id 错误
- `409 conflict`：动作不合法（如对 completed 任务发 retry 需要后端支持）
- `423 locked`：任务正在状态切换中

## 皮肤实现建议

- 列表分类徽标：扫描(蓝) / 探针(青) / 刮削(紫) / 上传(橙) / 回填(灰)
- 进度条 + 百分比文字
- 操作按钮根据 `available_actions` 渲染（不要硬编码）
- 「重试失败的全部」批量动作走 items 列表多选 + 逐个 POST actions
- 详情面板可链回各自来源（mediaitem / library / mount）
