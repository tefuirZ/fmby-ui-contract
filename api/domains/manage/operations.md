# Manage · Operations

> 管理首页运营看板。该接口是只读聚合，当前 classic skin 在 `/manage` 首屏使用。

---

## 端点

| Method | Path | 权限 | 用途 |
|---|---|---|---|
| GET | `/api/manage/operations/overview?days=7|30|90` | `manage:access` | 运营总览、热播榜、活跃用户、趋势 |

`days` 允许 `7`、`30`、`90`，缺失或非法时后端回退 `30`。

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

## UI 验收

- `/manage` 在已完成首次配置且站点有基础数据时展示运营看板。
- 未完成首次配置时仍展示 setup / 引导，不强行展示空运营面板。
- 7 / 30 / 90 天切换后五个面板一起刷新。
- 无播放记录时显示空态，不隐藏媒体趋势 / 用户趋势。
