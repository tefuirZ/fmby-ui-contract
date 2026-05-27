# Manage · Libraries

媒体库（library）= 一组 mount 下的扫描根。每个 library 配 1..N 个 source binding（数据源子路径）。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/libraries` | 列表 |
| POST   | `/api/manage/libraries` | 新建库 + 关联 sources |
| GET    | `/api/manage/libraries/{libraryId}` | 详情（含所有 source 的健康/扫描状态） |
| PATCH  | `/api/manage/libraries/{libraryId}` | 更新库、绑定和授权用户 |
| DELETE | `/api/manage/libraries/{libraryId}` | 删除库 |
| POST   | `/api/manage/libraries/{libraryId}/scan` | 触发全库扫描（异步） |
| GET    | `/api/manage/libraries/{libraryId}/cleanup-preview` | 预览清理空壳 / 孤儿数据影响 |
| POST   | `/api/manage/libraries/{libraryId}/cleanup` | 执行清理，要求危险操作确认 |
| POST   | `/api/manage/libraries/{libraryId}/sources/{sourceId}/purge` | 清空某 source 在该库下的索引（保留文件） |

## DTO

`ManagedLibraryDetailResponse` 关键字段：
```jsonc
{
  "library": {
    "id": "uuid",
    "name": "电影",
    "description": "",
    "kind": "movies|tv|music|mixed",
    "type_label": "电影",
    "scan_policy": {
      "preset": "movie",
      "allowed_extensions": ["mkv", "mp4"],
      "include_paths": [],
      "exclude_paths": []
    },
    "item_count": 1234,
    "total_items": 1234,
    "status": "ok|missing|degraded",
    "visibility_label": null,
    "updated_at": "...",
    "sources": ["NAS"],
    "actual_sources": ["NAS"],
    "last_scan_at": "..."
  },
  "source_bindings": [
    {
      "id": "uuid",
      "mount_id": "uuid",
      "mount_name": "115 分享 - 电影合集",
      "mount_type": "Pan115Share",
      "type_label": "115 分享",
      "sub_path": "/电影合集/4K",
      "path_label": "/电影合集/4K",
      "scan_priority": 10,
      "include_paths": [],
      "exclude_paths": [],
      "enable_detail_prefetch": false,
      "scan_warnings": [],
      "capabilities": ["list", "read"],
      "availability_status": "ok|missing|degraded",
      "availability_message": null,
      "last_scan_task_status": null
    }
  ],
  "access_grants": [],
  "recent_scan_tasks": []
}
```

`CreateManagedLibraryRequest`：

```jsonc
{
  "name": "电影",
  "library_type": "movies",
  "description": "",
  "scan_policy": {
    "preset": "movie",
    "allowed_extensions": ["mkv", "mp4", "avi"],
    "include_paths": [],
    "exclude_paths": []
  },
  "source_bindings": [
    {
      "mount_id": "mount_pan115_share_movies",
      "sub_path": "/电影合集/4K",
      "scan_priority": 10,
      "include_paths": [],
      "exclude_paths": [],
      "enable_detail_prefetch": false
    }
  ],
  "grant_user_ids": []
}
```

> 权威：`crates/fmby-api/src/manage/dto/libraries.rs`、`media_libraries.rs`。

## 关键流程

1. **新建库**：先用 [mounts.md](./mounts.md) 的 `browse-directories` 选择 mount 内子路径 → POST 创建 → 自动入扫描队列
2. **触发扫描**：body 为 `{ "task_type": "manual" }` 或空对象，返回 `{ library_id, task_type, tasks, skipped_source_ids }`
3. **purge**：场景是「这个源的内容彻底失联，索引也清掉」，但磁盘文件留给 mount 自己处理

`sub_path` 永远相对于已选 mount 的 `root_path` 生效。对 `pan115-share`，可选子路径从虚拟根 `/` 下的 `/alias/子目录` 开始；主题不能把分享链接、share cid 或 provider 全局路径写进 `sub_path`。

## 错误

- `409 conflict`：库名重复 / source 已关联其它库（多对一限制）
- `422 validation`：mount 不存在 / sub_path 不可达
- `423 locked`：扫描进行中不能 purge

## 皮肤实现建议

- 库列表渲染："名称 + 类型 + 源数 + 总条目数 + 最近扫描"
- 详情页分 Tab：基本信息 / 数据源 / 任务历史
- "扫描全库"按钮 → 提交后 toast 跳任务中心（task-center）
- source 状态徽标对接 [source-availability.md](./source-availability.md) 的恢复入口
