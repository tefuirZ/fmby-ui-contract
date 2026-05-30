# Manage · Operations

> 管理首页运营看板。该接口是只读聚合，当前 classic skin 在 `/manage` 首屏使用。

---

## 端点

| Method | Path | 权限 | 用途 |
|---|---|---|---|
| GET | `/api/manage/operations/overview?days=7|30|90` | SuperAdmin + `manage:access` | 运营总览、热播榜、活跃用户、趋势 |
| GET | `/api/manage/operations/runtime` | SuperAdmin + `manage:access` | 进程 / 主机 / PG pool / Redis / 起播延迟 / worker health |
| GET | `/api/manage/operations/playback/active?limit=200` | SuperAdmin + `manage:access` | 当前活跃播放会话快照 |
| GET | `/api/manage/operations/data-sources/load` | SuperAdmin + `manage:access` | 来源维度当前播放负载 |

`days` 允许 `7`、`30`、`90`，缺失或非法时后端回退 `30`。

`active` 的 `limit` 缺省为 `200`，允许范围 `1..=500`。

---

## 响应

```json
{
  "range": {
    "days": 30,
    "start_at": "2026-04-28T16:00:00Z",
    "end_at": "2026-05-28T15:59:59.999Z",
    "timezone": "Asia/Shanghai"
  },
  "summary": {
    "playback_count": 120,
    "unique_playback_users": 18,
    "estimated_watch_minutes": 3420,
    "total_media_items": 8120,
    "total_users": 42
  },
  "hot_items": [
    {
      "item_id": "item_ep_001",
      "title": "第 1 集",
      "media_type": "Episode",
      "series_title": "示例剧",
      "season_number": 1,
      "episode_number": 1,
      "source_id": "src_001",
      "source_name": "NAS",
      "source_provider": "local",
      "play_count": 32,
      "unique_user_count": 12,
      "average_watch_seconds": 1840,
      "latest_played_at": "2026-05-27T12:30:00Z"
    }
  ],
  "active_users": [
    {
      "user_id": "u_001",
      "username": "alice",
      "display_name": "Alice",
      "play_count": 24,
      "estimated_watch_seconds": 9320,
      "latest_played_at": "2026-05-27T12:30:00Z",
      "top_client_info": "Chrome / macOS"
    }
  ],
  "media_trend": [
    { "date": "2026-05-27", "added_count": 8, "cumulative_count": 8120 }
  ],
  "user_registration_trend": [
    { "date": "2026-05-27", "added_count": 1, "cumulative_count": 42 }
  ],
  "playback_trend": [
    { "date": "2026-05-27", "play_count": 18, "unique_user_count": 6, "estimated_watch_minutes": 520 }
  ]
}
```

---

## 数据规则

- 播放次数：统计 `playback_sessions.started_at` 落入范围且 `status <> 'Failed'` 的 session。
- 日期分桶：按 `Asia/Shanghai` 自然日，`date` 为 `YYYY-MM-DD`。
- 观看时长估算：`last_heartbeat_at - started_at`，小于 0 归 0；上限为 `media_sources.duration_ticks` 可用值，否则最多 6 小时。
- `estimated_watch_minutes` 向上取整：秒数 `(seconds + 59) / 60`。
- 热播榜按 `media_item_id` 聚合；电视剧展示具体 Episode，并带 `series_title`、`season_number`、`episode_number`。
- 热播来源取周期内该媒体播放次数最多的 `media_source_id`，并映射到 `storage_mounts.name/provider_type`。
- 媒体趋势用当前仍存在的 `media_items.created_at` 统计每日新增与累计，不是历史快照。
- 用户注册趋势只统计 `users.account_kind = 'human'`。
- 空数据必须返回空榜单和补齐日期的 0 值趋势。

---

## 前端映射

classic skin 将 raw DTO 映射为 camelCase：

