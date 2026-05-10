# Manage · Dashboard

站点首页与高级状态聚合，面向管理员落地页。

## 端点

| Method | Path | Handler | 用途 |
|--------|------|---------|------|
| GET | `/api/manage/overview` | `dashboard::get_overview` | 卡片视图：用户数、库数、源数、近 24h 任务、当前在线 |
| GET | `/api/manage/advanced` | `dashboard::get_advanced` | 进程级运行指标：tokio 任务、DB 池、缓存命中、最近错误 |

## 响应概要

### `GET /api/manage/overview` → `ManageOverviewResp`

```jsonc
{
  "data": {
    "users":        { "total": 12, "active_24h": 5 },
    "libraries":    { "total": 4, "scanning": 1 },
    "media_items":  { "total": 8120, "review_pending": 6 },
    "tasks":        { "running": 2, "queued": 17, "failed_24h": 1 },
    "sessions":     { "online": 3 },
    "storage":      { "used_bytes": 12345678901, "free_bytes": 4500000000 }
  }
}
```

### `GET /api/manage/advanced` → `ManageAdvancedResp`

```jsonc
{
  "data": {
    "runtime": {
      "uptime_secs": 86400,
      "tokio_tasks": 124,
      "db_pool":  { "size": 32, "idle": 28, "wait": 0 },
      "redis":    { "ok": true, "latency_ms": 1.2 }
    },
    "scrape_workers": [
      { "name": "naming-scrape", "running": true, "tick_lag_ms": 30 }
    ],
    "errors_recent": [
      { "ts": "2026-05-10T08:00:00+08:00", "module": "pan115", "msg": "qr poll timeout" }
    ]
  }
}
```

> 字段权威：`crates/fmby-api/src/manage/dto/dashboard.rs`、`manage/services/dashboard.rs`。`utoipa` 接入后由 OpenAPI 校准。

## 错误

- `401 unauthorized`：未登录
- `403 forbidden`：非 admin
- `503 service_unavailable`：DB / Redis 异常时返回；皮肤应渲染降级态而非弹错

## 皮肤实现建议

- overview 卡片支持点击下钻到对应详情页（users / libraries / media-items / task-center）
- advanced 适合放在「关于本站」/「系统状态」二级页，并提供刷新按钮（不要做强制 polling 默认 ≥30s）
- `errors_recent` 是只读快照；点击条目跳到 `logs.md` 描述的运行日志详情
