# Manage · Dashboard

旧站点概览与高级状态聚合。当前 `/manage` 首屏已经改为运营看板，见 [`operations.md`](./operations.md)；`GET /api/manage/overview` 仍用于首次配置引导、健康提醒和兼容页面。

## 端点

| Method | Path | Handler | 用途 |
|--------|------|---------|------|
| GET | `/api/manage/overview` | `dashboard::get_overview` | 配置 / 健康概览：媒体库、媒体、挂载、来源异常、最近审计 |
| GET | `/api/manage/advanced` | `dashboard::get_advanced` | 进程级运行指标：tokio 任务、DB 池、缓存命中、最近错误 |

## 响应概要

### `GET /api/manage/overview`

```jsonc
{
  "environment_status": "healthy",
  "refreshed_at": "2026-05-27T10:00:00Z",
  "kpis": {
    "total_libraries": 2,
    "total_media_items": 8120,
    "movie_count": 1200,
    "series_count": 80,
    "episode_count": 6840,
    "total_mounts": 3,
    "remote_mounts": 2,
    "healthy_remote_mounts": 2
  },
  "alerts": {
    "empty_libraries": 0,
    "unreachable_mounts": 0,
    "disabled_mounts": 0,
    "unavailable_library_sources": 0,
    "unavailable_source_summaries": []
  },
  "recent_audit_logs": []
}
```

### `GET /api/manage/advanced` → `ManageAdvancedResp`

```jsonc
{
  "generated_at": "2026-05-27T10:00:00Z",
  "license": {},
  "runtime": {},
  "database": {},
  "storage": {},
  "cache": {},
  "settings": {},
  "services": {},
  "recent_errors": []
}
```

> 字段权威：`crates/fmby-api/src/manage/dto/dashboard.rs`、`manage/services/dashboard.rs`。`utoipa` 接入后由 OpenAPI 校准。

## 错误

- `401 unauthorized`：未登录
- `403`：缺少管理权限
- `503 service_unavailable`：DB / Redis 异常时返回；皮肤应渲染降级态而非弹错

## 皮肤实现建议

- `/manage` 首屏优先用运营看板；overview 适合折叠成健康提示或首次配置引导
- advanced 适合放在「关于本站」/「系统状态」二级页，并提供刷新按钮（不要做强制 polling 默认 ≥30s）
- `errors_recent` 是只读快照；点击条目跳到 `logs.md` 描述的运行日志详情