| raw | frontend |
|---|---|
| `hot_items` | `hotItems` |
| `active_users` | `activeUsers` |
| `media_trend` | `mediaTrend` |
| `user_registration_trend` | `userRegistrationTrend` |
| `playback_trend` | `playbackTrend` |

建议 query key：`['manage', 'operations', 'overview', days]`。

---

## 运行观测

`GET /api/manage/operations/runtime` 返回运行时只读观测快照。

响应重点字段：

```json
{
  "sampled_at": "2026-05-30T02:30:00Z",
  "process_host_cache_status": "hit",
  "redis_cache_status": "miss",
  "startup_latency_cache_status": "hit",
  "worker_health_cache_status": "hit",
  "process": {
    "pid": 12345,
    "uptime_seconds": 3600,
    "rss_bytes": 268435456,
    "virtual_memory_bytes": 1073741824,
    "cpu_percent": 4.2,
    "status": "ok",
    "advice": null
  },
  "host": {
    "cpu_count": 8,
    "cpu_percent": 33.4,
    "memory_total_bytes": 17179869184,
    "memory_used_bytes": 6442450944,
    "memory_percent": 37.5,
    "status": "ok",
    "advice": null
  },
  "pg_pool": {
    "max_connections_configured": 20,
    "min_connections_configured": 0,
    "size": 8,
    "idle": 5,
    "in_use": 3,
    "utilization_percent": 37.5,
    "status": "ok",
    "advice": null
  },
  "redis": {
    "configured": true,
    "connected": true,
    "used_memory_bytes": 10485760,
    "maxmemory_bytes": null,
    "memory_percent": null,
    "connected_clients": 4,
    "db_keys": 128,
    "ops_per_sec": 42,
    "hit_rate_percent": 96.5,
    "status": "ok",
    "advice": null
  },
  "startup_latency": [
    { "window": "5m", "average_ms": 820, "p95_ms": 1400, "sample_count": 20, "failed_count": 1 }
  ],
  "worker_health": {
    "status": "ok",
    "total_registered": 12,
    "long_running_count": 10,
    "one_shot_count": 2,
    "disabled_count": 0,
    "running_count": 10,
    "starting_count": 0,
    "stopping_count": 0,
    "stopped_count": 2,
    "failed_count": 0,
    "restarted_count": 0,
    "unhealthy_workers": [],
    "advice": null
  }
}
```

`RuntimeMetricStatus` 取值：

- `ok`
- `warning`
- `critical`
- `degraded`
- `unconfigured`
- `unsupported`
- `warming`

`cache_status` 取值：

- `hit`
- `miss`
- `bypass`

运行观测响应不得包含 PostgreSQL URL、Redis URL、Cookie、Authorization、播放直链、stream token、provider 凭据或授权材料。

---

## 活跃播放快照

`GET /api/manage/operations/playback/active?limit=200`

响应：

```json
{
  "sampled_at": "2026-05-30T02:30:00Z",
  "cache_status": "miss",
  "limit": 200,
  "total_returned": 1,
  "sessions": [
    {
      "session_id": "psess_001",
      "user": {
        "user_id": "u_001",
        "username": "alice",
        "display_name": "Alice"
      },
      "item": {
        "item_id": "item_001",
        "title": "示例电影",
        "media_type": "Movie",
        "series_title": null,
        "season_number": null,
        "episode_number": null
      },
      "source": {
        "media_source_id": "src_001",
        "source_name": "NAS",
        "provider_type": "local",
        "mount_id": "mount_001"
      },
      "status": "Playing",
      "play_method": "DirectPlay",
      "client_info": "Chrome / Windows",
      "position_ticks": 18200000000,
      "duration_ticks": 81600000000,
      "progress_percent": 22.3,
      "started_at": "2026-05-30T02:20:00Z",
      "last_heartbeat_at": "2026-05-30T02:29:55Z"
    }
  ]
}
```

约束：

