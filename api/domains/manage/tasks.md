# Manage · Tasks (Scans, Probes, Naming Scrape, Naming Cleanup)

任务面板 + 命名/刮削配置。这是规模最大的一块，覆盖：
- 扫描任务（scans）
- 探针任务（probe-tasks，单 source 的可达性轮询）
- 命名刮削（naming-scrape，文件名 → metadata 抽取规则）
- 命名清理（naming-cleanup，识别失败 → 重命名建议）

## 端点

### 扫描

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/scans` | 扫描历史 `?library_id&status&page&page_size` |

### 探针

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/probe-tasks` | 探针任务列表 |
| GET    | `/api/manage/probe-tasks/{sourceId}` | 单源探针详情 |
| POST   | `/api/manage/probe-tasks/{sourceId}/enqueue` | 立即排队探针 |
| POST   | `/api/manage/probe-tasks/{sourceId}/refresh` | 强制重置周期 |

### 命名刮削

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/naming-scrape` | 当前刮削策略 |
| PUT    | `/api/manage/naming-scrape` | 改策略（含 `imghost_auto_upload` 开关） |
| POST   | `/api/manage/naming-scrape/batch-repair` | 对失败条目批量重刮 |

### 命名清理

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/naming-cleanup` | 当前清理规则 |
| PUT    | `/api/manage/naming-cleanup` | 改规则 |
| POST   | `/api/manage/naming-cleanup/preview` | 试运行（不落盘） |
| POST   | `/api/manage/naming-cleanup/replay-identify` | 应用清理后重新识别 |

## DTO 关键字段

`NamingScrapeSettings`：
```jsonc
{
  "enabled": true,
  "providers": ["tmdb", "tvdb", "douban"],
  "language_priority": ["zh-CN", "en-US"],
  "imghost_auto_upload": false,
  "score_threshold": 0.7,
  "fallback_to_review_queue": true
}
```

`NamingCleanupSettings`：
```jsonc
{
  "rules": [
    { "kind": "regex_strip", "pattern": "\\[.*?\\]", "enabled": true },
    { "kind": "tag_drop", "tags": ["1080p", "WEB-DL", "x264"] }
  ],
  "season_episode_patterns": ["S(\\d+)E(\\d+)", "(\\d+)x(\\d+)"]
}
```

`PreviewResp`：`{ samples: [{ before, after, parsed: { title, year, season?, episode? } }] }`

> 权威：`crates/fmby-api/src/manage/dto/scans.rs`、`probe_tasks.rs`、`naming_scrape.rs`、`naming_cleanup.rs`。

## 错误

- `409 conflict`：批量重刮已在运行
- `422 validation`：regex 不合法 / score_threshold 超 [0,1]

## 皮肤实现建议

- 扫描列表用时间线视图：开始/进度/结束/错误数
- 命名清理「试运行」必须有 → 显示前后对比表 → 用户确认后再 replay-identify
- imghost_auto_upload 开关在凭据未绑时禁用 + tooltip 引导去 [pan115-imghost.md](./pan115-imghost.md)
- 探针任务历史用迷你图（最近 24h 成功率）
