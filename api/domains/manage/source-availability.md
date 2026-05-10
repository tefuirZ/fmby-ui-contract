# Manage · Source Availability

数据源可用性恢复：当 mount/source 状态进入 `degraded|missing` 时，运维触发恢复。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| POST   | `/api/manage/source-availability/{library_source_id}/recover` | 触发恢复流程：重新探针 + 失败时降级标记 |

## 请求 / 响应

`RecoverResp`：
```jsonc
{
  "data": {
    "library_source_id": "uuid",
    "result": "ok|still_unavailable|escalated",
    "next_check_at": "2026-05-10T11:00:00+08:00",
    "task_id": "uuid?"
  }
}
```

> 权威：`crates/fmby-api/src/manage/dto/source_availability.rs`、`services/source_availability.rs`。

## 流程

1. 列表/详情发现 source 标红 → 用户点「尝试恢复」
2. 后端：清空当前错误窗口 → 立即跑探针 → 成功则 `ok` + 重新进入扫描队列
3. 失败则 `still_unavailable`，皮肤继续显示 degraded
4. 多次失败累积达阈值 → `escalated`，后端会发系统通知

## 错误

- `404 not_found`：source 不存在
- `423 locked`：恢复任务正在跑（`task_id` 同时返回，可链到 task-center 跟踪）

## 皮肤实现建议

- 在 [libraries.md](./libraries.md) / [mounts.md](./mounts.md) 详情页内嵌 inline action「立即恢复」
- result 用不同 toast 颜色：ok 绿 / still 黄 / escalated 红
- escalated 后给一个「查看运行日志」链接到 [logs.md](./logs.md)