- `client_info` 仅是脱敏预览；后端会去控制字符并拒绝 URL、直链和 token 形态。
- 响应不得包含 `stream_url`、`direct_url`、`playback_token`、Cookie、Authorization 或上游凭据。
- skin 只把该接口作为初始快照和降级刷新来源；不要用高频轮询替代 WebSocket。

建议 query key：`['manage', 'operations', 'playback', 'active', limit]`。

---

## 来源负载快照

`GET /api/manage/operations/data-sources/load`

响应：

```json
{
  "sampled_at": "2026-05-30T02:30:00Z",
  "cache_status": "miss",
  "items": [
    {
      "source_id": "src_001",
      "source_name": "NAS",
      "provider_type": "local",
      "mount_id": "mount_001",
      "active_session_count": 3,
      "playing_count": 2,
      "paused_count": 1,
      "media_source_count": 2480,
      "last_heartbeat_at": "2026-05-30T02:29:55Z",
      "load_level": "ok",
      "advice": null
    }
  ]
}
```

约束：

- `active_session_count` 是来源维度的当前活跃会话数量。
- `load_level` 使用 `RuntimeMetricStatus`。
- `advice` 是面向管理员的操作建议，不应当作为机器状态机输入。

建议 query key：`['manage', 'operations', 'data-sources', 'load']`。

---

## 管理端实时通道

管理端运营看板必须先读取 HTTP 初始快照，再打开：

```text
GET /api/playback/realtime/ws?scope=admin
```

`scope=admin` 只表示订阅全局管理视图，不是 token。认证仍依赖同源 Cookie session、Origin 校验、SuperAdmin 和 `manage:access`。

事件 envelope：

```json
{
  "type": "playback.active_snapshot",
  "server_time": "2026-05-30T02:30:00Z",
  "payload": {
    "kind": "active_snapshot",
    "data": {
      "limit": 200,
      "generated_at": "2026-05-30T02:30:00Z",
      "sessions": []
    }
  }
}
```

管理端必须处理：

| `type` | `payload.kind` | 处理 |
|---|---|---|
| `playback.realtime.hello` | `hello` | 标记连接成功 |
| `playback.active_snapshot` | `active_snapshot` | 覆盖 / 合并活跃播放快照 |
| `playback.source_load_snapshot` | `source_load_snapshot` | 覆盖 / 合并来源负载快照 |
| `playback.session.started` | `session` | 触发轻量 refetch 或等待 snapshot |
| `playback.session.progress` | `session` | 触发轻量 refetch 或等待 snapshot |
| `playback.session.paused` | `session` | 触发轻量 refetch 或等待 snapshot |
| `playback.session.stopped` | `session` | 触发轻量 refetch 或等待 snapshot |
| `playback.limit.warning` | `limit_warning` | 展示会话限制提示 |

安全约束：

- 第一方 WebSocket 不使用 query token、query `api_key`、Bearer 或 compat header。
- skin 不得把 envelope、session id、用户 id、client info、api key、token 或 URL 写入 localStorage / sessionStorage / IndexedDB。
- WS 断开、浏览器不支持或消息解析失败时，UI 必须进入 `degraded` / `disabled`，保留 HTTP 刷新路径。
- 管理端全局列表以 snapshot 为真相，不靠逐条 session event 自行维护全局状态。

---

## UI 验收

- `/manage` 在已完成首次配置且站点有基础数据时展示运营看板。
- 未完成首次配置时仍展示 setup / 引导，不强行展示空运营面板。
- 7 / 30 / 90 天切换后五个面板一起刷新。
- 无播放记录时显示空态，不隐藏媒体趋势 / 用户趋势。
- 实时播放和来源负载必须展示 `connecting / connected / degraded / disabled`。
- WS degraded 时必须保留 HTTP 初始快照和手动刷新。
- 页面不得展示播放直链、stream token、Cookie、Authorization、PG/Redis URL 或 provider 凭据。
