# Manage · Sessions

在线会话查看与强制下线。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/sessions` | 当前活跃会话列表 `?user_id&page&page_size` |
| DELETE | `/api/manage/sessions/{sessionId}` | 强制下线（吊销 access + refresh） |

## DTO

```jsonc
{
  "id": "uuid",
  "user_id": "uuid",
  "username": "alice",
  "client": "web|android|ios|tv|other",
  "user_agent": "Mozilla/5.0 ...",
  "ip": "10.0.0.5",
  "issued_at": "2026-05-10T10:00:00+08:00",
  "last_seen_at": "2026-05-10T10:30:00+08:00",
  "expires_at": "2026-05-17T10:00:00+08:00"
}
```

> 权威：`crates/fmby-api/src/manage/dto/sessions.rs`。

## 错误

- `404 not_found`：会话已过期 / 已被踢
- `409 conflict`：踢自己当前会话需要二次确认（前端层强制）

## 皮肤实现建议

- 表格列：用户名 / 客户端 / IP / 最后活跃 / 操作
- 「踢自己」按钮加二次确认 + 退出后跳登录页
- 高级筛选：按 client / 按 user_id
- 列表默认按 `last_seen_at desc`
