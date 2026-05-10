# Manage · Libraries

媒体库（library）= 一组 mount 下的扫描根。每个 library 配 1..N 个 source（数据源根目录）。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/libraries` | 列表 `?include_sources=1` |
| POST   | `/api/manage/libraries` | 新建库 + 关联 sources |
| GET    | `/api/manage/libraries/{libraryId}` | 详情（含所有 source 的健康/扫描状态） |
| POST   | `/api/manage/libraries/{libraryId}/scan` | 触发全库扫描（异步） |
| POST   | `/api/manage/libraries/{libraryId}/sources/{sourceId}/purge` | 清空某 source 在该库下的索引（保留文件） |

## DTO

`Library`：
```jsonc
{
  "id": "uuid",
  "name": "电影",
  "library_type": "movies|tv|music|mixed",
  "sources": [
    {
      "id": "uuid",
      "mount_id": "uuid",
      "root_path": "/电影/合集",
      "status": "ok|missing|degraded",
      "last_scan_at": "...",
      "item_count": 1234
    }
  ],
  "scrape_profile": "default|chinese|...",
  "created_at": "...",
  "updated_at": "..."
}
```

`CreateReq`：`{ name, library_type, scrape_profile?, sources: [{ mount_id, root_path }] }`

> 权威：`crates/fmby-api/src/manage/dto/libraries.rs`、`media_libraries.rs`。

## 关键流程

1. **新建库**：先用 [mounts.md](./mounts.md) 的 `browse-directories` 选根目录 → POST 创建 → 自动入扫描队列
2. **触发扫描**：scan 是 idempotent，已在跑则返回 `task_id`，不再排队
3. **purge**：场景是「这个源的内容彻底失联，索引也清掉」，但磁盘文件留给 mount 自己处理

## 错误

- `409 conflict`：库名重复 / source 已关联其它库（多对一限制）
- `422 validation`：mount 不存在 / root_path 不可达
- `423 locked`：扫描进行中不能 purge

## 皮肤实现建议

- 库列表渲染："名称 + 类型 + 源数 + 总条目数 + 最近扫描"
- 详情页分 Tab：基本信息 / 数据源 / 任务历史
- "扫描全库"按钮 → 提交后 toast 跳任务中心（task-center）
- source 状态徽标对接 [source-availability.md](./source-availability.md) 的恢复入口
