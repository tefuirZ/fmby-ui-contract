# Manage · Logs

审计日志（`audit_logs`，写操作）+ 运行日志（`runtime_logs`，错误/告警）。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/audit-logs` | 审计日志 `?actor_user_id&action&since&until&page&page_size` |
| GET    | `/api/manage/runtime-logs` | 运行日志 `?level&module&since&until&page&page_size` |

## DTO

`AuditLog`：
```jsonc
{
  "id": "uuid",
  "ts": "2026-05-10T10:30:00+08:00",
  "actor_user_id": "uuid?",
  "actor_username": "alice",
  "actor_ip": "10.0.0.5",
  "action": "user.disable|registration_code.create|library.scan|...",
  "target_kind": "user|library|mount|...",
  "target_id": "uuid?",
  "summary": "alice disabled bob",
  "diff": { "before": {...}, "after": {...} }
}
```

`RuntimeLog`：
```jsonc
{
  "id": "uuid",
  "ts": "...",
  "level": "info|warn|error",
  "module": "pan115|scrape|scan|...",
  "msg": "qr poll timeout",
  "context": { "mount_id": "...", "trace_id": "..." }
}
```

> 权威：`crates/fmby-api/src/manage/dto/logs.rs`。

## 错误

- `400 bad_request`：since/until 不是 ISO8601
- `413 payload_too_large`：返回行数超阈值（前端必须分页）

## 皮肤实现建议

- 审计页：表格 + 行点开看 diff（before/after 对比）
- 运行日志：彩色 level + 复制 trace_id 按钮
- 默认时间窗 24h，提供快捷范围（1h / 24h / 7d）
- 大查询前后端都做防御（前端 page_size ≤ 100）
- 跨链路：audit 行的 target_id 链到对应详情页；runtime 行的 trace_id 复制后可在外部 tracing 系统检索
